import React, { useState, useContext, useEffect } from 'react';
import mpesa from '../../../assets/img/mpesa-3.png';
import makeRequest from "../../utils/fetch-request";
import { Formik, Form } from 'formik';
import { Context } from '../../../context/store';
import { getBetslip } from '../../utils/betslip'
import { getFromLocalStorage, removeItem } from '../../utils/local-storage';

const Withdrawal = () => {
    const [state, dispatch] = useContext(Context);

    const [success, setSuccess] = useState(false);
    const [message, setMessage] = useState(null);

    const user = getFromLocalStorage("user");

    const initialValues = {
        amount: '',
        msisdn: user?.msisdn
    };

    // ✅ SUBMIT
    const handleSubmit = values => {
        let endpoint = 'v2/withdrawals/new';

        const amount = Math.floor(Number(values.amount) || 0);

        let data = {
            msisdn: user?.msisdn,
            amount: amount
        };

        makeRequest({
            url: endpoint,
            method: 'POST',
            data: data,
            api_version: 3
        }).then(([status, response]) => {

            setSuccess(status === 200 || status === 201);

            if (status === 200 || status === 201) {
                setMessage({
                    status: 200,
                    message: "Withdrawal request sent successfully."
                });

                dispatch({
                    type: "SET",
                    key: "toggleuserbalance",
                    payload: state?.toggleuserbalance
                        ? !state?.toggleuserbalance
                        : true
                });

            } else if (status === 403 || status === 401) {
                dispatch({ type: "DEL", key: "user" });
                removeItem("user");
                dispatch({ type: "SET", key: "showloginmodal", payload: true });

            } else {
                setMessage({
                    status: 400,
                    message:
                        response?.message ||
                        response?.error ||
                        "Error sending withdrawal request"
                });
            }
        });
    };

    // ✅ VALIDATION
    const validate = values => {
        let errors = {};

        if (!values.msisdn || !values.msisdn.match(/(254|0)?[71]\d{8}/)) {
            errors.msisdn = 'Please enter a valid phone number';
        }

        const amount = Math.floor(Number(values.amount) || 0);

        if (!amount || amount <= 0) {
            errors.amount = "Please enter a valid amount";
        }

        return errors;
    };

    useEffect(() => {
        let betslip = getBetslip();
        if (betslip) {
            dispatch({ type: "SET", key: "betslip", payload: betslip });
        }
    }, []);

    // ✅ ALERT
    const Alert = () => {
        let c = success ? 'success' : 'danger';
        return (
            <>
                {message &&
                    <div className={`fade alert alert-${c} show`}>
                        {message?.message}
                    </div>
                }
            </>
        );
    };

    // ✅ FORM FIELDS
    const WithdrawFormFields = ({ values, errors, onFieldChanged }) => {
        return (
            <>
                <div className="form-group row d-flex justify-content-center">
                    <div className="mt-4">
                        <input
                            readOnly
                            disabled
                            className="text-dark deposit-input form-control input-field"
                            name="msisdn"
                            type="text"
                            value={values.msisdn}
                        />
                        {errors.msisdn && <div className='text-danger'>{errors.msisdn}</div>}
                    </div>
                </div>

                <div className="form-group row mt-3">
                    <div className="col-md-12">
                        <label>Amount to Withdraw</label>
                        <input
                            onChange={onFieldChanged}
                            className="text-dark deposit-input form-control input-field"
                            name="amount"
                            type="number"
                            step="1"
                            min="50"
                            value={values.amount}
                            placeholder='Enter Amount'
                        />
                        {errors?.amount && <div className='text-danger'>{errors.amount}</div>}


                    </div>
                </div>

                <div className='mt-3'><Alert /></div>

                <button className='btn btn-lg btn-primary mt-3 w-100'>
                    Withdraw
                </button>
            </>
        );
    };

    // ✅ INSTRUCTIONS
    const PaymentInstructions = () => (
        <>
            <h5 className='mt-3'>Withdrawal Instructions</h5>
            <ol>
                <li>Enter your M-Pesa phone number.</li>
                <li>Enter the amount.</li>
                <li>Click withdraw.</li>
                <li>Confirm on your phone.</li>
            </ol>

            {/* ✅ TAX INFO (SECOND PLACEMENT) */}
            <div className="alert alert-warning mt-3">
                Note: All withdrawals are subject to a 5% withholding tax as per regulations.
            </div>
        </>
    );

    const MyWithdrawalForm = ({ values, errors, setFieldValue }) => {

        const onFieldChanged = (ev) => {
            let field = ev.target.name;
            let value = ev.target.value;

            if (field === "amount") {
                value = Math.floor(Number(value) || 0);
            }

            setFieldValue(field, value);
        };

        return (
            <Form>
                <div className="text-center">
                    <img src={mpesa} alt="" style={{ maxWidth: "100px" }} />
                </div>

                <WithdrawFormFields
                    values={values}
                    errors={errors}
                    onFieldChanged={onFieldChanged}
                />

                <PaymentInstructions />
            </Form>
        );
    };

    return (
        <>
            <div className='text-center p-3 border-bottom'>
                <h4>Withdraw Funds (Mobile Money)</h4>
            </div>

            <div className="std-medium-width-block">
                <Formik
                    initialValues={initialValues}
                    onSubmit={handleSubmit}
                    validate={validate}
                    validateOnChange={false}
                    validateOnBlur={false}
                >
                    {(props) => <MyWithdrawalForm {...props} />}
                </Formik>
            </div>
        </>
    );
};

export default Withdrawal;