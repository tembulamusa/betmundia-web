import React, { useState, useEffect, useRef } from 'react';
import { Formik, Form } from 'formik';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import makeRequest from "../../utils/fetch-request";
import { getFromLocalStorage } from "../../utils/local-storage";

const Header = React.lazy(() => import('../../header/header'));
const SideBar = React.lazy(() => import('../../sidebar/awesome/Sidebar'));
const Right = React.lazy(() => import('../../right/index'));
const Footer = React.lazy(() => import('../../footer/footer'));

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

const ResetPassword = (props) => {

    const [success, setSuccess] = useState(false);
    const [message, setMessage] = useState(null);
    const [otp_sent, setOtpSent] = useState(false);
    const [resetID, setResetID] = useState('');
    const [mobile, setMobile] = useState('');
    const [resending, setResending] = useState(false);
    const hasAutoSubmitted = useRef(false);

    const initialResetFormValues = {
        id: '',
        code: '',
        password: '',
        repeat_password: ''
    };

    const handleSubmit = (mobileValue) => {
        const num = mobileValue !== undefined && mobileValue !== '' ? mobileValue : mobile;
        if (!num) {
            toast.error('Please enter a mobile number.');
            return;
        }
        const endpoint = '/code';
        const data = { mobile: num };
        makeRequest({ url: endpoint, method: 'POST', data }).then(([status, response]) => {
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
        const endpoint = '/code';
        makeRequest({ url: endpoint, method: 'POST', data: { mobile } }).then(([status, response]) => {
            const ok = status === 200 || status === 201;
            const msg = response?.success?.message || response?.error?.message || (ok ? 'Code sent again.' : 'Failed to resend code.');
            setMessage(msg);
            setSuccess(ok);
            if (ok) {
                toast.success(msg);
            } else {
                toast.error(msg);
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
            hasAutoSubmitted.current = true;
            handleSubmit(storedMobile);
        }
        return () => {
            setSuccess(false);
            setMessage(null);
            setOtpSent(false);
            setResetID('');
            setResending(false);
        };
    }, []);

    const handleSubmitPasswordReset = values => {
        values.mobile = mobile;
        values.id = resetID;
        const endpoint = '/v1/reset-password';
        makeRequest({ url: endpoint, method: 'POST', data: values }).then(([status, response]) => {
            const ok = status === 200 || status === 201;
            const msg = response?.error?.message || response?.success?.message || response?.message || (ok ? 'Password reset successfully.' : 'Something went wrong.');
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
        }).catch(() => {
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
        if (password_reset_values.code.length < 4) {
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

    const FormTitle = () => {
        return (
            <div className='col-md-12 primary-bg p-4 text-center'>
                <h4 className="inline-block">
                    RECOVER YOUR ACCOUNT
                </h4>
            </div>
        );
    };

    const MyPasswordResetForm = (props) => {
        const { errors, values, submitForm, setFieldValue } = props;

        const onFieldChanged = (ev) => {
            let field = ev.target.name;
            let value = ev.target.value;
            setFieldValue(field, value);
        };

        return (
            <Form className="d-block">
                <div className="pt-0">
                    <div className="row">
                        <div className="col-md-12">
                            <div className="form-group row d-flex justify-content-center mt-3">
                                <label>Mobile Number</label>
                                <input
                                    value={mobile}
                                    className="text-dark deposit-input form-control col-md-12 input-field bg-light"
                                    id="mobile"
                                    name="mobile"
                                    type="text"
                                    readOnly
                                    aria-readonly="true"
                                />
                            </div>
                            <div className="form-group row d-flex justify-content-center mt-5">
                                <label>Code (OTP)</label>
                                <input
                                    value={values.code}
                                    className="text-dark deposit-input form-control col-md-12 input-field"
                                    id="otp"
                                    name="code"
                                    type="text"
                                    placeholder='Enter the code sent to your phone'
                                    onChange={ev => onFieldChanged(ev)}
                                    onKeyPress={ev => handleKeyPress(ev, submitForm)}
                                />
                                {errors.code && <div className='text-danger small mt-1'>{errors.code}</div>}
                                <p className="small text-muted mt-1 mb-0">
                                    Didn&apos;t receive the code?{' '}
                                    <button
                                        type="button"
                                        className="btn btn-link p-0 align-baseline small text-primary text-decoration-underline"
                                        onClick={handleResendCode}
                                        disabled={resending}
                                    >
                                        {resending ? 'Sending…' : 'Resend code'}
                                    </button>
                                </p>
                            </div>
                            <div className="form-group row d-flex justify-content-center mt-5">
                                <label>Password</label>
                                <input
                                    value={values.password}
                                    className="text-dark deposit-input form-control col-md-12 input-field"
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder='Password'
                                    onChange={ev => onFieldChanged(ev)}
                                    onKeyPress={ev => handleKeyPress(ev, submitForm)}
                                />
                                {errors.password && <div className='text-danger'>{errors.password}</div>}
                            </div>
                            <div className="form-group row d-flex justify-content-center mt-5">
                                <label>Confirm Password</label>
                                <input
                                    value={values.repeat_password}
                                    className="text-dark deposit-input form-control col-md-12 input-field"
                                    id="confirm_password"
                                    name="repeat_password"
                                    type="password"
                                    placeholder='Password'
                                    onChange={ev => onFieldChanged(ev)}
                                    onKeyPress={ev => handleKeyPress(ev, submitForm)}
                                />
                                {errors.repeat_password && <div className='text-danger'>{errors.repeat_password}</div>}
                            </div>
                            <div className="form-group row d-flex justify-content-left mb-4">
                                <div className="">
                                    <button type="submit"
                                        onClick={submitForm}
                                        className='btn btn-lg btn-primary mt-5 col-md-12 deposit-withdraw-button'>
                                        Reset Password
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Form >
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

    const Alert = () => {
        if (!message) return null;
        return (
            <div className={`alert alert-dismissible mb-4 ${success ? 'alert-success' : 'alert-danger'}`} role="alert">
                <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                {message}
            </div>
        );
    };

    return (
        <>
            <ToastContainer position="top-center" autoClose={5000} closeOnClick pauseOnFocusLoss draggable />
            <div className='col-md-12 bg-primary p-4 text-center'>
                Change Password
            </div>

            <div className="row">
                <div className="col-md-12 p-5 d-flex flex-column align-items-center">
                    <Alert />
                    <PasswordResetForm />
                </div>
            </div>
        </>

    );
};

export default ResetPassword;
