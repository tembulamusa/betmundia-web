import React, { useEffect, useCallback, useState, useContext } from "react";
import { JackpotMatchList, JackpotResultsList, JackpotHeader } from './matches/index';
import makeRequest from "./utils/fetch-request";
import dailyJackpot from '../assets/img/banner/jackpots/DailyJackpot.jpeg';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Container from "react-bootstrap/Container";
import { Context } from '../context/store';
import {
    addToJackpotSlip,
    getJackpotBetslip
} from './utils/betslip';
import Notify from "./utils/Notify";
import { LazyLoadImage } from "react-lazy-load-image-component";

const Jackpot = (props) => {
    const [jackpotData, setJackpotData] = useState(null);
    const [results, setResults] = useState(null);
    const [, dispatch] = useContext(Context);

    const Float = (equation, precision = 4) => {
        return Math.round(equation * (10 ** precision)) / (10 ** precision);
    }
    const fetchMatches = useCallback(async () => {
        const matchEndpoint = "/jackpot/matches";
        const [m_status, result] = await makeRequest({ url: matchEndpoint, method: "GET", api_version: 2 });

        if (m_status == 200) {
            setJackpotData(result?.data);
            dispatch({ type: "SET", key: "jackpotdata", payload: result?.data });
        }

        let jackpotbetslip = getJackpotBetslip();
        dispatch({ type: "SET", key: "jackpotbetslip", payload: jackpotbetslip });
    }, []);

    const fetchResults = useCallback(async () => {
        const resultsEndpoint = "/jackpot/results";
        const [r_status, result] = await makeRequest({ url: resultsEndpoint, method: "GET", api_version: 2 });
        if (r_status == 200) {
            setResults(result?.data);
        } else {
            Notify({ status: 400, message: "Error fetching Jackpot results" })
        }
    }, []);

    useEffect(() => {
        const abortController = new AbortController();
        fetchMatches();
        fetchResults();
        return () => {
            dispatch({ type: "DEL", key: "jackpotbetslip" });
            dispatch({ type: "DEL", key: "jackpotdata" });
            abortController.abort();
        };
    }, [fetchMatches, fetchResults, dispatch]);

    const AutoPickAllMatches = () => {
        const clean = (_str) => {
            _str = _str.replace(/[^A-Za-z0-9\-]/g, '');
            return _str.replace(/-+/g, '-');
        }

        const randomPick = (min, max) => {
            return Math.floor(min + Math.random() * (max - min + 1));
        }

        if (jackpotData) {
            let betslip;
            Object.entries(jackpotData?.matches).map(([key, match]) => {
                // alert(JSON.stringify(match));
                let reference = match.match_id + "_selected";
                let pick = randomPick(1, 3);
                let pickedValue = (pick == 1 ? match.home_team : (pick == 2 ? 'draw' : match?.away_team));
                let oddValue = (pick == 1 ? Float(match.odds["1x2"]['outcomes'][0].odd_value, 2) : (pick == 2 ? Float(match.odds["1x2"]['outcomes'][1].odd_value, 2) : Float(match.odds["1x2"]['outcomes'][2].odd_value, 2)));
                let cstm = clean(match.match_id + "" + 1 + pickedValue);
                let slip = {
                    "match_id": match.match_id,
                    "parent_match_id": match.parent_match_id,
                    "special_bet_value": '',
                    "sub_type_id": 1,
                    "bet_pick": pickedValue,
                    "odd_value": oddValue,
                    "home_team": match.home_team,
                    "away_team": match.away_team,
                    "bet_type": "9",
                    "odd_type": "3",
                    "sport_name": "soccer",
                    "live": 0,
                    "ucn": cstm,
                    "market_active": 1,
                }
                betslip = addToJackpotSlip(slip);

                dispatch({ type: "SET", key: reference, payload: cstm });
            });
            dispatch({ type: "SET", key: "jackpotbetslip", payload: betslip });
        }
    }

    useEffect(() => {
        dispatch({ type: "SET", key: "betslipkey", payload: "jackpotbetslip" })
        dispatch({ type: "SET", key: "isjackpot", payload: true });
        return () => {
            dispatch({ type: "DEL", key: "isjackpot" });
            dispatch({ type: "SET", key: "betslipkey", payload: "betslip" })
        }
    }, []);

    return (
        <>
            <LazyLoadImage src={dailyJackpot} alt="jackpot" className="std-carousel-image" />

            <div className="jackpot-header row bg-secondary">
                <div className="col-12">
                    <JackpotHeader jackpot={jackpotData} />
                </div>
            </div>
            <Tabs defaultActiveKey={"matches"} id="jackpot-tabs" className="jackpot-tabs plain-tabs">
                <Tab eventKey="matches" title="Matches" className="p-3">
                    {(jackpotData?.status?.toLowerCase() == "active" && jackpotData?.matches?.length == jackpotData?.total_games) && (
                        <div className="row flex flex-col items-center md:flex-row">
                            <div className="col-md-8 !px-3 text-center md:text-left">
                                <div className="!px-2">
                                    <div className="jackpot-amount !pl-0 pt-3">
                                        Autopick randomly picks jackpot for you! KES {Intl.NumberFormat('en-US').format(jackpotData?.jackpot_amount)}
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4 justify-center mt-3 md:mt-0">
                                <div className="autopick-button-div !px-3">
                                    <button
                                        onClick={() => AutoPickAllMatches()}
                                        className="btn btn-auto-pick mt-3 mx-auto md:mx-0">Auto Pick
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* If games are available, then show games */}
                    {(jackpotData?.matches?.length > 0 && jackpotData?.total_games) ? (
                        <JackpotMatchList matches={jackpotData} />
                    ) : (
                        <div className={'col-md-12 text-center background-primary mt-2 p-5 no-events-div'}>
                            There are no jackpots at the moment.
                        </div>
                    )}
                </Tab>
                <Tab eventKey="results" title="Results" className="p-3">
                    {results ? (
                        <JackpotResultsList results={results} />
                    ) : (
                        <div className={'text-center mt-5'}>
                            Loading results...
                        </div>
                    )}
                </Tab>
            </Tabs>
        </>
    );
};

export default Jackpot;
