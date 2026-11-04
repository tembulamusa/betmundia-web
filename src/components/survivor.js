import '../assets/css/survivor-page.css';
import React, { useState, useEffect, useCallback, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Modal, Accordion } from "react-bootstrap";
import { Context } from "../context/store";
import { getFromLocalStorage, setLocalStorage } from "./utils/local-storage";
import { openLoginWithRedirect } from "./utils/login-redirect";
import NoEvents from "./utils/no-events";
import jackpotEmptyBall from "../assets/img/backgrounds/jackpot-empty-ball.png";
import { FaArrowLeft, FaSkullCrossbones, FaTrophy, FaUsers, FaCheck, FaTimes, FaMinus, FaBan } from "react-icons/fa";
import {
    fetchSurvivorChallenges,
    fetchSurvivorChallenge,
    survivorGameList,
    isSurvivorGameEligible,
    fetchSurvivorResults,
    fetchSurvivorProgress,
    submitSurvivorPrediction,
    survivorOddValueForSelection,
    readStoredSurvivorChallenges,
    persistSurvivorChallenges,
    normalizeSelection,
    caseInsensitiveLabel,
    SURVIVOR_STATUS_LABELS,
    GAME_STATUS_LABELS,
    PARTICIPANT_STATUS_LABELS,
} from "./utils/survivor-data";

export const SURVIVOR_JOINED_STORAGE_KEY = "survivorJoinedChallenges";

/** Shared Survivor Challenge terms — shown in the pick-confirm toggle and
 * in the dedicated Terms modal opened from game-row "Terms" links. */
const SURVIVOR_CHALLENGE_TERMS = [
    "Pick one result (1, X or 2) for each game; picks close at the game's lock time.",
    "A correct pick keeps you in the challenge; one wrong pick eliminates you.",
    "The prize pool is shared among the participants who survive every game.",
    "Your stake for this game is debited when you submit your pick and is non-refundable once the game locks.",
    "Each game round requires a new stake; picks cannot be changed after submission.",
    "Game results are settled on the official 90-minute result.",
];

/** Remember locally which challenges this browser has joined, so My Bets
 * can list them (the API has no "my challenges" endpoint yet — only
 * per-challenge progress). */
const BET_FEEDBACK_MS = 6000;

// Per-game survivors count comes straight off the game object. The field
// name isn't fixed in the API doc yet, so a few likely spellings are
// accepted; the stat shows "—" until the backend sends one of them.
const SURVIVORS_KEYS = ["still_standing", "survivors_count", "survivor_count", "survivors_remaining", "survivors", "alive_count"];
const gameCount = (game, keys) => {
    const key = keys.find((k) => game?.[k] != null && game?.[k] !== "");
    return key ? game[key] : "—";
};

/** Survivors count for one game. */
const GameCounts = ({ game }) => (
    <div className="survivor-game-counts">
        <span>
            Survivors: <b className="survivor-yellow">{gameCount(game, SURVIVORS_KEYS)}</b>
        </span>
    </div>
);

/** Opens the challenge Terms & Conditions modal from game rows. */
const SurvivorTermsLink = ({ onOpen }) => (
    <button type="button" className="survivor-terms-link" onClick={onOpen}>
        Terms
    </button>
);

const SurvivorTermsModal = ({ show, onHide }) => (
    <Modal
        show={show}
        onHide={onHide}
        centered
        className="survivor-terms-modal"
    >
        <Modal.Header closeButton>
            <Modal.Title>Survivor Terms &amp; Conditions</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <ul className="survivor-terms-modal-list">
                {SURVIVOR_CHALLENGE_TERMS.map((term) => (
                    <li key={term}>{term}</li>
                ))}
            </ul>
        </Modal.Body>
        <Modal.Footer>
            <button type="button" className="survivor-terms-modal-close" onClick={onHide}>
                Close
            </button>
        </Modal.Footer>
    </Modal>
);

/** Empty state for the lobby — same look as the empty jackpots page
 * (illustration, title, subtitle). */
/** Shown when challenge/games UI cannot render yet — calm “check back” copy, not an error. */
const SURVIVOR_CHALLENGE_UNAVAILABLE_TITLE = "Next challenge coming soon";
const SURVIVOR_CHALLENGE_UNAVAILABLE_SUBTITLE =
    "The next challenge will be available in the next few hours. Check back and play.";
const SURVIVOR_GAMES_UNAVAILABLE_TITLE = "Games aren't available yet";

const SurvivorEmptyState = ({ title, subtitle }) => (
    <div className="col-md-12 text-center background-primary mt-2 no-events-div jackpot-empty-state">
        <img
            src={jackpotEmptyBall}
            alt=""
            aria-hidden="true"
            className="jackpot-empty-illustration"
        />
        <h3 className="jackpot-empty-title">{title}</h3>
        <p className="jackpot-empty-subtitle">{subtitle}</p>
    </div>
);

/** Page header in the same style as the Promotions page: full-width bar
 * with a round back button, centred title and a spacer to balance it. */
const SurvivorPageHeader = () => {
    const navigate = useNavigate();
    return (
        <header className="survivor-page-header">
            <button
                type="button"
                className="survivor-page-header__back"
                aria-label="Go back"
                onClick={() => navigate(-1)}
            >
                <FaArrowLeft />
            </button>
            <h1 className="survivor-page-header__title">Survivor Challenge</h1>
            <span className="survivor-page-header__spacer" aria-hidden="true" />
        </header>
    );
};

const rememberJoinedChallenge = (id) => {
    const existing = getFromLocalStorage(SURVIVOR_JOINED_STORAGE_KEY) || [];
    const list = Array.isArray(existing) ? existing : [];
    if (!list.some((entry) => String(entry) === String(id))) {
        setLocalStorage(SURVIVOR_JOINED_STORAGE_KEY, [...list, id], 1000 * 60 * 60 * 24 * 30);
    }
};

/** The challenge ids this browser has recorded as joined (see above),
 * as strings so callers can compare against challenge.id without
 * worrying about number/string mismatches. */
const getJoinedChallengeIds = () => {
    const joined = getFromLocalStorage(SURVIVOR_JOINED_STORAGE_KEY);
    const list = Array.isArray(joined) ? joined : [];
    return list.map((entry) => String(entry));
};

