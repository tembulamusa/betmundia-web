import { getFromLocalStorage, removeItem } from "./local-storage";
import { openLoginWithRedirect } from "./login-redirect";

let unauthorizedInFlight = false;
let authDispatch = null;
let setUserCb = null;
let promptLoginPromise = null;

/** Auth endpoints where 401/403 means bad credentials, not a dead session. */
const AUTH_STATUS_SKIP_PREFIXES = [
    "/auth/login",
    "/auth/signup",
    "/auth/register",
    "/auth/forgot",
    "/auth/reset",
    "/auth/verify",
    "/auth/otp",
    "/auth/token/refresh",
];

/** Wire React state from Header so forced logout can clear context + user. */
export const registerSessionAuthHandlers = ({ dispatch, setUser } = {}) => {
    authDispatch = dispatch || null;
    setUserCb = setUser || null;
};

export const isUnauthorizedStatus = (status) => [401, 403].includes(Number(status));

/**
 * Refresh (and some auth) endpoints can return HTTP 200 with a business failure:
 * `{ status: "E0006", result: "JWT token expired" }`. Treat as a dead session.
 */
export const isJwtExpiredBusinessFailure = (payload) => {
    if (payload == null) {
        return false;
    }
    if (typeof payload !== "object") {
        const bare = String(payload).trim();
        if (bare.toUpperCase() === "E0006") {
            return true;
        }
        return /jwt\s*token\s*expired/i.test(bare);
    }
    const status = String(payload.status ?? "").trim().toUpperCase();
    if (status === "E0006") {
        return true;
    }
    return /jwt\s*token\s*expired/i.test(String(payload.result ?? ""));
};

/** HTTP 401/403 or refresh body E0006 / "JWT token expired". */
export const isDeadSessionFailure = (status, response = null) => {
    if (isUnauthorizedStatus(status)) {
        return true;
    }
    if (isJwtExpiredBusinessFailure(status)) {
        return true;
    }
    return Boolean(response && isJwtExpiredBusinessFailure(response));
};

export const shouldSkipUnauthorizedLogout = (url = "") => {
    const path = String(url).split("?")[0];
    return AUTH_STATUS_SKIP_PREFIXES.some(
        (prefix) => path === prefix || path.endsWith(prefix) || path.includes(`${prefix}/`)
    );
};

/** Latest page for post-login return (path + search + hash). */
export const getCurrentPageNext = () => {
    const { pathname, search, hash } = window.location;
    if (["/login", "/logout", "/signup"].includes(pathname)) {
        return new URLSearchParams(search).get("next") || "/";
    }
    return `${pathname}${search || ""}${hash || ""}`;
};

export const resetUnauthorizedGuard = () => {
    unauthorizedInFlight = false;
};

const applyRecoveredUser = (user) => {
    if (typeof setUserCb === "function") {
        setUserCb(user);
    }
    if (authDispatch) {
        authDispatch({ type: "SET", key: "user", payload: user });
        authDispatch({ type: "DEL", key: "showloginmodal" });
        authDispatch({ type: "DEL", key: "sessionMessage" });
    }
};

/**
 * Clear auth and open login once per dead-session wave.
 * Call for HTTP 401/403 or refresh business failures (E0006 / JWT expired).
 * Prefer the login modal + loginRedirect; fall back to /login?next= if handlers
 * are not wired yet.
 */
export const logoutDueToUnauthorized = ({ next } = {}) => {
    if (unauthorizedInFlight) {
        return;
    }
    unauthorizedInFlight = true;

    const destination = next || getCurrentPageNext();

    // Match intentional /logout: flush client storage so stale tokens cannot linger.
    try {
        window.localStorage.clear();
    } catch (_) {
        removeItem("user");
    }
    if (typeof setUserCb === "function") {
        setUserCb(null);
    }

    if (authDispatch) {
        authDispatch({ type: "DEL", key: "user" });
        authDispatch({ type: "DEL", key: "mybets" });
        authDispatch({ type: "DEL", key: "sessionMessage" });
        openLoginWithRedirect(authDispatch, destination || "/");
        return;
    }

    if (window.location.pathname.startsWith("/login")) {
        unauthorizedInFlight = false;
        return;
    }
    const loginUrl = `/login?next=${encodeURIComponent(destination || "/")}`;
    window.location.assign(loginUrl);
};

/**
 * Attempt refresh_token before opening the login modal.
 * Recovers the session when only the access JWT is stale; opens login only when
 * there is no user / no refresh_token, or refresh returns 401/403 / E0006.
 * Concurrent callers share one in-flight attempt.
 * @returns {Promise<{ opened: boolean, recovered: boolean, transient?: boolean, user?: object }>}
 */
export const promptLoginModal = async ({ next } = {}) => {
    if (promptLoginPromise) {
        return promptLoginPromise;
    }

    promptLoginPromise = (async () => {
        const user = getFromLocalStorage("user");
        if (user?.refresh_token) {
            // Dynamic import avoids a static cycle with fetch-request → session-auth.
            const { refreshUserSession } = await import("./fetch-request");
            const refresh = await refreshUserSession({ force: true });
            if (refresh.success) {
                applyRecoveredUser(refresh.user);
                resetUnauthorizedGuard();
                return { opened: false, recovered: true, user: refresh.user };
            }
            // Network / 5xx: keep stored user and do not pop login.
            // E0006 / "JWT token expired" on HTTP 200 is a dead session, not transient.
            if (!isDeadSessionFailure(refresh.status, refresh.response)) {
                console.warn("[session] refresh before login modal failed transiently", refresh.status);
                return { opened: false, recovered: false, transient: true };
            }
        } else if (!user) {
            // Intentional logged-out surface: open modal without clearing anything.
            if (unauthorizedInFlight) {
                return { opened: true, recovered: false };
            }
            if (authDispatch) {
                openLoginWithRedirect(authDispatch, next || getCurrentPageNext() || "/");
                return { opened: true, recovered: false };
            }
            logoutDueToUnauthorized({ next });
            return { opened: true, recovered: false };
        }

        // User present but refresh_token missing, or refresh returned 401/403 / E0006.
        logoutDueToUnauthorized({ next });
        return { opened: true, recovered: false };
    })();

    try {
        return await promptLoginPromise;
    } finally {
        promptLoginPromise = null;
    }
};
