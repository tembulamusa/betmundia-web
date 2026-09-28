import React, { useState, useEffect, useCallback, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Context } from "../context/store";
import { getFromLocalStorage, setLocalStorage } from "./utils/local-storage";
import { openLoginWithRedirect } from "./utils/login-redirect";
import Notify from "./utils/Notify";
import NoEvents from "./utils/no-events";
import { FaShieldAlt, FaSkullCrossbones, FaTrophy, FaUsers } from "react-icons/fa";
import {
    fetchSurvivorChallenges,
    fetchSurvivorChallenge,
    fetchSurvivorResults,
    joinSurvivorChallenge,
    fetchSurvivorProgress,
    submitSurvivorPrediction,
    normalizeSelection,
    SURVIVOR_STATUS_LABELS,
    GAME_STATUS_LABELS,
    PARTICIPANT_STATUS_LABELS,
} from "./utils/survivor-data";

export const SURVIVOR_JOINED_STORAGE_KEY = "survivorJoinedChallenges";

/** Remember locally which challenges this browser has joined, so My Bets
 * can list them (the API has no "my challenges" endpoint yet — only
 * per-challenge progress). */
const rememberJoinedChallenge = (id) => {
    const existing = getFromLocalStorage(SURVIVOR_JOINED_STORAGE_KEY) || [];
    const list = Array.isArray(existing) ? existing : [];
    if (!list.some((entry) => String(entry) === String(id))) {
        setLocalStorage(SURVIVOR_JOINED_STORAGE_KEY, [...list, id], 1000 * 60 * 60 * 24 * 30);
    }
};

