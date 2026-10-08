import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { Context } from '../../context/store';
import {
    removeFromSlip,
    getBetslip,
    clearSlip,
    removeFromJackpotSlip,
    addToJackpotSlip,
    getJackpotBetslip,
    clearJackpotSlip,
    formatNumber
} from '../utils/betslip';
import { toast } from 'react-toastify';
import makeRequest from '../utils/fetch-request';
import 'react-toastify/dist/ReactToastify.css';

import {
    Formik,
    Form as FormikForm,
    useFormikContext,
    Field
} from 'formik';
import { isMobile } from "react-device-detect";
import { Modal } from "react-bootstrap";
import { TbRefreshAlert } from "react-icons/tb";
import { FaCheck, FaGift } from "react-icons/fa";
import { getFromLocalStorage, removeItem, setLocalStorage } from '../utils/local-storage';
import { getStoredIpAddress } from '../utils/ip-address';
import { formatToFloat } from '../utils/formatters';
import { resolveBongeBonusPercent } from './bonge-bonus-utils';

const Float = (equation, precision = 4) => {
    return Math.ceil(equation * (10 ** precision)) / (10 ** precision);
}

const cleanUcn = (str) => {
    str = String(str).replace(/[^A-Za-z0-9\-]/g, '');
    return str.replace(/-+/g, '-');
}

const formatSlipForPlaceBet = (slip) => {
    const isLive = slip.live === 1 || slip.live === '1' || slip.bet_type == 1 || slip.bet_type === '1';

    let marketActive = slip.market_active;
    if (marketActive === 'null' || marketActive === '' || marketActive === undefined) {
        marketActive = null;
    }

    return {
        match_id: String(slip.match_id),
        parent_match_id: String(slip.parent_match_id),
        special_bet_value: slip.special_bet_value ?? '',
        sub_type_id: String(slip.sub_type_id),
        away_team: slip.away_team,
        bet_pick: slip.bet_pick,
        bet_type: isLive ? '1' : '0',
        home_team: slip.home_team,
        live: isLive ? 1 : 0,
        market_active: marketActive,
        odd_type: slip.odd_type,
        odd_value: String(parseFloat(slip.odd_value).toFixed(2)),
        producer_id: String(slip.producer_id || '3'),
        sport_name: slip.sport_name,
        ucn: cleanUcn(`${slip.match_id}${slip.sub_type_id}${slip.bet_pick}`),
    };
}


// Turn a bonus rule from GET /bonuses into a readable line for the Bonus Terms modal.
const humanizeKey = (key) => String(key).replace(/_/g, ' ').replace(/^./, (ch) => ch.toUpperCase());
const humanizeValue = (value) => String(value).toLowerCase().replace(/_/g, ' ').replace(/^./, (ch) => ch.toUpperCase());
const BONUS_RULE_FORMATTERS = {
    bonus_amount: (v) => `Bonus amount: KSh ${formatNumber(v)}`,
    bonus_percentage: (v) => `Bonus: ${v}%`,
    bonus_contribution_percentage: (v) => `Bonus covers up to ${v}% of the stake`,
    cash_contribution_percentage: (v) => `Cash covers ${v}% of the stake`,
    minimum_odds_per_game: (v) => `Minimum odds per game: ${v}`,
    minimum_games: (v) => `Minimum games: ${v}`,
    maximum_games: (v) => `Maximum games: ${v}`,
    winnings_withdrawable: (v) => (v ? 'Winnings are withdrawable' : 'Winnings are not withdrawable'),
    deposit_frequency: (v) => `Deposit: ${humanizeValue(v)}`,
    expiry_hours: (v) => `Expires after ${v} hour${Number(v) === 1 ? '' : 's'}`,
    expiry_days: (v) => `Expires after ${v} day${Number(v) === 1 ? '' : 's'}`,
};
const formatBonusRules = (rules) =>
    Object.entries(rules || {})
        .filter(([, rule]) => rule && rule.enabled !== false && rule.value !== undefined && rule.value !== null)
        .map(([key, rule]) => (BONUS_RULE_FORMATTERS[key]
            ? BONUS_RULE_FORMATTERS[key](rule.value)
            : `${humanizeKey(key)}: ${typeof rule.value === 'boolean' ? (rule.value ? 'Yes' : 'No') : rule.value}`));

