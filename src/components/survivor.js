import React, { useState, useEffect, useCallback, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Modal } from "react-bootstrap";
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
    placeSurvivorGameBet,
    SURVIVOR_ARBITRARY_ODD,
    readStoredSurvivorChallenges,
    persistSurvivorChallenges,
    normalizeSelection,
    caseInsensitiveLabel,
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

/** Status strings come back in whatever case the backend feels like
 * ("ACTIVE"/"active"/"Active", etc.) — always compare downcased. */
const statusIs = (value, expected) =>
    String(value ?? "").toLowerCase() === String(expected).toLowerCase();

/**
 * Lobby status filter buckets. The API's own challenge statuses are
 * OPEN/ACTIVE/COMPLETED; mapped here to the "active/ended/inactive"
 * wording asked for on the filter bar — OPEN (not started yet) reads as
 * "inactive", ACTIVE as "active", COMPLETED as "ended".
 */
const SURVIVOR_LOBBY_FILTERS = [
    { key: "all", label: "All" },
    { key: "active", label: "Active", matchesStatus: "ACTIVE" },
    { key: "ended", label: "Ended", matchesStatus: "COMPLETED" },
    { key: "inactive", label: "Inactive", matchesStatus: "OPEN" },
];

const challengeMatchesFilter = (challenge, filterKey) => {
    if (filterKey === "all") return true;
    const filter = SURVIVOR_LOBBY_FILTERS.find((f) => f.key === filterKey);
    return filter ? statusIs(challenge?.status, filter.matchesStatus) : true;
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
        {(labels && caseInsensitiveLabel(labels, status)) || status || "—"}
    </span>
);

const PickButtons = ({ game, currentSelection, draftSelection, disabled, onPick }) => {
    const options = [
        { value: "1", label: "1" },
        { value: "X", label: "X" },
        { value: "2", label: "2" },
    ];
    return (
        <div className="survivor-pick-buttons">
            {options.map((opt) => {
                const isSelected = normalizeSelection(currentSelection) === opt.value;
                // Turns purple the instant it's clicked, same click-feel as
                // the shared prematch odds buttons' own "picked" toggle —
                // this is only a local draft, though, until "Place" is
                // pressed and the confirmation modal is accepted.
                const isDraft = normalizeSelection(draftSelection) === opt.value;
                const isPicked = isSelected || isDraft;
                return (
                    <button
                        key={opt.value}
                        type="button"
                        className={`survivor-pick-btn pick-${opt.value.toLowerCase()}${
                            isPicked ? " selected" : ""
                        }`}
                        disabled={disabled}
                        onClick={() => onPick(game.game_number, opt.value)}
                    >
                        {opt.label}
                        <span className="survivor-pick-odd">{SURVIVOR_ARBITRARY_ODD.toFixed(2)}</span>
                    </button>
                );
            })}
        </div>
    );
};

