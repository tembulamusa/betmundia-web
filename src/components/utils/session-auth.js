import { removeItem } from "./local-storage";
import { openLoginWithRedirect } from "./login-redirect";

let unauthorizedInFlight = false;
let authDispatch = null;
let clearUserCb = null;

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
    clearUserCb = setUser || null;
};

export const isUnauthorizedStatus = (status) => [401, 403].includes(Number(status));

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

/**
 * Clear auth and open login once per dead-session wave.
 * Only call for real HTTP 401/403 (or refresh that proves the session is dead).
 * Prefer the login modal + loginRedirect; fall back to /login?next= if handlers
 * are not wired yet.
 */
export const logoutDueToUnauthorized = ({ next } = {}) => {
    if (unauthorizedInFlight) {
        return;
    }
    unauthorizedInFlight = true;

    const destination = next || getCurrentPageNext();

    removeItem("user");
    if (typeof clearUserCb === "function") {
        clearUserCb(null);
    }

    if (authDispatch) {
        authDispatch({ type: "DEL", key: "user" });
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
