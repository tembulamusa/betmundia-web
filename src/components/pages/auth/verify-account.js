import React, { useContext, useEffect, useRef, useState, useCallback } from 'react';
import { Formik } from 'formik';
import makeRequest from "../../utils/fetch-request";
import { Context } from '../../../context/store';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    clearLoginRedirect,
    resolveLoginRedirect,
} from '../../utils/login-redirect';
import Notify from '../../utils/Notify';
import Alert from '../../utils/alert';
import socket from '../../utils/socket-connect';
import { getOrCreateDeviceId } from '../../utils/device-id';
import {
    clearPendingVerifyAuth,
    getPendingVerifyAuth,
} from '../../utils/pending-verify-auth';
import { getFromLocalStorage, setLocalStorage } from '../../utils/local-storage';
import { resetUnauthorizedGuard } from '../../utils/session-auth';
import { noteSessionAuthenticated } from '../../utils/session-keep-alive';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const BRAND = '#a71f66';
const OTP_CHANNEL = 'sms';

/**
 * Assumed socket contract (mirrors user.match.listen / socket-io# patterns):
 * - emit `user.otp.listen` with { device_id, msisdn, channel }
 * - listen on `socket-io#otp#${device_id}` (and fallback `user#otp#${device_id}`)
 * Message shapes accepted:
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

// ---- Resend cooldown (2 minutes) -----------------------------------------
// The cooldown end time is kept in localStorage (per phone number) so a page
// refresh neither resets it nor triggers another automatic SMS inside the
// window. A window event lets the countdown control update without re-rendering
// the whole page (which would reset the form).
const RESEND_COOLDOWN_MS = 2 * 60 * 1000;
const RESEND_EVENT = 'verify-resend-cooldown';
const cooldownKey = (msisdn) => `verify_resend_until_${msisdn}`;

const getCooldownRemainingSecs = (msisdn) => {
    if (!msisdn) return 0;
    try {
        const until = Number(getFromLocalStorage(cooldownKey(msisdn)));
        if (!until) return 0;
        return Math.max(0, Math.ceil((until - Date.now()) / 1000));
    } catch {
        return 0;
    }
};

const startResendCooldown = (msisdn) => {
    if (!msisdn) return;
    try {
        setLocalStorage(cooldownKey(msisdn), Date.now() + RESEND_COOLDOWN_MS, RESEND_COOLDOWN_MS + 5000);
    } catch { /* storage unavailable: fall back to no persistence */ }
    window.dispatchEvent(new CustomEvent(RESEND_EVENT, { detail: { msisdn, until: Date.now() + RESEND_COOLDOWN_MS } }));
};

const formatCountdown = (secs) => {
    const m = Math.floor(secs / 60);
    const sec = String(secs % 60).padStart(2, '0');
    return `${m}:${sec}`;
};

const ResendCodeControl = ({ msisdn, onResend }) => {
    const [remaining, setRemaining] = useState(() => getCooldownRemainingSecs(msisdn));
    const untilRef = useRef(Date.now() + getCooldownRemainingSecs(msisdn) * 1000);

    useEffect(() => {
        const sync = () => {
            const left = Math.max(0, Math.ceil((untilRef.current - Date.now()) / 1000));
            setRemaining((prev) => {
                if (prev > 0 && left === 0) {
                    Notify({ status: 200, message: 'You can now request a new verification code.' });
                }
                return left;
            });
        };
        const onStart = (e) => {
            if (e?.detail?.msisdn !== msisdn) return;
            untilRef.current = e.detail.until;
            sync();
        };
        untilRef.current = Date.now() + getCooldownRemainingSecs(msisdn) * 1000;
        sync();
        window.addEventListener(RESEND_EVENT, onStart);
        const timer = setInterval(sync, 1000);
        return () => {
            window.removeEventListener(RESEND_EVENT, onStart);
            clearInterval(timer);
        };
    }, [msisdn]);

    const waiting = remaining > 0;

    return (
        <div className="col-12">
            <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Didn't receive code?</span>
            <button
                onClick={onResend}
                type="button"
                disabled={waiting}
                className='btn text-white ml-2 btn-sm hover:opacity-70'
                style={{ backgroundColor: BRAND, opacity: waiting ? 0.6 : 1, cursor: waiting ? 'not-allowed' : 'pointer' }}
            >
                {waiting ? `Resend code in ${formatCountdown(remaining)}` : 'Click Resend Code'}
            </button>
            <div className="mt-2" style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '1.3rem' }} aria-live="polite">
                {waiting
                    ? `We've sent a code to your phone. You can request a new one in ${formatCountdown(remaining)}.`
                    : 'Still nothing? You can request a new code now.'}
            </div>
        </div>
    );
};

