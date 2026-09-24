import makeRequest from "./fetch-request";
import { getFromLocalStorage, setLocalStorage, removeItem } from "./local-storage";

export const JACKPOT_TYPES_STORAGE_KEY = "jackpotTypes";
export const JACKPOT_ARCHIVE_STORAGE_KEY = "jackpotArchive";
export const JACKPOT_GAMES_STORAGE_KEY = "jackpotGames";
export const TYPE_QUERY_PARAM = "type";
export const JACKPOT_PATH = "/jackpots";

const TYPES_TTL_MS = 24 * 60 * 60 * 1000;
const ARCHIVE_TTL_MS = 60 * 60 * 1000;
const GAMES_TTL_MS = 4 * 60 * 60 * 1000;

export const typeKey = (item) =>
    item?.jackpot_type_id ??
    item?.jackpot_event_id ??
    item?.id ??
    item?.jackpot_type ??
    item?.type ??
    item?.jackpot_name ??
    item?.name;

export const typeLabel = (item) =>
    item?.jackpot_name ||
    item?.name ||
    item?.jackpot_type ||
    item?.type ||
    "Jackpot";

/** Slug used in `/jackpots?type=` (e.g. 1x2). */
export const typeParamValue = (item) => {
    const slug = item?.jackpot_type || item?.type || item?.slug || item?.key;
    if (slug != null && slug !== "") {
        return String(slug);
    }
    return String(typeKey(item) ?? "");
};

/** Numeric/string id used when requesting /jackpot/matches?id= */
export const resolveJackpotTypeId = (item) => {
    if (!item) return null;
    const id =
        item.jackpot_event_id ??
        item.jackpot_type_id ??
        item.id ??
        item.key;
    if (id == null || id === "") return null;
    return id;
};

/**
 * Resolve which stored jackpot type the browser URL refers to.
 * Match ?type= against localStorage/context list; otherwise use the first entry.
 */
export const resolveJackpotTypeFromParam = (types, param) => {
    const list = Array.isArray(types) ? types.filter(Boolean) : [];
    if (!list.length) return null;
    if (param != null && param !== "") {
        const matched = list.find((item) => matchesTypeParam(item, param));
        if (matched) return matched;
    }
    return list[0];
};

export const matchesTypeParam = (item, param) => {
    if (param == null || param === "") {
        return false;
    }
    const value = String(param);
    return [
        item?.jackpot_type,
        item?.type,
        item?.slug,
        item?.jackpot_type_id,
        item?.jackpot_event_id,
        item?.id,
        item?.key,
        typeKey(item),
    ]
        .filter((candidate) => candidate != null && candidate !== "")
        .some((candidate) => String(candidate) === value);
};

export const normalizeJackpotTypes = (payload) => {
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

    // API: { status, result, data: [ { jackpot_type_id, name, jackpot_name, type, ... } ] }
    if (Array.isArray(payload)) {
        return asList(payload);
    }
    if (Array.isArray(payload?.data)) {
        return asList(payload.data);
    }
    if (Array.isArray(payload?.content)) {
        return asList(payload.content);
    }
    if (Array.isArray(payload?.data?.content)) {
        return asList(payload.data.content);
    }
    if (Array.isArray(payload?.jackpots)) {
        return asList(payload.jackpots);
    }
    if (Array.isArray(payload?.types)) {
        return asList(payload.types);
    }
    if (Array.isArray(payload?.results)) {
        return asList(payload.results);
    }
    if (Array.isArray(payload?.items)) {
        return asList(payload.items);
    }
    if (
        payload?.jackpot_type_id ||
        payload?.jackpot_event_id ||
        payload?.jackpot_name ||
        payload?.jackpot_type ||
        payload?.type ||
        payload?.name
    ) {
        return asList([payload]);
    }

    return [];
};

export const readStoredJackpotTypes = () => {
    const stored = getFromLocalStorage(JACKPOT_TYPES_STORAGE_KEY);
    return Array.isArray(stored) ? stored : [];
};

export const getJackpotTypes = (state) => {
    if (Array.isArray(state?.jackpotTypes) && state.jackpotTypes.length) {
        return state.jackpotTypes;
    }
    return readStoredJackpotTypes();
};

export const persistJackpotTypes = (types, dispatch) => {
    if (!Array.isArray(types) || !types.length) {
        return types || [];
    }
    setLocalStorage(JACKPOT_TYPES_STORAGE_KEY, types, TYPES_TTL_MS);
    if (dispatch) {
        dispatch({ type: "SET", key: "jackpotTypes", payload: types });
    }
    return types;
};

/**
 * Fetch jackpot type list for the jackpots header strip.
 * GET /jackpot/list → { status, result, data: [ { jackpot_type_id, name, ... } ] }
 * Does not change /jackpots page route or /jackpot/matches.
 */
export const refreshJackpotTypes = async (dispatch) => {
    const [status, result] = await makeRequest({
        url: "/jackpot/list",
        method: "GET",
        api_version: 2,
    });

    if (status == 200 || String(result?.status) === "200") {
        const types = normalizeJackpotTypes(result);
        if (types.length) {
            return persistJackpotTypes(types, dispatch);
        }
    }

    const cached = readStoredJackpotTypes();
    if (cached.length) {
        if (dispatch) {
            dispatch({ type: "SET", key: "jackpotTypes", payload: cached });
        }
        return cached;
    }

    return [];
};

export const archiveStorageKeyForType = (typeSlug) =>
    `${JACKPOT_ARCHIVE_STORAGE_KEY}:${typeSlug || "default"}`;

export const readStoredJackpotArchive = (typeSlug) =>
    getFromLocalStorage(archiveStorageKeyForType(typeSlug));

export const persistJackpotArchive = (typeSlug, archivePayload, dispatch) => {
    if (!archivePayload) {
        return archivePayload;
    }
    setLocalStorage(
        archiveStorageKeyForType(typeSlug),
        archivePayload,
        ARCHIVE_TTL_MS
    );
    if (dispatch) {
        dispatch({
            type: "SET",
            key: "jackpotArchive",
            payload: { type: typeSlug, data: archivePayload },
        });
    }
    return archivePayload;
};

/** localStorage key for cached /jackpot/matches games, per jackpot type id. */
export const gamesStorageKeyForId = (typeId) =>
    `${JACKPOT_GAMES_STORAGE_KEY}:${typeId != null && typeId !== "" ? String(typeId) : "default"}`;

export const readStoredJackpotGames = (typeId) => {
    if (typeId == null || typeId === "") return null;
    return getFromLocalStorage(gamesStorageKeyForId(typeId));
};

export const persistJackpotGames = (typeId, gamesPayload) => {
    if (typeId == null || typeId === "" || !gamesPayload) {
        return gamesPayload;
    }
    setLocalStorage(gamesStorageKeyForId(typeId), gamesPayload, GAMES_TTL_MS);
    return gamesPayload;
};

export const clearStoredJackpotGames = (typeId) => {
    if (typeId == null || typeId === "") return;
    removeItem(gamesStorageKeyForId(typeId));
};

export const jackpotsPathWithType = (typeSlug) => {
    const value = typeSlug != null && typeSlug !== "" ? String(typeSlug) : "";
    if (!value) {
        return JACKPOT_PATH;
    }
    return `${JACKPOT_PATH}?${TYPE_QUERY_PARAM}=${encodeURIComponent(value)}`;
};
