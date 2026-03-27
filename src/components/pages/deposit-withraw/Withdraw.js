import React, { useState, useContext, useEffect } from 'react';
import mpesa from '../../../assets/img/mpesa-3.png';
import makeRequest from "../../utils/fetch-request";
import { Formik, Form } from 'formik';
import { Context } from '../../../context/store';
import { getBetslip } from '../../utils/betslip'
import { getFromLocalStorage, removeItem } from '../../utils/local-storage';

const Withdrawal = (props) => {
    //todo get the phone number from logged in user ....
    const [state, dispatch] = useContext(Context);

    const [success, setSuccess] = useState(false);
    const [message, setMessage] = useState(null);
    const user = getFromLocalStorage("user");
    const initialValues = {
        amount: '',
        msisdn: user?.msisdn
    }


    const handleSubmit = values => {
        let endpoint = 'v2/withdrawals/new';
        let data = { msisdn: user?.msisdn, amount: values?.amount }
        makeRequest({ url: endpoint, method: 'POST', data: data, api_version: 3 }).then(([status, response]) => {
            setSuccess(status == 200 || status == 201);

            if (status == 200 || status == 201) {
                setMessage({ status: 200, message: "withdrawal request sent successfully." })
                dispatch({ type: "SET", key: "toggleuserbalance", payload: state?.toggleuserbalance ? !state?.toggleuserbalance : true })
            } else if (status == 403 || status == 401) {
                dispatch({ type: "DEL", key: "user" });
                removeItem("user");
                dispatch({ type: "SET", key: "showloginmodal", payload: true });
            } else {
                setMessage({ status: 400, message: response?.message || response?.error || "Error sending withdrawal request" })
            }
            setMessage({ ...response, status: status, message: response?.message || response?.data?.message || "Error sending withdrawal request" });
        })
    }

    const validate = values => {

        let errors = {}

        if (!values.msisdn || !values.msisdn.match(/(254|0|)?[71]\d{8}/g)) {
            errors.msisdn = 'Please enter a valid phone number'
        }

        if (!values.amount || values.amount < 0) {
            errors.amount = "Please enter a valid amount";
        }
        return errors
    }

    const FormTitle = () => {
        return (
            <div className='col-md-12 border-b border-gray-200 uppercase p-4 text-center'>
                <h4 className="">
                    Withdraw Funds (Mobile Money)
                </h4>
            </div>
        )
    }
    useEffect(() => {
        let betslip = getBetslip();
        if (betslip) {
            dispatch({ type: "SET", key: "betslip", payload: betslip });
        }
    }, [])


    const WithdrawFormFields = (props) => {
        const { values, errors, onFieldChanged } = props;

        return (
            <>
                <div className="form-group row d-flex justify-content-center">
                    <div className="mt-4">
                        <input
                            readOnly={true}
                            disabled={true}
                            className="text-dark deposit-input form-control input-field"
                            id="msisdn"
                            name="msisdn"
                            type="text"
                            value={values.msisdn}
                            placeholder='Enter Phone Number'
                        />
                        {errors.msisdn && <div className='text-danger'> {errors.msisdn} </div>}
                    </div>
                </div>
                <div className="form-group row d-flex justify-content-center mt-3">
                    <div className="col-md-12">
                        <label>Amount to Withdraw</label>
                        <input
                            onChange={ev => onFieldChanged(ev)}
                            className="text-dark deposit-input form-control col-md-12 input-field"
                            id="amount"
                            name="amount"
                            type="text"
                            value={values.amount}
                            placeholder='Enter Amount'
                        />
                        {errors.amount && <div className='text-danger'> {errors.amount} </div>}
                    </div>
                </div>
                <div className='mt-3'><Alert /></div>
                <div className="form-group row d-flex justify-content-left mb-4">
                    <div className="">
                        <button
                            className='btn btn-lg btn-primary mt-3 col-md-12 deposit-withdraw-button'>
                            Withdraw
                        </button>
                    </div>
                </div>
            </>
        )
    }


    const PaymentInstructions = (props) => {
        return (
            <>
                <h2 className='text-2x font-[500]'>Withdrawal Instructions</h2>
                <div className="container">
                    <div className="row"><div className="col"> 1. Enter the phone M-Pesa phone number to receive the funds.  </div></div>
                    <div className="row"><div className="col"> 2. Enter the amount you wish to withdraw.</div></div>
                    <div className="row"><div className="col"> 3. Click on the withdraw funds button.</div></div>
                    <div className="row"><div className="col"> 4. Check your phone for an M-Pesa Confirmation.</div></div>
                </div>
                <hr className='my-3' />
                <h2 className='text-2x font-[500]'>Withdraw Via SMS</h2>
                <div className="container">
                    <div className="row">
                        <div className="col"> To withdraw via SMS, send <span className='font-bold'>w#amount</span> or <span className='font-bold'>withdraw#amount</span> to <span className='font-bold'>29280</span> </div>
                        <div className='mt-2'>eg send SMS <span className='font-bold'>w#500</span> to <span className='font-bold'>29280</span></div>
                    </div>

                </div>
            </>
        );
    }
    const MyWithdrawalForm = (props) => {
        const { errors, values, setFieldValue } = props;

        const onFieldChanged = (ev) => {
            let field = ev.target.name;
            let value = ev.target.value;
            setFieldValue(field, value);
        }
        return (
            <Form className=" rounded border-0" >
                <div className="pt-0">
                    <div className="row">
                        <div className='col text-center md:text-left'>
                            <img src={mpesa} alt="" className='' style={{ maxWidth: "100px" }} />
                        </div>
                        <div className='my-2'><hr /></div>
                        <div className=''>
                            <WithdrawFormFields onFieldChanged={onFieldChanged} values={values} errors={errors} />
                        </div>
                        <hr />
                        <PaymentInstructions />
                    </div>
                </div>
            </Form>
        );
    }

    const WithdrawalForm = (props) => {
        return (
            <Formik
                initialValues={initialValues}
                onSubmit={handleSubmit}
                validateOnChange={false}
                validateOnBlur={false}
                validate={validate}
                render={(props) => <MyWithdrawalForm {...props} />} />
        );
    }

    const Alert = (props) => {
        let c = success ? 'success' : 'danger';
        return (<>{message && <div role="alert" className={`fade alert alert-${c} show`}>{message?.message}</div>} </>);

    };

    return (
        <React.Fragment>
            <FormTitle />
            <div className="">
                <div className="std-medium-width-block">
                    <WithdrawalForm />
                </div>
            </div>
        </React.Fragment>
    )
}

export default Withdrawal;
