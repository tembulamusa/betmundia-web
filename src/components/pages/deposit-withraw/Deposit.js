import React, { useState, useContext } from 'react';
import { Formik, Form } from 'formik';
import { useNavigate } from 'react-router-dom';
import Accordion from 'react-bootstrap/Accordion';
import makeRequest from "../../utils/fetch-request";
import { Context } from '../../../context/store';
import Notify from '../../utils/Notify';
import '../../../assets/css/accordion.react.css';
import { getFromLocalStorage, removeItem } from '../../utils/local-storage';
import {
    FaArrowLeft,
    FaShieldAlt,
    FaMobileAlt,
    FaCoins,
    FaWallet,
    FaInfoCircle,
    FaFileAlt,
    FaChevronDown,
    FaCheck,
    FaStar,
} from 'react-icons/fa';
import { MdPhoneIphone } from 'react-icons/md';


const Deposit = (props) => {

    const [state, dispatch] = useContext(Context);
    const navigate = useNavigate();

    const app_name = "desktop-web";
    const promoName = state?.promoInfo;
    const app = promoName ? `${app_name}:${promoName}` : app_name;


    const [success, setSuccess] = useState(false);
    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const user = getFromLocalStorage("user");

    const initialValues = {
        amount: '',
        msisdn: user?.msisdn || ''

    }


    const handleSubmit = values => {
        let endpoint = 'v2/deposits/stk/new';
        setIsLoading(true);
        setMessage(null);
        setSuccess(false)
        const requestData = {
            ...values,
            app_name: app
        };

        makeRequest({ url: endpoint, method: 'POST', data: requestData, api_version: 3 })
            .then(([status, response]) => {
                dispatch({ type: "SET", key: "toggleuserbalance", payload: state?.toggleuserbalance ? !state?.toggleuserbalance : true })
                if (status == 200) {
                    setSuccess(true)
                    setMessage({ status: 200, message: "Check your phone and enter pin to complete deposit" });
                    const pollBalID = setInterval(function () {
                        dispatch({ type: "SET", key: "toggleuserbalance", payload: state?.toggleuserbalance ? !state?.toggleuserbalance : true })
                    }, 7000);
                    const removePoll = setTimeout(() => { clearInterval(pollBalID) }, 60000)
                } else {
                    if (response?.status == 403 || response?.status == 401 || status == 401) {
                        dispatch({ type: "DEL", key: "user" });
                        removeItem("user");
                        dispatch({ type: "SET", key: "showloginmodal", payload: true });
                    } else {
                        setMessage({ status: 400, message: response?.message || response?.error || "STK not Available. Click to deposit directly" })
                        Notify({ status: 400, message: response?.message || response?.error || "STK not Available. Click to deposit directly" })
                    }
                    setIsLoading(false)
                }
            })
    }



    const validate = values => {

        let errors = {}

        if (!values.msisdn || !values.msisdn.match(/(254|0|)?[71]\d{8}/g)) {
            errors.msisdn = 'Please enter a valid phone number'
        }

        if (!values.amount || values.amount < 1 || values.amount > 70000) {
            errors.amount = "Please enter amount between KES 1.00 and KES 70,000.00";
        }
        return errors
    }


    const Alert = () => {
        if (!message) return null;
        return (
            <div
                role="alert"
                className={`deposit-alert deposit-alert--${success ? 'success' : 'danger'}`}
            >
                <a href="#pay-via-mobile">{message?.message}</a>
            </div>
        );
    };


    const DepositFormFields = (props) => {
        const { values, errors, onFieldChanged } = props;

        return (
            <>
                {message && <Alert />}

                <div className="deposit-field">
                    <label className="deposit-field-label" htmlFor="deposit-msisdn">
                        <MdPhoneIphone aria-hidden="true" />
                        Your Phone Number
                    </label>
                    <div className="deposit-input-wrap">
                        <input
                            id="deposit-msisdn"
                            onChange={ev => onFieldChanged(ev)}
                            className="deposit-field-input"
                            name="msisdn"
                            type="text"
                            readOnly
                            disabled
                            value={user?.msisdn || ''}
                        />
                    </div>
                    {errors.msisdn && <div className="deposit-field-error">{errors.msisdn}</div>}
                </div>

                <div className="deposit-field">
                    <label className="deposit-field-label" htmlFor="amount">
                        <FaCoins aria-hidden="true" />
                        Amount To Deposit
                    </label>
                    <div className="deposit-input-wrap deposit-input-wrap--amount">
                        <input
                            onChange={ev => onFieldChanged(ev)}
                            className="deposit-field-input"
                            id="amount"
                            name="amount"
                            type="text"
                            value={values.amount}
                            placeholder="Enter amount"
                            inputMode="decimal"
                        />
                        <span className="deposit-currency-suffix">KSh</span>
                    </div>
                    {errors.amount && <div className="deposit-field-error">{errors.amount}</div>}
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="deposit-submit-btn"
                >
                    <FaWallet aria-hidden="true" />
                    {isLoading ? "WAIT..." : "DEPOSIT"}
                </button>
            </>
        )
    }


    const PAYBILL_STEPS = [
        { text: 'Go to M-Pesa menu.' },
        { text: 'Select Lipa na M-Pesa.' },
        {
            text: (
                <>
                    Enter Paybill number: <span className="deposit-step-highlight">444142</span>
                </>
            ),
        },
        {
            text: (
                <>
                    Account Number: <span className="deposit-step-strong">Enter your phone number</span>
                </>
            ),
        },
        { text: 'Enter Amount.' },
        { text: 'Enter your PIN and accept.' },
    ];


    const PaymentInstructions = () => {
        return (
            <div className="deposit-paybill-body" id="pay-via-mobile">
                <div className="deposit-steps-col">
                    <h3 className="deposit-steps-heading">Follow the steps below:</h3>
                    <ol className="deposit-steps">
                        {PAYBILL_STEPS.map((step, index) => (
                            <li className="deposit-step" key={index}>
                                <span className="deposit-step-num">{index + 1}</span>
                                <span className="deposit-step-text">{step.text}</span>
                            </li>
                        ))}
                    </ol>
                </div>

                <div className="deposit-phone-art" aria-hidden="true">
                    <FaStar className="deposit-phone-sparkle deposit-phone-sparkle--1" />
                    <FaStar className="deposit-phone-sparkle deposit-phone-sparkle--2" />
                    <FaStar className="deposit-phone-sparkle deposit-phone-sparkle--3" />
                    <div className="deposit-phone-frame">
                        <div className="deposit-phone-notch" />
                        <div className="deposit-phone-mpesa">M-PESA</div>
                        <div className="deposit-phone-screen-lines">
                            <span />
                            <span />
                            <span />
                        </div>
                    </div>
                    <span className="deposit-phone-shield">
                        <FaCheck />
                    </span>
                </div>
            </div>
        );
    }


    const MyDepositForm = (props) => {
        const { errors, values, setFieldValue } = props;

        const onFieldChanged = (ev) => {
            let field = ev.target.name;
            let value = ev.target.value;
            setFieldValue(field, value);
        }

        const openDepositStatus = () => {
            dispatch({ type: "SET", key: "showcheckmpesadepositstatus", payload: true });
        };

        return (
            <Form className="deposit-form">
                <div className="deposit-card">
                    <div className="deposit-mpesa-head">
                        <span className="deposit-mpesa-icon-wrap" aria-hidden="true">
                            <FaMobileAlt />
                        </span>
                        <div>
                            <h2 className="deposit-mpesa-title">Lipa na Mpesa</h2>
                            <p className="deposit-mpesa-sub">Fast. Secure. Convenient.</p>
                        </div>
                    </div>

                    <DepositFormFields
                        onFieldChanged={onFieldChanged}
                        values={values}
                        errors={errors}
                    />

                    <div
                        className="deposit-status-box"
                        role="button"
                        tabIndex={0}
                        onClick={openDepositStatus}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                openDepositStatus();
                            }
                        }}
                    >
                        <span className="deposit-status-icon" aria-hidden="true">
                            <FaInfoCircle />
                        </span>
                        <div className="deposit-status-copy">
                            <p className="deposit-status-title">Missing Deposit?</p>
                            <p className="deposit-status-desc">
                                Deposit not reflecting? Sort your missing deposit here.
                            </p>
                        </div>
                        <span className="deposit-status-btn">Check Deposit Status</span>
                    </div>
                </div>

                <div className="deposit-card deposit-paybill-card">
                    <Accordion
                        className="accordion"
                        defaultActiveKey="0"
                        allowMultipleExpanded={false}
                    >
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>
                                <FaFileAlt className="deposit-paybill-header-icon" aria-hidden="true" />
                                <span className="deposit-paybill-header-text">
                                    Deposit Via Paybill Number (444142)
                                </span>
                                <FaChevronDown className="deposit-paybill-chevron" aria-hidden="true" />
                            </Accordion.Header>
                            <Accordion.Body>
                                <PaymentInstructions />
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                </div>
            </Form>
        );
    }

    const DepositForm = () => {
        return (
            <Formik
                initialValues={initialValues}
                onSubmit={handleSubmit}
                validateOnChange={false}
                validateOnBlur={false}
                validate={validate}
                render={(props) => <MyDepositForm {...props} />} />
        );
    }

    return (
        <div className="deposit-page">
            <div className="deposit-page-inner">
                <header className="deposit-page-header">
                    <button
                        type="button"
                        className="deposit-page-back"
                        aria-label="Go back"
                        onClick={() => navigate(-1)}
                    >
                        <FaArrowLeft />
                    </button>
                    <h1 className="deposit-page-title">Deposit Funds (Mobile Money)</h1>
                    <span className="deposit-page-secure-icon" aria-hidden="true" title="Secure">
                        <FaShieldAlt />
                    </span>
                </header>

                <DepositForm />

                <div className="deposit-trust">
                    <FaShieldAlt className="deposit-trust-icon" aria-hidden="true" />
                    <div>
                        <p className="deposit-trust-title">Your transactions are secure and encrypted</p>
                        <p className="deposit-trust-sub">We never share your details with anyone.</p>
                    </div>
                </div>
            </div>
        </div>
    )

}

export default React.memo(Deposit)