const BetslipSubmitForm = (props) => {

    const { jackpot, jackpotData, bonusBet, dbWinMatrix } = props;
    const [message, setMessage] = useState(null);
    const [state, dispatch] = useContext(Context);
    const [stake, setStake] = useState(state?.mobilefooteramount || jackpotData?.bet_amount || 100);
    const [stakeAfterTax, setStakeAfterTax] = useState(0);
    const [exciseTax, setExciseTax] = useState(0);
    const [withholdingTax, setWithholdingTax] = useState(0);
    const [possibleWin, setPossibleWin] = useState(0);
    const [netWin, setNetWin] = useState(0);
    const [bonus, setBonus] = useState(0);
    const [betslipkey, setBetslipKey] = useState(() => jackpot ? "jackpotbetslip" : "betslip");
    const [totalGames, setTotalGames] = useState(0);
    const [totalOdds, setTotalOdds] = useState(1);
    const [showBonusTooltip, setShowBonusTooltip] = useState(false);
    const user = getFromLocalStorage("user");
    const bonusBalance = formatToFloat(user?.bonus || user?.bonus_balance || 0);

    // Active bonuses + their rules from GET /bonuses, shown in the Bonus Terms modal.
    const [bonusTerms, setBonusTerms] = useState([]);

    useEffect(() => {
        makeRequest({ url: '/bonuses', method: 'GET', api_version: 2 })
            .then(([status, response]) => {
                if (status === 200 && Array.isArray(response?.data?.bonuses)) {
                    setBonusTerms(response.data.bonuses.filter((b) => b && b.active !== false));
                }
            })
            .catch(() => { /* terms stay empty if the request fails */ });
    }, []);


    // const setbonusMatrix = () => {
    //     let winMatrix = getFromLocalStorage("sgrBonusMatrix");
    //     if (winMatrix) {
    //         setDbWinMatrix(winMatrix);
    //         dispatch({ type: "SET", key: "sgrBonusMatrix", payload: winMatrix })

    //     } else {
    //         makeRequest({ url: '/sports/config/sgr', method: 'GET', api_version: 2 })
    //             .then(([status, response]) => {
    //                 if (status === 200) {
    //                     setLocalStorage("sgrBonusMatrix", response?.data, 24 * 60 * 60 * 1000);
    //                     setDbWinMatrix(response?.data);
    //                     dispatch({ type: "SET", key: "sgrBonusMatrix", payload: response?.data })

    //                 } else {
    //                     console.error("Failed to fetch SGR Bonus Matrix:", response);
    //                 }
    //             })
    //     }
    // };




    const rebet = async () => {
        // check for the betslip to be reloaded
        if (state?.jackpotrebetslip) {
            dispatch({ type: "SET", key: "jackpotbetslip", payload: state?.jackpotrebetslip });
            setLocalStorage('jackpotbetslip', state?.jackpotrebetslip, 1 * 60 * 60 * 1000);
            dispatch({ type: "DEL", key: "jackpotrebetslip" });


        } else {
            dispatch({ type: "SET", key: "betslip", payload: state?.rebetslip });
            setLocalStorage('betslip', state?.rebetslip, 1 * 60 * 60 * 1000);
            dispatch({ type: "DEL", key: "rebetslip" });
            // window.location.href = '/'
        }

    }
    const Alert = (props) => {
        let c = message?.status == 200 ? 'betslip-success-box' : 'danger';
        let x_style = {
            fontWeight: "bold",
            float: "right",
            display: "block",
            color: message?.status == 200 ? "white" : "orangered",
            cursor: "pointer",
        }
        return (<>{message?.status &&
            <div role="alert"
                className={`placebet-response fade alert alert-${c} show alert-dismissible`}>

                <div className=''>
                    <div className='alert-title text-2xl fex font-bold w-full py-3 justify-between'>
                        {/* <div className=' w-10/12'>{message?.title ? message?.title : "Error!"}</div> */}
                        <div aria-hidden="true" style={x_style} onClick={() => setMessage(null)}>&times;</div>
                    </div>
                    <div className='text-2xl mb-3 font-normal'>{message.message}</div>

                    {message?.status == 200 &&
                        <div className='my-3'>
                            <button class="betslip-rebet-button text-3xl" onClick={() => rebet()}>
                                <TbRefreshAlert size={25} className='inline-block mr-4 ' />Rebet
                            </button>
                        </div>
                    }
                </div>
            </div>}
        </>);
    };

    useEffect(() => {
        setBetslipKey(state?.isjackpot ? "jackpotbetslip" : "betslip")
    }, [state?.isjackpot])

    useEffect(() => {
        if (Object.keys(state?.betslip || state?.jackpotbetslip || {}).length > 0) {
            setMessage({})
        }
    }, [state?.betslip, state?.jackpotbetslip]);

    const successfulBetHeading = () => {
        let betType = "";
        if (!jackpot) {
            if (state?.islive) {
                betType = betType + "Live"
            }
            if (Object.keys(state?.betslip || {}).length > 1) {
                betType = betType + " Multibet"
            } else {
                betType = betType + " Single Bet"
            }


        }
        betType = betType + " placed successfully"
        return betType;
    }
    const handlePlaceBet = useCallback((values,
        { setSubmitting, resetForm, setStatus, setErrors }) => {

        if (!getFromLocalStorage("user") || !getFromLocalStorage("user")?.token) {
            return false
        }

        let bs = Object.values(state?.[betslipkey] || []);

        let slipHasOddsChange = false;
        let slipHasUnbettableEvents = false;
        let jackpotMessage = 'jp';


        for (let slip of bs) {
            if (jackpot) {
                jackpotMessage += "#" + slip.bet_pick
            }

            if (slip.disable == true) {
                slipHasUnbettableEvents = true;
                break;
            } else if (slip.prev_odds
                && slip.prev_odds !== slip.odd_value
                && (values.accept_all_odds_change == 0 || !values.accept_all_odds_change)) {
                slipHasOddsChange = true;
                break;
            } else {
                delete slip.start_time
                delete slip.disable
                delete slip.comment
                delete slip.prev_odds
                delete slip.changeOrigin
                delete slip.event_status
            }
        }


        if (slipHasUnbettableEvents == true || slipHasOddsChange == true) {

            let message = ""

            if (slipHasUnbettableEvents == true) {
                message += "Slip has events that have been disabled or suspended."
                    + " Please remove to proceed"
            }

            if (slipHasOddsChange == true) {
                message += "Slip has events with changed odds, tick "
                    + " accept odds all odds change box to accept and place bet"
            }
            setMessage({
                status: 400,
                message: message
            });

            setSubmitting(false);
            return;
        }

        let payload = {
            bet_string: isMobile ? 'mobile' : 'web',
            app_name: isMobile ? 'mobile' : 'desktop',
            possible_win: possibleWin,
            stake_amount: jackpot ? jackpotData?.bet_amount : stake,
            amount: jackpot ? jackpotData?.bet_amount : stake,
            bet_total_odds: Float(totalOdds, 2),
            ip_address: String(getStoredIpAddress() || ''),
            channel_id: isMobile ? 'mobile' : 'web',
            slip: bs.map(formatSlipForPlaceBet),
            profile_id: getFromLocalStorage("user")?.profile_id || state?.user?.profile_id,
            account: 1,
            msisdn: getFromLocalStorage("user")?.msisdn || state?.user?.msisdn,
            accept_all_odds_change: 0,
            bet_type: getFromLocalStorage("liveCount") > 0 ? "1" : jackpot ? "9" : "3", // update for live
        };
        let endpoint = '/user/place-bet';
        let method = "POST"
        if (jackpot) {
            endpoint = '/user/jackpot/place-bet'
            payload.jackpot_id = jackpotData?.jackpot_event_id
        }

        makeRequest({ url: endpoint, method: method, data: payload, api_version: 2 })
            .then(([status, response]) => {
                if (status == 200 || status == 201 || status == 204 || jackpot) {
                    if (response?.status == 200) {
                        dispatch({
                            type: "SET",
                            key: "toggleuserbalance",
                            payload: state?.toggleuserbalance
                                ?
                                !state?.toggleuserbalance : true
                        })
                        setBonus(0);
                        removeItem("bonusCentage")
                        handleRemoveAll();
                        if (jackpot) {
                            // save betslip into state before proceeding
                            dispatch({ type: "SET", key: "jackpotrebetslip", payload: state?.jackpotbetslip })
                            clearJackpotSlip();
                            setMessage({
                                status: 201,
                                message: "Jackpot bet placed successfully."
                            })
                        } else {
                            dispatch({ type: "SET", key: "rebetslip", payload: state?.betslip })
                            clearSlip();
                        }
                        dispatch({ type: "DEL", key: jackpot ? 'jackpotbetslip' : 'betslip' });
                        response = { ...response, ...{ title: successfulBetHeading() } }
                        setMessage({ status: status, message: "Your place bet request received successfully", title: successfulBetHeading() })
                    } else {
                        let qmessage = {
                            status: 400,
                            message: response?.message
                                ||
                                response?.error?.message
                                ||
                                response?.result
                                ||
                                "Error attempting to place bet"
                        };
                        if (response?.status == 403 || response?.status == 402) {
                            // remove the betslip
                            dispatch({ type: "SET", key: "showmobileslip", payload: false })
                            // set the modal for request payment
                            // compute the amount payable and round off to the nearest minimum that can be deposited
                            let amtDiff = Float(stake, 2) - Float(state?.user?.balance, 2);
                            if (amtDiff < 5) {
                                amtDiff = 5.00
                            }
                            dispatch({ type: "SET", key: "promptdepositrequest", payload: { show: true, payableAmt: amtDiff, message: { status: 400, message: response.result } } })
                        } else if (response?.status == 403) {
                            removeItem("user");
                            dispatch({ type: "SET", key: "showloginmodal", payload: true })

                        } else {
                            setMessage(qmessage);
                        }
                    }
                } else {
                    if (status == 403) {
                        dispatch({ type: "DEL", key: "showloginmodal" })
                        dispatch({ type: "SET", key: "showloginmodal", payload: true })
                    } else {
                        let qmessage = {
                            status: status,
                            message: response?.message || response?.error?.message || "Error attempting to place bet"
                        };
                        if (qmessage.status == 500) {
                            qmessage.message = "Error attempting to place bet"
                        }
                        setMessage(qmessage);
                    }

                }
                setSubmitting(false);
            })
    });

    const updateWinnings = useCallback(() => {
        if (state?.[betslipkey]) {

            // Get Bonus
            let max_games = dbWinMatrix?.sgr_bonus_max_games || 30;
            let total_games = Object.values(state?.betslip || {})?.filter(
                (slip) => slip.odd_value > (dbWinMatrix?.sgr_bonus_min_odds || 1.30))?.length;

            if (total_games > max_games) {
                total_games = max_games;
            }
            const bonusPercent = resolveBongeBonusPercent(dbWinMatrix, total_games);
            let centageInt = bonusPercent / 100;

            setTotalGames(Object.keys(state?.[betslipkey] || {}).length);

            let odds = Object.values(state?.[betslipkey] || {}).reduce((previous, { odd_value }) => {
                return previous * odd_value;
            }, 1);
            setTotalOdds(odds);

            let stake_after_tax = (stake / 100) * 100
            let ext = stake - stake_after_tax;
            let raw_possible_win = Float(stake * odds);

            if (jackpot) {
                raw_possible_win = jackpotData?.jackpot_amount
            }
            if (raw_possible_win > 500000 && !jackpot) {
                raw_possible_win = 500000
            }
            let taxable_amount = raw_possible_win - stake;

            let wint = taxable_amount * 0.2;
            let nw = raw_possible_win;
            let computeExAmt = stake - Float(stake_after_tax, 2);
            setStakeAfterTax(Float(stake_after_tax, 2));
            setExciseTax(Math.round(computeExAmt * (10 ** 2)) / (10 ** 2));
            setNetWin(nw > Float(500000) ? Float(500000) : nw);
            setPossibleWin(Float(raw_possible_win, 2));
            setWithholdingTax(Float(wint, 2));
            setBonus(Float(raw_possible_win * centageInt, 2) || 0);
            dispatch({ type: "SET", key: "totalodds", payload: Float(odds) })
            dispatch({ type: "SET", key: "slipnetwin", payload: Float(nw, 2) })
        } else {
            setNetWin(0);
            setWithholdingTax(0);
            setExciseTax(0);
            setPossibleWin(0);
            setStakeAfterTax(0);
            setBonus(0);
            setTotalOdds(1);
        }
        if (message && message.status > 299) {
            setMessage(null);
        }
    }, [state?.[betslipkey], stake]);


    const handleRemoveAll = () => {
        let betslips = state?.isjackpot ? getJackpotBetslip() : getBetslip();

        if (betslips) {
            Object.entries(betslips).map(([match_id, match]) => {
                state?.isjackpot
                    ? removeFromJackpotSlip(match_id)
                    : removeFromSlip(match_id);

                let match_selector = match.match_id + "_selected";
                let ucn = clean_rep(
                    match.match_id
                    + "" + match.sub_type_id
                    + (match.bet_pick)
                );
                dispatch({ type: "SET", key: match_selector, payload: "remove." + ucn });
            });
        }
        state?.isjackpot ? clearJackpotSlip() : clearSlip();
        dispatch({ type: "DEL", key: state?.isjackpot ? "jackpotbetslip" : "betslip" });

    };

    useEffect(() => {
        updateWinnings();
    }, [updateWinnings]);

    const initialValues = {
        bet_amount: jackpot ? jackpotData?.bet_amount : bonusBet ? 30 : 100,
        accept_all_odds_change: true,
        use_bonus: bonusBalance > 0,
        user_id: state?.user?.profile_id,
        total_games: state?.[betslipkey]?.length,
        total_odd: totalOdds,
    };

    const validate = values => {

        let errors = {}

        if (!getFromLocalStorage("user")) {
            dispatch({ type: "SET", key: "showloginmodal", payload: true })
            // errors.user_id = 'Kindly login to proceed';
            // setMessage({status: 400, message: errors.user_id});
            return false;
        }

        if (!values.bet_amount || values.bet_amount < 1) {
            errors.bet_amount = 'Enter valid bet amount';
            setMessage({ status: 400, message: errors.bet_amount });
            return errors;
        }
        if (!state?.[betslipkey] || Object.keys(state?.[betslipkey]).length == 0) {
            errors.user_id = "No betlip selected";
            setMessage({ status: 400, message: errors.user_id });
            return errors;
        }
    };


    const clean_rep = (str) => {
        str = str.replace(/[^A-Za-z0-9\-]/g, '');
        return str.replace(/-+/g, '-');
    }

    const SubmitButton = (props) => {
        const { title, disabled, className = '', ...rest } = props;
        const { isSubmitting } = useFormikContext();
        return (
            <button type="submit" {...rest}
                className={`${disabled ? 'disabled' : ''} place-bet-btn bold ${className}`.trim()}
                id='place_bet_button'
                disabled={isSubmitting || disabled}>{isSubmitting ? " WAIT ... " : title}</button>
        );
    };


    return (

        <Formik
            initialValues={initialValues}
            onSubmit={handlePlaceBet}
            validate={validate}
            validateOnChange={false}
            validateOnBlur={false}
            enableReinitialize={true}
        >{(props) => {

            const { isValid, errors, values, submitForm, setFieldValue } = props;

            const onFieldChanged = (ev) => {
                let field = ev.target.name;
                let value =
                    ev.target.type === "checkbox"
                        ? ev.target.checked
                        : ev.target.value;

                if (field === "bet_amount") {
                    // Allow only digits
                    if (/^\d*$/.test(value)) {
                        value = value === "" ? "" : parseInt(value, 10);

                        setFieldValue(field, value);
                        setStake(value);
                    }
                } else {
                    setFieldValue(field, value);
                }
            };


            return (
                <>
                    {
                        (((Object.keys(state?.betslip || {}) || []).length > 0) || ((Object.keys(state?.jackpotbetslip || {}) || []).length > 0) || (message?.status)) &&
                        <FormikForm name="betslip-submit-form" className="betslip-submit-form">
                            {<div className='mx-auto w-[95%]'><Alert /></div>}
                            <div className='betslip-submit-panel uppercase'>
                                <table className="bet-table betslip-submit-layer !p-3 border-t border-gray-200 m-auto" style={{ width: "96%", borderTopColor: 'rgba(255, 255, 255, 0.15)' }}>
                                    <tbody>
                                        {!jackpot && <tr className="hide-on-affix">
                                            <td className='opacity-60 py-3'>TOTAL ODDS</td>
                                            <td className=' py-3 text-right pr-2'>
                                                <b>{parseFloat(totalOdds).toFixed(2)}</b>
                                            </td>
                                        </tr>}

                                        {/* <tr id="odd-change-text" className='opacity-60'>
                                            <td colSpan="2">
                                                <label className="checkbox">

                                                    <input type="checkbox"
                                                        className="odds-change-box"
                                                        name={"accept_all_odds_change"}
                                                        id={"accept-all-odds-change"}
                                                        checked={values?.accept_all_odds_change}
                                                        onChange={(e) => onFieldChanged(e)}
                                                    /> Accept any odds change
                                                </label>
                                            </td>
                                        </tr> */}
                                        <tr>
                                            <td className='opacity-70 py-2'>AMOUNT(ksh)</td>
                                            <td className='py-2 text-right pr-2'>
                                                <div id="betting">
                                                    {jackpot ?
                                                        jackpotData?.bet_amount :
                                                        (<input
                                                            type="number"
                                                            className="bet-select"
                                                            name="bet_amount"
                                                            min={1}
                                                            max={20000}
                                                            step={1}
                                                            value={stake}
                                                            onKeyDown={(e) => {
                                                                if (["e", "E", "-", "."].includes(e.key)) {
                                                                    e.preventDefault();
                                                                }
                                                            }}
                                                            onChange={onFieldChanged}
                                                        />
                                                        )}
                                                </div>
                                            </td>
                                        </tr>
                                        {!jackpot && bonusBalance > 0 && (
                                            <tr>
                                                <td colSpan="2" className="py-2 normal-case use-bonus-row-body">
                                                    <label className="checkbox use-bonus-label" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 'normal' }}>
                                                        <input
                                                            type="checkbox"
                                                            name="use_bonus"
                                                            checked={!!values?.use_bonus}
                                                            onChange={(e) => onFieldChanged(e)}
                                                        />
                                                        <span>Use Bonus (<span style={{ color: 'rgba(255, 215, 0)' }}>KSh {bonusBalance}</span>)</span>
                                                    </label>

                                                    <button
                                                        type="button"
                                                        className="bonus-terms-link"
                                                        aria-label="Bonus terms"
                                                        onClick={() => setShowBonusTooltip(true)}
                                                        style={{ marginLeft: '10px' }}
                                                    >
                                                        Terms
                                                    </button>
                                                </td>
                                            </tr>
                                        )}
                                        <tr>
                                            <td colSpan="2"></td>
                                        </tr>
                                        {!jackpot && <tr className="bet-win-tr hide-on-affix">
                                            {/* <td className='opacity-70 py-2'>Stake after tax</td>
                                            <td className='text-right py-2 pr-2'>
                                                KSH. <span
                                                    id="pos_win">{formatNumber(stakeAfterTax)}</span>
                                            </td> */}
                                        </tr>}

                                        <tr className="bet-win-tr hide-on-affix">
                                            <td className='opacity-70 pb-4'> Excise Tax (0%)</td>
                                            <td className='text-right pb-4 pr-2'>KSH. <span id="tax">{exciseTax} </span></td>
                                        </tr>
                                    </tbody>
                                </table>

                                {/* the betslip form bottom */}


                                <table width={100} className='betslip-placebet-section betslip-submit-layer py-3' style={{ fontWeight: "500", paddingRight: "10px" }}>
                                    <tbody>
                                        {jackpot ? (
                                            ''
                                        ) : (
                                            <>
                                                <tr className="in-blue-highlight secondary-text">
                                                    <td className='py-3 px-3'>Bonus</td>
                                                    <td className='text-right py-3 px-3'>KES.
                                                        <span id="tax"> {formatNumber(bonus || 0)}</span>
                                                    </td>
                                                </tr>

                                            </>
                                        )}
                                        <tr className="bet-win-tr hide-on-affix">
                                            <td className='py-2 px-3'>{'possible Win'}</td>
                                            <td className='px-3 text-right py-2'>KSH. <span
                                                id="net-amount">{formatNumber(jackpot ? jackpotData?.jackpot_amount : parseFloat((netWin + bonus)).toFixed(2))}</span></td>
                                        </tr>
                                        <tr className="betslip-action-row">
                                            <td className="betslip-action-row__cell">
                                                <button className="place-bet-btn betslip-action-btn betslip-action-btn--remove"
                                                    type="button"
                                                    onClick={() => handleRemoveAll()}>REMOVE ALL
                                                </button>
                                            </td>
                                            <td className="betslip-action-row__cell">
                                                {(!jackpot || (jackpot && Object.entries(state?.[betslipkey] || []).length == JSON.stringify(jackpotData?.total_games))) &&
                                                    <SubmitButton id="place_bet_button"
                                                        disabled={jackpot && Object.entries(state?.[betslipkey] || []).length != JSON.stringify(jackpotData?.total_games)}
                                                        className="place-bet-btn bold betslip-action-btn betslip-action-btn--place"
                                                        title="PLACE BET"
                                                    />
                                                }
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </FormikForm>

                    }

                    <Modal
                        show={showBonusTooltip}
                        onHide={() => setShowBonusTooltip(false)}
                        centered
                        className="bonus-terms-modal"
                    >
                        <Modal.Header closeButton closeVariant="white">
                            <Modal.Title>
                                <span className="bonus-terms-modal-title-icon" aria-hidden="true">
                                    <FaGift />
                                </span>
                                Bonus Terms
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <p className="bonus-terms-modal-intro">
                                Bonus funds are subject to wagering requirements and expiry.
                            </p>
                            {bonusTerms.length > 0 && (
                                <div className="bonus-terms-list">
                                    {bonusTerms.map((bonusItem) => {
                                        const ruleLines = formatBonusRules(bonusItem.rules);
                                        return (
                                            <section className="bonus-terms-item" key={bonusItem.code || bonusItem.name}>
                                                <h3 className="bonus-terms-item-name">{bonusItem.name}</h3>
                                                {bonusItem.description && (
                                                    <p className="bonus-terms-item-desc">{bonusItem.description}</p>
                                                )}
                                                {ruleLines.length > 0 && (
                                                    <ul className="bonus-terms-item-rules">
                                                        {ruleLines.map((line) => (
                                                            <li key={line}>
                                                                <FaCheck className="bonus-terms-item-rule-icon" aria-hidden="true" />
                                                                <span>{line}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </section>
                                        );
                                    })}
                                </div>
                            )}
                        </Modal.Body>
                        <Modal.Footer>
                            <button
                                type="button"
                                className="bonus-terms-modal-ok"
                                onClick={() => setShowBonusTooltip(false)}
                            >
                                Got it
                            </button>
                        </Modal.Footer>
                    </Modal>
                </>
            )
        }}
        </Formik>

    )
}
export default React.memo(BetslipSubmitForm);
