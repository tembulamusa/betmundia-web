import makeRequest from "./fetch-request";
import { getFromLocalStorage, setLocalStorage } from "./local-storage";

/**
 * Survivor Challenge API helpers.
 *
 * Not a jackpot — a "last one standing" challenge: pick one 1X2 result per
 * game, one wrong pick and you're out. Lives on its own page (/survivor),
 * separate from /jackpots.
 *
 * All endpoints are under api_version 2 (BASE2_URL already resolves to
 * .../v2), so paths below omit the /v2 prefix — see fetch-request.js.
 *
 * Envelope: { status, result, error, data } — same bet-api convention used
 * everywhere else in this app. `status` is returned as a string ("200").
 */

/**
 * Best human-readable message from the bet-api envelope. Errors arrive as
 * { result: "Failed", error: { code, description, message } }, so the
 * generic "Failed" in `result` is skipped in favour of the error message.
 */
export const survivorResponseMessage = (response) => {
    const err = response?.error;
    const errMessage = typeof err === "string" ? err : err?.message || err?.description;
    const result = response?.result;
    const usefulResult = result && !/^failed$/i.test(String(result)) ? result : null;
    return errMessage || usefulResult || response?.message || null;
};

const SUCCESS_STATUSES = ["200", "201", 200, 201];

export const isSurvivorSuccess = (httpStatus, response) =>
    SUCCESS_STATUSES.includes(httpStatus) &&
    SUCCESS_STATUSES.includes(response?.status);

/**
 * The lobby list is cached to localStorage every time it loads
 * successfully, so the status filter on that page can show right away
 * from "earlier saved" data (and still work for a moment offline) while
 * a fresh fetch runs in the background.
 */
export const SURVIVOR_CHALLENGES_CACHE_KEY = "survivorChallengesList";
const CHALLENGES_CACHE_TTL_MS = 60 * 60 * 1000;

export const readStoredSurvivorChallenges = () => {
    const stored = getFromLocalStorage(SURVIVOR_CHALLENGES_CACHE_KEY);
    return Array.isArray(stored) ? stored : null;
};

export const persistSurvivorChallenges = (list) => {
    if (!Array.isArray(list)) {
        return list;
    }
    setLocalStorage(SURVIVOR_CHALLENGES_CACHE_KEY, list, CHALLENGES_CACHE_TTL_MS);
    return list;
};

/** GET /survivor/challenges — public list of challenges (lobby). */
export const fetchSurvivorChallenges = async () => {
    const [httpStatus, response] = await makeRequest({
        url: "/survivor/challenges",
        method: "GET",
        api_version: 2,
    });
    if (isSurvivorSuccess(httpStatus, response)) {
        return Array.isArray(response?.data) ? response.data : [];
    }
    return [];
};

/** GET /survivor/challenges/{id}/games — visible games only (poll-friendly). */
export const fetchSurvivorGames = async (id) => {
    const [httpStatus, response] = await makeRequest({
        url: `/survivor/challenges/${id}/games`,
        method: "GET",
        api_version: 2,
    });
    if (isSurvivorSuccess(httpStatus, response)) {
        return Array.isArray(response?.data) ? response.data : [];
    }
    return [];
};

/** GET /survivor/challenges/{id} — public challenge detail + games list. */
export const fetchSurvivorChallenge = async (id) => {
    const [httpStatus, response] = await makeRequest({
        url: `/survivor/challenges/${id}`,
        method: "GET",
        api_version: 2,
    });
    if (isSurvivorSuccess(httpStatus, response)) {
        return response?.data || null;
    }
    return null;
};

/** GET /survivor/challenges/{id}/results — aggregate status (public). */
export const fetchSurvivorResults = async (id) => {
    const [httpStatus, response] = await makeRequest({
        url: `/survivor/challenges/${id}/results`,
        method: "GET",
        api_version: 2,
    });
    if (isSurvivorSuccess(httpStatus, response)) {
        return response?.data || null;
    }
    return null;
};

/**
 * GET /user/survivor/challenges/{id}/progress — the logged-in user's own
 * pick-by-pick progress in a challenge: enrolled?, alive/eliminated,
 * games survived, and the per-game predictions array.
 */
export const fetchSurvivorProgress = async (id) => {
    const [httpStatus, response] = await makeRequest({
        url: `/user/survivor/challenges/${id}/progress`,
        method: "GET",
        api_version: 2,
    });
    if (isSurvivorSuccess(httpStatus, response)) {
        return response?.data || null;
    }
    return null;
};

