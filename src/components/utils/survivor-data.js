import makeRequest from "./fetch-request";
import { getFromLocalStorage, setLocalStorage } from "./local-storage";
import { getStoredIpAddress } from "./ip-address";

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

const Float = (equation, precision = 4) =>
    Math.ceil(equation * (10 ** precision)) / (10 ** precision);

const cleanUcn = (value) =>
    String(value).replace(/[^A-Za-z0-9-]/g, "").replace(/-+/g, "-");

/**
 * bet_type tag for a survivor-challenge pick placed through the regular
 * placebet flow. This app's existing convention (see betslip-submit-form.js
 * / jackpot.js) already overloads bet_type as a context tag rather than a
 * pure prematch/live flag: "0" prematch, "1" live, "3" share-existing bet,
 * "9" jackpot. Nothing is reserved for survivor yet, so "10" is used here —
 * confirm with backend and change this one constant if a different code is
 * expected.
 */
export const SURVIVOR_PLACEBET_TYPE = "10";

// TODO: no real per-game odds from the API yet — a survivor game only
// carries game_number/status/scheduled_at/lock_at/result, no match_id,
// team names, or odds. Using one arbitrary odd value for every 1X2
// outcome for now, per instruction, until the backend adds real match/odds
// data to each game. Swap this out for game.odds["1x2"].outcomes[i] once
// that's available.
export const SURVIVOR_ARBITRARY_ODD = 2.0;

const betPickForSelection = (game, selection) => {
    switch (normalizeSelection(selection)) {
        case "1": return game?.home_team;
        case "2": return game?.away_team;
        default: return "Draw";
    }
};

/**
 * Places a real bet for one survivor-challenge game pick, through the same
 * placebet endpoint every other bet in this app uses (not the challenge's
 * own /prediction endpoint) — so a survivor pick is a genuine, tracked bet.
 *
 * Reuses a freebet automatically when the user has one available, the same
 * way src/components/highlights/free-bet.js does, otherwise stakes the
 * challenge's entry_stake as a normal bet.
 *
 * NOTE: this assumes each `game` carries real match data (match_id,
 * home_team, away_team, sport_name) the same shape jackpot.js's matches
 * use — the survivor game object as currently wired up
 * (game_number/status/scheduled_at/lock_at/result only) does not expose
 * these yet, so the backend/data layer needs to add them for a fully
 * valid bet. Odds are arbitrary for now (see SURVIVOR_ARBITRARY_ODD).
 */
export const placeSurvivorGameBet = async (challenge, game, selection) => {
    const oddValue = Float(SURVIVOR_ARBITRARY_ODD, 2);
    const betPick = betPickForSelection(game, selection);
    const subTypeId = game?.sub_type_id ?? 1;

    const slip = {
        match_id: String(game?.match_id ?? ""),
        parent_match_id: String(game?.parent_match_id ?? game?.match_id ?? ""),
        special_bet_value: "",
        sub_type_id: String(subTypeId),
        away_team: game?.away_team,
        bet_pick: betPick,
        bet_type: SURVIVOR_PLACEBET_TYPE,
        home_team: game?.home_team,
        live: 0,
        market_active: 1,
        odd_type: game?.odd_type || "1x2",
        odd_value: oddValue.toFixed(2),
        producer_id: String(game?.producer_id || "3"),
        sport_name: game?.sport_name || "Soccer",
        ucn: cleanUcn(`${game?.match_id ?? ""}${subTypeId}${betPick ?? ""}`),
    };

    const user = getFromLocalStorage("user");
    const hasFreebet = !!user?.has_freebet;
    const stakeAmount = challenge?.entry_stake ?? 0;

    const payload = {
        bet_string: "web",
        app_name: "web",
        channel_id: "web",
        possible_win: Float(stakeAmount * oddValue, 2),
        stake_amount: stakeAmount,
        amount: stakeAmount,
        bet_total_odds: oddValue,
        ip_address: String(getStoredIpAddress() || ""),
        slip: [slip],
        profile_id: user?.profile_id,
        account: 1,
        msisdn: user?.msisdn,
        accept_all_odds_change: 1,
        bet_type: SURVIVOR_PLACEBET_TYPE,
        // Lets the backend attribute this placebet to the survivor
        // challenge/game it came from, on top of the bet_type tag above.
        placebet_type: "survivor_challenge",
        survivor_challenge_id: challenge?.id,
        survivor_game_number: game?.game_number,
    };

    // Same URL every other bet in this app posts to — not a dedicated
    // survivor endpoint. Freebet, when the user has one, goes through its
    // own dedicated endpoint instead, same as free-bet.js.
    const endpoint = hasFreebet ? "/user/place-free-bet" : "/user/place-bet";

    const [httpStatus, response] = await makeRequest({
        url: endpoint,
        method: "POST",
        data: payload,
        api_version: 2,
    });

    const success = isSurvivorSuccess(httpStatus, response) || [200, 201, 204].includes(httpStatus);

    if (success && hasFreebet) {
        setLocalStorage("user", { ...user, has_freebet: 0 });
    }

    return {
        success,
        httpStatus,
        message: response?.result || response?.message,
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
