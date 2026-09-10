import makeRequest from "./fetch-request";
import { getFromLocalStorage, setLocalStorage } from "./local-storage";

export const JACKPOT_TYPES_STORAGE_KEY = "jackpotTypes";
export const JACKPOT_ARCHIVE_STORAGE_KEY = "jackpotArchive";
export const TYPE_QUERY_PARAM = "type";
export const JACKPOT_PATH = "/jackpots";

const TYPES_TTL_MS = 24 * 60 * 60 * 1000;
const ARCHIVE_TTL_MS = 60 * 60 * 1000;

export const typeKey = (item) =>
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

/** Slug used in `/jackpots?type=` (e.g. last-man-standing). */
export const typeParamValue = (item) => {
    const slug = item?.jackpot_type || item?.type || item?.slug || item?.key;
    if (slug != null && slug !== "") {
        return String(slug);
    }
    return String(typeKey(item) ?? "");
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

    if (Array.isArray(payload)) {
        return asList(payload);
    }
    if (Array.isArray(payload?.jackpots)) {
        return asList(payload.jackpots);
    }
    if (Array.isArray(payload?.types)) {
        return asList(payload.types);
    }
    if (
        Array.isArray(payload?.data) &&
        (payload.data[0]?.jackpot_name || payload.data[0]?.jackpot_event_id)
    ) {
        return asList(payload.data);
    }
    if (
        payload?.jackpot_event_id ||
        payload?.jackpot_name ||
        payload?.jackpot_type ||
        payload?.type
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
 * Fetch jackpot types from API, update localStorage + context.
 * Falls back to cached types when the request fails.
 */
export const refreshJackpotTypes = async (dispatch) => {
    const [status, result] = await makeRequest({
        url: "/jackpot/list",
        method: "GET",
        api_version: 2,
    });

    if (status == 200) {
        const types = normalizeJackpotTypes(result?.data ?? result);
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

export const jackpotsPathWithType = (typeSlug) => {
    const value = typeSlug != null && typeSlug !== "" ? String(typeSlug) : "";
    if (!value) {
        return JACKPOT_PATH;
    }
    return `${JACKPOT_PATH}?${TYPE_QUERY_PARAM}=${encodeURIComponent(value)}`;
};