const VerifyAccount = () => {
    const [message, setMessage] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const verifyRef = useRef();
    const otpAbortRef = useRef(null);
    const [state, dispatch] = useContext(Context);
    const navigate = useNavigate();
    const location = useLocation();
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

    // Prefill OTP from socket / Web OTP — never auto-submit; user must click Verify
    const applyOtpCode = useCallback((code) => {
        if (!code || !verifyRef.current) return;
        verifyRef.current.setFieldValue('code', code);
    }, []);

    const emitOtpListen = useCallback(() => {
        if (!deviceId.current || !msisdn) return;
        const payload = {
            device_id: deviceId.current,
            msisdn,
            channel: OTP_CHANNEL,
        };
        if (socket.connected) {
            socket.emit('user.otp.listen', payload);
        }
    }, [msisdn]);

    const handleSocketMessage = useCallback((data) => {
        if (!data) return;
        if (isBetmundialOtpPayload(data)) {
            const code = extractOtpCode(data);
            if (code) {
                applyOtpCode(code);
            }
        }
    }, [applyOtpCode]);

    // Socket subscribe + listen
    useEffect(() => {
        if (!msisdn || !deviceId.current) return undefined;

        const eventPrimary = `socket-io#otp#${deviceId.current}`;
        const eventFallback = `user#otp#${deviceId.current}`;

        const onConnect = () => emitOtpListen();

        emitOtpListen();
        socket.on(eventPrimary, handleSocketMessage);
        socket.on(eventFallback, handleSocketMessage);
        socket.on('connect', onConnect);

        return () => {
            socket.off(eventPrimary, handleSocketMessage);
            socket.off(eventFallback, handleSocketMessage);
            socket.off('connect', onConnect);
        };
    }, [msisdn, emitOtpListen, handleSocketMessage]);

    // Web OTP API (SMS autofill in supporting browsers)
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
                resetUnauthorizedGuard();
                noteSessionAuthenticated();
                clearPendingVerifyAuth();
                dispatch({ type: "DEL", key: "regpassword" });
                dispatch({ type: "DEL", key: "showloginmodal" });
                Notify({ status: 200, message: "Account verified. You are now logged in." });
                const next = resolveLoginRedirect(state?.loginRedirect, location.search);
                if (state?.loginRedirect) {
                    clearLoginRedirect(dispatch);
                }
                window.location.href = next || '/';
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
    }, [dispatch, location.search, msisdn, navigate, state?.loginRedirect, state?.regpassword]);

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
                channel: OTP_CHANNEL,
            },
            api_version: 2,
        }).then(([status, response]) => {
            if ([200, 201].includes(status)) {
                if (response?.status == 200 || response?.status == 201) {
                    Notify({ status: 200, message: "Account verified successfully." });
                    autoLogin(values.msisdn || msisdn);
                } else {
                    setMessage({
                        status: 400,
                        message: response?.message || response?.result || "Code invalid",
                    });
                }
            } else {
                setMessage({
                    status: status,
                    message: response?.error?.message || response?.message || "Verification failed",
                });
            }
            setIsLoading(false);
        }).catch(() => {
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

    // Sends the OTP. Called once automatically on load (see effect below) and
    // again from "Click Resend Code".
    const sendOTP = useCallback(() => {
        if (!msisdn) return;
        if (getCooldownRemainingSecs(msisdn) > 0) return; // still inside the 2-minute window
        const endpoint = '/auth/verification-code';
        const values = {
            msisdn,
            channel: OTP_CHANNEL,
            device_id: deviceId.current,
        };
        makeRequest({ url: endpoint, method: 'POST', data: values, api_version: 2 }).then(([status, response]) => {
            if ([200, 201].includes(status)) {
                if (response?.status == 200 || response?.status == 201 || response?.success) {
                    startResendCooldown(msisdn);
                    Notify({
                        status: 200,
                        message: "Verification code sent to phone. You can request a new one in 2 minutes.",
                    });
                } else {
                    const errorMessage = response?.result || response?.error?.message || response?.error || response?.message || "Unable to send verification code. Please try again.";
                    setMessage({ status: 400, message: errorMessage });
                    toast.error(errorMessage);
                }
            } else {
                const errorMessage = response?.result || response?.error?.message || response?.error || response?.message || "Unable to send verification code. Please try again.";
                setMessage({ status: status || 400, message: errorMessage });
                toast.error(errorMessage);
            }
        }).catch(() => {
            const errorMessage = "Unable to send verification code. Please try again.";
            setMessage({ status: 400, message: errorMessage });
            toast.error(errorMessage);
        });
        emitOtpListen();
    }, [msisdn, emitOtpListen]);

    // Auto-send the verification code once when the page loads for a phone number.
    // The ref guards against StrictMode double-invoked effects and re-renders.
    const autoSentFor = useRef(null);
    useEffect(() => {
        if (!msisdn || autoSentFor.current === msisdn) return;
        autoSentFor.current = msisdn;
        sendOTP();
    }, [msisdn, sendOTP]);

    const handleKeyPress = (event, submitFn) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            submitFn();
        }
    };

    const MyVerifyAccountForm = (props) => {
        const { errors, values, setFieldValue, handleSubmit: formSubmit } = props;

        const onFieldChanged = (ev) => {
            setFieldValue(ev.target.name, ev.target.value);
        };

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
                                        Has been sent to your phone (SMS)
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
                            <ResendCodeControl msisdn={msisdn} onResend={sendOTP} />
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
            <ToastContainer position="top-center" autoClose={5000} closeOnClick pauseOnFocusLoss draggable />
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
