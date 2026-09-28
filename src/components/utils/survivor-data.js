import makeRequest from "./fetch-request";

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

const SUCCESS_STATUSES = ["200", "201", 200, 201];

export const isSurvivorSuccess = (httpStatus, response) =>
    SUCCESS_STATUSES.includes(httpStatus) &&
    SUCCESS_STATUSES.includes(response?.status);

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

/** POST /user/survivor/challenges/{id}/join — debits wallet, enrolls user. */
export const joinSurvivorChallenge = async (id) => {
    const [httpStatus, response] = await makeRequest({
        url: `/user/survivor/challenges/${id}/join`,
        method: "POST",
        api_version: 2,
    });
    return {
        success: isSurvivorSuccess(httpStatus, response),
        httpStatus,
        message: response?.result,
        data: response?.data || null,
    };
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
        message: response?.result,
        data: response?.data || null,
    };
};

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
    OPEN_FOR_PICKS: "Pick now",
    LOCKED: "Locked",
    SETTLED: "Settled",
};

export const PARTICIPANT_STATUS_LABELS = {
    ALIVE: "Still alive",
    ELIMINATED: "Eliminated",
    WINNER: "Winner",
};

/** "X" and "x" are the same pick — normalize so UI comparisons are simple. */
export const normalizeSelection = (selection) =>
    selection == null ? null : String(selection).toUpperCase();
