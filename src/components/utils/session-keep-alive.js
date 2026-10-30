import { getFromLocalStorage } from "./local-storage";
import { refreshUserSession } from "./fetch-request";
import { isUnauthorizedStatus, logoutDueToUnauthorized } from "./session-auth";

/**
 * Re-refresh from the last successful refresh (or login).
 * Access JWTs are ~1h; stay well under that so background timer throttling
 * does not leave the client on an expired Bearer until the next tick.
 */
export const TOKEN_REFRESH_INTERVAL_MS = 30 * 60 * 1000;
const RETURN_DEBOUNCE_MS = 1000;
const TRANSIENT_RETRY_MS = 60 * 1000;

let scheduleTimer = null;
let returnDebounceTimer = null;
let started = false;
let refreshPromise = null;
let onUserUpdated = null;

const clearSchedule = () => {
    if (scheduleTimer) {
        clearTimeout(scheduleTimer);
    }
    scheduleTimer = null;
};

const scheduleNext = (delayMs = TOKEN_REFRESH_INTERVAL_MS) => {
    clearSchedule();
    scheduleTimer = setTimeout(() => {
        void runScheduledRefresh();
    }, delayMs);
};

const isLoggedIn = () => Boolean(getFromLocalStorage("user")?.refresh_token);

/**
 * Mark tokens as fresh (login / verify success) and restart the keep-alive timer.
 */
export const noteSessionAuthenticated = () => {
    if (started && isLoggedIn()) {
        scheduleNext();
    }
};

/**
 * Coalesced refresh used by the keep-alive scheduler and tab-return handlers.
 * Resolves to the shared refreshUserSession result.
 */
export const runScheduledRefresh = () => {
    if (!isLoggedIn()) {
        clearSchedule();
        return Promise.resolve({ success: false, status: 401, response: null });
    }
    if (refreshPromise) {
        return refreshPromise;
    }

    refreshPromise = (async () => {
        try {
            const refresh = await refreshUserSession();
            if (refresh.success) {
                if (typeof onUserUpdated === "function" && refresh.user) {
                    onUserUpdated(refresh.user);
                }
                scheduleNext();
                return refresh;
            }
            const status = Number(refresh.status);
            if (isUnauthorizedStatus(status)) {
                logoutDueToUnauthorized();
                clearSchedule();
                return refresh;
            }
            // Network / 5xx / other: keep the session and retry soon. Never open login from the timer alone.
            console.warn("[session] token refresh failed, will retry", refresh.status);
            scheduleNext(TRANSIENT_RETRY_MS);
            return refresh;
        } catch (error) {
            console.warn("[session] token refresh failed, will retry", error);
            scheduleNext(TRANSIENT_RETRY_MS);
            return { success: false, status: null, response: null };
        } finally {
            refreshPromise = null;
        }
    })();

    return refreshPromise;
};

const onUserReturned = () => {
    if (document.visibilityState && document.visibilityState !== "visible") {
        return;
    }
    if (!isLoggedIn()) {
        return;
    }
    clearTimeout(returnDebounceTimer);
    returnDebounceTimer = setTimeout(() => {
        void runScheduledRefresh();
    }, RETURN_DEBOUNCE_MS);
};

const attachReturnListeners = () => {
    document.addEventListener("visibilitychange", onUserReturned);
    window.addEventListener("focus", onUserReturned);
};

/**
 * Single app-wide keep-alive: 30 min from last success + refresh on tab return.
 * Safe to call more than once; later calls only update the user callback.
 */
export const startSessionKeepAlive = ({ onUserUpdated: cb } = {}) => {
    if (typeof cb === "function") {
        onUserUpdated = cb;
    }
    if (started) {
        return;
    }
    started = true;
    attachReturnListeners();

    if (isLoggedIn()) {
        // Page load / first start: refresh now, then arm the timer from success.
        void runScheduledRefresh();
    }
};

export const stopSessionKeepAlive = () => {
    started = false;
    clearSchedule();
    clearTimeout(returnDebounceTimer);
    document.removeEventListener("visibilitychange", onUserReturned);
    window.removeEventListener("focus", onUserReturned);
};
