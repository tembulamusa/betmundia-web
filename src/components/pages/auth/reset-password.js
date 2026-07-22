import React, { useState, useEffect, useRef } from 'react';
import { Formik, Form } from 'formik';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import makeRequest from "../../utils/fetch-request";
import { getFromLocalStorage } from "../../utils/local-storage";
import {
    FaArrowLeft,
    FaShieldAlt,
    FaLock,
    FaEye,
    FaEyeSlash,
    FaStar,
} from 'react-icons/fa';
import { MdPhoneIphone } from 'react-icons/md';

const getMobileFromStorage = () => {
    const user = getFromLocalStorage("user");
    const fromUser = user?.phone || user?.mobile || user?.msisdn;
    if (fromUser) return fromUser;
    try {
        const raw = window.localStorage.getItem("reset_mobile");
        return raw || '';
    } catch {
        return '';
    }
};

const getPasswordStrength = (password) => {
    if (!password) {
        return { score: 0, label: 'Weak', className: 'change-password-strength--weak' };
    }
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Za-z]/.test(password) && /\d/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    if (password.length >= 12) score += 1;

    if (score <= 1) {
        return { score: Math.max(score, 1), label: 'Weak', className: 'change-password-strength--weak' };
    }
    if (score === 2) {
        return { score, label: 'Fair', className: 'change-password-strength--fair' };
    }
    if (score === 3) {
        return { score, label: 'Good', className: 'change-password-strength--good' };
    }
    return { score: 4, label: 'Strong', className: 'change-password-strength--strong' };
};

