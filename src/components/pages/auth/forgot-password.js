
// This component is also in charge of verifying phone number/account.
// We use the same thing to forgot password and 

import React, { useState, useContext, useEffect } from 'react';
import { Formik, Form } from 'formik';
import makeRequest from "../../utils/fetch-request";
import { useNavigate, useSearchParams } from 'react-router-dom';
import Notify from '../../utils/Notify';
import Alert from '../../utils/alert';
import { Context } from "../../../context/store";


const ResetPassword = (props) => {
    const [message, setMessage] = useState(null);
    const [otp_sent, setOtpSent] = useState(false);
    const [msisdn, setMsisdn] = useState('');
    const navigate = useNavigate();
    const [state, dispatch] = useContext(Context);
    const [searchParams] = useSearchParams();
    const forgotType = searchParams.get("forgot-type");

    useEffect(() => {
        dispatch({ type: "DEL", key: "showloginmodal" });
    }, [])

    useEffect(() => {
        if (state?.user) {
            navigate("/");
        }
    }, [state?.user])
    const initialValues = {
        msisdn: '',
    };

    const initialResetFormValues = {
        id: '',
        verificationCode: '',
        password: '',
        repeat_password: ''
    };

    const handleSubmit = values => {
        setMsisdn(values.msisdn);
        let endpoint = '/auth/forgot-password';
        makeRequest({ url: endpoint, method: 'POST', data: values, api_version: 2 }).then(([status, response]) => {
            if (status == 200) {
                if (response?.status == 200) {
                    setMessage({ status: 200, message: "Verification Code sent to your phone number" });
                    setOtpSent(true);
                } else {
                    setMessage({ status: 400, message: response?.result });
                }
            } else {
                setMessage({ status: 400, message: "Unable to process" });
            }
        });
    };

    const handleSubmitPasswordReset = values => {
        values.msisdn = msisdn;
        values = { msisdn: msisdn, verification_code: values.verificationCode, password: values.password };

        let endpoint = '/auth/reset-password';
        makeRequest({ url: endpoint, method: 'POST', data: values, api_version: 2 }).then(([status, response]) => {
            if ([200, 201].includes(status)) {
                if (response?.status == 200) {
                    Notify({ status: 200, message: "Password reset successfully. Login to continue" });
                    navigate("/login");
                } else {
                    setMessage({ status: 400, message: "Error occurred. Wrong or stale code used." });
                }
            } else {
                setMessage({ status: status, message: "unable to process request" });
            }
        });
    };

    const validate = values => {
        let errors = {};
        if (!values.msisdn || !values.msisdn.match(/(254|0|)?[71]\d{8}/g)) {
            errors.msisdn = 'Please enter a valid phone number';
        }
        return errors;
    };

    const validatePasswordReset = password_reset_values => {
        let password_reset_errors = {};
        if (!password_reset_values.verificationCode) {
            password_reset_errors.verificationCode = "Please enter your One Time Pin (OTP)";
        }
        if (password_reset_values.verificationCode.length < 4) {
            password_reset_errors.verificationCode = "Your OTP should be greater than 4 numbers.";
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

    const MyOtpForm = (props) => {
        const { errors, values, submitForm, setFieldValue } = props;

        const onFieldChanged = (ev) => {
            let field = ev.target.name;
            let value = ev.target.value;
            setFieldValue(field, value);
        };

        return (
            <Form className={`${otp_sent ? 'd-none' : 'd-block'}`}>
                <div className="pt-0">
                    <div className="row">
                        <div className="form-group row d-flex justify-content-center mt-2">
                            <div className="col-md-12">
                                <label>Your Number</label>
                                <input
                                    value={values.msisdn}
                                    className="text-dark deposit-input form-control col-md-12 input-field"
                                    id="msisdn"
                                    name="msisdn"
                                    type="text"
                                    placeholder='Phone number'
                                    onChange={ev => onFieldChanged(ev)}
                                    onKeyPress={ev => handleKeyPress(ev, submitForm)} // Add key press handler
                                />
                                {errors.msisdn && <div className='text-danger'> {errors.msisdn} </div>}
                            </div>
                        </div>

                        <div className="form-group row d-flex justify-content-left mb-4">
                            <div className="col-md-6">
                                <button type="submit"
                                    onClick={submitForm}
                                    className='btn btn-lg btn-primary mt-5 col-md-12 deposit-withdraw-button'>
                                    Send OTP
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </Form>
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
            <Form className={`${otp_sent ? 'd-block' : 'd-none'}`}>
                <div className="row">
                    <div className="col-md-12">
                        <div className="col-md-12">
                            <div className="form-group row d-flex justify-content-center mt-3">
                                <input
                                    value={msisdn}
                                    className="mb-3 block text-dark deposit-input form-control col-md-12 input-field"
                                    name="msisdn"
                                    type="text"
                                    disabled={true}
                                />
                                <label className='block mt-2'>OTP</label>
                                <input
                                    value={values.verificationCode}
                                    className="text-dark deposit-input form-control col-md-12 input-field"
                                    id="otp"
                                    name="verificationCode"
                                    type="text"
                                    placeholder='OTP'
                                    onChange={ev => onFieldChanged(ev)}
                                    onKeyPress={ev => handleKeyPress(ev, submitForm)} // Add key press handler
                                />
                                {errors.verificationCode && <div className='text-danger'>
                                    {errors.verificationCode}
                                </div>}
                            </div>
                        </div>
                        <div className="form-group row d-flex justify-content-center">
                            <div className="col-md-12 mt-3">
                                <label>Password</label>
                                <input
                                    value={values.password}
                                    className="text-dark deposit-input form-control col-md-12 input-field"
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder='Password'
                                    onChange={ev => onFieldChanged(ev)}
                                    onKeyPress={ev => handleKeyPress(ev, submitForm)} // Add key press handler
                                />
                                {errors.password && <div className='text-danger'>
                                    {errors.password}
                                </div>}
                            </div>
                            <div className="col-md-12 mt-3">
                                <label>Confirm Password</label>
                                <input
                                    value={values.repeat_password}
                                    className="text-dark deposit-input form-control col-md-12 input-field"
                                    id="confirm_password"
                                    name="repeat_password"
                                    type="password"
                                    placeholder='Password'
                                    onChange={ev => onFieldChanged(ev)}
                                    onKeyPress={ev => handleKeyPress(ev, submitForm)} // Add key press handler
                                />
                                {errors.repeat_password &&
                                    <div className='text-danger'>
                                        {errors.repeat_password}
                                    </div>}
                            </div>
                        </div>

                        <div className="form-group row d-flex justify-content-left mb-4">
                            <div className="col-6">
                                <button type="submit"
                                    onClick={submitForm}
                                    className='btn btn-lg btn-primary mt-5 col-md-12 deposit-withdraw-button !capitalize'>
                                    Reset Password
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </Form>
        );
    };

    const OptForm = (props) => {
        return (
            <Formik
                initialValues={initialValues}
                onSubmit={handleSubmit}
                validate={validate}
            >
                {(props) => <MyOtpForm {...props} />}
            </Formik>
        );
    };

    const PasswordResetForm = (props) => {
        return (
            <Formik
                initialValues={initialResetFormValues}
                onSubmit={handleSubmitPasswordReset}
                validate={validatePasswordReset}
            >
                {(props) => <MyPasswordResetForm {...props} />}
            </Formik>
        );
    };

    return (
        <>
            <div className='col-md-12 page-title p-4 text-center mb-4'>
                <h4 className="">Forgot Password</h4>
            </div>
            <div className='std-medium-width-block bg-white'>
                <div className="row">
                    {message && <Alert message={message} />}
                    <div className="col-md-12">
                        <OptForm />
                        <PasswordResetForm />
                    </div>
                </div>
            </div>
        </>
    );
};

export default ResetPassword;

