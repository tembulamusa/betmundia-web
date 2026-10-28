/**
 * localStorage TTL helper. Does NOT open the login modal.
 * Session end / login is driven only by HTTP 401/403 (see session-auth).
 */
const checkIfExpired = () => {
    try {
        const raw = window.localStorage.getItem("user");

        if (!raw || raw === "undefined") return false;

        const parsed = JSON.parse(raw);

        const expiry = parsed.now + parsed.ttl;

        if (parsed.ttl && expiry < Date.now()) {
            window.localStorage.removeItem("user");
            return true;
        }

        return false;
    } catch (err) {
        console.error("Expiry check failed:", err);
        return false;
    }
};

export default checkIfExpired;
