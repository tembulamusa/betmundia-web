import React, { useContext, useEffect, useRef, useState, useCallback } from 'react';
import { Formik } from 'formik';
import makeRequest from "../../utils/fetch-request";
import { Context } from '../../../context/store';
import { useNavigate } from 'react-router-dom';
import Notify from '../../utils/Notify';
import Alert from '../../utils/alert';

const VerifyAccount = () => {
    const [message, setMessage] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const verifyRef = useRef();
    const [state, dispatch] = useContext(Context);
    const navigate = useNavigate();

    const initialValues = {
        msisdn: state?.regmsisdn,
        code: ''
    }
    useEffect(() => {
        dispatch({ type: "SET", key: "fullpagewidth", payload: true });
        return () => {
            dispatch({ type: "DEL", key: "fullpagewidth" });
        };
    }, []);

    const handleSubmit = values => {
        let endpoint = '/auth/verify';
        setIsLoading(true);
        makeRequest({ url: endpoint, method: 'POST', data: values, api_version: 2 }).then(([status, response]) => {
            if ([200, 201].includes(status)) {
                if (response?.status == 200) {
                    Notify({ status: 200, message: "Password reset successfully. Login to continue" });
                    navigate("/login");
                } else {
                    setMessage({ status: 400, message: "Code invalid" });
                }
            } else {
                setMessage({ status: status, message: response?.error?.message });
            }
            setIsLoading(false);
        });
    }

    const validate = values => {
        let errors = {};
        if (!values.msisdn || !values.msisdn.match(/(254|0|)?[71]\d{8}/g)) {
            errors.msisdn = 'Please enter a valid phone number';
        }
        if (!values.code || values.code.length < 4) {
            errors.code = "Please enter four or more characters for code";
        }
        return errors;
    }

    const sendOTP = useCallback(() => {
        let endpoint = '/auth/verification-code';
        let values = {
            msisdn: state?.regmsisdn
        }
        makeRequest({ url: endpoint, method: 'POST', data: values, api_version: 2 }).then(([status, response]) => {
            if ([200, 201].includes(status)) {
                if (response?.status == 200) {
                    Notify({ status: 200, message: "Verification code sent to phone" });
                } else {
                    setMessage({ status: 400, message: "Error fetching code" });
                }
            } else {
                setMessage({ status: status, message: "Error fetching code" });
            }
        });
    }, [state?.regmsisdn]);

    useEffect(() => { sendOTP() }, [sendOTP]);

    const handleKeyPress = (event, handleSubmit) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSubmit();
        }
    }

    const MyVerifyAccountForm = (props) => {
        const { errors, values, setFieldValue, handleSubmit } = props;

        const onFieldChanged = (ev) => {
            let field = ev.target.name;
            let value = ev.target.value;
            setFieldValue(field, value);
        }

        return (
            <form onReset={props.handleReset} onSubmit={handleSubmit}>
                <div className="pt-0">
                    <div className="row form-block">
                        <div className='text-center'>
                            <h1 className='std-title' style={{ color: '#ffffff' }}>Verify your account</h1>
                            <p className='text-xl' style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                Enter the one-time code we sent to your phone to finish creating your account.
                            </p>
                        </div>

                        <div className='col-md-12 col-sm-12 mt-4'>
                            {message && <Alert message={message} />}
                        </div>

                        <div className="form-group row d-flex justify-content-center mt-5">
                            <div className="col-md-12">
                                <label style={{ color: '#ffffff' }}>Mobile Number</label>
                                <input
                                    value={state?.regmsisdn || ''}
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
                                        Has been sent to your phone
                                    </span>
                                </label>
                                <input
                                    value={values.code}
                                    className="form-control block px-3 py-3 w-full rounded-2xl std-input"
                                    id="code"
                                    name="code"
                                    type="text"
                                    placeholder='Enter Code'
                                    onChange={ev => onFieldChanged(ev)}
                                    onKeyPress={(event) => handleKeyPress(event, handleSubmit)}
                                />
                                {errors.code && <div className='text-danger'> {errors.code} </div>}
                            </div>
                        </div>

                        <div className="form-group row d-flex justify-content-left mt-4">
                            <div className="col-12">
                                <span style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Didn't receive code?</span>
                                <button
                                    onClick={() => sendOTP()}
                                    type={"button"}
                                    className='btn text-white ml-2 btn-sm !bg-green-500 hover:opacity-70'
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
    }

    const VerifyAccountForm = (props) => {
        return (
            <Formik
                innerRef={verifyRef}
                initialValues={initialValues}
                onSubmit={handleSubmit}
                validateOnChange={false}
                validateOnBlur={false}
                validate={validate}>
                {props => <MyVerifyAccountForm {...props} />}
            </Formik>
        );
    }

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
}

export default VerifyAccount;