/** Status strings come back in whatever case the backend feels like
 * ("ACTIVE"/"active"/"Active", etc.) — always compare downcased. */
const statusIs = (value, expected) =>
    String(value ?? "").toLowerCase() === String(expected).toLowerCase();

/**
 * Lobby status filter buckets (challenge detail nav only). The API's own
 * challenge statuses are OPEN/ACTIVE/COMPLETED; mapped here to the
 * "active/ended/inactive" wording — OPEN (not started yet) reads as
 * "inactive", ACTIVE as "active", COMPLETED as "ended".
 */
const SURVIVOR_LOBBY_FILTERS = [
    { key: "all", label: "All" },
    { key: "mine", label: "Mine" },
    { key: "active", label: "Active", matchesStatus: "ACTIVE" },
    { key: "ended", label: "Ended", matchesStatus: "COMPLETED" },
    { key: "inactive", label: "Inactive", matchesStatus: "OPEN" },
];

const challengeMatchesFilter = (challenge, filterKey) => {
    if (filterKey === "all") return true;
    if (filterKey === "mine") {
        return getJoinedChallengeIds().includes(String(challenge?.id));
    }
    const filter = SURVIVOR_LOBBY_FILTERS.find((f) => f.key === filterKey);
    return filter ? statusIs(challenge?.status, filter.matchesStatus) : true;
};

/** Lobby tabs: Latest/Active (default) vs My History. */
const SURVIVOR_LOBBY_TABS = [
    { key: "latest", label: "Latest / Active" },
    { key: "history", label: "My History" },
];

/** OPEN (entries) and ACTIVE (in progress) both count as current/active. */
const isChallengeCurrentlyActive = (challenge) =>
    statusIs(challenge?.status, "OPEN") || statusIs(challenge?.status, "ACTIVE");

const isChallengeCompleted = (challenge) => statusIs(challenge?.status, "COMPLETED");

/** Prefer live /progress.enrolled; fall back to local joined-ids cache. */
const isEnrolledInChallenge = (challenge, progressByChallenge) => {
    const progress = progressByChallenge?.[challenge?.id];
    if (progress) return !!progress.enrolled;
    return getJoinedChallengeIds().includes(String(challenge?.id));
};

/** Win detection: progress.participant_status === "WINNER" (any case). */
const isWinnerOfChallenge = (challenge, progressByChallenge) =>
    statusIs(progressByChallenge?.[challenge?.id]?.participant_status, "WINNER");

/**
 * First game the user got wrong / dropped at. Prefers the first prediction
 * with result_status INCORRECT; falls back to games_survived + 1. Returns
 * null when we can't tell. Label includes team names when the challenge
 * games payload has them.
 */
const resolveDroppedAtGame = (challenge, progress) => {
    const predictions = progress?.predictions || [];
    const incorrect = predictions.find((p) => statusIs(p.result_status, "INCORRECT"));
    let gameNumber = incorrect?.game_number ?? null;
    if (gameNumber == null && progress?.games_survived != null) {
        gameNumber = Number(progress.games_survived) + 1;
    }
    if (gameNumber == null && progress?.current_game_number != null && statusIs(progress?.participant_status, "ELIMINATED")) {
        gameNumber = progress.current_game_number;
    }
    if (gameNumber == null) return null;

    const game = survivorGameList(challenge).find((g) => Number(g.game_number) === Number(gameNumber));
    const hasTeams = !!(game?.home_team || game?.away_team);
    const matchup = hasTeams
        ? `${game.home_team || "Home"} vs ${game.away_team || "Away"}`
        : null;
    return {
        gameNumber,
        label: matchup ? `Game ${gameNumber} (${matchup})` : `Game ${gameNumber}`,
    };
};

/**
 * Ineligible / missed-games copy. Enrolled vs not enrolled must not share
 * the same "you missed matches" implication — guests/non-enrolled players
 * never started, so they get join-oriented wording. Eliminated / dropped
 * players also get the first drop-out game when we can resolve it.
 */
const resolveIneligibleCopy = ({ enrolled, eliminated, challenge, progress }) => {
    if (!enrolled) {
        return {
            title: "Not eligible to join",
            text: "You aren't enrolled in this challenge. Earlier games have already progressed, so you can't start picking from here.",
            feedback: "Not eligible to join. You aren't enrolled, and earlier games have already progressed.",
        };
    }

    const dropped =
        eliminated ||
        (progress?.predictions || []).some((p) => statusIs(p.result_status, "INCORRECT"))
            ? resolveDroppedAtGame(challenge, progress)
            : null;

    if (dropped) {
        return {
            title: "Not eligible to play",
            text: `You dropped at ${dropped.label}. You can't continue in this challenge.`,
            feedback: `Not eligible to play. You dropped at ${dropped.label}.`,
        };
    }

    return {
        title: "Not eligible to play",
        text: "You missed out on some matches.",
        feedback: "Not eligible to play. You missed out on some matches.",
    };
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

/** Challenge-level status badge only (not used for game rows). The
 * challenge's own "In progress" (ACTIVE) state always renders green and
 * square-cornered, same as it always has. For every other status, color
 * instead reflects whether the viewer is enrolled: blue rounded if
 * enrolled, grey rounded if not. Label text is unaffected - only the
 * color/variant changes. */
const ChallengeStatusPill = ({ status, labels, enrolled }) => {
    // The challenge's own "In progress" (ACTIVE) state always wins and
    // stays green/square, as it always has - enrolled-vs-not only decides
    // the color for every other status (blue if enrolled, grey if not).
    const variant = statusIs(status, "ACTIVE") ? "active" : enrolled ? "enrolled" : "grey";
    return (
        <span className={`survivor-status-pill survivor-status-${variant}`}>
            {(labels && caseInsensitiveLabel(labels, status)) || status || "—"}
        </span>
    );
};

/** A nicer stand-in for the old plain "Loading…" text — a small spinning
 * ring plus the word itself with an animated ellipsis, instead of flat
 * dark text sitting on the dark page. */
const SurvivorLoading = ({ label }) => (
    <div className="survivor-loading">
        <span className="survivor-spinner" aria-hidden="true" />
        <span className="survivor-loading-text">
            {label}
            <span className="survivor-loading-dots" aria-hidden="true">
                <span></span>
                <span></span>
                <span></span>
            </span>
        </span>
    </div>
);

/** Circular won/lost/cancelled indicator shown next to "Your pick" once a
 * game is settled - green check when the pick was correct, red cross when
 * incorrect, grey dash for anything else (e.g. a voided/cancelled game). */
const OutcomeBadge = ({ resultStatus }) => {
    if (!resultStatus) return null;
    const isWon = statusIs(resultStatus, "CORRECT");
    const isLost = statusIs(resultStatus, "INCORRECT");
    const variant = isWon ? "won" : isLost ? "lost" : "cancelled";
    return (
        <span
            className={`survivor-outcome-badge survivor-outcome-${variant}`}
            title={resultStatus}
        >
            {isWon && <FaCheck aria-hidden="true" />}
            {isLost && <FaTimes aria-hidden="true" />}
            {!isWon && !isLost && <FaMinus aria-hidden="true" />}
        </span>
    );
};

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
                // Turns yellow the instant it's clicked (local draft); other
                // options keep the shared prematch odd-button look until
                // "Place" is pressed and the confirmation modal is accepted.
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
                        <span className="survivor-pick-odd">
                            {survivorOddValueForSelection(game, opt.value).toFixed(2)}
                        </span>
                    </button>
                );
            })}
        </div>
    );
};

