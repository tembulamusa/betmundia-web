import React, { useContext } from "react";
import { Context } from "../../context/store";

/**
 * Blinking purple header text shown while the logged-in user has an unused
 * free bet. Clicking it opens the free bet modal.
 */
const FreebetNotice = ({ user, className = "" }) => {
    const [state, dispatch] = useContext(Context);

    if (!user?.token || Number(user?.has_freebet) !== 1 || state?.freebetAvailable !== true) {
        return null;
    }

    return (
        <button
            type="button"
            className={`freebet-notice ${className}`.trim()}
            onClick={() => dispatch({ type: "SET", key: "showfreebetmodal", payload: true })}
        >
            Freebet
        </button>
    );
};

export default React.memo(FreebetNotice);
