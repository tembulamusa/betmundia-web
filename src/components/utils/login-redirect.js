import { getFromLocalStorage } from "./local-storage";

export const LOGIN_REDIRECT_KEY = "loginRedirect";

const isHomePath = (pathname = "") =>
    pathname === "/" || pathname === "/home";

/**
 * Open the login modal and remember where to send the user after success.
 * Intentional CTAs (Login button, Deposit while logged out) use this directly.
 * Session-expiry paths should use promptLoginModal in session-auth.js instead
 * so a refresh is attempted first.
 * @param {Function} dispatch - context dispatch
 * @param {string} path - intended destination (e.g. "/affiliate")
 */
export const openLoginWithRedirect = (dispatch, path) => {
    if (path) {
        dispatch({ type: "SET", key: LOGIN_REDIRECT_KEY, payload: path });
    }
    dispatch({ type: "SET", key: "showloginmodal", payload: true });
};

export const clearLoginRedirect = (dispatch) => {
    dispatch({ type: "DEL", key: LOGIN_REDIRECT_KEY });
};

/**
 * Close the login modal when a recoverable session is still in localStorage
 * (e.g. Home / logo click while the access JWT was stale but user remains).
 * Also kicks a best-effort token refresh so the stored user stays current.
 * @returns {boolean} true if the modal was dismissed
 */
export const dismissLoginModalIfSessionPresent = (dispatch) => {
    if (!dispatch || !getFromLocalStorage("user")) {
        return false;
    }
    dispatch({ type: "DEL", key: "showloginmodal" });
    dispatch({ type: "DEL", key: LOGIN_REDIRECT_KEY });
    // Fire-and-forget: Home dismiss should not wait on the network.
    import("./fetch-request")
        .then(({ refreshUserSession }) => refreshUserSession({ force: true }))
        .catch(() => {});
    return true;
};

/** True when navigating to the sports home surface. */
export const isHomeNavigationPath = isHomePath;

/**
 * Resolve post-login destination from context and/or ?next= query.
 * @returns {string|null}
 */
export const resolveLoginRedirect = (loginRedirect, search = "") => {
    const fromQuery = new URLSearchParams(search).get("next");
    return loginRedirect || fromQuery || null;
};
