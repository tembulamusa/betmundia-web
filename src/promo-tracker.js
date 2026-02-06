import React, { useEffect, useRef } from "react";
import { useLocation } from 'react-router-dom';
import { Context } from "./context/store";

export const PromoTracker = () => {
    const location = useLocation();
    const [state, dispatch] = React.useContext(Context);
    const promoInfoRef = useRef(null);
    const promoTimestampRef = useRef(null);

    useEffect(() => {
        const now = new Date().getTime();

        // Check if promo info is valid based on the timestamp
        if (promoTimestampRef.current && now - promoTimestampRef.current < 30 * 60 * 1000) {
            if (promoInfoRef.current !== state?.promoInfo) {
                dispatch({ type: "SET", key: "promoInfo", payload: promoInfoRef.current });
            }
        } else {
            if (promoInfoRef.current !== null) {
                promoInfoRef.current = null;
                promoTimestampRef.current = null;
                dispatch({ type: "SET", key: "promoInfo", payload: null });
            }
        }
    }, [state.promoInfo]);

    useEffect(() => {
        const path = location.pathname;

        // Check if the user is coming from an external source or root
        const referrer = document.referrer;
        const isExternalNavigation = !referrer || !referrer.includes("betmundial.com");

        if (isExternalNavigation && path !== "/") {
            const promoName = path.startsWith("/") ? path.slice(1) : path;

            if (promoName !== promoInfoRef.current) {
                const now = new Date().getTime();
                promoInfoRef.current = promoName;
                promoTimestampRef.current = now;
                dispatch({ type: "SET", key: "promoInfo", payload: promoName });
            }
        }
    }, [location]);

    return null;
};