const formatMoney = (value) =>
    `KSh ${Number(value || 0).toLocaleString("en-KE", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const formatDateTime = (value) => {
    if (!value) return "";
    try {
        return new Date(value).toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch (e) {
        return value;
    }
};

const StatusPill = ({ status, labels }) => (
    <span className={`survivor-status-pill survivor-status-${String(status || "").toLowerCase()}`}>
        {labels?.[status] || status || "—"}
    </span>
);

const PickButtons = ({ game, currentSelection, disabled, onPick }) => {
    const options = [
        { value: "1", label: "1" },
        { value: "X", label: "X" },
        { value: "2", label: "2" },
    ];
    return (
        <div className="survivor-pick-buttons">
            {options.map((opt) => {
                const isSelected = normalizeSelection(currentSelection) === opt.value;
                return (
                    <button
                        key={opt.value}
                        type="button"
                        className={`survivor-pick-btn${isSelected ? " selected" : ""}`}
                        disabled={disabled}
                        onClick={() => onPick(game.game_number, opt.value)}
                    >
                        {opt.label}
                    </button>
                );
            })}
        </div>
    );
};

/** /survivor — the lobby: every open/active/completed challenge. */
const SurvivorChallengesList = () => {
    const [challenges, setChallenges] = useState(null);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setFetching(true);
        fetchSurvivorChallenges().then((list) => {
            if (!cancelled) {
                setChallenges(list);
                setFetching(false);
            }
        });
        return () => { cancelled = true; };
    }, []);

    return (
        <div className="survivor-page">
            <div className="survivor-lobby-header">
                <FaShieldAlt className="survivor-lobby-icon" aria-hidden="true" />
                <div>
                    <h1 className="survivor-lobby-title">Survivor Challenge</h1>
                    <p className="survivor-lobby-subtitle">
                        Pick one 1X2 result per game. One wrong pick and you're out —
                        last player standing takes the pool.
                    </p>
                </div>
            </div>

            {fetching && <div className="survivor-loading">Loading challenges…</div>}

            {!fetching && (!challenges || challenges.length < 1) && (
                <NoEvents message="No survivor challenges are open right now. Check back later!" />
            )}

            {!fetching && challenges && challenges.length > 0 && (
                <div className="survivor-challenge-grid">
                    {challenges.map((challenge) => (
                        <Link
                            key={challenge.id}
                            to={`/survivor/${challenge.id}`}
                            className="survivor-challenge-card"
                        >
                            <div className="survivor-challenge-card-top">
                                <span className="survivor-challenge-name">{challenge.name}</span>
                                <StatusPill status={challenge.status} labels={SURVIVOR_STATUS_LABELS} />
                            </div>
                            <div className="survivor-challenge-card-pool">
                                {formatMoney(challenge.current_prize_pool)}
                                <span className="survivor-challenge-card-pool-label">prize pool</span>
                            </div>
                            <div className="survivor-challenge-card-meta">
                                <span><FaUsers aria-hidden="true" /> {challenge.participant_count} playing</span>
                                <span>Entry {formatMoney(challenge.entry_stake)}</span>
                            </div>
                            <div className="survivor-challenge-card-time">
                                {challenge.status === "OPEN"
                                    ? `Entries close ${formatDateTime(challenge.registration_closes_at)}`
                                    : `Started ${formatDateTime(challenge.start_at)}`}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

/** /survivor/:id — one challenge: games, picks, join, progress. */
const SurvivorChallengeDetail = ({ id }) => {
    const [, dispatch] = useContext(Context);
    const navigate = useNavigate();
    const user = getFromLocalStorage("user");
    // NOTE: getFromLocalStorage() re-parses JSON on every call, so `user` is a
    // brand-new object reference each render. Depending on it directly below
    // would recreate loadAll -> re-run the effect -> re-render -> new `user`
    // reference -> forever, hammering /progress. Depend on a stable boolean
    // instead so loadAll only changes when sign-in state actually changes.
    const isSignedIn = !!user;

    const [challenge, setChallenge] = useState(null);
    const [results, setResults] = useState(null);
    const [progress, setProgress] = useState(null);
    const [fetching, setFetching] = useState(true);
    const [isJoining, setIsJoining] = useState(false);
    const [pendingGame, setPendingGame] = useState(null);

    const loadAll = useCallback(async () => {
        setFetching(true);
        const [detail, aggregate] = await Promise.all([
            fetchSurvivorChallenge(id),
            fetchSurvivorResults(id),
        ]);
        setChallenge(detail);
        setResults(aggregate);
        if (isSignedIn) {
            const mine = await fetchSurvivorProgress(id);
            setProgress(mine);
            if (mine?.enrolled) {
                rememberJoinedChallenge(id);
            }
        } else {
            setProgress(null);
        }
        setFetching(false);
    }, [id, isSignedIn]);

    useEffect(() => {
        void loadAll();
    }, [loadAll]);

    const handleJoin = async () => {
        if (!user) {
            openLoginWithRedirect(dispatch, `/survivor/${id}`);
            return;
        }
        setIsJoining(true);
        const outcome = await joinSurvivorChallenge(id);
        setIsJoining(false);
        if (outcome.success) {
            rememberJoinedChallenge(id);
            Notify({ status: 200, message: "You're in! Good luck." });
            void loadAll();
        } else {
            Notify({ status: 400, message: outcome.message || "Could not join this challenge." });
        }
    };

    const handlePick = async (gameNumber, selection) => {
        if (!user) {
            openLoginWithRedirect(dispatch, `/survivor/${id}`);
            return;
        }
        setPendingGame(gameNumber);
        const outcome = await submitSurvivorPrediction(id, gameNumber, selection);
        setPendingGame(null);
        if (outcome.success) {
            void loadAll();
        } else {
            Notify({ status: 400, message: outcome.message || "Could not save your pick." });
        }
    };

    if (fetching && !challenge) {
        return <div className="survivor-page"><div className="survivor-loading">Loading challenge…</div></div>;
    }

    if (!challenge) {
        return (
            <div className="survivor-page">
                <NoEvents message="This survivor challenge could not be found." />
            </div>
        );
    }

    const predictionByGame = new Map(
        (progress?.predictions || []).map((p) => [p.game_number, p])
    );

    const isEliminated = progress?.participant_status === "ELIMINATED";
    const isEnrolled = !!progress?.enrolled;

    return (
        <div className="survivor-page">
            <button type="button" className="survivor-back-link" onClick={() => navigate("/survivor")}>
                ← All challenges
            </button>

            <div className="survivor-detail-header">
                <div className="survivor-detail-header-top">
                    <h1 className="survivor-detail-title">{challenge.name}</h1>
                    <StatusPill status={challenge.status} labels={SURVIVOR_STATUS_LABELS} />
                </div>
                {challenge.description && (
                    <p className="survivor-detail-description">{challenge.description}</p>
                )}
                <div className="survivor-detail-stats">
                    <div className="survivor-stat">
                        <span className="survivor-stat-value">{formatMoney(challenge.current_prize_pool)}</span>
                        <span className="survivor-stat-label">Prize pool</span>
                    </div>
                    <div className="survivor-stat">
                        <span className="survivor-stat-value">{results?.survivors_remaining ?? "—"}</span>
                        <span className="survivor-stat-label">Survivors left</span>
                    </div>
                    <div className="survivor-stat">
                        <span className="survivor-stat-value">{challenge.participant_count}</span>
                        <span className="survivor-stat-label">Players</span>
                    </div>
                    <div className="survivor-stat">
                        <span className="survivor-stat-value">{formatMoney(challenge.entry_stake)}</span>
                        <span className="survivor-stat-label">Entry stake</span>
                    </div>
                </div>
            </div>

            {isEnrolled && (
                <div className={`survivor-progress-banner${isEliminated ? " eliminated" : ""}`}>
                    {isEliminated ? <FaSkullCrossbones aria-hidden="true" /> : <FaTrophy aria-hidden="true" />}
                    <span>
                        {isEliminated
                            ? `You were eliminated after surviving ${progress.games_survived} game(s).`
                            : `You're ${PARTICIPANT_STATUS_LABELS[progress.participant_status]?.toLowerCase() || "still in"} — ${progress.games_survived} game(s) survived so far.`}
                    </span>
                </div>
            )}

            {/* Join button hidden per request; handleJoin/isJoining kept in
                place so it can be re-enabled by uncommenting this block. */}
            {false && !isEnrolled && challenge.status !== "COMPLETED" && (
                <button
                    type="button"
                    className="survivor-join-btn"
                    disabled={isJoining || challenge.status === "COMPLETED"}
                    onClick={handleJoin}
                >
                    {isJoining ? "Joining…" : `Join for ${formatMoney(challenge.entry_stake)}`}
                </button>
            )}

            <div className="survivor-games-list">
                {(challenge.games || []).map((game) => {
                    const mine = predictionByGame.get(game.game_number);
                    const canPick = isEnrolled && !isEliminated && game.status === "OPEN_FOR_PICKS";
                    return (
                        <div key={game.game_number} className="survivor-game-row">
                            <div className="survivor-game-row-top">
                                <span className="survivor-game-number">Game {game.game_number}</span>
                                <StatusPill status={game.status} labels={GAME_STATUS_LABELS} />
                            </div>
                            <div className="survivor-game-time">
                                Kicks off {formatDateTime(game.scheduled_at)} · picks lock {formatDateTime(game.lock_at)}
                            </div>

                            {canPick && (
                                <PickButtons
                                    game={game}
                                    currentSelection={mine?.selection}
                                    disabled={pendingGame === game.game_number}
                                    onPick={handlePick}
                                />
                            )}

                            {!canPick && isEnrolled && (
                                <div className="survivor-game-outcome">
                                    <span>Your pick: <b>{mine?.selection ? normalizeSelection(mine.selection) : "—"}</b></span>
                                    {game.result && <span>Result: <b>{normalizeSelection(game.result)}</b></span>}
                                    {mine?.result_status && (
                                        <span className={`survivor-result-status survivor-result-${mine.result_status.toLowerCase()}`}>
                                            {mine.result_status}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const Survivor = () => {
    const { id } = useParams();
    return id ? <SurvivorChallengeDetail id={id} /> : <SurvivorChallengesList />;
};

export default Survivor;
