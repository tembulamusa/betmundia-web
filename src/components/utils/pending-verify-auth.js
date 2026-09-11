const SESSION_KEY = "bm_pending_verify_auth";

/**
 * Short-lived registration credentials for auto-login after OTP verify.
 * sessionStorage only — cleared after successful login or explicitly.
 */
export function savePendingVerifyAuth({ msisdn, password }) {
    if (typeof window === "undefined" || !msisdn || !password) return;
    try {
        window.sessionStorage.setItem(
            SESSION_KEY,
            JSON.stringify({ msisdn, password })
        );
    } catch {
        /* ignore quota / private mode */
    }
}

export function getPendingVerifyAuth() {
    if (typeof window === "undefined") return null;
    try {
        const raw = window.sessionStorage.getItem(SESSION_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed?.msisdn || !parsed?.password) return null;
        return parsed;
    } catch {
        return null;
    }
}

export function clearPendingVerifyAuth() {
    if (typeof window === "undefined") return;
    try {
        window.sessionStorage.removeItem(SESSION_KEY);
    } catch {
        /* ignore */
    }
}
