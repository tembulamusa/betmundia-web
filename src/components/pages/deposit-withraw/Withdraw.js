import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form } from 'formik';
import {
    FaArrowLeft,
    FaCoins,
    FaInfoCircle,
    FaLock,
    FaHeadset,
    FaChevronRight,
    FaPaperPlane,
    FaShieldAlt,
} from 'react-icons/fa';
import { MdPhoneIphone } from 'react-icons/md';
import mpesa from '../../../assets/img/mpesa-3.png';
import makeRequest from '../../utils/fetch-request';
import { Context } from '../../../context/store';
import { getBetslip } from '../../utils/betslip';
import { getFromLocalStorage, removeItem } from '../../utils/local-storage';

const SUPPORT_EMAIL = 'mailto:customercare@betmundial.com';

const WITHDRAW_STEPS = [
    'Confirm your M-Pesa phone number.',
    'Enter the amount.',
    'Click withdraw.',
    'Confirm on your phone.',
];

const Withdrawal = () => {
    const [state, dispatch] = useContext(Context);
    const navigate = useNavigate();

    const [success, setSuccess] = useState(false);
    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const user = getFromLocalStorage('user');

    const initialValues = {
        amount: '',
        msisdn: user?.msisdn || '',
    };

    const handleSubmit = (values) => {
        const amount = Math.floor(Number(values.amount) || 0);
        const balance = Number(user?.balance || 0);
        const msisdn = values.msisdn || user?.msisdn;

        if (amount > 70000) {
            setSuccess(false);
            setMessage({ status: 400, message: 'Maximum withdrawal is 70,000' });
            return;
        }

        if (amount > balance) {
            setSuccess(false);
            setMessage({ status: 400, message: 'Insufficient balance' });
            return;
        }

        setIsLoading(true);
        setMessage(null);
        setSuccess(false);

        makeRequest({
            url: 'v2/withdrawals/new',
            method: 'POST',
            data: {
                msisdn,
                amount,
            },
            api_version: 3,
        }).then(([status, response]) => {
            setIsLoading(false);
            setSuccess(status === 200 || status === 201);

            if (status === 200 || status === 201) {
                setMessage({
                    status: 200,
                    message: 'Withdrawal request sent successfully.',
                });

                dispatch({
                    type: 'SET',
                    key: 'toggleuserbalance',
                    payload: state?.toggleuserbalance
                        ? !state?.toggleuserbalance
                        : true,
                });
            } else if (status === 403 || status === 401) {
                dispatch({ type: 'DEL', key: 'user' });
                removeItem('user');
                dispatch({ type: 'SET', key: 'showloginmodal', payload: true });
            } else {
                setMessage({
                    status: 400,
                    message:
                        response?.message ||
                        response?.error ||
                        'Error sending withdrawal request',
                });
            }
        });
    };

    const validate = (values) => {
        const errors = {};

        if (!values.msisdn || !values.msisdn.match(/(254|0)?[71]\d{8}/)) {
            errors.msisdn = 'Please enter a valid phone number';
        }

        const amount = Number(values.amount);

        if (!amount || amount <= 0) {
            errors.amount = 'Please enter a valid amount';
        } else if (amount > 70000) {
            errors.amount = 'Maximum withdrawal is 70,000';
        } else if (amount > Number(user?.balance || 0)) {
            errors.amount = 'Insufficient balance';
        }

        return errors;
    };

    useEffect(() => {
        const betslip = getBetslip();
        if (betslip) {
            dispatch({ type: 'SET', key: 'betslip', payload: betslip });
        }
    }, [dispatch]);

    const Alert = () => {
        if (!message) return null;
        return (
            <div
                role="alert"
                className={`withdraw-alert withdraw-alert--${success ? 'success' : 'danger'}`}
            >
                {message?.message}
            </div>
        );
    };

    const WithdrawFormFields = ({ values, errors, onFieldChanged }) => (
        <>
            {message && <Alert />}

            <div className="withdraw-field">
                <label className="withdraw-field-label" htmlFor="withdraw-msisdn">
                    <MdPhoneIphone aria-hidden="true" />
                    M-Pesa Phone Number
                </label>
                <p className="withdraw-field-hint">
                    Withdrawals go to the M-Pesa number linked to your account.
                </p>
                <div className="withdraw-input-wrap">
                    <span className="withdraw-mpesa-badge" aria-hidden="true">
                        <img src={mpesa} alt="" />
                    </span>
                    <input
                        id="withdraw-msisdn"
                        className="withdraw-field-input"
                        name="msisdn"
                        type="text"
                        inputMode="tel"
                        readOnly
                        disabled
                        value={values.msisdn || user?.msisdn || ''}
                    />
                </div>
                {errors.msisdn && (
                    <div className="withdraw-field-error">{errors.msisdn}</div>
                )}
            </div>

            <div className="withdraw-field">
                <label className="withdraw-field-label" htmlFor="withdraw-amount">
                    <FaCoins aria-hidden="true" />
                    Amount To Withdraw
                </label>
                <p className="withdraw-field-hint">
                    Enter the amount you want to withdraw.
                </p>
                <div className="withdraw-input-wrap withdraw-input-wrap--amount">
                    <span className="withdraw-currency-prefix" aria-hidden="true">
                        KES
                    </span>
                    <input
                        id="withdraw-amount"
                        className="withdraw-field-input"
                        name="amount"
                        type="number"
                        min="0"
                        inputMode="decimal"
                        value={values.amount}
                        placeholder="Enter Amount"
                        onChange={onFieldChanged}
                    />
                </div>
                {errors.amount && (
                    <div className="withdraw-field-error">{errors.amount}</div>
                )}
            </div>

            <button
                type="submit"
                className="withdraw-submit-btn"
                disabled={isLoading}
            >
                {isLoading ? 'Please wait…' : 'Withdraw'}
                <FaPaperPlane aria-hidden="true" />
            </button>
        </>
    );

    const MyWithdrawalForm = ({ values, errors, setFieldValue }) => {
        const onFieldChanged = (ev) => {
            let field = ev.target.name;
            let value = ev.target.value;

            if (field === 'amount') {
                if (value.startsWith('0') && value.length > 1) {
                    value = value.replace(/^0+/, '');
                }
            }

            setFieldValue(field, value);
        };

        return (
            <Form className="withdraw-form">
                <div className="withdraw-card">
                    <WithdrawFormFields
                        values={values}
                        errors={errors}
                        onFieldChanged={onFieldChanged}
                    />
                </div>

                <div className="withdraw-card">
                    <div className="withdraw-instructions-head">
                        <FaInfoCircle aria-hidden="true" />
                        <h3 className="withdraw-instructions-title">
                            Withdrawal Instructions
                        </h3>
                    </div>
                    <ol className="withdraw-steps">
                        {WITHDRAW_STEPS.map((text, index) => (
                            <li className="withdraw-step" key={text}>
                                <span className="withdraw-step-num">{index + 1}</span>
                                <span className="withdraw-step-text">{text}</span>
                            </li>
                        ))}
                    </ol>
                </div>

                <div className="withdraw-card">
                    <div className="withdraw-secure">
                        <span className="withdraw-secure-icon" aria-hidden="true">
                            <FaShieldAlt />
                        </span>
                        <div>
                            <p className="withdraw-secure-title">Secure &amp; Instant</p>
                            <p className="withdraw-secure-sub">
                                Withdrawals are processed securely and instantly to your
                                M-Pesa account.
                            </p>
                        </div>
                    </div>
                </div>
            </Form>
        );
    };

    return (
        <div className="withdraw-page">
            <header className="withdraw-page-header">
                <button
                    type="button"
                    className="withdraw-page-back"
                    aria-label="Go back"
                    onClick={() => navigate(-1)}
                >
                    <FaArrowLeft />
                </button>
                <h1 className="withdraw-page-title">
                    Withdraw Funds (Mobile Money)
                </h1>
                <span className="withdraw-page-header-spacer" aria-hidden="true" />
            </header>

            <div className="withdraw-page-inner">
                <Formik
                    initialValues={initialValues}
                    onSubmit={handleSubmit}
                    validate={validate}
                    validateOnChange={false}
                    validateOnBlur={false}
                >
                    {(props) => <MyWithdrawalForm {...props} />}
                </Formik>

                <div className="withdraw-footer">
                    <span className="withdraw-footer-item">
                        <FaLock aria-hidden="true" />
                        Your transactions are 100% secure
                    </span>
                    <a className="withdraw-footer-link" href={SUPPORT_EMAIL}>
                        <FaHeadset aria-hidden="true" />
                        <span>
                            Need Help? <strong>Contact Support</strong>
                        </span>
                        <FaChevronRight
                            className="withdraw-footer-chevron"
                            aria-hidden="true"
                        />
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Withdrawal;
