import React, { useState, useContext, useEffect, useRef } from 'react';
import { Context } from '../../context/store';
import { Modal } from "react-bootstrap";
import { isMobile } from "react-device-detect";
import { FaWallet, FaMobileAlt, FaCheckCircle } from "react-icons/fa";
import makeRequest from '../utils/fetch-request';
import { getFromLocalStorage, removeItem } from '../utils/local-storage';
import { formatNumber } from '../utils/betslip';
import '../../assets/css/deposit-prompt-modal.css';

const MAX_DEPOSIT = 70000;
const BALANCE_POLL_MS = 7000;
const BALANCE_POLL_FOR_MS = 60000;

const DepositModal = () => {

    const [state, dispatch] = useContext(Context);
    const prompt = state?.promptdepositrequest;
    const user = getFromLocalStorage("user") || state?.user;
    const msisdn = user?.msisdn || '';

    const [amount, setAmount] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [stkSent, setStkSent] = useState(false);
    const pollRef = useRef({ interval: null, timeout: null });
    const toggleRef = useRef(state?.toggleuserbalance);
    toggleRef.current = state?.toggleuserbalance;

    const stopPolling = () => {
        clearInterval(pollRef.current.interval);
        clearTimeout(pollRef.current.timeout);
        pollRef.current = { interval: null, timeout: null };
    };

    const refreshBalance = () => {
        dispatch({ type: "SET", key: "toggleuserbalance", payload: !toggleRef.current });
    };

    useEffect(() => {
        if (prompt?.show) {
            setAmount(prompt?.payableAmt ? String(prompt.payableAmt) : '');
            setError(null);
            setStkSent(false);
            setIsLoading(false);
        }
    }, [prompt?.show, prompt?.payableAmt]);

    useEffect(() => stopPolling, []);

    const close = () => {
        stopPolling();
        dispatch({ type: "DEL", key: "promptdepositrequest" });
    };

    const backToBetslip = () => {
        close();
        if (isMobile) {
            dispatch({ type: "SET", key: "showmobileslip", payload: true });
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const value = parseFloat(amount);
        if (!msisdn) {
            setError("Log in to deposit.");
            return;
        }
        if (!value || value < 1 || value > MAX_DEPOSIT) {
            setError(`Enter an amount between KSh 1 and KSh ${formatNumber(MAX_DEPOSIT)}.`);
            return;
        }

        setIsLoading(true);
        setError(null);
        const promoName = state?.promoInfo;
        makeRequest({
            url: 'v2/deposits/stk/new',
            method: 'POST',
            data: {
                amount: value,
                msisdn,
                app_name: promoName ? `desktop-web:${promoName}` : 'desktop-web',
            },
            api_version: 3
        }).then(([status, response]) => {
            setIsLoading(false);
            if (status == 200) {
                setStkSent(true);
                refreshBalance();
                stopPolling();
                pollRef.current.interval = setInterval(refreshBalance, BALANCE_POLL_MS);
                pollRef.current.timeout = setTimeout(stopPolling, BALANCE_POLL_FOR_MS);
                return;
            }
            if (status == 401 || response?.status == 401 || response?.status == 403) {
                close();
                removeItem("user");
                dispatch({ type: "DEL", key: "user" });
                dispatch({ type: "SET", key: "showloginmodal", payload: true });
                return;
            }
            setError(response?.message || response?.error?.message
                || "We couldn't send the M-Pesa prompt. Use the Paybill option below.");
        });
    };

    const hasShortfall = prompt?.stake != null && prompt?.balance != null;

    return (
        <Modal
            show={!!prompt?.show}
            onHide={close}
            centered
            className="deposit-prompt-modal"
        >
            <Modal.Header closeButton closeVariant="white">
                <Modal.Title>
                    <span className="deposit-prompt-title-icon" aria-hidden="true">
                        <FaWallet />
                    </span>
                    Insufficient balance
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {stkSent ? (
                    <div className="deposit-prompt-success" role="status">
                        <FaCheckCircle className="deposit-prompt-success-icon" aria-hidden="true" />
                        <p className="deposit-prompt-success-title">Check your phone</p>
                        <p className="deposit-prompt-text">
                            Enter your M-Pesa PIN on {msisdn} to complete the deposit of
                            {' '}<b>KSh {formatNumber(amount)}</b>. Once it reflects in your balance,
                            go back to your betslip and place the bet again.
                        </p>
                    </div>
                ) : (
                    <>
                        <p className="deposit-prompt-text">
                            You don't have enough balance to place this bet. Top up with M-Pesa to continue.
                        </p>

                        {hasShortfall && (
                            <div className="deposit-prompt-summary">
                                <div className="deposit-prompt-row">
                                    <span>Stake</span>
                                    <span>KSh {formatNumber(prompt.stake)}</span>
                                </div>
                                <div className="deposit-prompt-row">
                                    <span>Your balance</span>
                                    <span>KSh {formatNumber(prompt.balance)}</span>
                                </div>
                                <div className="deposit-prompt-row deposit-prompt-row--total">
                                    <span>Top up at least</span>
                                    <span className="deposit-prompt-highlight">KSh {formatNumber(prompt.payableAmt)}</span>
                                </div>
                            </div>
                        )}

                        <form className="deposit-prompt-form" onSubmit={handleSubmit} noValidate>
                            <label className="deposit-prompt-label" htmlFor="deposit-prompt-msisdn">
                                <FaMobileAlt aria-hidden="true" /> M-Pesa number
                            </label>
                            <input
                                id="deposit-prompt-msisdn"
                                className="deposit-prompt-input"
                                type="text"
                                value={msisdn}
                                readOnly
                                disabled
                            />

                            <label className="deposit-prompt-label" htmlFor="deposit-prompt-amount">
                                Amount to deposit
                            </label>
                            <div className="deposit-prompt-amount-wrap">
                                <span className="deposit-prompt-currency">KSh</span>
                                <input
                                    id="deposit-prompt-amount"
                                    className="deposit-prompt-input deposit-prompt-input--amount"
                                    type="text"
                                    inputMode="decimal"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                                    placeholder="Enter amount"
                                    autoFocus
                                />
                            </div>

                            {error && <div className="deposit-prompt-error" role="alert">{error}</div>}

                            <button type="submit" className="deposit-prompt-submit" disabled={isLoading}>
                                {isLoading ? "Sending M-Pesa prompt..." : "Deposit now"}
                            </button>
                        </form>

                        <p className="deposit-prompt-paybill">
                            Or pay via M-Pesa Paybill <b>444142</b>, account number: your phone number.
                        </p>
                    </>
                )}
            </Modal.Body>
            <Modal.Footer>
                {stkSent ? (
                    <button type="button" className="deposit-prompt-secondary" onClick={backToBetslip}>
                        Back to betslip
                    </button>
                ) : (
                    <>
                        <a
                            href={`/deposit?next=${encodeURIComponent(window.location.pathname)}`}
                            className="deposit-prompt-link"
                            onClick={() => stopPolling()}
                        >
                            Open deposit page
                        </a>
                        <button type="button" className="deposit-prompt-secondary" onClick={close}>
                            Cancel
                        </button>
                    </>
                )}
            </Modal.Footer>
        </Modal>
    );
};

export default DepositModal;
