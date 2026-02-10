import React, { useState, useContext, useEffect } from 'react';

import { Formik, Form } from 'formik';
import makeRequest from "../../utils/fetch-request";
import mpesa from '../../../assets/img/mpesa.png'
import { Context } from '../../../context/store';
import Notify from '../../utils/Notify';
import Accordion from 'react-bootstrap/Accordion';
import '../../../assets/css/accordion.react.css';
import StdTable from '../../utils/std-table';
import { Link } from 'react-router-dom';
import { GoAlertFill } from "react-icons/go";
import { getFromLocalStorage } from '../../utils/local-storage';


const Deposit = (props) => {

    const [state, dispatch] = useContext(Context);

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
                    setMessage({ status: 400, message: "STK not Available. Click to deposit directly" })
                    Notify({ status: 400, message: "Error making a deposit. Seek customer care support" })
                }
                setIsLoading(false)
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




    // Upon loading this page call the function that polls for balance every 3 seconds and then stops after 1 minute


    const FormTitle = () => {
        return (
            <div className='p-4 text-center border-b bg-primary'>
                <h4 className="!uppercase">
                    Deposit Funds (Mobile money)
                </h4>
            </div>
        )
    }


    const DepositFormFields = (props) => {
        const { values, errors, onFieldChanged } = props;

        return (
            <>

                <div className="form-group row d-flex justify-content-center mt-4">

                    <div className="row">
                        {message &&
                            <div className='mt-3 font-bold'>
                                <Link to={"#pay-via-mobile"}><Alert /></Link>
                            </div>}
                        <input
                            onChange={ev => onFieldChanged(ev)}
                            style={{}}
                            className="text-dark deposit-input form-control input-field"
                            name="msisdn"
                            type="text"
                            readOnly
                            disabled
                            value={user?.msisdn}
                        />
                        <label className='pl-0 mb-1'>Amount to Deposit</label>
                        <input
                            onChange={ev => onFieldChanged(ev)}
                            style={{}}
                            className="text-dark deposit-input form-control  input-field"
                            id="amount"
                            name="amount"
                            type="text"
                            value={values.amount}
                            placeholder='Enter Amount'
                        />
                        {errors.amount && <div className='text-danger'> {errors.amount} </div>}

                        <button
                            disabled={isLoading}
                            style={{}}
                            className='btn btn-lg btn-primary mt-3 col-md-12 deposit-withdraw-button'>
                            {isLoading ? "wait..." : "Deposit"}
                        </button>
                    </div>
                </div>
            </>
        )
    }


    const PaymentInstructions = (props) => {
        return (
            <>
                <hr className='my-3' />
                <div className='' id='pay-via-mobile'>
                    <h2 className='text-2x text-gray-700 font-[500] mb-3 '>Direct Mpesa Deposit</h2>
                    <div className="row">
                        <div className="col"> 1. Go to Mpesa.</div>
                    </div>
                    <div className="row">
                        <div className="col"> 2. Select Lipa na mpesa</div>
                    </div>
                    <div className="row">
                        <div className="col"> 3. Enter Paybill number: <span className='text-2x font-bold'>444142/</span></div>
                    </div>
                    <div className="row">
                        <div className="col"> 4. Account Number:
                            <span className='text-2x font-bold'>Enter your phone number</span>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col"> 5. Enter Amount</div>
                    </div>
                    <div className="row">
                        <div className="col"> 5. Enter PIN and accept</div>
                    </div>

                </div>

            </>
        );
    }
    const MyDepositForm = (props) => {
        const { errors, values, setFieldValue } = props;

        const onFieldChanged = (ev) => {
            let field = ev.target.name;
            let value = ev.target.value;
            setFieldValue(field, value);
        }

        const DepositSelfService = (props) => {

            return (
                <div className='cursor-pointer opacity-80 hover:opacity-100'
                    onClick={() => dispatch({ type: "SET", key: "showcheckmpesadepositstatus", payload: true })}>
                    <div className='flex'>
                        <GoAlertFill className='text-3xl mr-4 align-middle' size={30} />
                        <div className=''>
                            <div className='font-bold'>Missing Deposit</div>
                            <div className='block font-[500] opacity-70'>
                                Deposit not reflecting? sort your missing deposit here
                            </div>
                            <button className='btn rounded-md btn-default text-gray-700 capitalize py-3 my-2 font-[500]'>
                                Check Deposit status
                            </button>
                        </div>
                    </div>
                </div>
            )
        }

        return (
            <div className='std-medium-width-block'>
                <Form className="rounded border-0">
                    <div className="pt-0">
                        <div className="row px-3">
                            <div className='text-center'>
                                <img src={mpesa} alt="" />
                            </div>


                        </div>
                        <hr className='my-2' />
                        <div className='row'>
                            <div className=''>
                                <DepositFormFields onFieldChanged={onFieldChanged} values={values} errors={errors} />

                                <div className='my-3'><DepositSelfService /></div>

                                <Accordion
                                    className="accordion mt-4"
                                    defaultActiveKey={0}
                                    allowMultipleExpanded={false}
                                // uuid = {}
                                >
                                    <Accordion.Item eventKey={0}>
                                        <Accordion.Header className='capitalize'>
                                            <span className='capitalize'>Deposit via paybill number (444142/)</span>
                                        </Accordion.Header>
                                        <Accordion.Body>
                                            <PaymentInstructions />
                                        </Accordion.Body>
                                    </Accordion.Item>
                                </Accordion>
                            </div>

                        </div>
                    </div>
                </Form>
            </div>
        );
    }

    const DepositForm = (props) => {
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

    const Alert = (props) => {
        let c = success ? 'success' : 'danger';
        return (
            <>
                {message &&
                    <div role="alert" className={`rounded-md fade alert alert-${c} show`}>
                        {message?.message}
                    </div>
                }
            </>
        );

    };

    return (
        <div className="homepage">
            <FormTitle />
            <div className="col-md-12 mt-2  p-2">
                <div className="pb-0" data-backdrop="static">
                    <DepositForm />
                </div>
            </div>
        </div>
    )

}

export default React.memo(Deposit)
