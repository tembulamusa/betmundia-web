import '../../../assets/css/deposit-page.css';
import React, { useState, useContext } from 'react';
import { Formik, Form } from 'formik';
import { useNavigate } from 'react-router-dom';
import Accordion from 'react-bootstrap/Accordion';
import makeRequest from "../../utils/fetch-request";
import { Context } from '../../../context/store';
import Notify from '../../utils/Notify';
import '../../../assets/css/accordion.react.css';
import { getFromLocalStorage, removeItem } from '../../utils/local-storage';
import mpesaLogo from '../../../assets/img/mpesa-3.png';
import {
    FaArrowLeft,
    FaShieldAlt,
    FaCoins,
    FaWallet,
    FaInfoCircle,
    FaFileAlt,
    FaChevronDown,
    FaCcVisa,
    FaCcMastercard,
    FaCreditCard,
} from 'react-icons/fa';
import { MdPhoneIphone } from 'react-icons/md';


const Deposit = (props) => {

    const [state, dispatch] = useContext(Context);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('mpesa');

    const app_name = "desktop-web";
    const promoName = state?.promoInfo;
    const app = promoName ? `${app_name}:${promoName}` : app_name;


    const [success, setSuccess] = useState(false);
    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [cardSuccess, setCardSuccess] = useState(false);
    const [cardMessage, setCardMessage] = useState(null);
    const [cardLoading, setCardLoading] = useState(false);
    const user = getFromLocalStorage("user");

    const initialValues = {
        amount: '',
        msisdn: user?.msisdn || ''
    };

    const cardInitialValues = {
        amount: '',
        card_number: '',
        expiry: '',
        cvc: '',
    };


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

    const handleCardSubmit = values => {
        const endpoint = 'v2/deposits/card/new';
        setCardLoading(true);
        setCardMessage(null);
        setCardSuccess(false);

        const expiryParts = String(values.expiry || '').split('/');
        const requestData = {
            amount: values.amount,
            card_number: String(values.card_number || '').replace(/\s+/g, ''),
            expiry_month: expiryParts[0] || '',
            expiry_year: expiryParts[1] || '',
            cvc: values.cvc,
            app_name: app,
        };

        makeRequest({ url: endpoint, method: 'POST', data: requestData, api_version: 3 })
            .then(([status, response]) => {
                setCardLoading(false);
                dispatch({
                    type: "SET",
                    key: "toggleuserbalance",
                    payload: state?.toggleuserbalance ? !state?.toggleuserbalance : true,
                });

                if (status == 200 || status == 201) {
                    setCardSuccess(true);
                    setCardMessage({
                        status: 200,
                        message: response?.message || "Card payment initiated. Complete the secure checkout if prompted.",
                    });
                    if (response?.redirect_url) {
                        window.location.href = response.redirect_url;
                    }
                } else if (response?.status == 403 || response?.status == 401 || status == 401) {
                    dispatch({ type: "DEL", key: "user" });
                    removeItem("user");
                    dispatch({ type: "SET", key: "showloginmodal", payload: true });
                } else {
                    const errMsg = response?.message || response?.error || "Card payment is not available yet. Please use M-Pesa.";
                    setCardMessage({ status: 400, message: errMsg });
                    Notify({ status: 400, message: errMsg });
                }
            })
            .catch(() => {
                setCardLoading(false);
                const errMsg = "Card payment is not available yet. Please use M-Pesa.";
                setCardMessage({ status: 400, message: errMsg });
                Notify({ status: 400, message: errMsg });
            });
    };



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

    const validateCard = values => {
        const errors = {};
        const digits = String(values.card_number || '').replace(/\s+/g, '');
        const expiry = String(values.expiry || '').trim();
        const cvc = String(values.cvc || '').trim();

        if (!values.amount || values.amount < 1 || values.amount > 70000) {
            errors.amount = "Please enter amount between KES 1.00 and KES 70,000.00";
        }
        if (!digits || digits.length < 13 || digits.length > 19 || !/^\d+$/.test(digits)) {
            errors.card_number = "Enter a valid card number";
        }
        if (!/^\d{2}\/\d{2}$/.test(expiry)) {
            errors.expiry = "Use MM/YY";
        }
        if (!/^\d{3,4}$/.test(cvc)) {
            errors.cvc = "Enter a valid CVC";
        }
        return errors;
    };


    const Alert = ({ variant = 'mpesa' }) => {
        const activeMessage = variant === 'card' ? cardMessage : message;
        const isOk = variant === 'card' ? cardSuccess : success;
        if (!activeMessage) return null;
        return (
            <div
                role="alert"
                className={`deposit-alert deposit-alert--${isOk ? 'success' : 'danger'}`}
            >
                {variant === 'mpesa' ? (
                    <a href="#pay-via-mobile">{activeMessage?.message}</a>
                ) : (
                    <span>{activeMessage?.message}</span>
                )}
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
                    <span className="deposit-phone-sparkle deposit-phone-sparkle--1" />
                    <span className="deposit-phone-sparkle deposit-phone-sparkle--2" />
                    <span className="deposit-phone-sparkle deposit-phone-sparkle--3" />
                    <div className="deposit-phone-frame">
                        <div className="deposit-phone-notch" />
                        <div className="deposit-phone-mpesa">
                            <span className="deposit-phone-mpesa-m">M-</span>
                            <span className="deposit-phone-mpesa-p">P</span>
                            <span className="deposit-phone-mpesa-esa">ESA</span>
                        </div>
                    </div>
                    <span className="deposit-phone-shield">
                        <svg viewBox="0 0 40 46" className="deposit-phone-shield-svg" focusable="false">
                            <path
                                className="deposit-phone-shield-body"
                                d="M20 2 L36 8.5 V22 C36 33 28.5 40.5 20 44 C11.5 40.5 4 33 4 22 V8.5 Z"
                            />
                            <path
                                className="deposit-phone-shield-check"
                                d="M12.5 23.5 L17.5 28.5 L27.5 17.5"
                                fill="none"
                                strokeWidth="3.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
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
                        <img
                            src={mpesaLogo}
                            alt=""
                            className="deposit-method-logo deposit-method-logo--mpesa"
                        />
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

    const formatCardNumber = (raw) => {
        const digits = String(raw || '').replace(/\D/g, '').slice(0, 19);
        return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
    };

    const formatExpiry = (raw) => {
        const digits = String(raw || '').replace(/\D/g, '').slice(0, 4);
        if (digits.length <= 2) return digits;
        return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    };

    const CardDepositFormFields = ({ values, errors, setFieldValue }) => {
        const onFieldChanged = (ev) => {
            const { name, value } = ev.target;
            if (name === 'card_number') {
                setFieldValue(name, formatCardNumber(value));
                return;
            }
            if (name === 'expiry') {
                setFieldValue(name, formatExpiry(value));
                return;
            }
            if (name === 'cvc') {
                setFieldValue(name, String(value || '').replace(/\D/g, '').slice(0, 4));
                return;
            }
            setFieldValue(name, value);
        };

        return (
            <Form className="deposit-form">
                <div className="deposit-card">
                    <div className="deposit-mpesa-head">
                        <span className="deposit-card-logos" aria-hidden="true">
                            <FaCcVisa className="deposit-card-brand deposit-card-brand--visa" />
                            <FaCcMastercard className="deposit-card-brand deposit-card-brand--mc" />
                        </span>
                        <div>
                            <h2 className="deposit-card-title">Card Payment</h2>
                            <p className="deposit-mpesa-sub">Visa &amp; Mastercard</p>
                        </div>
                    </div>

                    {cardMessage && <Alert variant="card" />}

                    <div className="deposit-field">
                        <label className="deposit-field-label" htmlFor="card-amount">
                            <FaCoins aria-hidden="true" />
                            Amount To Deposit
                        </label>
                        <div className="deposit-input-wrap deposit-input-wrap--amount">
                            <input
                                onChange={onFieldChanged}
                                className="deposit-field-input"
                                id="card-amount"
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

                    <div className="deposit-field">
                        <label className="deposit-field-label" htmlFor="card-number">
                            <FaCreditCard aria-hidden="true" />
                            Card Number
                        </label>
                        <div className="deposit-input-wrap deposit-input-wrap--wide">
                            <input
                                onChange={onFieldChanged}
                                className="deposit-field-input"
                                id="card-number"
                                name="card_number"
                                type="text"
                                inputMode="numeric"
                                autoComplete="cc-number"
                                placeholder="ACCT-000003"
                                value={values.card_number}
                            />
                        </div>
                        {errors.card_number && <div className="deposit-field-error">{errors.card_number}</div>}
                    </div>

                    <div className="deposit-card-row">
                        <div className="deposit-field">
                            <label className="deposit-field-label" htmlFor="card-expiry">
                                Expiry
                            </label>
                            <div className="deposit-input-wrap">
                                <input
                                    onChange={onFieldChanged}
                                    className="deposit-field-input"
                                    id="card-expiry"
                                    name="expiry"
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete="cc-exp"
                                    placeholder="MM/YY"
                                    value={values.expiry}
                                />
                            </div>
                            {errors.expiry && <div className="deposit-field-error">{errors.expiry}</div>}
                        </div>

                        <div className="deposit-field">
                            <label className="deposit-field-label" htmlFor="card-cvc">
                                CVC
                            </label>
                            <div className="deposit-input-wrap">
                                <input
                                    onChange={onFieldChanged}
                                    className="deposit-field-input"
                                    id="card-cvc"
                                    name="cvc"
                                    type="password"
                                    inputMode="numeric"
                                    autoComplete="cc-csc"
                                    placeholder="123"
                                    value={values.cvc}
                                />
                            </div>
                            {errors.cvc && <div className="deposit-field-error">{errors.cvc}</div>}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={cardLoading}
                        className="deposit-submit-btn"
                    >
                        <FaWallet aria-hidden="true" />
                        {cardLoading ? "WAIT..." : "PAY WITH CARD"}
                    </button>
                </div>
            </Form>
        );
    };

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

    const CardDepositForm = () => {
        return (
            <Formik
                initialValues={cardInitialValues}
                onSubmit={handleCardSubmit}
                validateOnChange={false}
                validateOnBlur={false}
                validate={validateCard}
                render={(props) => <CardDepositFormFields {...props} />}
            />
        );
    };

    return (
        <div className="deposit-page">
            <header className="deposit-page-header">
                <button
                    type="button"
                    className="deposit-page-back"
                    aria-label="Go back"
                    onClick={() => navigate(-1)}
                >
                    <FaArrowLeft />
                </button>
                <h1 className="deposit-page-title">Deposit Funds</h1>
                <span className="deposit-page-secure-icon" aria-hidden="true" title="Secure">
                    <FaShieldAlt />
                </span>
            </header>

            <div className="deposit-page-inner">
                <div className="deposit-page-panel">
                    <div className="deposit-method-sheet">
                        <div className="deposit-tabs" role="tablist" aria-label="Deposit method">
                            <button
                                type="button"
                                role="tab"
                                id="deposit-tab-mpesa"
                                aria-selected={activeTab === 'mpesa'}
                                aria-controls="deposit-panel-mpesa"
                                className={`deposit-tab${activeTab === 'mpesa' ? ' is-active' : ''}`}
                                onClick={() => setActiveTab('mpesa')}
                            >
                                <img src={mpesaLogo} alt="" className="deposit-tab-logo" />
                                <span>M-Pesa</span>
                            </button>
                            <button
                                type="button"
                                role="tab"
                                id="deposit-tab-card"
                                aria-selected={activeTab === 'card'}
                                aria-controls="deposit-panel-card"
                                className={`deposit-tab${activeTab === 'card' ? ' is-active' : ''}`}
                                onClick={() => setActiveTab('card')}
                            >
                                <span className="deposit-tab-card-icons" aria-hidden="true">
                                    <FaCcVisa />
                                    <FaCcMastercard />
                                </span>
                                <span>Card</span>
                            </button>
                        </div>

                        <div className="deposit-method-panels">
                            <div
                                id="deposit-panel-mpesa"
                                role="tabpanel"
                                aria-labelledby="deposit-tab-mpesa"
                                hidden={activeTab !== 'mpesa'}
                            >
                                {activeTab === 'mpesa' && <DepositForm />}
                            </div>

                            <div
                                id="deposit-panel-card"
                                role="tabpanel"
                                aria-labelledby="deposit-tab-card"
                                hidden={activeTab !== 'card'}
                            >
                                {activeTab === 'card' && <CardDepositForm />}
                            </div>
                        </div>
                    </div>

                    <div className="deposit-trust">
                        <FaShieldAlt className="deposit-trust-icon" aria-hidden="true" />
                        <div>
                            <p className="deposit-trust-title">Your transactions are secure and encrypted</p>
                            <p className="deposit-trust-sub">We never share your details with anyone.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

}

export default React.memo(Deposit)
