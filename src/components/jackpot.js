import React, { useEffect, useCallback, useState, useContext } from "react";
import { JackpotMatchList, JackpotResultsList, JackpotHeader } from './matches/index';
import makeRequest from "./utils/fetch-request";
import dailyJackpot from '../assets/img/banner/jackpots/DailyJackpot.jpeg';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import { Context } from '../context/store';
import {
    addToJackpotSlip,
    clearJackpotSlip,
    getJackpotBetslip
} from './utils/betslip';
import Notify from "./utils/Notify";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { FaCoins } from "react-icons/fa";

const typeKey = (item) =>
    item?.jackpot_event_id ?? item?.id ?? item?.jackpot_type ?? item?.type ?? item?.jackpot_name ?? item?.name;

const typeLabel = (item) =>
    item?.jackpot_name || item?.name || item?.jackpot_type || item?.type || "Jackpot";

const normalizeJackpotTypes = (payload) => {
    if (!payload) {
        return [];
    }

    const asList = (list) =>
        (list || [])
            .filter(Boolean)
            .map((item) => ({
                ...item,
                key: String(typeKey(item)),
                label: typeLabel(item),
            }));

    if (Array.isArray(payload)) {
        return asList(payload);
    }
    if (Array.isArray(payload?.jackpots)) {
        return asList(payload.jackpots);
    }
    if (Array.isArray(payload?.types)) {
        return asList(payload.types);
    }
    if (Array.isArray(payload?.data) && (payload.data[0]?.jackpot_name || payload.data[0]?.jackpot_event_id)) {
        return asList(payload.data);
    }
    if (payload?.jackpot_event_id || payload?.jackpot_name || payload?.jackpot_type || payload?.type) {
        return asList([payload]);
    }

    return [];
};

const Jackpot = (props) => {
    const [jackpotData, setJackpotData] = useState(null);
    const [jackpotTypes, setJackpotTypes] = useState([]);
    const [activeTypeKey, setActiveTypeKey] = useState(null);
    const [results, setResults] = useState(null);
    const [isAutoPicking, setIsAutoPicking] = useState(false);
    const [, dispatch] = useContext(Context);

    const Float = (equation, precision = 4) => {
        return Math.round(equation * (10 ** precision)) / (10 ** precision);
    }

    const applyJackpotPayload = useCallback((data) => {
        const now = new Date();
        const matches = data?.matches;
        const hasStarted = matches
            ? Object.values(matches).some((match) => {
                const startTime = new Date(match?.start_time || match?.startTime);
                return startTime < now;
            })
            : false;

        if (hasStarted || !data) {
            setJackpotData(null);
            dispatch({ type: "DEL", key: "jackpotdata" });
            return null;
        }

        setJackpotData(data);
        dispatch({ type: "SET", key: "jackpotdata", payload: data });
        return data;
    }, [dispatch]);

    const fetchMatches = useCallback(async (selectedType = null) => {
        const eventId = selectedType?.jackpot_event_id ?? selectedType?.id;
        const typeParam = selectedType?.jackpot_type || selectedType?.type;
        let matchEndpoint = "/jackpot/matches";
        const params = new URLSearchParams();
        if (eventId) {
            params.set("jackpot_event_id", eventId);
        } else if (typeParam) {
            params.set("type", typeParam);
        }
        const query = params.toString();
        if (query) {
            matchEndpoint = `${matchEndpoint}?${query}`;
        }

        const [m_status, result] = await makeRequest({ url: matchEndpoint, method: "GET", api_version: 2 });

        if (m_status == 200) {
            const data = applyJackpotPayload(result?.data);
            if (data) {
                const fromMatches = normalizeJackpotTypes(data);
                setJackpotTypes((prev) => {
                    if (prev?.length > 1) {
                        return prev;
                    }
                    return fromMatches.length ? fromMatches : prev;
                });
                setActiveTypeKey(String(typeKey(selectedType || data)));
            }
        }

        let jackpotbetslip = getJackpotBetslip();
        dispatch({ type: "SET", key: "jackpotbetslip", payload: jackpotbetslip });
    }, [applyJackpotPayload, dispatch]);

    const fetchJackpotTypes = useCallback(async () => {
        const [listStatus, listResult] = await makeRequest({
            url: "/jackpot/list",
            method: "GET",
            api_version: 2,
        });

        if (listStatus == 200) {
            const types = normalizeJackpotTypes(listResult?.data ?? listResult);
            if (types.length) {
                setJackpotTypes(types);
                return types;
            }
        }
        return null;
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
        (async () => {
            const listed = await fetchJackpotTypes();
            await fetchMatches(listed?.[0] || null);
            await fetchResults();
        })();
        return () => {
            dispatch({ type: "DEL", key: "jackpotbetslip" });
            dispatch({ type: "DEL", key: "jackpotdata" });
            abortController.abort();
        };
    }, [fetchJackpotTypes, fetchMatches, fetchResults, dispatch]);

    const selectJackpotType = (type) => {
        const nextKey = String(typeKey(type));
        if (nextKey === String(activeTypeKey)) {
            return;
        }
        setActiveTypeKey(nextKey);
        clearJackpotSlip();
        dispatch({ type: "SET", key: "jackpotbetslip", payload: [] });
        fetchMatches(type);
    };

    const AutoPickAllMatches = () => {
        if (isAutoPicking || !jackpotData?.matches) {
            return;
        }

        const clean = (_str) => {
            _str = _str.replace(/[^A-Za-z0-9\-]/g, '');
            return _str.replace(/-+/g, '-');
        }

        const randomPick = (min, max) => {
            return Math.floor(min + Math.random() * (max - min + 1));
        }

        setIsAutoPicking(true);
        try {
            let betslip;
            Object.entries(jackpotData.matches).forEach(([, match]) => {
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
        } catch (error) {
            Notify({ status: 400, message: "Error auto-picking jackpot matches" });
        } finally {
            setIsAutoPicking(false);
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
            {jackpotTypes.length > 0 && (
                <nav className="jackpot-types-strip" aria-label="Jackpot types">
                    <div className="jackpot-types-strip__scroll big-icon-scrollbar-hide">
                        {jackpotTypes.map((type) => {
                            const key = String(type.key || typeKey(type));
                            const isActive = key === String(activeTypeKey);
                            return (
                                <button
                                    key={key}
                                    type="button"
                                    className={`jackpot-types-strip__item${isActive ? " active" : ""}`}
                                    onClick={() => selectJackpotType(type)}
                                    aria-pressed={isActive}
                                >
                                    <span className="jackpot-types-strip__icon" aria-hidden="true">
                                        <FaCoins />
                                    </span>
                                    <span className="jackpot-types-strip__label">
                                        {type.label || typeLabel(type)}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </nav>
            )}

            <LazyLoadImage src={dailyJackpot} alt="jackpot" className="std-carousel-image" />

            <div className="jackpot-header row">
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
                                        type="button"
                                        onClick={(event) => {
                                            AutoPickAllMatches();
                                            event.currentTarget.blur();
                                        }}
                                        disabled={isAutoPicking}
                                        aria-busy={isAutoPicking}
                                        className={`btn btn-auto-pick mt-3 mx-auto md:mx-0${isAutoPicking ? " is-auto-picking" : ""}`}>
                                        {isAutoPicking ? "Picking..." : "Auto Pick"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* If games are available, then show games */}
                    {(jackpotData?.matches?.length > 0 && jackpotData?.total_games) ? (
                        <JackpotMatchList setJackpotData={setJackpotData} matches={jackpotData} />
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
