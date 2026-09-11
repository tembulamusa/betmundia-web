import React, { useEffect, useCallback, useState, useContext, useMemo } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { JackpotMatchList, JackpotHeader } from './matches/index';
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
import JackpotArchive from "./jackpot-archive";
import {
    JACKPOT_PATH,
    TYPE_QUERY_PARAM,
    getJackpotTypes,
    matchesTypeParam,
    persistJackpotTypes,
    refreshJackpotTypes,
    typeKey,
    typeLabel,
    typeParamValue,
} from "./utils/jackpot-data";

const Jackpot = () => {
    const [jackpotData, setJackpotData] = useState(null);
    const [isAutoPicking, setIsAutoPicking] = useState(false);
    const [autoPickButtonKey, setAutoPickButtonKey] = useState(0);
    const [activeTab, setActiveTab] = useState("games");
    const [lastFetchedType, setLastFetchedType] = useState(null);
    const [state, dispatch] = useContext(Context);
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const location = useLocation();
    const urlTypeParam = searchParams.get(TYPE_QUERY_PARAM);

    const jackpotTypes = useMemo(
        () => getJackpotTypes(state),
        [state?.jackpotTypes, state]
    );

    const resetAutoPickButton = useCallback(() => {
        setIsAutoPicking(false);
        setAutoPickButtonKey((key) => key + 1);
    }, []);

    const Float = (equation, precision = 4) => {
        return Math.round(equation * (10 ** precision)) / (10 ** precision);
    };

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

    // Hydrate types from cache; refresh if empty (header usually already fetched).
    useEffect(() => {
        const cached = getJackpotTypes(state);
        if (cached.length) {
            persistJackpotTypes(cached, dispatch);
        } else {
            void refreshJackpotTypes(dispatch);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Normalize legacy /jackpot → /jackpots while preserving query.
    useEffect(() => {
        if (location.pathname === "/jackpot") {
            navigate(
                `${JACKPOT_PATH}${location.search || ""}`,
                { replace: true }
            );
        }
    }, [location.pathname, location.search, navigate]);

    // When types arrive: default URL to first type (e.g. /jackpots?type=last-man-standing).
    useEffect(() => {
        if (!jackpotTypes.length) {
            return;
        }
        const current = searchParams.get(TYPE_QUERY_PARAM);
        if (current && jackpotTypes.some((item) => matchesTypeParam(item, current))) {
            return;
        }
        const fallback = jackpotTypes[0];
        const value = String(typeParamValue(fallback));
        if (current === value) {
            return;
        }
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.set(TYPE_QUERY_PARAM, value);
            return next;
        }, { replace: true });
    }, [jackpotTypes, searchParams, setSearchParams]);

    const fetchMatchesForType = useCallback(async (typeSlug, selectedType = null) => {
        const params = new URLSearchParams();
        if (typeSlug) {
            params.set("type", typeSlug);
        }
        const eventId = selectedType?.jackpot_event_id ?? selectedType?.id;
        if (eventId && !typeSlug) {
            params.set("jackpot_event_id", eventId);
        }

        let matchEndpoint = "/jackpot/matches";
        const query = params.toString();
        if (query) {
            matchEndpoint = `${matchEndpoint}?${query}`;
        }

        const [m_status, result] = await makeRequest({
            url: matchEndpoint,
            method: "GET",
            api_version: 2,
        });

        if (m_status == 200) {
            applyJackpotPayload(result?.data);
        }

        const jackpotbetslip = getJackpotBetslip();
        dispatch({ type: "SET", key: "jackpotbetslip", payload: jackpotbetslip });
    }, [applyJackpotPayload, dispatch]);

    // URL ?type= change → fetch that jackpot.
    useEffect(() => {
        if (!urlTypeParam || !jackpotTypes.length) {
            return;
        }
        if (String(lastFetchedType) === String(urlTypeParam)) {
            return;
        }

        const selected =
            jackpotTypes.find((item) => matchesTypeParam(item, urlTypeParam)) ||
            null;

        setLastFetchedType(urlTypeParam);
        clearJackpotSlip();
        dispatch({ type: "SET", key: "jackpotbetslip", payload: [] });
        void fetchMatchesForType(urlTypeParam, selected);
    }, [
        urlTypeParam,
        jackpotTypes,
        lastFetchedType,
        fetchMatchesForType,
        dispatch,
    ]);

    useEffect(() => {
        return () => {
            dispatch({ type: "DEL", key: "jackpotbetslip" });
            dispatch({ type: "DEL", key: "jackpotdata" });
        };
    }, [dispatch]);

    const selectJackpotType = (type) => {
        const value = String(typeParamValue(type));
        if (value === String(urlTypeParam ?? "")) {
            return;
        }
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.set(TYPE_QUERY_PARAM, value);
            return next;
        });
    };

    const activeJackpotType =
        jackpotTypes.find((item) => matchesTypeParam(item, urlTypeParam)) ||
        jackpotTypes[0] ||
        null;

    const AutoPickAllMatches = async () => {
        if (isAutoPicking || !jackpotData?.matches) {
            return;
        }

        const clean = (_str) => {
            _str = _str.replace(/[^A-Za-z0-9\-]/g, '');
            return _str.replace(/-+/g, '-');
        };

        const randomPick = (min, max) => {
            return Math.floor(min + Math.random() * (max - min + 1));
        };

        setIsAutoPicking(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 0));

            let betslip;
            Object.entries(jackpotData.matches).forEach(([, match]) => {
                const reference = match.match_id + "_selected";
                const pick = randomPick(1, 3);
                const pickedValue = (pick == 1 ? match.home_team : (pick == 2 ? 'draw' : match?.away_team));
                const oddValue = (pick == 1 ? Float(match.odds["1x2"]['outcomes'][0].odd_value, 2) : (pick == 2 ? Float(match.odds["1x2"]['outcomes'][1].odd_value, 2) : Float(match.odds["1x2"]['outcomes'][2].odd_value, 2)));
                const cstm = clean(match.match_id + "" + 1 + pickedValue);
                const slip = {
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
                };
                betslip = addToJackpotSlip(slip);

                dispatch({ type: "SET", key: reference, payload: cstm });
            });
            dispatch({ type: "SET", key: "jackpotbetslip", payload: betslip });
        } catch (error) {
            Notify({ status: 400, message: "Error auto-picking jackpot matches" });
        } finally {
            resetAutoPickButton();
        }
    };

    useEffect(() => {
        dispatch({ type: "SET", key: "betslipkey", payload: "jackpotbetslip" });
        dispatch({ type: "SET", key: "isjackpot", payload: true });
        return () => {
            dispatch({ type: "DEL", key: "isjackpot" });
            dispatch({ type: "SET", key: "betslipkey", payload: "betslip" });
        };
    }, [dispatch]);

    return (
        <>
            {jackpotTypes.length > 0 && (
                <nav
                    className="jackpot-types-strip"
                    aria-label="Jackpot types"
                    style={{ "--jackpot-types-count": String(jackpotTypes.length) }}
                    onTouchStart={(event) => event.currentTarget.classList.add("is-paused")}
                    onTouchEnd={(event) => event.currentTarget.classList.remove("is-paused")}
                    onTouchCancel={(event) => event.currentTarget.classList.remove("is-paused")}
                >
                    <div className="jackpot-types-strip__scroll big-icon-scrollbar-hide">
                        {[0, 1].flatMap((copy) =>
                            jackpotTypes.map((type) => {
                                const key = String(type.key || typeKey(type));
                                const isActive = matchesTypeParam(type, urlTypeParam);
                                const isClone = copy === 1;
                                return (
                                    <button
                                        key={`${copy}-${key}`}
                                        type="button"
                                        className={`jackpot-types-strip__item${isActive ? " active" : ""}`}
                                        onClick={() => selectJackpotType(type)}
                                        aria-pressed={isActive}
                                        tabIndex={isClone ? -1 : undefined}
                                        aria-hidden={isClone ? true : undefined}
                                    >
                                        <span className="jackpot-types-strip__icon" aria-hidden="true">
                                            <FaCoins />
                                        </span>
                                        <span className="jackpot-types-strip__label">
                                            {type.label || typeLabel(type)}
                                        </span>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </nav>
            )}

            <LazyLoadImage src={dailyJackpot} alt="jackpot" className="std-carousel-image" />

            <div className="jackpot-header row">
                <div className="col-12">
                    <JackpotHeader jackpot={jackpotData} />
                </div>
            </div>
            <Tabs
                activeKey={activeTab}
                onSelect={(key) => setActiveTab(key || "games")}
                id="jackpot-tabs"
                className="jackpot-tabs plain-tabs"
            >
                <Tab eventKey="games" title="Games" className="p-3">
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
                                        key={autoPickButtonKey}
                                        type="button"
                                        onClick={() => {
                                            void AutoPickAllMatches();
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

                    {(jackpotData?.matches?.length > 0 && jackpotData?.total_games) ? (
                        <JackpotMatchList setJackpotData={setJackpotData} matches={jackpotData} />
                    ) : (
                        <div className={'col-md-12 text-center background-primary mt-2 p-5 no-events-div'}>
                            There are no jackpots at the moment.
                        </div>
                    )}
                </Tab>
                <Tab eventKey="archive" title="Archive" className="p-3">
                    <JackpotArchive
                        active={activeTab === "archive"}
                        jackpotName={jackpotData?.jackpot_name || activeJackpotType?.label}
                        selectedType={activeJackpotType}
                        typeSlug={urlTypeParam || typeParamValue(activeJackpotType)}
                    />
                </Tab>
            </Tabs>
        </>
    );
};

export default Jackpot;