/**
 * POST /user/survivor/challenges/{id}/games/{gameNumber}/prediction
 * selection must be "1", "X" (or "x"), or "2".
 */
export const submitSurvivorPrediction = async (id, gameNumber, selection) => {
    const [httpStatus, response] = await makeRequest({
        url: `/user/survivor/challenges/${id}/games/${gameNumber}/prediction`,
        method: "POST",
        data: { selection },
        api_version: 2,
    });
    return {
        success: isSurvivorSuccess(httpStatus, response),
        httpStatus,
        unauthorized: httpStatus === 401,
        message: survivorResponseMessage(response),
        data: response?.data || null,
    };
};

const Float = (equation, precision = 4) =>
    Math.ceil(equation * (10 ** precision)) / (10 ** precision);

/** Fallback when a game has no 1X2 outcomes yet (e.g. match not priced). */
export const SURVIVOR_ARBITRARY_ODD = 2.0;

const outcomeField = (row, snake, camel) => row?.[snake] ?? row?.[camel];

/** Map 1 / X / 2 pick to a row in `game.odds["1x2"].outcomes` (Betradar-style 1,2,3). */
export const survivorOutcomeForSelection = (game, selection) => {
    const outcomes = game?.odds?.["1x2"]?.outcomes;
    if (!Array.isArray(outcomes) || outcomes.length === 0) {
        return null;
    }
    const sel = normalizeSelection(selection);
    const findByOutcomeId = (id) =>
        outcomes.find((o) => String(outcomeField(o, "outcome_id", "outcomeId")) === id);

    if (sel === "1") {
        return findByOutcomeId("1") || outcomes[0];
    }
    if (sel === "2") {
        return findByOutcomeId("3") || outcomes[outcomes.length - 1];
    }
    return findByOutcomeId("2") || outcomes[Math.min(1, outcomes.length - 1)];
};

export const survivorOddForSelection = (game, selection) => {
    const row = survivorOutcomeForSelection(game, selection);
    const value = outcomeField(row, "odd_value", "oddValue");
    return value != null && value !== "" ? Number(value) : SURVIVOR_ARBITRARY_ODD;
};

export const survivorOddValueForSelection = (game, selection) =>
    Float(survivorOddForSelection(game, selection), 2);

/** GET /user/survivor/challenges/{id}/results — same shape as the public one. */
export const fetchSurvivorUserResults = async (id) => {
    const [httpStatus, response] = await makeRequest({
        url: `/user/survivor/challenges/${id}/results`,
        method: "GET",
        api_version: 2,
    });
    if (isSurvivorSuccess(httpStatus, response)) {
        return response?.data || null;
    }
    return null;
};

export const SURVIVOR_STATUS_LABELS = {
    OPEN: "Open for entries",
    ACTIVE: "In progress",
    COMPLETED: "Completed",
};

export const GAME_STATUS_LABELS = {
    // Real responses use SCHEDULED, not OPEN_FOR_PICKS as originally
    // assumed from the API spec — keep both mapped, harmless either way.
    SCHEDULED: "Pick now",
    OPEN_FOR_PICKS: "Pick now",
    LOCKED: "Locked",
    SETTLED: "Settled",
    COMPLETED: "Settled",
    FINISHED: "Settled",
};

export const PARTICIPANT_STATUS_LABELS = {
    // Some environments send "ACTIVE" for a still-in participant instead
    // of "ALIVE" — accept both (case-insensitive lookup is done at the
    // call site via caseInsensitiveLabel()).
    ALIVE: "Still alive",
    ACTIVE: "Still alive",
    ELIMINATED: "Eliminated",
    WINNER: "Winner",
};

/** Case-insensitive lookup into a STATUS_LABELS map — backend status
 * strings show up in whatever case ("ACTIVE"/"active"/"Active"), so a
 * plain labels[status] lookup silently misses anything not upper-case. */
export const caseInsensitiveLabel = (labels, status) => {
    if (status == null) return undefined;
    const key = Object.keys(labels || {}).find(
        (k) => k.toLowerCase() === String(status).toLowerCase()
    );
    return key ? labels[key] : undefined;
};

/** "X" and "x" are the same pick — normalize so UI comparisons are simple. */
export const normalizeSelection = (selection) =>
    selection == null ? null : String(selection).toUpperCase();
