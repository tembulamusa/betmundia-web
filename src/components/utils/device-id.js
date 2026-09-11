const DEVICE_ID_KEY = "bm_device_id";

/**
 * Stable web device id for socket OTP / verification subscriptions.
 * Persisted in localStorage so reconnects reuse the same channel.
 */
export function getOrCreateDeviceId() {
    if (typeof window === "undefined") {
        return null;
    }
    try {
        let id = window.localStorage.getItem(DEVICE_ID_KEY);
        if (id) return id;
        id =
            (typeof crypto !== "undefined" && crypto.randomUUID
                ? crypto.randomUUID()
                : null) ||
            `web-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
        window.localStorage.setItem(DEVICE_ID_KEY, id);
        return id;
    } catch {
        return `web-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    }
}
