import React, { useState, useEffect, useRef } from 'react';
import { Formik, Form } from 'formik';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import InputAdornment from '@mui/material/InputAdornment';
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

const CP = {
    pink: '#e91e8c',
    pinkSoft: '#ff52d4',
    pinkDeep: '#a71f66',
    card: 'rgba(255, 255, 255, 0.15)',
    input: 'rgba(0, 0, 0, 0.1)',
    border: 'rgba(255, 255, 255, 0.1)',
    text: '#ffffff',
    muted: 'rgba(255, 255, 255, 0.55)',
    label: 'rgba(255, 255, 255, 0.65)',
    titleMuted: 'rgba(255, 255, 255, 0.75)',
    headerLine: 'rgba(255, 255, 255, 0.12)',
    radius: '12px',
    radiusSm: '8px',
};

const fieldLabelSx = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    mb: '8px',
    fontSize: '15px',
    fontWeight: 500,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 1.3,
    '& svg': {
        color: CP.pink,
        fontSize: '16px',
    },
};

const textFieldSx = {
    width: '100%',
    '& .MuiOutlinedInput-root': {
        minHeight: '50px',
        backgroundColor: 'rgba(4, 10, 25, 0.42) !important',
        borderRadius: '5px',
        color: CP.text,
        fontSize: '16px',
        fontWeight: 400,
        '& fieldset': {
            borderColor: 'rgba(255, 255, 255, 0.14) !important',
            borderWidth: '1px',
        },
        '&:hover fieldset': {
            borderColor: `${CP.border} !important`,
        },
        '&.Mui-focused fieldset': {
            borderColor: 'rgba(233, 30, 140, 0.45) !important',
            borderWidth: '1px',
        },
        '&.Mui-disabled': {
            opacity: 0.9,
        },
        '&.Mui-disabled fieldset': {
            borderColor: `${CP.border} !important`,
        },
    },
    '& .MuiOutlinedInput-input': {
        py: '15px',
        px: '16px',
        color: `${CP.text} !important`,
        WebkitTextFillColor: `${CP.text} !important`,
        cursor: 'inherit',
        '&::placeholder': {
            color: 'rgba(255, 255, 255, 0.5) !important',
            WebkitTextFillColor: 'rgba(255, 255, 255, 0.5) !important',
            fontSize: '12px !important',
            fontWeight: '400 !important',
            opacity: '1 !important',
        },
        '&::-webkit-input-placeholder': {
            color: 'rgba(255, 255, 255, 0.5) !important',
            WebkitTextFillColor: 'rgba(255, 255, 255, 0.5) !important',
            fontSize: '12px !important',
            fontWeight: '400 !important',
            opacity: '1 !important',
        },
        '&::-moz-placeholder': {
            color: 'rgba(255, 255, 255, 0.5) !important',
            fontSize: '12px !important',
            fontWeight: '400 !important',
            opacity: '1 !important',
        },
        '&:-ms-input-placeholder': {
            color: 'rgba(255, 255, 255, 0.5) !important',
            fontSize: '12px !important',
            fontWeight: '400 !important',
            opacity: '1 !important',
        },
    },
    '& .MuiInputAdornment-root': {
        mr: '0.35rem',
    },
};

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
        return { score: 0, label: 'Weak', color: CP.pink };
    }
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Za-z]/.test(password) && /\d/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    if (password.length >= 12) score += 1;

    if (score <= 1) {
        return { score: Math.max(score, 1), label: 'Weak', color: CP.pink };
    }
    if (score === 2) {
        return { score, label: 'Fair', color: '#ffb74d' };
    }
    if (score === 3) {
        return { score, label: 'Good', color: '#69f0ae' };
    }
    return { score: 4, label: 'Strong', color: '#69f0ae' };
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
            <Form>
                <Box
                    sx={{
                        background: CP.card,
                        border: `1px solid ${CP.border}`,
                        borderRadius: CP.radius,
                        p: { xs: '1.15rem 1rem 1.25rem', md: '1.25rem 1.15rem 1.35rem' },
                        mb: '0.9rem',
                    }}
                >
                    <Box
                        sx={{
                            textAlign: 'center',
                            py: { xs: '24px', md: '28px' },
                            mb: '18px',
                        }}
                    >
                        <Typography
                            component="h2"
                            sx={{
                                m: 0,
                                fontSize: '1.75rem',
                                fontWeight: 800,
                                color: CP.text,
                                lineHeight: 1.25,
                            }}
                        >
                            Keep your account secure
                        </Typography>
                        <Typography
                            sx={{
                                mt: '0.35rem',
                                mb: 0,
                                fontSize: '1.32rem',
                                color: CP.muted,
                                fontWeight: 500,
                                lineHeight: 1.4,
                            }}
                        >
                            Update your password regularly to keep your account safe and protected.
                        </Typography>
                    </Box>

                    {message && (
                        <Alert
                            severity={success ? 'success' : 'error'}
                            sx={{
                                mb: '0.85rem',
                                py: '0.65rem',
                                px: '0.85rem',
                                borderRadius: CP.radiusSm,
                                fontSize: '1.39rem',
                                fontWeight: 600,
                                backgroundColor: success
                                    ? 'rgba(0, 200, 83, 0.12)'
                                    : 'rgba(255, 82, 82, 0.12)',
                                border: success
                                    ? '1px solid rgba(0, 200, 83, 0.35)'
                                    : '1px solid rgba(255, 82, 82, 0.35)',
                                color: success ? '#69f0ae' : '#ff8a80',
                                '& .MuiAlert-icon': {
                                    color: success ? '#69f0ae' : '#ff8a80',
                                    fontSize: '1.5rem',
                                    alignItems: 'center',
                                },
                            }}
                        >
                            {message}
                        </Alert>
                    )}

                    <Box sx={{ mb: '28px' }}>
                        <Typography component="label" htmlFor="mobile" sx={fieldLabelSx}>
                            <MdPhoneIphone aria-hidden="true" />
                            Mobile Number
                        </Typography>
                        <TextField
                            id="mobile"
                            name="mobile"
                            value={mobile}
                            fullWidth
                            InputProps={{
                                readOnly: true,
                            }}
                            inputProps={{
                                'aria-readonly': true,
                            }}
                            sx={textFieldSx}
                        />
                    </Box>

                    <Box sx={{ mb: '28px' }}>
                        <Typography component="label" htmlFor="otp" sx={fieldLabelSx}>
                            <FaShieldAlt aria-hidden="true" />
                            Code (OTP)
                        </Typography>
                        <TextField
                            id="otp"
                            name="code"
                            value={values.code || ''}
                            fullWidth
                            placeholder="Enter the code sent to your phone"
                            onChange={onFieldChanged}
                            onKeyPress={(ev) => handleKeyPress(ev, submitForm)}
                            autoComplete="one-time-code"
                            error={Boolean(errors.code)}
                            helperText={errors.code || null}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Button
                                            type="button"
                                            onClick={handleResendCode}
                                            disabled={resending || !mobile}
                                            sx={{
                                                minWidth: 0,
                                                p: '0.25rem 0.15rem',
                                                color: CP.pink,
                                                fontSize: '1.25rem',
                                                fontWeight: 800,
                                                letterSpacing: '0.04em',
                                                textTransform: 'uppercase',
                                                lineHeight: 1,
                                                '&:hover': {
                                                    backgroundColor: 'transparent',
                                                    color: CP.pinkSoft,
                                                },
                                                '&.Mui-disabled': {
                                                    color: CP.pink,
                                                    opacity: 0.55,
                                                },
                                            }}
                                        >
                                            {resending ? '…' : 'RESEND'}
                                        </Button>
                                    </InputAdornment>
                                ),
                            }}
                            FormHelperTextProps={{
                                sx: {
                                    m: '0.35rem 0 0',
                                    fontSize: '1.32rem',
                                    fontWeight: 500,
                                    color: '#ff6b81 !important',
                                },
                            }}
                            sx={textFieldSx}
                        />
                        <Typography
                            sx={{
                                mt: '15px',
                                fontSize: '15px',
                                color: CP.muted,
                                lineHeight: 1.4,
                            }}
                        >
                            Didn&apos;t receive the code?{' '}
                            <Link
                                component="button"
                                type="button"
                                onClick={handleResendCode}
                                disabled={resending || !mobile}
                                underline="always"
                                sx={{
                                    verticalAlign: 'baseline',
                                    color: CP.pink,
                                    fontSize: 'inherit',
                                    fontWeight: 700,
                                    cursor: resending || !mobile ? 'not-allowed' : 'pointer',
                                    opacity: resending || !mobile ? 0.55 : 1,
                                    '&:hover': {
                                        color: CP.pinkSoft,
                                    },
                                }}
                            >
                                {resending ? 'Sending…' : 'Request OTP code'}
                            </Link>
                        </Typography>
                    </Box>

                    <Box sx={{ mb: '28px' }}>
                        <Typography component="label" htmlFor="password" sx={fieldLabelSx}>
                            <FaLock aria-hidden="true" />
                            New Password
                        </Typography>
                        <TextField
                            id="password"
                            name="password"
                            value={values.password || ''}
                            fullWidth
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter your new password"
                            onChange={onFieldChanged}
                            onKeyPress={(ev) => handleKeyPress(ev, submitForm)}
                            autoComplete="new-password"
                            error={Boolean(errors.password)}
                            helperText={errors.password || null}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            type="button"
                                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                                            onClick={() => setShowPassword((prev) => !prev)}
                                            edge="end"
                                            sx={{
                                                color: CP.muted,
                                                fontSize: '1.55rem',
                                                p: '0.25rem',
                                                '&:hover': { color: '#fff', backgroundColor: 'transparent' },
                                            }}
                                        >
                                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            FormHelperTextProps={{
                                sx: {
                                    m: '0.35rem 0 0',
                                    fontSize: '1.32rem',
                                    fontWeight: 500,
                                    color: '#ff6b81 !important',
                                },
                            }}
                            sx={textFieldSx}
                        />
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                justifyContent: 'space-between',
                                gap: '0.75rem',
                                mt: '0.4rem',
                            }}
                        >
                            <Typography
                                sx={{
                                    m: 0,
                                    flex: 1,
                                    fontSize: '1.22rem',
                                    color: CP.muted,
                                    lineHeight: 1.35,
                                }}
                            >
                                Use 8+ characters with a mix of letters, numbers &amp; symbols
                            </Typography>
                            <Box sx={{ flexShrink: 0, textAlign: 'right', minWidth: '6.5rem' }}>
                                <Typography
                                    sx={{
                                        m: '0 0 0.3rem',
                                        fontSize: '1.18rem',
                                        color: CP.muted,
                                        lineHeight: 1.2,
                                    }}
                                >
                                    Strength:{' '}
                                    <Box
                                        component="strong"
                                        sx={{ color: strength.color, fontWeight: 800 }}
                                    >
                                        {strength.label}
                                    </Box>
                                </Typography>
                                <Box
                                    aria-hidden="true"
                                    sx={{
                                        display: 'flex',
                                        gap: '0.25rem',
                                        justifyContent: 'flex-end',
                                    }}
                                >
                                    {[1, 2, 3, 4].map((level) => (
                                        <Box
                                            key={level}
                                            sx={{
                                                display: 'block',
                                                width: '1.35rem',
                                                height: '0.32rem',
                                                borderRadius: '2px',
                                                background:
                                                    strength.score >= level
                                                        ? strength.color
                                                        : 'rgba(255, 255, 255, 0.15)',
                                            }}
                                        />
                                    ))}
                                </Box>
                            </Box>
                        </Box>
                    </Box>

                    <Box sx={{ mb: '28px' }}>
                        <Typography component="label" htmlFor="confirm_password" sx={fieldLabelSx}>
                            <FaLock aria-hidden="true" />
                            Confirm New Password
                        </Typography>
                        <TextField
                            id="confirm_password"
                            name="repeat_password"
                            value={values.repeat_password || ''}
                            fullWidth
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Re-enter your new password"
                            onChange={onFieldChanged}
                            onKeyPress={(ev) => handleKeyPress(ev, submitForm)}
                            autoComplete="new-password"
                            error={Boolean(errors.repeat_password)}
                            helperText={errors.repeat_password || null}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            type="button"
                                            aria-label={
                                                showConfirmPassword ? 'Hide password' : 'Show password'
                                            }
                                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                                            edge="end"
                                            sx={{
                                                color: CP.muted,
                                                fontSize: '1.55rem',
                                                p: '0.25rem',
                                                '&:hover': { color: '#fff', backgroundColor: 'transparent' },
                                            }}
                                        >
                                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            FormHelperTextProps={{
                                sx: {
                                    m: '0.35rem 0 0',
                                    fontSize: '1.32rem',
                                    fontWeight: 500,
                                    color: '#ff6b81 !important',
                                },
                            }}
                            sx={textFieldSx}
                        />
                    </Box>

                    <Button
                        type="submit"
                        fullWidth
                        onClick={submitForm}
                        startIcon={<FaLock aria-hidden="true" />}
                        sx={{
                            mt: '0.35rem',
                            minHeight: '4rem',
                            py: '0.8rem',
                            px: '1rem',
                            borderRadius: CP.radiusSm,
                            background: `linear-gradient(90deg, ${CP.pink} 0%, ${CP.pinkDeep} 100%)`,
                            color: '#fff',
                            fontSize: '1.68rem',
                            fontWeight: 500,
                            letterSpacing: '0.08em',
                            textTransform: 'capitalize',
                            boxShadow: 'none',
                            gap: '0.35rem',
                            '& .MuiButton-startIcon': {
                                m: 0,
                                fontSize: '1.55rem',
                                '& > *:nth-of-type(1)': {
                                    fontSize: '1.55rem',
                                },
                            },
                            '&:hover': {
                                background: CP.pinkDeep,
                                boxShadow: 'none',
                            },
                            '&.Mui-disabled': {
                                opacity: 0.65,
                                color: '#fff',
                            },
                        }}
                    >
                        Reset Password
                    </Button>
                </Box>
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
        <Box
            className="change-password-page"
            sx={{
                color: CP.text,
                background: 'transparent',
                minHeight: '100%',
                pb: '1.5rem',
                fontSize: '1.53rem',
                boxSizing: 'border-box',
                '& *': { boxSizing: 'border-box' },
                '@keyframes changePasswordTwinkle': {
                    '0%, 100%': { opacity: 0.45, transform: 'scale(0.9)' },
                    '50%': { opacity: 1, transform: 'scale(1.1)' },
                },
            }}
        >
            <ToastContainer position="top-center" autoClose={5000} closeOnClick pauseOnFocusLoss draggable />

            <Box
                component="header"
                sx={{
                    display: 'grid',
                    gridTemplateColumns: '2.5rem 1fr 2.5rem',
                    alignItems: 'center',
                    gap: '0.75rem',
                    width: '100%',
                    mt: '0.75rem',
                    mb: { xs: '1.5rem', md: '1.75rem' },
                    pt: { xs: '1.15rem', md: '1.25rem' },
                    px: { xs: '1rem', md: '1.25rem' },
                    pb: { xs: '1.25rem', md: '1.35rem' },
                    background: 'transparent',
                    borderBottom: `1px solid ${CP.headerLine}`,
                }}
            >
                <IconButton
                    type="button"
                    aria-label="Go back"
                    onClick={() => navigate(-1)}
                    sx={{
                        width: '2.5rem',
                        height: '2.5rem',
                        borderRadius: '50%',
                        border: '1.5px solid rgba(255, 255, 255, 0.35)',
                        color: CP.titleMuted,
                        p: 0,
                        fontSize: '1.32rem',
                        '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                            borderColor: 'rgba(255, 255, 255, 0.55)',
                        },
                    }}
                >
                    <FaArrowLeft />
                </IconButton>
                <Typography
                    component="h1"
                    sx={{
                        m: 0,
                        textAlign: 'center',
                        fontSize: { xs: '1.75rem', md: '1.89rem' },
                        fontWeight: 700,
                        letterSpacing: '0.01em',
                        color: CP.titleMuted,
                        lineHeight: 1.25,
                    }}
                >
                    Change Password
                </Typography>
                <Box
                    aria-hidden="true"
                    title="Secure"
                    sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '2.5rem',
                        height: '2.5rem',
                        color: CP.pink,
                        fontSize: '1.89rem',
                    }}
                >
                    <FaShieldAlt />
                </Box>
            </Box>

            <Box
                sx={{
                    maxWidth: { xs: 480, md: 520 },
                    mx: 'auto',
                    px: { xs: '1rem', md: '1.25rem' },
                    pt: { xs: 0, md: '0.35rem' },
                    pb: { xs: '1rem', md: '1.25rem' },
                }}
            >
                <Box
                    aria-hidden="true"
                    sx={{
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mt: '0.5rem',
                        mb: '1.25rem',
                        minHeight: '5.5rem',
                    }}
                >
                    <Box
                        component={FaStar}
                        sx={{
                            position: 'absolute',
                            color: CP.pink,
                            opacity: 0.85,
                            pointerEvents: 'none',
                            animation: 'changePasswordTwinkle 2.4s ease-in-out infinite',
                            top: '8%',
                            left: '28%',
                            fontSize: '1.1rem',
                        }}
                    />
                    <Box
                        component={FaStar}
                        sx={{
                            position: 'absolute',
                            color: CP.pink,
                            opacity: 0.85,
                            pointerEvents: 'none',
                            animation: 'changePasswordTwinkle 2.4s ease-in-out infinite',
                            animationDelay: '0.6s',
                            top: '18%',
                            right: '26%',
                            fontSize: '0.75rem',
                        }}
                    />
                    <Box
                        component={FaStar}
                        sx={{
                            position: 'absolute',
                            color: CP.pink,
                            opacity: 0.85,
                            pointerEvents: 'none',
                            animation: 'changePasswordTwinkle 2.4s ease-in-out infinite',
                            animationDelay: '1.2s',
                            bottom: '12%',
                            left: '32%',
                            fontSize: '0.85rem',
                        }}
                    />
                    <Box
                        sx={{
                            position: 'relative',
                            zIndex: 1,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '4.75rem',
                            height: '4.75rem',
                            color: CP.pink,
                            fontSize: '4.5rem',
                            filter: 'drop-shadow(0 4px 14px rgba(233, 30, 140, 0.35))',
                        }}
                    >
                        <FaShieldAlt />
                        <Box
                            sx={{
                                position: 'absolute',
                                left: '50%',
                                top: '52%',
                                transform: 'translate(-50%, -50%)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.15rem',
                                color: '#fff',
                                pointerEvents: 'none',
                                '& svg': { fontSize: '1.35rem' },
                            }}
                        >
                            <FaLock />
                            <Box sx={{ display: 'flex', gap: '0.2rem' }}>
                                {[0, 1, 2, 3].map((i) => (
                                    <Box
                                        key={i}
                                        sx={{
                                            width: '0.28rem',
                                            height: '0.28rem',
                                            borderRadius: '50%',
                                            background: '#fff',
                                            opacity: 0.95,
                                        }}
                                    />
                                ))}
                            </Box>
                        </Box>
                    </Box>
                </Box>

                <PasswordResetForm />

                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.55rem',
                        mt: '0.75rem',
                        p: '0.25rem',
                        color: CP.muted,
                        fontSize: '1.29rem',
                        lineHeight: 1.35,
                        textAlign: 'center',
                    }}
                >
                    <Box
                        component={FaShieldAlt}
                        aria-hidden="true"
                        sx={{
                            color: CP.pink,
                            fontSize: '1.55rem',
                            flexShrink: 0,
                        }}
                    />
                    <span>Your data is encrypted and secure.</span>
                </Box>
            </Box>
        </Box>
    );
};

export default ResetPassword;
