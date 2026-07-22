import React, { useContext, useEffect, useState } from "react";
import { Context } from "../../context/store";
import { Modal } from "react-bootstrap";
import { Formik, Form, Field } from 'formik';
import StdTable from "../utils/std-table";
import makeRequest from "../utils/fetch-request";
import Alert from "../utils/alert";
import { FaSearch, FaInfoCircle, FaLock, FaCheck, FaClipboard } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import "../../assets/css/confirm-deposit-modal.css";

const CheckMpesaDepositStatus = (props) => {
    const [state, dispatch] = useContext(Context);

    const closeModal = () => {
        dispatch({ type: "SET", key: "showcheckmpesadepositstatus", payload: false });
    };

    const CheckMpesaDepositStatusForm = (props) => {
        const [fakeMessage, setFakeMessage] = useState(false);
        const [mpesa_code] = useState("")
        const initialValues = { mpesa_code: '' };
        const [message, setMessage] = useState(null);
        const [isSubmitting, setIsSubmitting] = useState(false)

        const handleSubmit = (values, { setSubmitting }) => {
            // Validate the code first
            let endpoint = 'v2/transaction/status';
            setIsSubmitting(true);
            makeRequest({ url: endpoint, data: { mpesa_receipt_code: values.mpesa_code }, method: 'POST', api_version: 3 }).then(([status, response]) => {

                if (status == 200) {
                    if (response?.success == true) {
                        setTimeout(() => {
                            dispatch({ type: "SET", key: "toggleuserbalance", payload: !state?.toggleuserbalance })
                            dispatch({ type: "SET", key: "showcheckmpesadepositstatus", payload: false })
                        }, 30000)
                        setMessage({ status: 200, message: response?.message || "Request has been received. You'll receive an SMS Notification shortly. In case of delay, you could try again by copy pasting the mpesa message." });
                    }
                } else {
                    setMessage({ status: 400, message: response?.message || "Could not process. Please contact customer care. on 0143444142" });
                }
                setIsSubmitting(false);
            })


        };

        const handlePaste = async (setFieldValue) => {
            try {
                if (navigator?.clipboard?.readText) {
                    const text = await navigator.clipboard.readText();
                    if (text) {
                        setFieldValue('mpesa_code', text.trim());
                    }
                }
            } catch (e) {
                // Clipboard permission denied or unavailable — user can still paste manually
            }
        };

        return (
            <Formik
                initialValues={initialValues}
                onSubmit={handleSubmit}
            >
                {({ setFieldValue }) => (
                    <Form>
                        <div className="cdm-hero" aria-hidden="true">
                            <div className="cdm-hero-ring">
                                <div className="cdm-hero-phone">
                                    <div className="cdm-hero-bubble">
                                        <span className="cdm-hero-dot" />
                                        <span className="cdm-hero-dot" />
                                        <span className="cdm-hero-dot" />
                                    </div>
                                    <span className="cdm-hero-check">
                                        <FaCheck />
                                    </span>
                                </div>
                            </div>
                        </div>

                        <h3 className="cdm-heading">
                            Need to check if your deposit has reflected?
                        </h3>
                        <p className="cdm-subtext">
                            Copy the MPESA message you received and paste it in the field below.
                        </p>

                        {message && (
                            <div className="cdm-alert">
                                <Alert message={message} />
                            </div>
                        )}

                        <div className="cdm-field">
                            <label className="cdm-label" htmlFor="mpesa_code">
                                MPESA Message Code
                                <FaInfoCircle aria-hidden="true" title="Confirmation code from your MPESA SMS" />
                            </label>
                            <div className="cdm-input-wrap">
                                <Field
                                    id="mpesa_code"
                                    placeholder="e.g. EDK98G76HHKB"
                                    name="mpesa_code"
                                    type="text"
                                    className="cdm-input"
                                    autoComplete="off"
                                />
                                <button
                                    type="button"
                                    className="cdm-paste-btn"
                                    title="Paste from clipboard"
                                    aria-label="Paste from clipboard"
                                    onClick={() => handlePaste(setFieldValue)}
                                >
                                    <FaClipboard />
                                </button>
                            </div>
                        </div>

                        <div className="cdm-info-card">
                            <span className="cdm-info-icon" aria-hidden="true">
                                <FaLock />
                            </span>
                            <div className="cdm-info-copy">
                                <p className="cdm-info-title">Where do I find the code?</p>
                                <p className="cdm-info-desc">
                                    It&apos;s the confirmation code within the MPESA message you received after making the deposit.
                                </p>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="cdm-submit-btn"
                            disabled={isSubmitting}
                        >
                            <FaSearch aria-hidden="true" />
                            {isSubmitting ? 'Checking…' : 'CHECK NOW'}
                        </button>
                    </Form>
                )}
            </Formik>
        );
    }


    const PastUserDeposits = (props) => {
        const [pastDeposits, setPastDeposits] = useState(null);
        const [tableHeaders,] = useState(["Date", "Amount", "betmundial Balance"]);

        const requestUserDeposits = () => {
            let endpoint = '/deposits';

            makeRequest({ url: endpoint, method: 'GET', api_version: 3 }).then(([status, response]) => {

                if (status == 200) {
                    setPastDeposits(response?.data?.deposits)
                }
            })

        }

        useEffect(() => { requestUserDeposits() }, [])
        return (
            <>
                {pastDeposits &&
                    <div className="cdm-past">
                        <h4 className="cdm-past-title">Past Deposits</h4>
                        <StdTable headers={tableHeaders} data={pastDeposits} emptymessage="No Deposits. Please make your first deposit" />
                    </div>
                }

            </>
        )
    }
    return (
        <>
            <Modal
                show={state?.showcheckmpesadepositstatus == true}
                onHide={closeModal}
                dialogClassName="confirm-deposit-modal"
                centered
                aria-labelledby="confirm-mpesa-deposit-title"
            >
                <div className="cdm-header">
                    <span className="cdm-header-icon" aria-hidden="true">
                        <span className="cdm-header-phone">
                            <span className="cdm-header-icon-ksh">KSh</span>
                        </span>
                    </span>
                    <h2 id="confirm-mpesa-deposit-title" className="cdm-header-title">
                        Confirm Mpesa Deposit
                    </h2>
                    <button
                        type="button"
                        className="cdm-header-close"
                        onClick={closeModal}
                        aria-label="Close"
                    >
                        <MdClose />
                    </button>
                </div>
                <Modal.Body>
                    <div className="cdm-body">
                        <CheckMpesaDepositStatusForm />
                        {state?.user && <PastUserDeposits />}
                    </div>
                </Modal.Body>
            </Modal>
        </>
    )

}

export default React.memo(CheckMpesaDepositStatus)
