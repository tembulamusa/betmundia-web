import React, { useState, useEffect, useCallback, useRef } from "react";
import { Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import makeRequest from "../utils/fetch-request";
import { GiSoccerBall } from "react-icons/gi";
import HomeTeamDefaultFlag from "../../assets/team-jersies/home-default.png"
import AwayTeamDefaultFlag from "../../assets/team-jersies/away-default.png"
import { getFromLocalStorage, setLocalStorage } from "../utils/local-storage";
import NoEvents from "../utils/no-events";

const FreeBet = ({ isFreebetPage = false } = {}) => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [freebet, setFreebet] = useState(null);
    const [freebetSlip, setFreeBetslip] = useState();
    const [selectedOdd, setSelectedOdd] = useState();
    const [ipInfo, setIpInfo] = useState();
    const [submitting, setSubmitting] = useState(false);
    const [alert, setAlert] = useState(null);
    const [showRegisterPrompt, setShowRegisterPrompt] = useState(false);
    const [fetchCompleted, setFetchCompleted] = useState(false);
    const isFetchingRef = useRef(false);

    const user = getFromLocalStorage("user");
    const isLoggedIn = Boolean(user?.token);


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
                let updatedUser = { ...getFromLocalStorage("user") };
                updatedUser.has_freebet = 0;
                setLocalStorage("user", updatedUser);
                setTimeout(() => {
                    setAlert(null)
                }, 5000)
            } else {
                setAlert(
                    { status: result?.status || 400, message: result?.data?.message || result?.message || result?.error || "Unable to place free bet" });
                setTimeout(() => {
                    setAlert(null)
                }, 3000)
            }
        });
    }
    useEffect(() => {
        if (freebet) {
            let slip = [
                {
                    away_team: freebet?.away_team,
                    bet_pick: selectedOdd || "",
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
                    amount: freebet?.amount ?? 30,
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
    }, [freebet, ipInfo, selectedOdd]);

    const fetchFreeBet = useCallback((endpoint = "/user/freebet") => {
        if (isFetchingRef.current) return;

        isFetchingRef.current = true;
        setIsLoading(true);

        makeRequest({ url: endpoint, method: "GET", api_version: 2 })
            .then(([status, result]) => {

                if (['200', '201'].includes(result?.status)) {

                    if (result.data != null) {

                        let data = result.data;

                        // ✅ SORT outcomes
                        const outcomes = data?.odds?.["1x2"]?.outcomes;

                        if (Array.isArray(outcomes)) {
                            data.odds["1x2"].outcomes = outcomes.sort(
                                (a, b) => Number(a.outcome_id) - Number(b.outcome_id)
                            );
                        }

                        setFreebet(data);
                    }
                }


            })
            .finally(() => {
                isFetchingRef.current = false;
                setIsLoading(false);
                setFetchCompleted(true);
            });
    }, []);

    useEffect(() => {
        const currentUser = getFromLocalStorage("user");
        const loggedIn = Boolean(currentUser?.token);

        if (isFreebetPage) {
            if (loggedIn) {
                // Logged-in on freebet page: only load if profile says they have a freebet
                if (currentUser?.has_freebet == 1) {
                    fetchFreeBet("/user/freebet");
                } else {
                    setFetchCompleted(true);
                }
            } else {
                // Guest on freebet page: fetch public freebet link (no profile gate)
                fetchFreeBet("/freebet");
            }
            return;
        }

        // Highlights / other pages: normal profile-related logic
        if (currentUser?.has_freebet == 1) {
            fetchFreeBet("/user/freebet");
        }
    }, [isFreebetPage, fetchFreeBet]);


    const updatePick = (outcome) => {
        // Freebet page for guests: prompt to register, then redirect
        if (isFreebetPage && !isLoggedIn) {
            setShowRegisterPrompt(true);
            return;
        }

        setFreeBetslip((prevSlip) => {
            let currentSlip = { ...prevSlip };
            currentSlip.slip[0].bet_pick = outcome?.odd_key;
            return currentSlip;
        });

        setSelectedOdd(outcome?.odd_key);

    }

    const handleRegisterConfirm = () => {
        setShowRegisterPrompt(false);
        navigate("/signup");
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
                        <div aria-hidden="true" style={x_style} onClick={() => setAlert(null)}>&times;</div>
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
                    <div className="marquee-card free-bet relative blink-e animate-shadow-pulse" style={{
                        background: "rgba(255, 255, 255, 0.1)",
                        marginBottom: "8px",
                        marginRight: "4px",
                        border: "1px solid rgb(167 31 102 / 46%)",
                        marginTop: "4px",
                        paddingLeft: "5px",
                        color: "#fff",
                        // boxShadow: "0 0 10px 1px #a71f66"
                    }}>
                        <div className="card-top-sub-heading">
                            <div className="row">
                                <div className="col-8">
                                    <GiSoccerBall className="inline-block text-3xl mr-2" />
                                    <span className="font-[500] freebet-highlight highlight-color blink-e animate-blink uppercase " style={{ color: "rgba(255, 215, 0)" }}>Free Bet</span>
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

                        {!(isFreebetPage && !isLoggedIn) && selectedOdd &&
                            <div className="absolute m-auto top-0 freebet-btn-parent">
                                <button onClick={() => placeFreebet()}
                                    disabled={submitting}
                                    className="disabled:opacity-90 font-bold text-xl btn place-free-bet !bg-[#469866] rounded-md text-white"
                                >{submitting ? "wait..." : "Place Bet"}</button>
                            </div>}

                    </div>
                </div >

            }

            {isFreebetPage && fetchCompleted && !isLoading && !freebet && !alert && (
                <div className="w-full">
                    <NoEvents message="There are no free bets." />
                </div>
            )}

            <Modal
                show={showRegisterPrompt}
                onHide={() => setShowRegisterPrompt(false)}
                centered
            >
                <Modal.Header closeButton className="no-header">
                    <Modal.Title>Register for Free Bet</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="mb-4 text-lg">
                        Please register to claim and place your free bet.
                    </p>
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => setShowRegisterPrompt(false)}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="btn text-white"
                            style={{ backgroundColor: "#a71f66" }}
                            onClick={handleRegisterConfirm}
                        >
                            OK
                        </button>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    )
}


export default React.memo(FreeBet);