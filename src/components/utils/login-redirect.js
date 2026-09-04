export const LOGIN_REDIRECT_KEY = "loginRedirect";

/**
 * Open the login modal and remember where to send the user after success.
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
 * Resolve post-login destination from context and/or ?next= query.
 * @returns {string|null}
 */
export const resolveLoginRedirect = (loginRedirect, search = "") => {
    const fromQuery = new URLSearchParams(search).get("next");
    return loginRedirect || fromQuery || null;
};