/** /survivor — the lobby: every open/active/completed challenge. */
const SurvivorChallengesList = () => {
    // Hydrate instantly from whatever was saved on the last visit, then
    // refresh from the network in the background — the status filter and
    // its counts work immediately from "earlier saved" data either way.
    const [challenges, setChallenges] = useState(() => readStoredSurvivorChallenges());
    const [fetching, setFetching] = useState(() => !readStoredSurvivorChallenges());
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        let cancelled = false;
        fetchSurvivorChallenges().then((list) => {
            if (!cancelled) {
                setChallenges(list);
                persistSurvivorChallenges(list);
                setFetching(false);
            }
        });
        return () => { cancelled = true; };
    }, []);

    const filterCounts = SURVIVOR_LOBBY_FILTERS.reduce((acc, filter) => {
        acc[filter.key] = (challenges || []).filter((c) => challengeMatchesFilter(c, filter.key)).length;
        return acc;
    }, {});

    const filteredChallenges = (challenges || []).filter((c) => challengeMatchesFilter(c, statusFilter));

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

            {challenges && challenges.length > 0 && (
                <div className="survivor-lobby-filter-bar">
                    <label className="survivor-lobby-filter-label" htmlFor="survivor-status-filter">
                        Filter by status
                    </label>
                    <select
                        id="survivor-status-filter"
                        className="survivor-lobby-filter-select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        {SURVIVOR_LOBBY_FILTERS.map((filter) => (
                            <option key={filter.key} value={filter.key}>
                                {filter.label} ({filterCounts[filter.key]})
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {fetching && !challenges && <div className="survivor-loading">Loading challenges…</div>}

            {!fetching && (!challenges || challenges.length < 1) && (
                <NoEvents message="No survivor challenges are open right now. Check back later!" />
            )}

            {challenges && challenges.length > 0 && filteredChallenges.length < 1 && (
                <NoEvents message="No challenges match this filter right now." />
            )}

            {challenges && filteredChallenges.length > 0 && (
                <div className="survivor-challenge-grid">
                    {filteredChallenges.map((challenge) => (
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
                                {statusIs(challenge.status, "OPEN")
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
    const [showBlockReason, setShowBlockReason] = useState(false);
    // The pick the user clicked but hasn't confirmed yet — clicking 1/X/2
    // opens a confirmation modal instead of placing the bet immediately.
    const [pendingPick, setPendingPick] = useState(null);
    // Local, unsubmitted picks per game (gameNumber -> "1"/"X"/"2") — set
    // by clicking 1/X/2, cleared once that game's pick is confirmed (or
    // the confirm attempt finishes). Nothing is sent to the server until
    // "Place" is pressed for that game.
    const [draftPicks, setDraftPicks] = useState({});

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
        if (!canBetOnChallenge) {
            Notify({ status: 400, message: "You cannot place a bet on this challenge" });
            return;
        }
        const game = (challenge.games || []).find((g) => g.game_number === gameNumber);
        setPendingGame(gameNumber);
        // Real placebet, not the challenge's own /prediction endpoint — see
        // placeSurvivorGameBet in utils/survivor-data.js.
        const outcome = await placeSurvivorGameBet(challenge, game, selection);
        setPendingGame(null);
        if (outcome.success) {
            Notify({ status: 200, message: "Bet placed." });
            void loadAll();
        } else {
            Notify({ status: 400, message: outcome.message || "Could not place bet." });
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

    // A game object may carry its own selection/result_status directly
    // (as returned by /survivor/challenges/{id}), separate from — and not
    // always mirrored by — progress.predictions. Prefer the progress
    // entry when there is one, otherwise fall back to the game's own
    // fields so a pick still shows up.
    const predictionByGame = new Map(
        (progress?.predictions || []).map((p) => [p.game_number, p])
    );
    const predictionFor = (game) =>
        predictionByGame.get(game.game_number) ||
        (game.selection != null
            ? { selection: game.selection, result_status: game.result_status }
            : null);

    // A game counts as settled once it has a result, regardless of the
    // exact status string used ("SETTLED"/"COMPLETED"/"FINISHED" — real
    // responses seen so far only use SCHEDULED/LOCKED and never actually
    // reach a terminal status string, so `result` is the reliable signal).
    const isGameSettled = (g) =>
        g?.result != null ||
        statusIs(g?.status, "SETTLED") ||
        statusIs(g?.status, "COMPLETED") ||
        statusIs(g?.status, "FINISHED");
    // A game is pickable while it's scheduled and not yet locked/settled.
    // Real data uses "SCHEDULED" (not "OPEN_FOR_PICKS" as originally
    // assumed from the API spec) — keep both for safety.
    const isGamePickable = (g) =>
        !isGameSettled(g) &&
        !statusIs(g?.status, "LOCKED") &&
        (statusIs(g?.status, "SCHEDULED") || statusIs(g?.status, "OPEN_FOR_PICKS"));

    const participantStatus = progress?.participant_status;
    const isEliminated = statusIs(participantStatus, "ELIMINATED");
    const isWinner = statusIs(participantStatus, "WINNER");
    const isEnrolled = !!progress?.enrolled;
    // progress carries its own `status` for the challenge (per the
    // /progress example response) — prefer it, fall back to the challenge
    // detail's own status field.
    const challengeStatus = progress?.status ?? challenge?.status;
    const isChallengeActive = statusIs(challengeStatus, "ACTIVE");
    // Betting is allowed whenever the challenge itself is active and this
    // user hasn't been knocked out of it (or already won it) — there is
    // no separate "must already be an enrolled/active participant"
    // requirement: placing a pick through the regular placebet flow IS
    // the entry action now, since the explicit join button is hidden.
    const canBetOnChallenge = isChallengeActive && !isEliminated && !isWinner;
    const nonSettledGames = (challenge.games || []).filter((g) => !isGameSettled(g));
    const settledGames = (challenge.games || []).filter((g) => isGameSettled(g));

    /** First game the user got wrong, for the "you lost at game N" modal
     * copy — falls back to games_survived + 1 when predictions aren't
     * available to inspect directly. */
    const resolveLostAtGame = () => {
        const predictions = progress?.predictions || [];
        const incorrect = predictions.find((p) => statusIs(p.result_status, "INCORRECT"));
        if (incorrect) return incorrect.game_number;
        if (progress?.games_survived != null) return progress.games_survived + 1;
        return progress?.current_game_number ?? null;
    };

    /** Why the odds buttons are replaced with a reason link, and what the
     * modal behind it should say. Only meaningful when !canBetOnChallenge. */
    const resolveBlockReason = () => {
        if (!isChallengeActive) {
            return {
                key: "closed",
                label: "Challenge closed",
                title: "Challenge closed",
                body: "This challenge isn't currently active, so no bets can be placed on its games right now.",
            };
        }
        if (isEliminated) {
            const lostAtGame = resolveLostAtGame();
            return {
                key: "lost",
                label: "Not allowed (You lost)",
                title: "You lost",
                body: lostAtGame
                    ? `You lost at game ${lostAtGame}.`
                    : "You were eliminated from this challenge.",
            };
        }
        if (isWinner) {
            return {
                key: "winner",
                label: "Not allowed",
                title: "Challenge complete",
                body: "This challenge is complete — congratulations, you won!",
            };
        }
        // Shouldn't be reachable given canBetOnChallenge above, but keeps
        // the reason link/modal from ever rendering blank.
        return {
            key: "unavailable",
            label: "Not allowed",
            title: "Not allowed",
            body: "Betting isn't available on this challenge right now.",
        };
    };

    const blockReason = canBetOnChallenge ? null : resolveBlockReason();

    /** Clicking 1/X/2 opens a confirmation modal first — it surfaces more
     * insight (game number, pick, stake, possible win) and, when this game
     * already has an earlier pick recorded, warns the user before they
     * finalize a new one. The actual placebet only fires from
     * confirmPendingPick below, never directly from the buttons. */
    const setDraftPick = (gameNumber, selection) => {
        setDraftPicks((prev) => ({ ...prev, [gameNumber]: selection }));
    };

    const requestPick = (gameNumber, selection) => {
        if (!selection) return;
        const game = (challenge.games || []).find((g) => g.game_number === gameNumber);
        setPendingPick({ gameNumber, selection, existing: predictionFor(game) });
    };

    const cancelPendingPick = () => setPendingPick(null);

    const confirmPendingPick = async () => {
        if (!pendingPick) return;
        const { gameNumber, selection } = pendingPick;
        setPendingPick(null);
        await handlePick(gameNumber, selection);
        setDraftPicks((prev) => {
            const next = { ...prev };
            delete next[gameNumber];
            return next;
        });
    };

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
                            : `You're ${caseInsensitiveLabel(PARTICIPANT_STATUS_LABELS, progress.participant_status)?.toLowerCase() || "still in"} — ${progress.games_survived} game(s) survived so far.`}
                    </span>
                </div>
            )}

            {/* Join button hidden per request; handleJoin/isJoining kept in
                place so it can be re-enabled by uncommenting this block. */}
            {false && !isEnrolled && !statusIs(challenge.status, "COMPLETED") && (
                <button
                    type="button"
                    className="survivor-join-btn"
                    disabled={isJoining || statusIs(challenge.status, "COMPLETED")}
                    onClick={handleJoin}
                >
                    {isJoining ? "Joining…" : `Join for ${formatMoney(challenge.entry_stake)}`}
                </button>
            )}

            <div className="survivor-games-list">
                {nonSettledGames.length > 0 && blockReason && (
                    <div className="survivor-game-row survivor-game-blocked">
                        <button
                            type="button"
                            className="survivor-blocked-link"
                            onClick={() => setShowBlockReason(true)}
                        >
                            {blockReason.label}
                        </button>
                    </div>
                )}

                {canBetOnChallenge && nonSettledGames.map((game) => {
                    const mine = predictionFor(game);
                    const canPick = isGamePickable(game);
                    return (
                        <div key={game.game_number} className="survivor-game-row">
                            <div className="survivor-game-row-top">
                                <span className="survivor-game-number">Game {game.game_number}</span>
                                <StatusPill status={game.status} labels={GAME_STATUS_LABELS} />
                            </div>
                            <div className="survivor-game-teams">
                                {/* The survivor game payload has no home_team/away_team yet (only
                                    parent_match_id) - shows the literal placeholder for now, and
                                    will pick up real names automatically once the backend adds
                                    them, same fallback convention as betPickForSelection. */}
                                ({game.home_team || "Home"}) Vs ({game.away_team || "Away"})
                            </div>
                            <div className="survivor-game-time">
                                Active until {formatDateTime(game.lock_at)}
                            </div>

                            {canPick && (
                                <>
                                    <PickButtons
                                        game={game}
                                        currentSelection={mine?.selection}
                                        draftSelection={draftPicks[game.game_number]}
                                        disabled={pendingGame === game.game_number}
                                        onPick={setDraftPick}
                                    />
                                    <div className="survivor-place-btn-row">
                                        <button
                                            type="button"
                                            className="survivor-place-btn"
                                            disabled={
                                                !draftPicks[game.game_number] ||
                                                pendingGame === game.game_number
                                            }
                                            onClick={() =>
                                                requestPick(game.game_number, draftPicks[game.game_number])
                                            }
                                        >
                                            Place bet
                                        </button>
                                    </div>
                                </>
                            )}

                            {!canPick && (
                                <div className="survivor-game-outcome">
                                    <span>Your pick: <b>{mine?.selection ? normalizeSelection(mine.selection) : "—"}</b></span>
                                </div>
                            )}
                        </div>
                    );
                })}

                {settledGames.map((game) => {
                    const mine = predictionFor(game);
                    return (
                        <div key={game.game_number} className="survivor-game-row">
                            <div className="survivor-game-row-top">
                                <span className="survivor-game-number">Game {game.game_number}</span>
                                <StatusPill status={game.status} labels={GAME_STATUS_LABELS} />
                            </div>
                            <div className="survivor-game-teams">
                                {/* The survivor game payload has no home_team/away_team yet (only
                                    parent_match_id) - shows the literal placeholder for now, and
                                    will pick up real names automatically once the backend adds
                                    them, same fallback convention as betPickForSelection. */}
                                ({game.home_team || "Home"}) Vs ({game.away_team || "Away"})
                            </div>
                            <div className="survivor-game-time">
                                Active until {formatDateTime(game.lock_at)}
                            </div>

                            {(isEnrolled || mine) && (
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

            <Modal
                show={showBlockReason}
                onHide={() => setShowBlockReason(false)}
                centered
                className="survivor-block-modal"
            >
                <Modal.Header closeButton>
                    <Modal.Title>{blockReason?.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>{blockReason?.body}</p>
                    {blockReason?.key === "lost" && (
                        <button
                            type="button"
                            className="survivor-blocked-history-link"
                            onClick={() => {
                                setShowBlockReason(false);
                                navigate("/my-bets");
                            }}
                        >
                            Back to betting history
                        </button>
                    )}
                </Modal.Body>
            </Modal>

            <Modal
                show={!!pendingPick}
                onHide={cancelPendingPick}
                centered
                className="survivor-pick-confirm-modal"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Confirm your pick</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="survivor-pick-confirm-row">
                        <span>Game</span>
                        <b>Game {pendingPick?.gameNumber}</b>
                    </div>
                    <div className="survivor-pick-confirm-row">
                        <span>Your pick</span>
                        <b>{normalizeSelection(pendingPick?.selection)}</b>
                    </div>
                    <div className="survivor-pick-confirm-row">
                        <span>Entry stake</span>
                        <b>{formatMoney(challenge.entry_stake)}</b>
                    </div>
                    <div className="survivor-pick-confirm-row">
                        <span>Possible win</span>
                        <b>{formatMoney((challenge.entry_stake || 0) * SURVIVOR_ARBITRARY_ODD)}</b>
                    </div>
                    {pendingPick?.existing?.selection && (
                        <p className="survivor-pick-confirm-warning">
                            Heads up — you already have a pick recorded for game{" "}
                            {pendingPick.gameNumber} (<b>{normalizeSelection(pendingPick.existing.selection)}</b>).
                            Confirming will submit a new bet for this game with your updated
                            selection, <b>{normalizeSelection(pendingPick?.selection)}</b>.
                        </p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <button
                        type="button"
                        className="survivor-pick-confirm-cancel"
                        onClick={cancelPendingPick}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="survivor-pick-confirm-ok"
                        onClick={confirmPendingPick}
                    >
                        Place bet
                    </button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

const Survivor = () => {
    const { id } = useParams();
    return id ? <SurvivorChallengeDetail id={id} /> : <SurvivorChallengesList />;
};

export default Survivor;
