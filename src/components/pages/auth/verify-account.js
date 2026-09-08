import React, { useContext, useEffect, useRef, useState, useCallback } from 'react';
import { Formik } from 'formik';
import makeRequest from "../../utils/fetch-request";
import { Context } from '../../../context/store';
import { useNavigate } from 'react-router-dom';
import Notify from '../../utils/Notify';
import Alert from '../../utils/alert';
import socket from '../../utils/socket-connect';
import { getOrCreateDeviceId } from '../../utils/device-id';
import {
    clearPendingVerifyAuth,
    getPendingVerifyAuth,
} from '../../utils/pending-verify-auth';
import { setLocalStorage } from '../../utils/local-storage';

const BRAND = '#a71f66';
const OTP_REFRESH_MS = 30 * 60 * 1000;

/**
 * Assumed socket contract (mirrors user.match.listen / socket-io# patterns):
 * - emit `user.otp.listen` with { device_id, msisdn, channel }
 * - emit `user.otp.channel` when switching channel { device_id, msisdn, channel }
 * - listen on `socket-io#otp#${device_id}` (and fallback `user#otp#${device_id}`)
 * Message shapes accepted:
 * - WhatsApp available: { type|event|action: 'whatsapp_available'|'enable_whatsapp', channel: 'whatsapp' }
 * - OTP: { type: 'otp'|'verification_code', code|otp|verification_code, source? }
 */

const extractOtpCode = (data) => {
    if (!data || typeof data !== 'object') return null;
    const raw =
        data.code ??
        data.otp ??
        data.verification_code ??
        data.verificationCode ??
        data.pin ??
        data.message?.code ??
        data.data?.code ??
        data.data?.otp;
    if (raw == null) return null;
    const code = String(raw).trim();
    if (!/^\d{4,8}$/.test(code)) return null;
    return code;
};

const isBetmundialOtpPayload = (data) => {
    if (!data || typeof data !== 'object') return false;
    const source = String(data.source || data.sender || data.from || data.app || '').toLowerCase();
    // If a sender/source is present, only accept Betmundial-tagged payloads.
    // Socket events without source are still accepted when they carry a numeric OTP
    // on the otp verification channel (subscription itself is Betmundial-scoped).
    if (source && !/betmundial|bet.?mundial|mundial/.test(source)) {
        return false;
    }
    return Boolean(extractOtpCode(data));
};

const isWhatsAppAvailableMessage = (data) => {
    if (!data || typeof data !== 'object') return false;
    const type = String(
        data.type || data.event || data.action || data.status || ''
    ).toLowerCase();
    const channel = String(data.channel || data.otp_channel || '').toLowerCase();
    if (channel === 'whatsapp' && (type.includes('available') || type.includes('enable') || data.enable === true)) {
        return true;
    }
    return (
        type === 'whatsapp_available' ||
        type === 'enable_whatsapp' ||
        type === 'whatsapp_enabled' ||
        data.whatsapp_available === true ||
        data.enable_whatsapp === true
    );
};

const channelButtonStyle = (active) => ({
    flex: 1,
    padding: '10px 12px',
    borderRadius: '12px',
    border: active ? `2px solid ${BRAND}` : '1px solid rgba(255,255,255,0.25)',
    background: active ? 'rgba(167, 31, 102, 0.25)' : 'rgba(0,0,0,0.2)',
    color: '#ffffff',
    fontWeight: 600,
    cursor: 'pointer',
});

