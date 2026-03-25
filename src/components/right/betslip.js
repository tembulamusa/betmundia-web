import React, { useState, useEffect, useContext, useCallback, useMemo, useRef } from 'react';
import BetslipSubmitForm from './betslip-submit-form';
import { Context } from '../../context/store';
import {
    removeFromSlip,
    removeFromJackpotSlip,
    getBetslip,
    getJackpotBetslip,
    addToSlip,
} from '../utils/betslip';

import { Link } from 'react-router-dom';
import PerfectScrollbar from 'react-perfect-scrollbar';
import CompanyInfo from "./company-info";
import makeRequest from '../utils/fetch-request';
import { getFromLocalStorage, setLocalStorage } from '../utils/local-storage';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import Notify from "../utils/Notify";
import Alert from '../utils/alert';
import useInterval from '../../hooks/set-interval.hook';
import socket from '../utils/socket-connect';
const clean_rep = (str) => {
    str = str.replace(/[^A-Za-z0-9\-]/g, '');
    return str.replace(/-+/g, '-');
}

const BetSlip = (props) => {
    const { jackpot, betslipValidationData, jackpotData, dbWinMatrix } = props;
    const [is_jackpot, setIsJackpot] = useState(jackpot);
    const [localJPData, setLocalJPData] = useState(jackpotData);
    const { code } = useParams();
    const [state, dispatch] = useContext(Context);
    const [betslipKey, setBetslipKey] = useState(
        () => state?.jackpotbetslip ? "jackpotbestslip" : "bestslip"
    );
    const [betslipsData, setBetslipsData] = useState({});
    const [hasBetslip, setHasBetslip] = useState(false);
    const [socketSlipChange, setSocketSlipChange] = useState(false);

    //initial betslip loading




    useEffect(() => {
        const formerBetslip = betslipsData;
        let b = (state?.isjackpot)
            ? getJackpotBetslip()
            : getBetslip();
        setBetslipsData(b);
        if (b) {
            setHasBetslip(true);
        } else {
            setHasBetslip(false);
        }
        setIsJackpot(state?.jackpotbetslip != null);
        setLocalJPData(state?.jackpotdata);
        (!state?.betslip && !state?.jackpotbetslip) && dispatch({ type: "SET", key: state?.jackpotbetslip ? "jackpotbetslip" : "betslip", payload: b })

    }, [state?.betslip, state?.jackpotbetslip]);

    useEffect(() => {
        if (state[betslipKey]) {
            setBetslipsData(state[betslipKey]);
        }
    }, [state[betslipKey]]);

    // validate started 
    const validateStarted = (start_time) => {
        let isStarted = false
        const slipDate = new Date(start_time);
        if (slipDate <= new Date()) {
            isStarted = true;
        }

        return isStarted;

    }
    //Handle db validation of betslip


    const setJackpotSlipkey = useCallback(() => {
        if (state?.jackpotbetslip) {
            setBetslipKey("jackpotbetslip");
        } else {
            setBetslipKey("betslip")
        }
        dispatch({ type: "SET", key: "isjackpot", payload: is_jackpot })
    }, [is_jackpot]);

    useEffect(() => {
        setJackpotSlipkey();
    }, [setJackpotSlipkey]);

    const handledRemoveSlip = (match) => {
        let betslip = (betslipKey == "betslip")
            ? removeFromSlip(match.match_id)
            : removeFromJackpotSlip(match.match_id);

        let match_selector = match.match_id + "_selected";
        let ucn = clean_rep(
            match.match_id
            + "" + match.sub_type_id
            + (match.bet_pick)
        );
        setBetslipsData(betslip);
        dispatch({ type: "SET", key: betslipKey, payload: betslip });
        dispatch({ type: "SET", key: match_selector, payload: "remove." + ucn });
    }

    const getSportImageIcon = (sport_name, folder = 'svg', topLeagues = false) => {

        let default_img = 'Soccer'
        let sport_image;
        try {
            sport_image = topLeagues ? require(`../../assets${sport_name}`) : require(`../../assets/${folder}/${sport_name}.svg`);
        } catch (error) {

            sport_image = require(`../../assets/${folder}/${default_img}.svg`);
            if (is_jackpot) {
                sport_image = require(`../../assets/${folder}/Soccer.svg`);
            }

        }
        return sport_image
    }


    const LoadSharedBetslip = (props) => {
        const [sharedBetLoading, setSharedBetLoading] = useState(false);
        const [sharedBetError, setSharedBetError] = useState(null);
        const [inputShareCode, setInputShareCode] = useState('');

        useEffect(() => {
            if (sharedBetError != null) {
                setSharedBetError(null);
            }
        }, []);

        const fetchSharedBetslip = useCallback((code) => {
            let endpoint = "/bet/share?share-code=" + code;
            setSharedBetError(null);
            setSharedBetLoading(true);
            makeRequest({ url: endpoint, method: "GET", api_version: 2 }).then(([status, result]) => {
                if (status == 200) {
                    if (result.status == 200) {
                        if (result?.data?.betslip && result?.data?.betslip.length > 0) {
                            let betslip = {};
                            result?.data?.betslip?.forEach(item => {
                                let item_id = item.match_id;
                                betslip[item_id] = item;
                            });
                            // Assuming dispatch and setLocalStorage are properly configured
                            dispatch({ type: "SET", key: "betslip", payload: betslip });
                            setLocalStorage("betslip", betslip);
                        } else {
                            setSharedBetError({ status: 400, message: "No games found. Slip expired" });
                        }
                    } else {
                        setSharedBetError({ status: 400, message: result?.result + ". Invalid slip" });
                    }
                } else {
                    setSharedBetError({ status: status, message: "Failed to load betslip. Please try again later." });
                }
                setSharedBetLoading(false);
            });
        }, []);

        const handleCodeInputChange = (event) => {
            setInputShareCode(event.target.value);
        };

        const loadBetslipFromCode = () => {
            if (inputShareCode && inputShareCode.length >= 5) {
                fetchSharedBetslip(inputShareCode);
            } else {
                setSharedBetError({ status: 400, message: "Invalid code. Check your slip and try again" });
            }
        };

        const handleKeyPress = (event) => {
            if (event.key == 'Enter') {
                loadBetslipFromCode();
            }
        };

        useEffect(() => {
            if (props.code) {
                setInputShareCode(props.code);   // 👈 fill input
                fetchSharedBetslip(props.code);  // 👈 auto submit
            }
        }, [fetchSharedBetslip, props.code]);

        return (
            <div className='px-2 py-1'>
                <div className='my-3 font-[500] text-2xl text-center'>Do you have a shared betslip code? Enter it here.</div>
                {sharedBetError && <div className='my-3'><Alert message={sharedBetError} /></div>}
                <input
                    type="text"
                    name="sharecode"
                    placeholder="Eg HLRTMRV"
                    onChange={handleCodeInputChange}
                    onKeyPress={handleKeyPress}
                    value={inputShareCode}
                    className='block w-full px-2 text-center rounded-2xl'
                    style={{ border: "1px solid rgba(255, 255, 255, 0.15)", margin: "0px 0px 0px", height: "40px", backgroundColor: "#151525", color: "#ffffff" }}
                />
                <button
                    disabled={sharedBetLoading}
                    className="my-3 w-full block capitalize secondary-bg bg-pink p-3 px-3 py-2 font-bold btn-pink border-none text-white uppercase hover:opacity-80 rounded-2xl"
                    style={{ padding: "0px", height: "40px" }}
                    onClick={() => loadBetslipFromCode()}
                >
                    {sharedBetLoading ? "wait..." : "Load Betslip"}
                </button>
            </div>
        );
    };


    const SlipEntry = (props) => {
        const { match_id, initialSlip } = props;
        // let odd = slip.odd_value;

        // get the entire betslip
        const [slip, setSlip] = useState({ ...initialSlip, changeOrigin: "main" });
        const [slipKey, setKey] = useState();
        // const [slipChangeOrigin, setSlipChangeOrigin] = useState("original")

        const checkUpdateSlipChanges = (market, eventOdd) => {
            setSlip((prevSlip) => {
                let betslips = getBetslip();

                if (!betslips[match_id]) { return false }

                if (market.sub_type_id == prevSlip.sub_type_id
                    && market.special_bet_value == prevSlip.special_bet_value) {
                    let newSlip = { ...prevSlip };

                    if (market.status !== "Active" && market.special_bet_value == prevSlip.special_bet_value) {
                        newSlip.comment = 'Market ' + market.status;
                        newSlip.disable = true;
                    } else {
                        delete newSlip.disable
                    }
                    if (eventOdd !== null) {
                        if (newSlip.bet_pick == eventOdd.odd_key) {
                            if (eventOdd.odd_active !== 1) {
                                newSlip.comment = 'Not available for staking';
                                newSlip.disable = true;
                            } else if (eventOdd.market_status !== 'Active') {
                                newSlip.comment = 'Market ' + eventOdd.market_status;
                                newSlip.disable = true;
                            } else if (parseFloat(eventOdd.odd_value) !== parseFloat(newSlip.odd_value)) {
                                if (!("prev_odds" in newSlip)) {
                                    newSlip.prev_odds = newSlip.odd_value;
                                }
                                newSlip.odd_value = eventOdd.odd_value;
                                newSlip.comment = 'The odds for this event have changed';
                            } else {
                                if (!newSlip.prev_odds) {
                                    delete newSlip.comment
                                    delete newSlip.disable
                                } else if (newSlip.prev_odds && newSlip.prev_odds == eventOdd.odd_value) {
                                    delete newSlip.prev_odds
                                    delete newSlip.comment
                                }

                            }

                        }
                        if (market.status !== "Active" && market.special_bet_value == prevSlip.special_bet_value) {
                            newSlip.comment = 'Market ' + market.status;
                            newSlip.disable = true;
                        }
                    }
                    newSlip.changeOrigin = "socket"
                    return newSlip;  // Return the updated state
                } else {
                    return prevSlip
                }

            })
        }

        const updateBetslipChange = async (slip) => {
            let betslip = await { ...state?.betslip };
            if (betslip && betslip[slip.match_id]) {
                await addToSlip({ ...slip });
                if (JSON.stringify(betslip[slip.match_id]) !== JSON.stringify(slip)) {
                    betslip[slip.match_id] = slip;
                    dispatch({ type: "SET", key: "betslip", payload: betslip })
                }
            }

        }

        useEffect(() => {
            if (slip.changeOrigin == "socket") {
                updateBetslipChange(slip);
            }
        }, [slip])

        const socketRef = useRef(socket);

        const socketEvent = (parent_match_id, sub_type_id) => {
            return `socket-io#${parent_match_id}#${sub_type_id}`
        };

        const handleGameSocket = (type, gameId, sub_type_id) => {
            if (type === "listen" && socketRef?.connected) {
                socketRef.emit('user.market.listen', { parent_match_id: gameId, sub_type_id: sub_type_id });
            }
        };


        const connectBetslipToScket = () => {
            handleGameSocket("listen", slip?.parent_match_id, slip?.sub_type_id);

        }

        useEffect(() => {
            connectBetslipToScket();
            const handleSocketData = (data) => {
                if (Object.keys(data.event_odds).length > 0) {
                    Object.values(data.event_odds)?.forEach((evodd, ivg) => {
                        checkUpdateSlipChanges(data.match_market, evodd);
                    });
                } else {
                    checkUpdateSlipChanges(data.match_market, null);

                }

            };
            socket?.on(`socket-io#${slip?.parent_match_id}#${slip.sub_type_id}`, handleSocketData)

            socket.emit('user.match.listen', slip?.parent_match_id);
            socket.on(`socket-io#${slip?.parent_match_id}`, (data) => {
                if (
                    data.message_type !== "betstop"
                    &&
                    validateStarted(slip.start_time)
                    &&
                    slip.bet_type == 0
                ) {
                    slip.bet_type = 1
                }
            }
            )

            return () => {
            }
        }, [])

        useEffect(() => {

            if (slip) {
                setKey(`${slip?.parent_match_id}${slip?.bet_pick}${slip?.odd_value}${slip?.market_status}`)
            }
        }, [slip])

        return (
            <>
                <li key={slipKey} className={`${(slip?.bet_type == 0 && validateStarted(slip.start_time)) && 'prematch-started alert alert-warning'} bet-option hide-on-affix ${slip?.disable ? 'warn' : ''}`}
                    style={{ background: slip?.odd_value == 1 ? '#f29f7a' : '' }}>

                    <div className="bet-cancel">
                        <input id={slip?.match_id} type="submit" value="X"
                            onClick={() => handledRemoveSlip(slip)} />
                    </div>
                    <Link to={`/match/${slip.bet_type == 1 && 'live/'}${slip?.match_id}`} style={{}} className='hover:underline'>
                        <div className={`${(slip?.bet_type == 0 && validateStarted(slip.start_time)) && 'line-through'} bet-value betslip-game`} onClick={() => dispatch({ type: "SET", key: "showmobileslip", payload: false })}>
                            {
                                <span
                                    style={{
                                        float: "left",
                                        width: "auto",
                                        fontWeight: "400"
                                    }}>
                                    <img src={getSportImageIcon(slip?.sport_name)} alt={slip.sport_name} className='inline-block betslip-sport-icon' />
                                    {`${slip.home_team} VS ${slip.away_team}`}
                                </span>
                            }
                            <div className={`${(slip.bet_type == 0 && validateStarted(slip.start_time)) && 'line-through'} opacity-60 `}>
                                <span>
                                    {!validateStarted(slip.start_time) && ' Pre-match'}
                                    {validateStarted(slip.start_time) && <span className='text-red-500'>Live</span>}:
                                </span>

                                <span className='betslip-match-start-time ml-4'>
                                    {moment(slip.start_time).format('DD/MM hh:mm A')}
                                </span>
                            </div>
                        </div>
                        <div className={`${(slip.bet_type == 0 && validateStarted(slip.start_time)) && 'game-started'} row`}>
                            <div className="bet-value">
                                {slip?.odd_type} - <span className='font-[500]'>{slip?.bet_pick}</span>
                                <span className="bet-odd">{slip?.prev_odds && <span className='line-through opacity-60 mr-3'>{parseFloat(slip?.prev_odds).toFixed(2)}</span>} {parseFloat(slip?.odd_value).toFixed(2)}
                                    {slip?.odd_value == 1 &&
                                        (<span style={{ color: "#cc0000", fontSize: "11px", display: "block" }}>Market Disabled</span>)
                                    }
                                </span>
                            </div>
                            {/* later add for live */}

                        </div>
                        {/* <div className="bet-pick">Your Pick - <b>{slip.bet_pick}
                            <span className="bet-odd">{slip.odd_value}
                                {slip.odd_value == 1 &&
                                    (<span style={{color: "#cc0000", fontSize: "11px", display: "block"}}>Market Disabled</span>)
                                }
                    </span></b>
                        </div> */}
                        <div className="row">
                            <div className="warn">{slip?.comment} </div>
                        </div>
                        {(slip?.bet_type == 0 && validateStarted(slip.start_time)) && <div className='alert alert-warning'>Game Started</div>}
                    </Link>

                </li>
            </>
        )
    }

    return (

        <div className="">
            {(Object.keys(betslipsData || {}).length == 0) &&

                <li className="bet-option hide-on-affix" key="no-slip-ai"
                    style={{ margin: "10px 0px 5px 0px", borderBottom: "none", padding: "0px 2px", listStyle: "none" }}>
                    <div className='my-3 text-center text-2xl'>You have not selected any bet.</div>
                    <hr className='mb-3' />
                    {state?.betslipKey}
                    {!state?.isjackpot &&

                        <LoadSharedBetslip />

                    }
                </li>
            }
            {hasBetslip && <>

                <div className="flow betslip-slips" style={{ maxHeight: "29vh", overflowY: "auto", overflowX: "hidden", paddingRight: "8px" }}>
                    <ul style={{ paddingRight: "8px", paddingLeft: "8px" }}>
                        {Object.entries(betslipsData ?? {}).map(([match_id, slip]) => (<SlipEntry match_id={match_id} initialSlip={slip} />))
                        }
                    </ul>
                </div>

            </>
            }
            <div className="bottom">
                <BetslipSubmitForm
                    dbWinMatrix={dbWinMatrix}
                    jackpotData={localJPData}
                    jackpot={is_jackpot}
                />
            </div>


        </div>

    )
}
export default React.memo(BetSlip);
