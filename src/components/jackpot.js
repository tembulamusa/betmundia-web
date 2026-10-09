import React, { useEffect, useCallback, useState, useContext, useMemo, useRef } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { JackpotMatchList, JackpotHeader } from './matches/index';
import makeRequest from "./utils/fetch-request";
import dailyJackpot from '../assets/img/banner/jackpots/DailyJackpot.jpeg';
import jackpotEmptyBall from '../assets/img/backgrounds/jackpot-empty-ball.png';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Spinner from 'react-bootstrap/Spinner';
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
    clearStoredJackpotGames,
    getJackpotTypes,
    matchesTypeParam,
    persistJackpotGames,
    persistJackpotTypes,
    readStoredJackpotGames,
    refreshJackpotTypes,
    resolveJackpotTypeFromParam,
    resolveJackpotTypeId,
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
    const [isLoadingMatches, setIsLoadingMatches] = useState(false);
    const matchesRequestRef = useRef(0);
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

    const applyJackpotPayload = useCallback((data, typeId = null) => {
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
            if (typeId != null) {
                clearStoredJackpotGames(typeId);
            }
            return null;
        }

        setJackpotData(data);
        dispatch({ type: "SET", key: "jackpotdata", payload: data });
        if (typeId != null) {
            persistJackpotGames(typeId, data);
        }
        return data;
    }, [dispatch]);

    // Load jackpot list for the header strip from /jackpot/list (keep page URL /jackpots).
    useEffect(() => {
        const cached = getJackpotTypes(state);
        if (cached.length) {
            persistJackpotTypes(cached, dispatch);
        }
        void refreshJackpotTypes(dispatch);
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

    // When types arrive: sync URL ?type= to a stored jackpot (match URL, else first).
    useEffect(() => {
        if (!jackpotTypes.length) {
            return;
        }
        const selected = resolveJackpotTypeFromParam(jackpotTypes, searchParams.get(TYPE_QUERY_PARAM));
        if (!selected) {
            return;
        }
        const value = String(typeParamValue(selected));
        const current = searchParams.get(TYPE_QUERY_PARAM);
        if (current === value) {
            return;
        }
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.set(TYPE_QUERY_PARAM, value);
            return next;
        }, { replace: true });
    }, [jackpotTypes, searchParams, setSearchParams]);

    const fetchMatchesForType = useCallback(async (selectedType) => {
        const typeId = resolveJackpotTypeId(selectedType);
        if (typeId == null) {
            return;
        }

        const requestId = ++matchesRequestRef.current;

        // Serve cached games within 4h TTL; otherwise fetch and refresh storage.
        const cachedGames = readStoredJackpotGames(typeId);
        if (cachedGames) {
            const applied = applyJackpotPayload(cachedGames, typeId);
            if (applied) {
                setIsLoadingMatches(false);
                const jackpotbetslip = getJackpotBetslip();
                dispatch({ type: "SET", key: "jackpotbetslip", payload: jackpotbetslip });
                return;
            }
        }

        const matchEndpoint = `/jackpot/matches?id=${encodeURIComponent(String(typeId))}`;

        setIsLoadingMatches(true);
        const [m_status, result] = await makeRequest({
            url: matchEndpoint,
            method: "GET",
            api_version: 2,
        });

        // A newer jackpot was selected while this request was in flight.
        if (requestId !== matchesRequestRef.current) {
            return;
        }

        if (m_status == 200) {
            applyJackpotPayload(result?.data, typeId);
        }
        setIsLoadingMatches(false);

        const jackpotbetslip = getJackpotBetslip();
        dispatch({ type: "SET", key: "jackpotbetslip", payload: jackpotbetslip });
    }, [applyJackpotPayload, dispatch]);

    // URL ?type= change (reload, click, or replace) → resolve from localStorage list, fetch by id.
    useEffect(() => {
        if (!jackpotTypes.length) {
            return;
        }

        const selected = resolveJackpotTypeFromParam(jackpotTypes, urlTypeParam);
        if (!selected) {
            return;
        }

        const selectedId = resolveJackpotTypeId(selected);
        const fetchKey = selectedId != null
            ? String(selectedId)
            : String(typeParamValue(selected));

        if (String(lastFetchedType) === fetchKey) {
            return;
        }

        setLastFetchedType(fetchKey);
        setJackpotData(null);
        dispatch({ type: "DEL", key: "jackpotdata" });
        clearJackpotSlip();
        dispatch({ type: "SET", key: "jackpotbetslip", payload: [] });
        void fetchMatchesForType(selected);
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
        resolveJackpotTypeFromParam(jackpotTypes, urlTypeParam);

    // Auto Pick is offered for any open jackpot that has games we can actually pick.
    // We deliberately do not require status === "active" or matches.length === total_games:
    // staging/production payloads vary (status casing/wording, extra or missing games).
    const CLOSED_JACKPOT_STATUSES = ["closed", "settled", "completed", "cancelled", "canceled", "expired", "finished", "ended", "inactive"];
    const pickableMatches = Object.values(jackpotData?.matches || {}).filter(
        (match) => match && match.match_id != null && match?.odds?.["1x2"]?.outcomes?.length >= 3
    );
    const jackpotStatus = String(jackpotData?.status ?? "").trim().toLowerCase();
    const canAutoPick = pickableMatches.length > 0 && !CLOSED_JACKPOT_STATUSES.includes(jackpotStatus);

    const AutoPickAllMatches = async () => {
        if (isAutoPicking || !pickableMatches.length) {
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
            pickableMatches.forEach((match) => {
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
                    {jackpotData && <JackpotHeader jackpot={jackpotData} />}
                </div>
            </div>
            <Tabs
                activeKey={activeTab}
                onSelect={(key) => setActiveTab(key || "games")}
                id="jackpot-tabs"
                className="jackpot-tabs plain-tabs"
            >
                <Tab eventKey="games" title="Games" className="p-3">
                    {canAutoPick && (
                        <div className="row flex flex-col items-center md:flex-row">
                            <div className="col-md-8 !px-3 text-center md:text-left">
                                <div className="!px-2">
                                    <div className="jackpot-amount !pl-0 pt-3">
                                        Autopick randomly picks jackpot for you!{Number(jackpotData?.jackpot_amount) > 0 && ` KES ${Intl.NumberFormat('en-US').format(jackpotData?.jackpot_amount)}`}
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

                    {isLoadingMatches ? (
                        <div className="col-md-12 text-center mt-4" role="status">
                            <Spinner animation="border" size="sm" className="me-2" />
                            Loading jackpot games...
                        </div>
                    ) : (jackpotData?.matches?.length > 0 && jackpotData?.total_games) ? (
                        <JackpotMatchList
                            key={jackpotData?.jackpot_event_id ?? lastFetchedType}
                            setJackpotData={setJackpotData}
                            matches={jackpotData}
                        />
                    ) : (
                        <div className={'col-md-12 text-center background-primary mt-2 no-events-div jackpot-empty-state'}>
                            <img
                                src={jackpotEmptyBall}
                                alt=""
                                aria-hidden="true"
                                className="jackpot-empty-illustration"
                            />
                            <h3 className="jackpot-empty-title">There are no jackpots at the moment.</h3>
                            <p className="jackpot-empty-subtitle">Check back later for exciting football jackpots and big wins!</p>
                        </div>
                    )}
                </Tab>
                <Tab eventKey="archive" title="Winning History" className="p-3">
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