/** Reusable "join + progress + games list" panel for one challenge — shared
 * between the standalone /survivor/:id page (SurvivorChallengeDetail below)
 * and each row of the lobby's challenges accordion, so expanding a challenge
 * inline shows the exact same games/picks UI as visiting its own page. It
 * deliberately fetches its own challenge/progress data (rather than being
 * handed it as props) so it can be dropped into either place with just an
 * id — the lobby accordion only mounts this for whichever row is currently
 * expanded, so it doesn't fire a request per challenge in the list, only
 * for the one actually opened. */
const SurvivorChallengeGames = ({ id }) => {
    const [, dispatch] = useContext(Context);
    const navigate = useNavigate();
    const user = getFromLocalStorage("user");
    const isSignedIn = !!user;

    const [challenge, setChallenge] = useState(null);
    const [progress, setProgress] = useState(null);
    const [fetching, setFetching] = useState(true);
    const [pendingGame, setPendingGame] = useState(null);
    const [showBlockReason, setShowBlockReason] = useState(false);
    // The pick the user clicked but hasn't confirmed yet — clicking 1/X/2
    // opens a confirmation modal instead of placing the bet immediately.
    const [pendingPick, setPendingPick] = useState(null);
    const [showPickTerms, setShowPickTerms] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const openTermsModal = () => setShowTermsModal(true);
    // Local, unsubmitted picks per game (gameNumber -> "1"/"X"/"2") — set
    // by clicking 1/X/2, cleared once that game's pick is confirmed (or
    // the confirm attempt finishes). Nothing is sent to the server until
    // "Place bet" is pressed for that game.
    const [draftPicks, setDraftPicks] = useState({});
    // Result of the last place-bet attempt, shown inline under the game's
    // Place bet button for a few seconds ({ gameNumber, type, message }) —
    // the confirm modal is already gone by then, so this is what keeps the
    // outcome visible. The button stays disabled until it clears.
    const [betFeedback, setBetFeedback] = useState(null);
    // Picks placed in this session (gameNumber -> "1"/"X"/"2"), so the 1X2
    // buttons disappear the moment a bet succeeds rather than after reload.
    const [placedPicks, setPlacedPicks] = useState({});
    const betFeedbackTimer = useRef(null);
    useEffect(() => () => clearTimeout(betFeedbackTimer.current), []);
    const showBetFeedback = (gameNumber, type, message) => {
        clearTimeout(betFeedbackTimer.current);
        setBetFeedback({ gameNumber, type, message });
        betFeedbackTimer.current = setTimeout(() => setBetFeedback(null), BET_FEEDBACK_MS);
    };

    // Once this panel has finished its first load, scroll the current/
    // latest game (it's the one rendered last, per orderedNonSettledGames
    // below) into view - on the lobby this is what actually needs
    // attention right after expanding a challenge's accordion row, rather
    // than leaving the user to scroll past every earlier game to reach
    // it. Only fires once per mount (a fresh expand), not on every
    // reload after placing a bet.
    const currentGameRowRef = useRef(null);
    const hasScrolledToCurrentGameRef = useRef(false);

    const loadAll = useCallback(async () => {
        setFetching(true);
        try {
            const detail = await fetchSurvivorChallenge(id);
            setChallenge(detail);
            if (isSignedIn) {
                const mine = await fetchSurvivorProgress(id);
                setProgress(mine);
                if (mine?.enrolled) {
                    rememberJoinedChallenge(id);
                }
            } else {
                setProgress(null);
            }
        } catch (error) {
            console.error("[Survivor Challenge] Failed to load challenge data", error);
            setChallenge(null);
            setProgress(null);
        } finally {
            setFetching(false);
        }
    }, [id, isSignedIn]);

    useEffect(() => {
        void loadAll();
    }, [loadAll]);

    useEffect(() => {
        if (hasScrolledToCurrentGameRef.current) return;
        if (fetching || !currentGameRowRef.current) return;
        hasScrolledToCurrentGameRef.current = true;
        currentGameRowRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    });

    const handlePick = async (gameNumber, selection) => {
        if (!user) {
            openLoginWithRedirect(dispatch, `/survivor/${id}`);
            return;
        }
        if (!canBetOnChallenge) {
            showBetFeedback(gameNumber, "error", "You cannot place a bet on this challenge.");
            return;
        }
        const game = survivorGameList(challenge).find((g) => g.game_number === gameNumber);
        if (!isSurvivorGameEligible(game)) {
            const ineligible = resolveIneligibleCopy({
                enrolled: !!progress?.enrolled,
                eliminated: statusIs(progress?.participant_status, "ELIMINATED"),
                challenge,
                progress,
            });
            showBetFeedback(gameNumber, "error", ineligible.feedback);
            return;
        }
        clearTimeout(betFeedbackTimer.current);
        setBetFeedback(null);
        setPendingGame(gameNumber);
        const outcome = await submitSurvivorPrediction(
            id,
            gameNumber,
            normalizeSelection(selection)
        );
        setPendingGame(null);
        if (outcome.success) {
            rememberJoinedChallenge(id);
            setPlacedPicks((prev) => ({ ...prev, [gameNumber]: normalizeSelection(selection) }));
            showBetFeedback(gameNumber, "success", "Pick submitted successfully.");
            void loadAll();
        } else if (!outcome.httpStatus) {
            showBetFeedback(gameNumber, "error", "Network error. Your pick was not submitted, please try again.");
        } else if (outcome.unauthorized) {
            showBetFeedback(
                gameNumber,
                "error",
                "Unauthorized — your session may have expired. Please log out and log in again, then retry."
            );
        } else {
            showBetFeedback(gameNumber, "error", outcome.message || "Could not submit pick. Please try again.");
        }
    };

    if (fetching && !challenge) {
        return <SurvivorLoading label="Loading challenge" />;
    }

    if (!challenge) {
        return <NoEvents message="This survivor challenge could not be found." />;
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
    const isChallengeOpenForEntry =
        statusIs(challengeStatus, "OPEN") || statusIs(challengeStatus, "ACTIVE");
    const canBetOnChallenge = isChallengeOpenForEntry && !isEliminated && !isWinner;
    const nonSettledGames = survivorGameList(challenge).filter((g) => !isGameSettled(g));
    const settledGames = survivorGameList(challenge).filter((g) => isGameSettled(g));

    // The current game - the one the user actually needs to act on next.
    // Prefer the real current_game_number from /progress when it's there;
    // otherwise fall back to the last game still in nonSettledGames (in
    // practice there's normally only one game open at a time anyway). It
    // always renders last in the list below, regardless of where it falls
    // in the challenge's own game order.
    // The challenge payload also names it (current_game_number).
    const currentGameNumber = progress?.current_game_number ?? challenge?.current_game_number ?? null;
    const currentGame =
        nonSettledGames.find(
            (g) => currentGameNumber != null && g.game_number === currentGameNumber
        ) || nonSettledGames[nonSettledGames.length - 1] || null;
    const orderedNonSettledGames = currentGame
        ? [
              ...nonSettledGames.filter((g) => g.game_number !== currentGame.game_number),
              currentGame,
          ]
        : nonSettledGames;

    /** Why the odds buttons are replaced with a reason link, and what the
     * modal behind it should say. Only meaningful when !canBetOnChallenge. */
    const resolveBlockReason = () => {
        if (!isChallengeOpenForEntry) {
            return {
                key: "closed",
                label: "Challenge closed",
                title: "Challenge closed",
                body: "This challenge isn't open for entry, so no bets can be placed on its games right now.",
            };
        }
        if (isEliminated) {
            const dropped = resolveDroppedAtGame(challenge, progress);
            return {
                key: "lost",
                label: "Not allowed (You lost)",
                title: "You lost",
                body: dropped
                    ? `You dropped at ${dropped.label}.`
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
        const game = survivorGameList(challenge).find((g) => g.game_number === gameNumber);
        if (isSignedIn && !isSurvivorGameEligible(game)) return;
        setPendingPick({ gameNumber, selection, existing: predictionFor(game) });
    };

    const cancelPendingPick = () => {
        setPendingPick(null);
        setShowPickTerms(false);
    };

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
        <>
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

            <div className="survivor-games-list">
                {orderedNonSettledGames.map((game, gameIndex) => {
                    const mine = predictionFor(game);
                    const canPick = isGamePickable(game);
                    const isCurrentGame = currentGame?.game_number === game.game_number;
                    // Position of this game within the currently-shown list
                    // (1-based), distinct from game.game_number - this is
                    // what "your game number" next to the current-game badge
                    // refers to, per explicit product decision.
                    const yourGameNumber = gameIndex + 1;
                    // Locked (picks closed) but betting on the challenge as a
                    // whole isn't currently allowed (challenge closed, user
                    // eliminated, or already won) - the specific case this
                    // row's controls need to reflect, rather than hiding the
                    // whole games list behind one summary row.
                    const isLockedOut = statusIs(game.status, "LOCKED") && !canBetOnChallenge;
                    const hasSubmittedPick = mine?.selection != null && mine.selection !== "";
                    const canBetOnThisGame = canPick && canBetOnChallenge && isCurrentGame;
                    // One pick per game, no changes: once a pick exists (from the
                    // server or just placed), the 1X2 buttons and Submit pick are
                    // replaced by "Your pick" + the result (--- until available).
                    const placedSelection = hasSubmittedPick
                        ? mine.selection
                        : placedPicks[game.game_number];
                    // Eligibility only gates placing a new pick for a signed-in
                    // user; an existing pick still shows below as usual. Guests
                    // keep the pick buttons, which lead to the login prompt.
                    const isEligibleToPlay = !isSignedIn || isSurvivorGameEligible(game);
                    const showPickControls = canBetOnThisGame && !placedSelection && isEligibleToPlay;
                    const showIneligibleNotice = canBetOnThisGame && !placedSelection && !isEligibleToPlay;
                    const ineligibleCopy = showIneligibleNotice
                        ? resolveIneligibleCopy({
                              enrolled: isEnrolled,
                              eliminated: isEliminated,
                              challenge,
                              progress,
                          })
                        : null;
                    // "Pick now" is the SCHEDULED / OPEN_FOR_PICKS status label —
                    // hide that CTA once the user already has a pick on this game
                    // (API selection, progress prediction, or just-submitted local).
                    const statusLabel = caseInsensitiveLabel(GAME_STATUS_LABELS, game.status);
                    const showStatusPill = !(placedSelection && statusLabel === "Pick now");
                    return (
                        <div
                            key={game.game_number}
                            className="survivor-game-row"
                            ref={isCurrentGame ? currentGameRowRef : undefined}
                        >
                            <div className="survivor-game-row-top">
                                {isCurrentGame ? (
                                    <span
                                        className={`survivor-current-game-badge${
                                            isLockedOut ? " survivor-current-game-blocked" : ""
                                        }`}
                                    >
                                        {isLockedOut
                                            ? "Not Allowed to Place bet."
                                            : `Today's Game ${game.game_number}`}
                                    </span>
                                ) : (
                                    <span className="survivor-game-number">Game {game.game_number}</span>
                                )}
                                {isCurrentGame && (
                                    <span className="survivor-your-game-number">
                                        your game number {yourGameNumber}
                                    </span>
                                )}
                                {showStatusPill && (
                                    <StatusPill status={game.status} labels={GAME_STATUS_LABELS} />
                                )}
                            </div>
                            <div className="survivor-game-teams">
                                {/* The survivor game payload has no home_team/away_team yet (only
                                    parent_match_id) - shows the literal placeholder for now, and
                                    will pick up real names automatically once the backend adds
                                    them, same fallback convention as betPickForSelection. */}
                                {game.home_team || "Home"} Vs {game.away_team || "Away"}
                            </div>
                            <div className="survivor-game-time">
                                Active until {formatDateTime(game.lock_at)}
                            </div>
                            <GameCounts game={game} />

                            {showPickControls && (
                                <>
                                    <PickButtons
                                        game={game}
                                        currentSelection={mine?.selection}
                                        draftSelection={draftPicks[game.game_number]}
                                        disabled={
                                            pendingGame === game.game_number ||
                                            betFeedback?.gameNumber === game.game_number
                                        }
                                        onPick={setDraftPick}
                                    />
                                    {draftPicks[game.game_number] && (
                                        <div className="survivor-game-outcome">
                                            <span className="survivor-your-pick">
                                                Your pick:{" "}
                                                <b>{normalizeSelection(draftPicks[game.game_number])}</b>
                                            </span>
                                            <span className="survivor-next-prize">
                                                Next prize will be: <b>—</b>
                                            </span>
                                        </div>
                                    )}
                                    <div className="survivor-place-btn-row">
                                        <span className="survivor-place-amount">
                                            Amount: <b>{formatMoney(challenge.entry_stake)}</b>
                                        </span>
                                        <button
                                            type="button"
                                            className="survivor-place-btn"
                                            disabled={
                                                !draftPicks[game.game_number] ||
                                                pendingGame === game.game_number ||
                                                betFeedback?.gameNumber === game.game_number
                                            }
                                            onClick={() =>
                                                requestPick(game.game_number, draftPicks[game.game_number])
                                            }
                                        >
                                            {pendingGame === game.game_number ? (
                                                <>
                                                    <span className="survivor-btn-spinner" aria-hidden="true" />
                                                    Submitting pick…
                                                </>
                                            ) : (
                                                "Submit pick"
                                            )}
                                        </button>
                                    </div>
                                    <div className="survivor-game-terms-row">
                                        <SurvivorTermsLink onOpen={openTermsModal} />
                                    </div>
                                    {betFeedback?.gameNumber === game.game_number && (
                                        <div
                                            className={`survivor-bet-feedback survivor-bet-feedback-${betFeedback.type}`}
                                            role="status"
                                        >
                                            {betFeedback.message}
                                        </div>
                                    )}
                                </>
                            )}

                            {showIneligibleNotice && ineligibleCopy && (
                                <div className="survivor-ineligible-notice" role="status">
                                    <FaBan className="survivor-ineligible-icon" aria-hidden="true" />
                                    <div>
                                        <div className="survivor-ineligible-title">{ineligibleCopy.title}</div>
                                        <div className="survivor-ineligible-text">{ineligibleCopy.text}</div>
                                    </div>
                                </div>
                            )}

                            {canBetOnThisGame && placedSelection && (
                                <>
                                    <div className="survivor-game-outcome">
                                        <span className="survivor-your-pick">
                                            Your pick: <b>{normalizeSelection(placedSelection)}</b>
                                        </span>
                                        <span className="survivor-result-line">
                                            Result: <b>{game.result ? normalizeSelection(game.result) : "---"}</b>
                                        </span>
                                        {!game.result && (
                                            <span className="survivor-result-status survivor-result-pending">
                                                Pending
                                            </span>
                                        )}
                                        <span className="survivor-next-prize">
                                            Next prize will be: <b>—</b>
                                        </span>
                                        <SurvivorTermsLink onOpen={openTermsModal} />
                                    </div>
                                    {betFeedback?.gameNumber === game.game_number && (
                                        <div
                                            className={`survivor-bet-feedback survivor-bet-feedback-${betFeedback.type}`}
                                            role="status"
                                        >
                                            {betFeedback.message}
                                        </div>
                                    )}
                                </>
                            )}

                            {!canBetOnThisGame && isLockedOut && (
                                <button
                                    type="button"
                                    className="survivor-blocked-link"
                                    onClick={() => setShowBlockReason(true)}
                                >
                                    Locked out
                                </button>
                            )}

                            {!canBetOnThisGame && !isLockedOut && (
                                <div className="survivor-game-outcome">
                                    <span className="survivor-your-pick">Your pick: <b>{mine?.selection ? normalizeSelection(mine.selection) : "N/A"}</b></span>
                                    {mine?.selection && (
                                        <span className="survivor-result-status survivor-result-pending">
                                            Pending
                                        </span>
                                    )}
                                    <span className="survivor-next-prize">
                                        Next prize will be: <b>—</b>
                                    </span>
                                    <SurvivorTermsLink onOpen={openTermsModal} />
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
                                {game.home_team || "Home"} Vs {game.away_team || "Away"}
                            </div>
                            <div className="survivor-game-time">
                                Active until {formatDateTime(game.lock_at)}
                            </div>
                            <GameCounts game={game} />

                            {(isEnrolled || mine) && (
                                <div className="survivor-game-outcome">
                                    <span className="survivor-your-pick">Your pick: <b>{mine?.selection ? normalizeSelection(mine.selection) : "N/A"}</b></span>
                                    {mine?.result_status && (
                                        <span className="survivor-outcome-line">
                                            Outcome: <OutcomeBadge resultStatus={mine.result_status} />
                                        </span>
                                    )}
                                    {game.result && <span className="survivor-result-line">Result: <b>{normalizeSelection(game.result)}</b></span>}
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
                    <Modal.Title>Confirm Your Pick</Modal.Title>
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
                        <span>Stake for this game</span>
                        <b>{formatMoney(challenge.entry_stake)}</b>
                    </div>
                    <div className="survivor-pick-confirm-row">
                        <span>Current participants</span>
                        <b>{challenge.participant_count ?? 0}</b>
                    </div>
                    <div className="survivor-pick-confirm-row">
                        <span>Amount to be won</span>
                        <b>{formatMoney(challenge.current_prize_pool)}</b>
                    </div>
                    <button
                        type="button"
                        className="survivor-pick-confirm-terms-toggle"
                        onClick={() => setShowPickTerms((v) => !v)}
                    >
                        {showPickTerms ? "Hide terms" : "Terms"}
                    </button>
                    {showPickTerms && (
                        <ul className="survivor-pick-confirm-terms">
                            {SURVIVOR_CHALLENGE_TERMS.map((term) => (
                                <li key={term}>{term}</li>
                            ))}
                        </ul>
                    )}
                    <p className="survivor-pick-confirm-note">
                        Your pick for this game is final and cannot be changed after you confirm.
                    </p>
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
                        {isEnrolled ? "Pay stake and submit pick" : "Join and submit pick"}
                    </button>
                </Modal.Footer>
            </Modal>

            <SurvivorTermsModal
                show={showTermsModal}
                onHide={() => setShowTermsModal(false)}
            />
        </>
    );
};

/** Which accordion row should start open on the lobby: the first
 * challenge (in the list's own order) this browser has actually joined
 * (survivorJoinedChallenges) - or, if it hasn't joined any of them, just
 * the first challenge in the list, so a row is always open by default. */
const defaultActiveKeyFor = (list) => {
    const challenges = list || [];
    if (challenges.length === 0) return null;
    const joinedIds = getJoinedChallengeIds();
    const firstJoined = challenges.find((c) => joinedIds.includes(String(c.id)));
    return String((firstJoined || challenges[0]).id);
};

/** One lobby accordion row — summary card + expand-to-games panel. */
const SurvivorLobbyChallengeItem = ({
    challenge,
    activeKey,
    progressByChallenge,
    showWonBadge = false,
}) => {
    const key = String(challenge.id);
    const isEnrolled = isEnrolledInChallenge(challenge, progressByChallenge);
    const won = showWonBadge && isWinnerOfChallenge(challenge, progressByChallenge);

    return (
        <Accordion.Item eventKey={key}>
            <Accordion.Header>
                <div className="survivor-accordion-content">
                    <div className="survivor-challenge-card-top">
                        <span className="survivor-challenge-name">{challenge.name}</span>
                        {won && (
                            <span className="survivor-won-badge" title="You won this challenge">
                                <FaTrophy aria-hidden="true" /> You won
                            </span>
                        )}
                        <ChallengeStatusPill
                            status={challenge.status}
                            labels={SURVIVOR_STATUS_LABELS}
                            enrolled={isEnrolled}
                        />
                        <div className="survivor-challenge-card-pool">
                            {formatMoney(challenge.current_prize_pool)}
                            <span className="survivor-challenge-card-pool-label">prize pool</span>
                        </div>
                    </div>
                    <div className="survivor-challenge-card-meta">
                        <span className="survivor-challenge-card-meta-item">
                            <FaUsers aria-hidden="true" />{" "}
                            <b className="survivor-yellow">{challenge.participant_count}</b> participants
                        </span>
                        {(challenge.maximum_games ?? challenge.minimum_games) != null && (
                            <span className="survivor-challenge-card-meta-item">
                                Game <b className="survivor-yellow">{challenge.current_game_number ?? 1}</b> of{" "}
                                <b className="survivor-yellow">
                                    {challenge.maximum_games ?? challenge.minimum_games}
                                </b>
                            </span>
                        )}
                    </div>
                    <div className="survivor-challenge-card-time">
                        {statusIs(challenge.status, "OPEN")
                            ? `Entries close ${formatDateTime(challenge.registration_closes_at)}`
                            : statusIs(challenge.status, "COMPLETED")
                              ? `Ended ${formatDateTime(challenge.end_at || challenge.start_at)}`
                              : `Started ${formatDateTime(challenge.start_at)}`}
                    </div>
                </div>
            </Accordion.Header>
            <Accordion.Body>
                {/* Only the expanded row fetches/renders games — mounting
                    SurvivorChallengeGames for every challenge would fire one
                    request per challenge. */}
                {activeKey === key && (
                    <SurvivorErrorBoundary variant="panel" resetKey={key}>
                        <SurvivorChallengeGames id={challenge.id} />
                    </SurvivorErrorBoundary>
                )}
            </Accordion.Body>
        </Accordion.Item>
    );
};

/** /survivor — lobby with Latest/Active + My History tabs. Expanding a
 * challenge still shows the same games/picks panel as /survivor/:id. */
const SurvivorChallengesList = () => {
    // Hydrate instantly from whatever was saved on the last visit, then
    // refresh from the network in the background.
    const [challenges, setChallenges] = useState(() => readStoredSurvivorChallenges());
    const [fetching, setFetching] = useState(() => !readStoredSurvivorChallenges());
    const [lobbyTab, setLobbyTab] = useState("latest");

    // Which challenge's row is expanded. Defaults once from cache / first
    // fetch, then never clobbers the user's own manual toggling.
    const [activeKey, setActiveKey] = useState(() => defaultActiveKeyFor(readStoredSurvivorChallenges()));
    const appliedDefaultActiveKeyRef = useRef(activeKey != null);

    useEffect(() => {
        let cancelled = false;
        fetchSurvivorChallenges().then((list) => {
            if (!cancelled) {
                setChallenges(list);
                persistSurvivorChallenges(list);
                setFetching(false);
                if (!appliedDefaultActiveKeyRef.current) {
                    appliedDefaultActiveKeyRef.current = true;
                    const defaultKey = defaultActiveKeyFor(list);
                    if (defaultKey != null) setActiveKey(defaultKey);
                }
            }
        }).catch((error) => {
            console.error("[Survivor Challenge] Failed to load challenge list", error);
            if (!cancelled) setFetching(false);
        });
        return () => { cancelled = true; };
    }, []);

    // One /progress call per challenge shown so enrolled/won badges reflect
    // the user's real state — only fetches ids not already populated.
    const [progressByChallenge, setProgressByChallenge] = useState({});
    useEffect(() => {
        const idsToFetch = (challenges || [])
            .map((c) => c.id)
            .filter((cid) => !(cid in progressByChallenge));
        if (idsToFetch.length === 0) return;
        let cancelled = false;
        Promise.all(
            idsToFetch.map((cid) =>
                fetchSurvivorProgress(cid)
                    .then((p) => [cid, p])
                    .catch(() => [cid, null])
            )
        ).then((results) => {
            if (cancelled) return;
            setProgressByChallenge((prev) => {
                const next = { ...prev };
                results.forEach(([cid, p]) => {
                    next[cid] = p;
                });
                return next;
            });
        });
        return () => { cancelled = true; };
    }, [challenges, progressByChallenge]);

    const list = challenges || [];

    // Tab 1 — Latest / Active:
    //   available: current (OPEN/ACTIVE) challenges the user is NOT enrolled in
    //   mineActive: enrolled challenges that are still current
    const availableActive = list.filter(
        (c) => isChallengeCurrentlyActive(c) && !isEnrolledInChallenge(c, progressByChallenge)
    );
    const myActiveChallenges = list.filter(
        (c) => isChallengeCurrentlyActive(c) && isEnrolledInChallenge(c, progressByChallenge)
    );

    // Tab 2 — My History: challenges the user participated in that are finished
    // (or still marked enrolled via local cache once completed).
    const historyChallenges = list.filter(
        (c) => isChallengeCompleted(c) && isEnrolledInChallenge(c, progressByChallenge)
    );

    const latestHasRows = availableActive.length > 0 || myActiveChallenges.length > 0;
    const historyHasRows = historyChallenges.length > 0;

    const renderAccordion = (rows, { showWonBadge = false } = {}) => {
        if (!rows.length) return null;
        return (
            <Accordion
                activeKey={activeKey}
                onSelect={(k) => setActiveKey(k)}
                className="survivor-challenge-accordion"
            >
                {rows.map((challenge) => (
                    <SurvivorLobbyChallengeItem
                        key={challenge.id}
                        challenge={challenge}
                        activeKey={activeKey}
                        progressByChallenge={progressByChallenge}
                        showWonBadge={showWonBadge}
                    />
                ))}
            </Accordion>
        );
    };

    return (
        <div className="survivor-page">
            <SurvivorPageHeader />
            <p className="survivor-page-subtitle">
                Pick one 1X2 result per game. One wrong pick and you're out —
                last player standing takes the pool.
            </p>

            <div className="survivor-lobby-sheet">
                <div className="survivor-lobby-tabs" role="tablist" aria-label="Survivor lobby">
                    {SURVIVOR_LOBBY_TABS.map((tab) => (
                        <button
                            key={tab.key}
                            type="button"
                            role="tab"
                            id={`survivor-tab-${tab.key}`}
                            aria-selected={lobbyTab === tab.key}
                            aria-controls={`survivor-panel-${tab.key}`}
                            className={`survivor-lobby-tab${lobbyTab === tab.key ? " is-active" : ""}`}
                            onClick={() => setLobbyTab(tab.key)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="survivor-lobby-panels">
                    <div
                        id="survivor-panel-latest"
                        role="tabpanel"
                        aria-labelledby="survivor-tab-latest"
                        hidden={lobbyTab !== "latest"}
                    >
                        {lobbyTab === "latest" && (
                            <>
                                {fetching && !challenges && (
                                    <SurvivorLoading label="Loading challenges" />
                                )}

                                {!fetching && list.length < 1 && (
                                    <SurvivorEmptyState
                                        title="There are no survivor challenges at the moment."
                                        subtitle="Check back later for new challenges and a chance to be the last one standing!"
                                    />
                                )}

                                {list.length > 0 && !latestHasRows && (
                                    <SurvivorEmptyState
                                        title="No active challenges right now."
                                        subtitle="When a new challenge opens, it will show up here."
                                    />
                                )}

                                {availableActive.length > 0 && renderAccordion(availableActive)}

                                {myActiveChallenges.length > 0 && (
                                    <section className="survivor-lobby-section">
                                        <h2 className="survivor-lobby-section-title">My active challenges</h2>
                                        {renderAccordion(myActiveChallenges)}
                                    </section>
                                )}
                            </>
                        )}
                    </div>

                    <div
                        id="survivor-panel-history"
                        role="tabpanel"
                        aria-labelledby="survivor-tab-history"
                        hidden={lobbyTab !== "history"}
                    >
                        {lobbyTab === "history" && (
                            <>
                                {fetching && !challenges && (
                                    <SurvivorLoading label="Loading challenges" />
                                )}

                                {!fetching && !historyHasRows && (
                                    <SurvivorEmptyState
                                        title="No challenge history yet."
                                        subtitle="Challenges you join will appear here once they finish."
                                    />
                                )}

                                {historyHasRows &&
                                    renderAccordion(historyChallenges, { showWonBadge: true })}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

/** /survivor/:id — one challenge's own page: nav (status filter + challenge
 * switcher + refresh), header stats, then the same games/picks panel the
 * lobby's accordion rows show inline (SurvivorChallengeGames above). */
const SurvivorChallengeDetail = ({ id }) => {
    const navigate = useNavigate();

    const [challenge, setChallenge] = useState(null);
    const [results, setResults] = useState(null);
    const [progress, setProgress] = useState(null);
    const [fetching, setFetching] = useState(true);

    // The "All challenges" back-link is now two dropdowns: a status
    // filter, and a challenge picker built from that same locally-stored
    // list the /survivor lobby caches (readStoredSurvivorChallenges /
    // persistSurvivorChallenges) - only the Refresh button below actually
    // calls the API again; otherwise this just reads what's already
    // stored, hydrating once from the network if nothing was cached yet
    // (e.g. this challenge was opened directly, without visiting the
    // lobby first).
    const [allChallenges, setAllChallenges] = useState(() => readStoredSurvivorChallenges() || []);
    const [challengeNavFilter, setChallengeNavFilter] = useState("all");
    const [refreshingChallenges, setRefreshingChallenges] = useState(false);

    useEffect(() => {
        if (allChallenges.length > 0) return;
        let cancelled = false;
        fetchSurvivorChallenges().then((list) => {
            if (!cancelled) {
                setAllChallenges(list);
                persistSurvivorChallenges(list);
            }
        }).catch((error) => {
            console.error("[Survivor Challenge] Failed to load challenge navigation", error);
        });
        return () => { cancelled = true; };
    }, [allChallenges.length]);

    const handleRefreshChallenges = async () => {
        setRefreshingChallenges(true);
        try {
            const list = await fetchSurvivorChallenges();
            setAllChallenges(list);
            persistSurvivorChallenges(list);
        } catch (error) {
            console.error("[Survivor Challenge] Failed to refresh challenge list", error);
        } finally {
            setRefreshingChallenges(false);
        }
    };

    useEffect(() => {
        let cancelled = false;
        setFetching(true);
        Promise.all([
            fetchSurvivorChallenge(id),
            fetchSurvivorResults(id),
            fetchSurvivorProgress(id).catch(() => null),
        ]).then(([detail, aggregate, progressData]) => {
            if (cancelled) return;
            setChallenge(detail);
            setResults(aggregate);
            setProgress(progressData);
        }).catch((error) => {
            console.error("[Survivor Challenge] Failed to load challenge detail", error);
            if (!cancelled) {
                setChallenge(null);
                setResults(null);
                setProgress(null);
            }
        }).finally(() => {
            if (!cancelled) setFetching(false);
        });
        return () => { cancelled = true; };
    }, [id]);

    if (fetching && !challenge) {
        return <div className="survivor-page"><SurvivorLoading label="Loading challenge" /></div>;
    }

    if (!challenge) {
        return (
            <div className="survivor-page">
                <NoEvents message="This survivor challenge could not be found." />
            </div>
        );
    }

    const filteredChallengeNavOptions = allChallenges.filter((c) =>
        challengeMatchesFilter(c, challengeNavFilter)
    );

    return (
        <div className="survivor-page">
            <SurvivorPageHeader />

            <div className="survivor-detail-nav">
                <select
                    className="survivor-lobby-filter-select survivor-detail-nav-status"
                    value={challengeNavFilter}
                    onChange={(e) => setChallengeNavFilter(e.target.value)}
                >
                    {SURVIVOR_LOBBY_FILTERS.map((filter) => (
                        <option key={filter.key} value={filter.key}>
                            {filter.label}
                        </option>
                    ))}
                </select>

                <div className="survivor-detail-nav-challenge-group">
                    <select
                        className="survivor-lobby-filter-select survivor-detail-nav-challenge"
                        value={String(id)}
                        onChange={(e) => {
                            if (!e.target.value) {
                                navigate("/survivor");
                            } else {
                                navigate(`/survivor/${e.target.value}`);
                            }
                        }}
                    >
                        <option value="">← All challenges</option>
                        {filteredChallengeNavOptions.map((c) => (
                            <option key={c.id} value={String(c.id)}>
                                {c.name}
                            </option>
                        ))}
                    </select>

                    <button
                        type="button"
                        className="survivor-detail-nav-refresh"
                        disabled={refreshingChallenges}
                        onClick={handleRefreshChallenges}
                    >
                        {refreshingChallenges ? "Refreshing…" : "Refresh"}
                    </button>
                </div>
            </div>

            <div className="survivor-detail-card">
            <div className="survivor-detail-header">
                <div className="survivor-detail-header-top">
                    <h2 className="survivor-detail-title">{challenge.name}</h2>
                    <ChallengeStatusPill
                        status={challenge.status}
                        labels={SURVIVOR_STATUS_LABELS}
                        enrolled={
                            progress
                                ? !!progress.enrolled
                                : getJoinedChallengeIds().includes(String(challenge.id))
                        }
                    />
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
                        <span className="survivor-stat-value survivor-yellow">{results?.survivors_remaining ?? "—"}</span>
                        <span className="survivor-stat-label">Survivors left</span>
                    </div>
                    <div className="survivor-stat">
                        <span className="survivor-stat-value survivor-yellow">{challenge.participant_count}</span>
                        <span className="survivor-stat-label">Players</span>
                    </div>
                    <div className="survivor-stat">
                        <span className="survivor-stat-value survivor-yellow">
                            {results?.initial_participants ??
                                results?.total_participants ??
                                challenge.participant_count}
                        </span>
                        <span className="survivor-stat-label">Initially enrolled</span>
                    </div>
                    <div className="survivor-stat">
                        <span className="survivor-stat-value">
                            {challenge.current_game_number ?? 1} / {challenge.maximum_games ?? challenge.minimum_games ?? "—"}
                        </span>
                        <span className="survivor-stat-label">Game no.</span>
                    </div>
                    <div className="survivor-stat">
                        <span className="survivor-stat-value">{formatMoney(challenge.entry_stake)}</span>
                        <span className="survivor-stat-label">Entry stake</span>
                    </div>
                </div>
            </div>

            <div className="survivor-detail-body">
                <SurvivorErrorBoundary variant="panel" resetKey={id}>
                    <SurvivorChallengeGames id={id} />
                </SurvivorErrorBoundary>
            </div>
            </div>
        </div>
    );
};

class SurvivorErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, message: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, message: error?.message || null };
    }

    componentDidCatch(error, errorInfo) {
        console.error("[Survivor Challenge] Render failed", error, errorInfo);
    }

    componentDidUpdate(prevProps) {
        if (this.state.hasError && prevProps.resetKey !== this.props.resetKey) {
            this.setState({ hasError: false, message: null });
        }
    }

    render() {
        if (this.state.hasError) {
            if (this.props.variant === "panel") {
                return (
                    <div className="survivor-games-unavailable" role="status">
                        <SurvivorEmptyState
                            title={SURVIVOR_GAMES_UNAVAILABLE_TITLE}
                            subtitle={SURVIVOR_CHALLENGE_UNAVAILABLE_SUBTITLE}
                        />
                    </div>
                );
            }
            return (
                <div className="survivor-page" role="status">
                    <SurvivorPageHeader />
                    <SurvivorEmptyState
                        title={SURVIVOR_CHALLENGE_UNAVAILABLE_TITLE}
                        subtitle={SURVIVOR_CHALLENGE_UNAVAILABLE_SUBTITLE}
                    />
                </div>
            );
        }

        return this.props.children;
    }
}

const Survivor = () => {
    const { id } = useParams();
    // Browser tab title for the lobby and the challenge page; restored on leave.
    useEffect(() => {
        const previous = document.title;
        document.title = "Survivor Challenge - Betmundial";
        return () => {
            document.title = previous;
        };
    }, [id]);
    return (
        <SurvivorErrorBoundary key={id || "survivor-lobby"}>
            {id ? <SurvivorChallengeDetail id={id} /> : <SurvivorChallengesList />}
        </SurvivorErrorBoundary>
    );
};

export default Survivor;