const VerifyAccount = () => {
    const [message, setMessage] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [otpChannel, setOtpChannel] = useState('sms');
    const [whatsappEnabled, setWhatsappEnabled] = useState(false);
    const verifyRef = useRef();
    const autoSubmitRef = useRef(false);
    const otpAbortRef = useRef(null);
    const [state, dispatch] = useContext(Context);
    const navigate = useNavigate();
    const deviceId = useRef(getOrCreateDeviceId());

    const msisdn =
        state?.regmsisdn ||
        getPendingVerifyAuth()?.msisdn ||
        '';

    const initialValues = {
        msisdn,
        code: ''
    };

    useEffect(() => {
        dispatch({ type: "SET", key: "fullpagewidth", payload: true });
        dispatch({ type: "DEL", key: "showloginmodal" });
        const pending = getPendingVerifyAuth();
        if (pending?.msisdn && !state?.regmsisdn) {
            dispatch({ type: "SET", key: "regmsisdn", payload: pending.msisdn });
        }
        if (pending?.password && !state?.regpassword) {
            dispatch({ type: "SET", key: "regpassword", payload: pending.password });
        }
        return () => {
            dispatch({ type: "DEL", key: "fullpagewidth" });
        };
    }, [dispatch, state?.regmsisdn, state?.regpassword]);

    // Request OTP on mount and whenever channel changes — not on every sendOTP identity change
    const sendOTPRef = useRef(null);

    const applyOtpCode = useCallback((code, { autoSubmit = true } = {}) => {
        if (!code || !verifyRef.current) return;
        verifyRef.current.setFieldValue('code', code);
        if (autoSubmit && !autoSubmitRef.current && code.length >= 4) {
            autoSubmitRef.current = true;
            // Allow Formik field update to settle before submit
            setTimeout(() => {
                verifyRef.current?.submitForm?.();
            }, 150);
        }
    }, []);

    const emitOtpListen = useCallback((channel) => {
        if (!deviceId.current || !msisdn) return;
        const payload = {
            device_id: deviceId.current,
            msisdn,
            channel: channel || otpChannel,
        };
        if (socket.connected) {
            socket.emit('user.otp.listen', payload);
        }
    }, [msisdn, otpChannel]);

    const emitOtpChannel = useCallback((channel) => {
        if (!deviceId.current || !msisdn) return;
        const payload = {
            device_id: deviceId.current,
            msisdn,
            channel,
        };
        if (socket.connected) {
            socket.emit('user.otp.channel', payload);
            socket.emit('user.otp.listen', payload);
        }
    }, [msisdn]);

    const selectChannel = useCallback((channel) => {
        setOtpChannel(channel);
        emitOtpChannel(channel);
    }, [emitOtpChannel]);

    const handleSocketMessage = useCallback((data) => {
        if (!data) return;

        if (isWhatsAppAvailableMessage(data)) {
            setWhatsappEnabled(true);
            setOtpChannel((prev) => {
                if (prev !== 'whatsapp') {
                    emitOtpChannel('whatsapp');
                    return 'whatsapp';
                }
                return prev;
            });
        }

        if (isBetmundialOtpPayload(data)) {
            const code = extractOtpCode(data);
            if (code) {
                applyOtpCode(code);
            }
        }
    }, [applyOtpCode, emitOtpChannel]);

    // Socket subscribe + listen
    useEffect(() => {
        if (!msisdn || !deviceId.current) return undefined;

        const eventPrimary = `socket-io#otp#${deviceId.current}`;
        const eventFallback = `user#otp#${deviceId.current}`;

        const onConnect = () => emitOtpListen(otpChannel);

        emitOtpListen(otpChannel);
        socket.on(eventPrimary, handleSocketMessage);
        socket.on(eventFallback, handleSocketMessage);
        socket.on('connect', onConnect);

        return () => {
            socket.off(eventPrimary, handleSocketMessage);
            socket.off(eventFallback, handleSocketMessage);
            socket.off('connect', onConnect);
        };
    }, [msisdn, otpChannel, emitOtpListen, handleSocketMessage]);

    // Web OTP API (SMS autofill in supporting browsers) — not native SMS/WhatsApp readers
    useEffect(() => {
        if (typeof window === 'undefined') return undefined;
        if (!('OTPCredential' in window) || !navigator.credentials?.get) {
            return undefined;
        }

        const ac = new AbortController();
        otpAbortRef.current = ac;

        navigator.credentials
            .get({
                otp: { transport: ['sms'] },
                signal: ac.signal,
            })
            .then((otp) => {
                if (otp?.code) {
                    applyOtpCode(String(otp.code));
                }
            })
            .catch(() => {
                /* user dismissed or unsupported */
            });

        return () => {
            ac.abort();
            otpAbortRef.current = null;
        };
    }, [applyOtpCode, msisdn]);

    const autoLogin = useCallback(async (phone) => {
        const pending = getPendingVerifyAuth();
        const loginMsisdn = phone || pending?.msisdn || msisdn;
        const password = pending?.password || state?.regpassword;

        if (!loginMsisdn || !password) {
            Notify({
                status: 200,
                message: "Account verified. Please log in to continue.",
            });
            navigate("/login");
            return;
        }

        try {
            const [status, response] = await makeRequest({
                url: '/auth/login',
                method: 'POST',
                data: { msisdn: loginMsisdn, password },
                api_version: 2,
            });

            if (
                [200, 201, 204].includes(status) &&
                (response?.status == 200 || response?.status == 201) &&
                response?.data
            ) {
                setLocalStorage('user', response.data, 1000 * 60 * 60 * 24 * 7);
                dispatch({ type: "SET", key: "user", payload: response.data });
                clearPendingVerifyAuth();
                dispatch({ type: "DEL", key: "regpassword" });
                dispatch({ type: "DEL", key: "showloginmodal" });
                Notify({ status: 200, message: "Account verified. You are now logged in." });
                window.location.href = '/';
                return;
            }

            Notify({
                status: 200,
                message: "Account verified. Please log in to continue.",
            });
            navigate("/login");
        } catch {
            Notify({
                status: 200,
                message: "Account verified. Please log in to continue.",
            });
            navigate("/login");
        } finally {
            clearPendingVerifyAuth();
            dispatch({ type: "DEL", key: "regpassword" });
        }
    }, [dispatch, msisdn, navigate, state?.regpassword]);

    const handleSubmit = (values) => {
        const endpoint = '/auth/verify';
        setIsLoading(true);
        setMessage({});
        makeRequest({
            url: endpoint,
            method: 'POST',
            data: {
                msisdn: values.msisdn || msisdn,
                code: values.code,
                channel: otpChannel,
            },
            api_version: 2,
        }).then(([status, response]) => {
            if ([200, 201].includes(status)) {
                if (response?.status == 200 || response?.status == 201) {
                    Notify({ status: 200, message: "Account verified successfully." });
                    autoLogin(values.msisdn || msisdn);
                } else {
                    autoSubmitRef.current = false;
                    setMessage({
                        status: 400,
                        message: response?.message || response?.result || "Code invalid",
                    });
                }
            } else {
                autoSubmitRef.current = false;
                setMessage({
                    status: status,
                    message: response?.error?.message || response?.message || "Verification failed",
                });
            }
            setIsLoading(false);
        }).catch(() => {
            autoSubmitRef.current = false;
            setMessage({ status: 400, message: "Verification failed. Please try again." });
            setIsLoading(false);
        });
    };

    const validate = (values) => {
        const errors = {};
        const phone = values.msisdn || msisdn;
        if (!phone || !String(phone).match(/(254|0|)?[71]\d{8}/g)) {
            errors.msisdn = 'Please enter a valid phone number';
        }
        if (!values.code || values.code.length < 4) {
            errors.code = "Please enter four or more characters for code";
        }
        return errors;
    };

    const sendOTP = useCallback((opts = {}) => {
        const { silent = false } = opts;
        if (!msisdn) return;
        const endpoint = '/auth/verification-code';
        const values = {
            msisdn,
            channel: otpChannel,
            device_id: deviceId.current,
        };
        makeRequest({ url: endpoint, method: 'POST', data: values, api_version: 2 }).then(([status, response]) => {
            if ([200, 201].includes(status)) {
                if (response?.status == 200 || response?.status == 201 || response?.success) {
                    if (!silent) {
                        Notify({
                            status: 200,
                            message: otpChannel === 'whatsapp'
                                ? "Verification code sent via WhatsApp"
                                : "Verification code sent to phone",
                        });
                    }
                } else if (!silent) {
                    setMessage({ status: 400, message: "Error fetching code" });
                }
            } else if (!silent) {
                setMessage({ status: status, message: "Error fetching code" });
            }
        });
        emitOtpListen(otpChannel);
    }, [msisdn, otpChannel, emitOtpListen]);

    sendOTPRef.current = sendOTP;

    // Initial OTP + re-request when channel switches
    useEffect(() => {
        sendOTPRef.current?.();
    }, [msisdn, otpChannel]);

    // Refresh OTP every 30 minutes while on this screen
    useEffect(() => {
        const timer = setInterval(() => {
            sendOTPRef.current?.({ silent: true });
        }, OTP_REFRESH_MS);
        return () => clearInterval(timer);
    }, [msisdn]);

    // Refresh when user returns to the app / tab
    useEffect(() => {
        let lastResumeAt = Date.now();
        const refreshOnResume = () => {
            if (document.visibilityState !== 'visible') return;
            const now = Date.now();
            // Skip initial load / rapid focus+visibility pairs
            if (now - lastResumeAt < 2000) return;
            lastResumeAt = now;
            sendOTPRef.current?.({ silent: true });
        };
        document.addEventListener('visibilitychange', refreshOnResume);
        window.addEventListener('focus', refreshOnResume);
        return () => {
            document.removeEventListener('visibilitychange', refreshOnResume);
            window.removeEventListener('focus', refreshOnResume);
        };
    }, [msisdn]);

    const handleKeyPress = (event, submitFn) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            submitFn();
        }
    };

    const MyVerifyAccountForm = (props) => {
        const { errors, values, setFieldValue, handleSubmit: formSubmit } = props;

        const onFieldChanged = (ev) => {
            const field = ev.target.name;
            const value = ev.target.value;
            setFieldValue(field, value);
            if (field === 'code' && /^\d{4,8}$/.test(String(value).trim()) && !autoSubmitRef.current) {
                autoSubmitRef.current = true;
                setTimeout(() => formSubmit(), 100);
            }
        };

        const channelHint =
            otpChannel === 'whatsapp'
                ? 'Has been sent via WhatsApp'
                : 'Has been sent to your phone (SMS)';

        return (
            <form onReset={props.handleReset} onSubmit={formSubmit}>
                <div className="pt-0">
                    <div className="row form-block">
                        <div className='text-center'>
                            <h1 className='std-title' style={{ color: '#ffffff' }}>Verify your account</h1>
                            <p className='text-xl' style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                Enter the one-time code we sent to finish creating your account.
                            </p>
                        </div>

                        <div className='col-md-12 col-sm-12 mt-4'>
                            {message && <Alert message={message} />}
                        </div>

                        <div className="form-group row d-flex justify-content-center mt-4">
                            <div className="col-md-12">
                                <label style={{ color: '#ffffff' }}>OTP channel</label>
                                <div className="d-flex gap-2 mt-2" style={{ gap: '10px' }}>
                                    <button
                                        type="button"
                                        style={channelButtonStyle(otpChannel === 'sms')}
                                        onClick={() => selectChannel('sms')}
                                    >
                                        SMS
                                    </button>
                                    <button
                                        type="button"
                                        style={{
                                            ...channelButtonStyle(otpChannel === 'whatsapp'),
                                            opacity: whatsappEnabled ? 1 : 0.55,
                                            cursor: whatsappEnabled ? 'pointer' : 'not-allowed',
                                        }}
                                        disabled={!whatsappEnabled}
                                        onClick={() => selectChannel('whatsapp')}
                                        title={
                                            whatsappEnabled
                                                ? 'Receive OTP via WhatsApp'
                                                : 'WhatsApp becomes available when the server enables it on this device'
                                        }
                                    >
                                        WhatsApp
                                        {!whatsappEnabled ? (
                                            <span style={{ opacity: 0.85, fontWeight: 400 }}> (waiting)</span>
                                        ) : null}
                                    </button>
                                </div>
                                {whatsappEnabled && otpChannel === 'whatsapp' ? (
                                    <p className="mt-2 mb-0" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>
                                        WhatsApp verification selected — waiting for your Betmundial code.
                                    </p>
                                ) : null}
                            </div>
                        </div>

                        <div className="form-group row d-flex justify-content-center mt-5">
                            <div className="col-md-12">
                                <label style={{ color: '#ffffff' }}>Mobile Number</label>
                                <input
                                    value={msisdn || ''}
                                    className="form-control block px-3 py-3 w-full rounded-2xl std-input"
                                    id="msisdn"
                                    name="msisdn"
                                    type="text"
                                    placeholder='Phone number'
                                    disabled={true}
                                    onChange={ev => onFieldChanged(ev)}
                                />
                            </div>
                        </div>

                        <div className="form-group row d-flex justify-content-center mt-5">
                            <div className="col-md-12">
                                <label style={{ color: '#ffffff' }}>
                                    Code (OTP){' '}
                                    <span className='alert alert-warning py-1 font-[500] italic font-small'>
                                        {channelHint}
                                    </span>
                                </label>
                                <input
                                    value={values.code}
                                    className="form-control block px-3 py-3 w-full rounded-2xl std-input"
                                    id="code"
                                    name="code"
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="one-time-code"
                                    placeholder='Enter Code'
                                    onChange={ev => onFieldChanged(ev)}
                                    onKeyPress={(event) => handleKeyPress(event, formSubmit)}
                                />
                                {errors.code && <div className='text-danger'> {errors.code} </div>}
                            </div>
                        </div>

                        <div className="form-group row d-flex justify-content-left mt-4">
                            <div className="col-12">
                                <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Didn't receive code?</span>
                                <button
                                    onClick={() => {
                                        autoSubmitRef.current = false;
                                        sendOTP();
                                    }}
                                    type={"button"}
                                    className='btn text-white ml-2 btn-sm hover:opacity-70'
                                    style={{ backgroundColor: BRAND }}
                                >
                                    Click Resend Code
                                </button>
                            </div>
                        </div>

                        <div className="form-group row d-flex justify-content-left mb-4">
                            <div className="col-12">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`btn btn-lg btn-primary mt-5 col-md-12 deposit-withdraw-button font-bold`}
                                >
                                    {isLoading === false ? "Verify Account" : "verifying..."}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        );
    };

    const VerifyAccountForm = () => {
        return (
            <Formik
                innerRef={verifyRef}
                initialValues={initialValues}
                enableReinitialize
                onSubmit={handleSubmit}
                validateOnChange={false}
                validateOnBlur={false}
                validate={validate}>
                {(props) => <MyVerifyAccountForm {...props} />}
            </Formik>
        );
    };

    return (
        <>
            <div className='signup-container' style={{ paddingTop: '20px' }}>
                <div className='std-medium-width-block'>
                    <div className="col-md-12 mt-2 p-2 std-boxed-form-page" data-backdrop="static">
                        <div className='text-center mb-4'>
                        </div>
                        <VerifyAccountForm />
                    </div>
                </div>
            </div>
        </>
    );
};

export default VerifyAccount;
