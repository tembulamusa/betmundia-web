import { setLocalStorage, getFromLocalStorage } from './local-storage';
import {
    isUnauthorizedStatus,
    logoutDueToUnauthorized,
    shouldSkipUnauthorizedLogout,
} from './session-auth';

const ENC_KEY = '2bdVweTeI42s5mkLdYHyklTMxQS5gLA7MDS6FA9cs1uobDXeruACDic0YSU3si04JGZe4Y';
const BASE_URL = process.env.REACT_APP_BASE_URL;
const BASE2_URL = process.env.REACT_APP_BASE2_URL;
const ACCOUNTS_URL = process.env.REACT_APP_ACCOUNTS_URL;
const CASINOGAMES = process.env.REACT_APP_CASINO_URL;
const CASINOGAMELaunch = process.env.REACT_APP_CASINO_LAUNCH_URL;
const CASINOFAZI = process.env.REACT_APP_CASINOFAZI_URL;
const SURECOIN_URL = process.env.REACT_APP_SURECOIN_URL;
const SUREBOX_URL = process.env.REACT_APP_SUREBOX_URL;
const PRAGMATIC_JACKPOT_URL = process.env.REACT_APP_PRAGMATIC_JACKPOT_URL;
const AVIATRIX_URL = process.env.REACT_APP_AVIATRIX_URL;
const CASINO_INTOUCHVAS_URL = process.env.REACT_APP_INTOUCHVAS_URL; // split the pot casino
const CASINO_PRAGMATIC_URL = process.env.REACT_APP_PRAGMATIC_URL; // pragmatic
const CASINO_SMARTSOFT_URL = process.env.REACT_APP_SMARTSOFT_URL; // smartsoft
let tokenRefreshPromise = null;
let tokenRefreshCompletedAt = 0;

const joinBaseUrl = (base, path) => {
    if (!base) {
        return path;
    }
    if (!path) {
        return base;
    }
    const normalizedBase = String(base).replace(/\/+$/, "");
    const normalizedPath = String(path).replace(/^\/+/, "");
    return `${normalizedBase}/${normalizedPath}`;
};

const makeRequest = async ({ url, method, data = null, use_jwt = false, api_version = 1, responseType = "json" }) => {
    // const 
    if (api_version == 2) {
        // BASE2_URL is typically .../v2 with no trailing slash; paths may or may not start with /
        url = joinBaseUrl(BASE2_URL, url);
    } else {
        if (api_version == 3) {
            url = joinBaseUrl(ACCOUNTS_URL, url);
        } else {
            if (api_version == "sureCoin") {
                url = joinBaseUrl(SURECOIN_URL, url);
            } else if (api_version == "sureBox") {
                url = joinBaseUrl(SUREBOX_URL, url);
            } else if (api_version == "casinoGames") {
                url = joinBaseUrl(CASINOGAMES, url);
            } else if (api_version == "CasinoGameLaunch") {
                url = joinBaseUrl(CASINOGAMELaunch, url);
            } else if (api_version == "casinoJackpots") {
                url = joinBaseUrl(PRAGMATIC_JACKPOT_URL, url);
            }
        }
    }
    let headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "origin": "betmundial.com"
    };

    let user = getFromLocalStorage('user');



    const token = user?.token;
    if (token) {
        headers = { ...headers, ...{ Authorization: "Bearer " + token } }
    }

    try {
        let request = {
            method: method,
            mode: 'cors',
            cache: 'no-cache',
            // credentials: 'same-origin',
            headers: headers,
            redirect: 'follow',
            // referrerPolicy: 'no-referrer',
        }
        if (data) {
            request['body'] = JSON.stringify(data)
        }
        const response = await fetch(url, request);
        let result;
        if (responseType == "text") {
            result = await response?.text()
        } else {
            result = await response?.json();
        }
        let status = response?.status;
        // Dead session: only real HTTP 401/403 from non-auth requests force login.
        // Timers never open login on their own; refresh failures are handled in keep-alive.
        if (
            isUnauthorizedStatus(status) &&
            !shouldSkipUnauthorizedLogout(url) &&
            getFromLocalStorage("user")
        ) {
            logoutDueToUnauthorized();
        }
        return [status, result];
    } catch (err) {
        let status = err.response?.status,
            result = err.response?.data;
        return [status, result]
    } finally {
        // updateUserSession();
    }
};

export default makeRequest;

/** Refresh and persist the current user's session, sharing concurrent calls. */
export const refreshUserSession = async () => {
    const current = getFromLocalStorage("user");
    if (!current?.refresh_token) {
        return { success: false, status: 401, response: null };
    }

    // Header and protected pages mount together. Reuse a just-completed refresh
    // so they don't rotate the same refresh token twice in quick succession.
    if (Date.now() - tokenRefreshCompletedAt < 30_000) {
        return { success: true, user: getFromLocalStorage("user") || current, status: 200 };
    }
    if (tokenRefreshPromise) {
        return tokenRefreshPromise;
    }

    tokenRefreshPromise = (async () => {
        const [status, response] = await makeRequest({
            url: "/auth/token/refresh",
            method: "POST",
            data: { refresh_token: current.refresh_token },
            api_version: 2,
        });
        if ([200, 201, 204].includes(status) && [200, 201, "200", "201"].includes(response?.status) && response?.data) {
            const latest = getFromLocalStorage("user") || current;
            const user = { ...latest, ...response.data };
            setLocalStorage("user", user, 1000 * 60 * 60 * 24 * 7);
            tokenRefreshCompletedAt = Date.now();
            return { success: true, user, status, response };
        }
        return { success: false, status: response?.status || status, response };
    })();

    try {
        return await tokenRefreshPromise;
    } finally {
        tokenRefreshPromise = null;
    }
};
