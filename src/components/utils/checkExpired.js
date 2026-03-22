const checkIfExpired = () => {
    try {
        const raw = window.localStorage.getItem("user");

        if (!raw || raw === "undefined") return false;

        const parsed = JSON.parse(raw);

        const expiry = parsed.now + parsed.ttl;

        if (parsed.ttl && expiry < Date.now()) {
            // ❌ expired → cleanup
            window.localStorage.removeItem("user");

            // remove from global state
            dispatch({ type: "DEL", key: "user" });

            // show login modal
            dispatch({ type: "SET", key: "showloginmodal", payload: true });

            return true;
        }

        return false;
    } catch (err) {
        console.error("Expiry check failed:", err);
        return false;
    }
};