const ResetPassword = (props) => {
    const navigate = useNavigate();
    const [success, setSuccess] = useState(false);
    const [message, setMessage] = useState(null);
    const [otp_sent, setOtpSent] = useState(false);
    const [resetID, setResetID] = useState('');
    const [mobile, setMobile] = useState('');
    const [resending, setResending] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const hasAutoSubmitted = useRef(false);

    const initialResetFormValues = {
        code: '',
        password: '',
        repeat_password: '',
    };

    const handleSubmit = (mobileValue) => {
        const num = mobileValue !== undefined && mobileValue !== '' ? mobileValue : mobile;
        if (!num) {
            toast.error('Please enter a mobile number.');
            return;
        }
        const endpoint = '/auth/verification-code';
        const data = { mobile: num };
        makeRequest({ url: endpoint, method: 'POST', data, api_version: 2 }).then(([status, response]) => {
            const ok = status === 200 || status === 201;
            setSuccess(ok);
            const msg = response?.success?.message || response?.error?.message || response?.message || (ok ? 'Code sent to your phone.' : 'Failed to send code.');
            setMessage(msg);
            if (ok) {
                setOtpSent(true);
                setResetID(response.success?.id ?? '');
                setMobile(num);
                toast.success(msg);
            } else {
                toast.error(msg);
            }
        }).catch(() => {
            const errMsg = 'Failed to send code. Please try again.';
            setSuccess(false);
            setMessage(errMsg);
            toast.error(errMsg);
        });
    };

    const handleResendCode = () => {
        if (resending || !mobile) return;
        setResending(true);
        const endpoint = '/auth/verification-code';
        makeRequest({ url: endpoint, method: 'POST', data: { msisdn: mobile }, api_version: 2 }).then(([status, response]) => {
            const ok = status === 200 || status === 201;
            const msg = response?.success?.message || response?.error?.message || (ok ? 'Code sent again.' : 'Failed to resend code.');
            setMessage(msg);
            setSuccess(ok);
            if (response?.status == 200 || response?.status == 201) {
                toast.success(msg);
            } else {
                toast.error(response?.result || response?.error || 'Failed to resend code. Please try again.');
            }
        }).catch(() => {
            const errMsg = 'Failed to resend code. Please try again.';
            setMessage(errMsg);
            setSuccess(false);
            toast.error(errMsg);
        }).finally(() => {
            setResending(false);
        });
    };

    useEffect(() => {
        const storedMobile = getMobileFromStorage();
        setMobile(storedMobile);
        if (storedMobile && !hasAutoSubmitted.current) {
            // hasAutoSubmitted.current = true;
            // handleSubmit(storedMobile);
        }
        return () => {
            setSuccess(false);
            setMessage(null);
            setOtpSent(false);
            setResetID('');
            setResending(false);
        };
    }, []);

    const handleSubmitPasswordReset = (values) => {
        const payload = {
            msisdn: mobile,
            verification_code: values.code,
            password: values.password,
        };

        const endpoint = '/auth/reset-password';

        makeRequest({
            url: endpoint,
            method: 'POST',
            data: payload,
            api_version: 2
        })
            .then(([status, response]) => {
                const ok = status === 200 || status === 201;

                const msg =
                    response?.error?.message ||
                    response?.success?.message ||
                    response?.message ||
                    (ok ? 'Password reset successfully.' : 'Something went wrong.');

                setSuccess(ok);
                setMessage(msg);

                if (ok) {
                    toast.success(msg);
                    setTimeout(() => {
                        window.location.href = "/";
                    }, 2000);
                } else {
                    toast.error(msg);
                }
            })
            .catch(() => {
                setSuccess(false);
                setMessage('Failed to reset password. Please try again.');
                toast.error('Failed to reset password. Please try again.');
            });
    };

    const validatePasswordReset = password_reset_values => {
        let password_reset_errors = {};
        if (!password_reset_values.code) {
            password_reset_errors.code = "Please enter your One Time Pin (OTP)";
        }
        if (password_reset_values.code && password_reset_values.code.length < 4) {
            password_reset_errors.code = "Your OTP should be greater than 4 numbers.";
        }
        if (!password_reset_values.password) {
            password_reset_errors.password = "Please enter your new password";
        }
        if (!password_reset_values.repeat_password) {
            password_reset_errors.repeat_password = "Please enter your password confirmation";
        }
        if (password_reset_values.password !== password_reset_values.repeat_password) {
            password_reset_errors.repeat_password = "The passwords do not match. Please enter the password you entered above.";
        }
        return password_reset_errors;
    };

    const handleKeyPress = (event, submitForm) => {
        if (event.key == 'Enter') {
            event.preventDefault();
            submitForm();
        }
    };

    const MyPasswordResetForm = (props) => {
        const { errors, values, submitForm, setFieldValue } = props;
        const strength = getPasswordStrength(values.password);

        const onFieldChanged = (ev) => {
            let field = ev.target.name;
            let value = ev.target.value;
            setFieldValue(field, value);
        };

        return (
            <Form className="change-password-form">
                <div className="change-password-card">
                    <h2 className="change-password-card-title">Keep your account secure</h2>
                    <p className="change-password-card-sub">
                        Update your password regularly to keep your account safe and protected.
                    </p>

                    {message && (
                        <div
                            role="alert"
                            className={`change-password-alert change-password-alert--${success ? 'success' : 'danger'}`}
                        >
                            {message}
                        </div>
                    )}

                    <div className="change-password-field">
                        <label className="change-password-field-label" htmlFor="mobile">
                            <MdPhoneIphone aria-hidden="true" />
                            Mobile Number
                        </label>
                        <div className="change-password-input-wrap">
                            <input
                                value={mobile}
                                className="change-password-field-input"
                                id="mobile"
                                name="mobile"
                                type="text"
                                readOnly
                                aria-readonly="true"
                            />
                        </div>
                    </div>

                    <div className="change-password-field">
                        <label className="change-password-field-label" htmlFor="otp">
                            <FaShieldAlt aria-hidden="true" />
                            Code (OTP)
                        </label>
                        <div className="change-password-input-wrap change-password-input-wrap--otp">
                            <input
                                value={values.code || ''}
                                className="change-password-field-input"
                                id="otp"
                                name="code"
                                type="text"
                                placeholder="Enter the code sent to your phone"
                                onChange={ev => onFieldChanged(ev)}
                                onKeyPress={ev => handleKeyPress(ev, submitForm)}
                                autoComplete="one-time-code"
                            />
                            <button
                                type="button"
                                className="change-password-resend-btn"
                                onClick={handleResendCode}
                                disabled={resending || !mobile}
                            >
                                {resending ? '…' : 'RESEND'}
                            </button>
                        </div>
                        {errors.code && <div className="change-password-field-error">{errors.code}</div>}
                        <p className="change-password-otp-hint">
                            Didn&apos;t receive the code?{' '}
                            <button
                                type="button"
                                className="change-password-otp-link"
                                onClick={handleResendCode}
                                disabled={resending || !mobile}
                            >
                                {resending ? 'Sending…' : 'Request OTP code'}
                            </button>
                        </p>
                    </div>

                    <div className="change-password-field">
                        <label className="change-password-field-label" htmlFor="password">
                            <FaLock aria-hidden="true" />
                            New Password
                        </label>
                        <div className="change-password-input-wrap change-password-input-wrap--password">
                            <input
                                value={values.password || ''}
                                className="change-password-field-input"
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter your new password"
                                onChange={ev => onFieldChanged(ev)}
                                onKeyPress={ev => handleKeyPress(ev, submitForm)}
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                className="change-password-toggle-btn"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                onClick={() => setShowPassword((prev) => !prev)}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                        {errors.password && <div className="change-password-field-error">{errors.password}</div>}
                        <div className="change-password-strength-row">
                            <p className="change-password-hint">
                                Use 8+ characters with a mix of letters, numbers &amp; symbols
                            </p>
                            <div className={`change-password-strength ${strength.className}`}>
                                <p className="change-password-strength-label">
                                    Strength: <strong>{strength.label}</strong>
                                </p>
                                <div className="change-password-strength-bars" aria-hidden="true">
                                    {[1, 2, 3, 4].map((level) => (
                                        <span
                                            key={level}
                                            className={strength.score >= level ? 'is-active' : ''}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="change-password-field">
                        <label className="change-password-field-label" htmlFor="confirm_password">
                            <FaLock aria-hidden="true" />
                            Confirm New Password
                        </label>
                        <div className="change-password-input-wrap change-password-input-wrap--password">
                            <input
                                value={values.repeat_password || ''}
                                className="change-password-field-input"
                                id="confirm_password"
                                name="repeat_password"
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="Re-enter your new password"
                                onChange={ev => onFieldChanged(ev)}
                                onKeyPress={ev => handleKeyPress(ev, submitForm)}
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                className="change-password-toggle-btn"
                                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                                onClick={() => setShowConfirmPassword((prev) => !prev)}
                            >
                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                        {errors.repeat_password && (
                            <div className="change-password-field-error">{errors.repeat_password}</div>
                        )}
                    </div>

                    <button
                        type="submit"
                        onClick={submitForm}
                        className="change-password-submit-btn"
                    >
                        <FaLock aria-hidden="true" />
                        Reset Password
                    </button>
                </div>
            </Form>
        );
    };

    const PasswordResetForm = () => {
        return (
            <Formik
                initialValues={initialResetFormValues}
                onSubmit={handleSubmitPasswordReset}
                validateOnChange={false}
                validateOnBlur={false}
                validate={validatePasswordReset}
            >
                {(props) => <MyPasswordResetForm {...props} />}
            </Formik>
        );
    };

    return (
        <div className="change-password-page">
            <ToastContainer position="top-center" autoClose={5000} closeOnClick pauseOnFocusLoss draggable />

            <header className="change-password-page-header">
                <button
                    type="button"
                    className="change-password-page-back"
                    aria-label="Go back"
                    onClick={() => navigate(-1)}
                >
                    <FaArrowLeft />
                </button>
                <h1 className="change-password-page-title">Change Password</h1>
                <span className="change-password-page-secure-icon" aria-hidden="true" title="Secure">
                    <FaShieldAlt />
                </span>
            </header>

            <div className="change-password-page-inner">
                <div className="change-password-hero" aria-hidden="true">
                    <FaStar className="change-password-hero-sparkle change-password-hero-sparkle--1" />
                    <FaStar className="change-password-hero-sparkle change-password-hero-sparkle--2" />
                    <FaStar className="change-password-hero-sparkle change-password-hero-sparkle--3" />
                    <span className="change-password-hero-shield">
                        <FaShieldAlt />
                        <span className="change-password-hero-lock">
                            <FaLock />
                            <span className="change-password-hero-dots">
                                <span /><span /><span /><span />
                            </span>
                        </span>
                    </span>
                </div>

                <PasswordResetForm />

                <div className="change-password-trust">
                    <FaShieldAlt className="change-password-trust-icon" aria-hidden="true" />
                    <span>Your data is encrypted and secure.</span>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
