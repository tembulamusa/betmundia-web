const now = () => (new Date()).getTime();

/** Persist logged-in user for a week (default setLocalStorage TTL is only 1 hour). */
export const USER_STORAGE_TTL_MS = 1000 * 60 * 60 * 24 * 7;

export const getFromLocalStorage = (key) => {
    let entry = window.localStorage.getItem(key);
    if (!entry || entry == undefined || entry == "undefined") {
        return null;
    }
    let entry_data = JSON.parse(entry);
    let expiry = entry_data.now + entry_data.ttl;

    if (entry_data.ttl && expiry < now()) {
        window.localStorage.removeItem(key);
        return null;
    }
    return entry_data.value;
}
//will keep item for 10mins where ttl is not provided
export const setLocalStorage = (key, value, ttl) => {
    window.localStorage.setItem(key, JSON.stringify({
        ttl: ttl || 60 * 60 * 1000,
        now: now(),
        value: value
    }));
}
export const removeItem = (key) => {
    window.localStorage.removeItem(key);
}