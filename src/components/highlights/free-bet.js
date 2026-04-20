import React, { useState, useCallback, useContext, useEffect } from "react";
import makeRequest from "../utils/fetch-request";
import { Context } from "../../context/store";
import Notify from "../utils/Notify";
import { Link } from "react-router-dom";
import { GiSoccerBall } from "react-icons/gi";
import HomeTeamDefaultFlag from "../../assets/team-jersies/home-default.png"
import AwayTeamDefaultFlag from "../../assets/team-jersies/away-default.png"
import { getFromLocalStorage } from "../utils/local-storage";

const FreeBet = (props) => {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({});
    const [state, dispatch] = useContext(Context);
    const [freebet, setFreebet] = useState(null);
    const [freebetSlip, setFreeBetslip] = useState();
    const [selectedOdd, setSelectedOdd] = useState();
    const [ipInfo, setIpInfo] = useState();
    const [submitting, setSubmitting] = useState(false);
    const [alert, setAlert] = useState(null);


    useEffect(() => {
        let loadedBetslip = getFromLocalStorage("freebetSlip");
        if (loadedBetslip) {
            setFreeBetslip(loadedBetslip);
        }

        fetch("https://api64.ipify.org?format=json")
            .then((response) => response.json())
            .then((data) => setIpInfo(data.ip))
            .catch((error) => setIpInfo({ city: "Error fetching IP" }));
    }, []);

    useEffect(() => {

        if (freebetSlip?.slip[0]?.bet_pick) {
            setSelectedOdd(freebetSlip?.slip[0]?.bet_pick);
        }
    }, [freebetSlip]);

    const placeFreebet = () => {
        setSubmitting(true);
        let endpoint = "/user/place-free-bet";
        makeRequest({ url: endpoint, method: "POST", data: freebetSlip, api_version: 2 }).then(([status, result]) => {
            setSubmitting(false);
            if (['200', '201'].includes(result?.status)) {
                setAlert({ status: 200, message: result?.data?.message });
                setFreebet(null);
                setTimeout(() => {
                    setAlert(null)
                }, 5000)
            }
        });
    }
    useEffect(() => {
        if (freebet) {
            let slip = [
                {
                    away_team: freebet?.away_team,
                    bet_pick: "",
                    bet_type: "0",
                    home_team: freebet?.home_team,
                    live: freebet?.live || 0,
                    market_active: freebet?.market_active,
                    match_id: freebet?.match_id,
                    odd_type: "1x2",
                    odd_value: "1.00",
                    parent_match_id: freebet?.parent_match_id,
                    producer_id: freebet?.odds?.["1x2"]?.producer_id || "3",
                    special_bet_value: "",
                    sport_name: freebet?.sport_name || "Soccer",
                    sub_type_id: "1",
                    ucn: freebet?.parent_match_id + (selectedOdd?.trim() || "")
                }
            ];
            setFreeBetslip(
                {
                    account: 1,
                    accept_all_odds_change: 1,
                    amount: freebet?.amount ?? 20,
                    app_name: "desktop",
                    bet_string: "string",
                    bet_total_odds: 1,
                    bet_type: freebet?.live ? "1" : "3",
                    channel_id: "web",
                    ip_address: ipInfo,
                    msisdn: getFromLocalStorage("user")?.msisdn,
                    possible_win: 100,
                    profile_id: getFromLocalStorage("user")?.profile_id,
                    slip: slip
                }
            );
        }
    }, [freebet]);

    const fetchFreeBet = () => {
        console.log("Fetching free bet details...");
        if (isLoading) return;
        setIsLoading(true);
        setMessage(null);
        let endpoint = "/user/freebet";
        makeRequest({ url: endpoint, method: "GET", api_version: 2 }).then(([status, result]) => {
            if (['200', '201'].includes(result?.status)) {
                if (result.data != null) {
                    setFreebet(result?.data || result);
                };
            }
            console.log("Fetched free bet details, check console for details::: " + JSON.stringify(result));
        });

    };

    useEffect(() => {
        if (getFromLocalStorage("user")?.has_freebet == 1) {
            fetchFreeBet();
        }
    }, []);


    const updatePick = (outcome) => {

        setFreeBetslip((prevSlip) => {
            let currentSlip = { ...prevSlip };
            currentSlip.slip[0].bet_pick = outcome?.odd_key;
            return currentSlip;
        });

        setSelectedOdd(outcome?.odd_key);

    }

    const Alert = ({ message }) => {
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
                className={`max-w-[400px] placebet-response fade alert alert-${c} show alert-dismissible`}>

                <div className=''>
                    <div className='alert-title text-2xl fex font-bold w-full py-3 justify-between'>
                        {/* <div className=' w-10/12'>{message?.title ? message?.title : "Error!"}</div> */}
                        <div aria-hidden="true" style={x_style} onClick={() => setMessage(null)}>&times;</div>
                    </div>
                    <div className='text-2xl mb-3 font-normal'>{message.message}</div>
                </div>
            </div>}
        </>);
    };
    return (
        <>
            {alert &&
                <div className="highlights">
                    <div className="marquee-card free-bet relative" style={{ background: "transparent" }}>
                        <Alert message={alert} />
                    </div>
                </div>
            }

            {

                freebet &&
                <div className="highlights">
                    <div className="marquee-card free-bet relative" style={{
                        background: "rgba(255, 255, 255, 0.1)",
                        marginBottom: "8px",
                        marginRight: "4px",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        marginTop: "4px",
                        paddingLeft: "5px",
                        color: "#fff"
                    }}>
                        <div className="card-top-sub-heading">
                            <div className="row">
                                <div className="col-8">
                                    <GiSoccerBall className="inline-block text-3xl mr-2" />
                                    <span className="font-[500] freebet-highlight highlight-color blink-e animate-blink uppercase">Free Bet</span>
                                </div>

                            </div>
                        </div>

                        <div className="main teams text-[12px]">
                            <div className="row">
                                <div className="col-4">
                                    <div className="freebet-team  text-center">
                                        <span className="team-name m-auto">
                                            <div className="m-auto team-flag  w-[20px]"><img src={HomeTeamDefaultFlag} alt="" /></div>
                                            <div className="freebet-card team-name">{freebet?.home_team}</div>
                                        </span>


                                    </div>
                                </div>
                                <div className="col-4">
                                    <div className="overflow-hidden font-[300] text-center">
                                        {freebet?.start_time}
                                    </div>
                                </div>
                                <div className="col-4">
                                    <div className="freebet-team text-center">
                                        <span className="team-name">
                                            <div className=" m-auto team-flag  w-[20px]"><img src={AwayTeamDefaultFlag} alt="" /></div>
                                            <div className="freebet-card team-name">{freebet?.away_team}</div>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bet-highlight">
                            <div className="market-type ng-star-inserted">
                                <span className="line-span"></span>
                                <span className="market-name-span" title="Total Goals"> 1 x 2</span>
                                <span className="line-span"></span>
                            </div>
                        </div>

                        <div className="">
                            <div className="ng-star-inserted">
                                <span className="card-option-group btn-count-3 freebet-btn">
                                    {freebet?.odds?.["1x2"]?.outcomes?.map((outcome, idx) => (

                                        <span className="ng-star-inserted ">
                                            <div className={`freebet-pick secondary-bg-2 home-team c-btn ${outcome?.odd_key == selectedOdd && "picked"}`} onClick={() => updatePick(outcome)}>
                                                <div className="card-event-result-name card-result-name ng-star-inserted">
                                                </div>
                                                <span className="card-result-odds option-value odds-right-align ng-star-inserted">
                                                    <span className="ng-star-inserted" >{outcome?.odd_value}</span>
                                                </span>
                                            </div>
                                        </span>
                                    ))}
                                </span>
                            </div>
                        </div>

                        {selectedOdd &&
                            <div className="absolute m-auto top-0 freebet-btn-parent">
                                <button onClick={() => placeFreebet()}
                                    disabled={submitting}
                                    className="disabled:opacity-90 font-bold text-xl btn place-free-bet !bg-[#469866] rounded-md text-white"
                                >{submitting ? "wait..." : "Place Bet"}</button>
                            </div>}

                    </div>

                </div >

            }
        </>
    )
}


export default React.memo(FreeBet);