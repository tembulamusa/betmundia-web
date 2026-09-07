import React, { useEffect, useMemo, useRef } from "react";
import '../../assets/css/theme.css';

const SPORT_RADAR_CLIENT_ID = "d9d6a9c373db18dfdf63352e1c1d9321";
const WIDGET_LOADER_SRC = `https://widgets.sir.sportradar.com/${SPORT_RADAR_CLIENT_ID}/widgetloader`;
const WIDGET_TYPE = "match.lmtPlus";

const ensureSirLoader = () => {
    if (typeof window === "undefined" || typeof window.SIR === "function") {
        return;
    }

    // Official SIR queue stub so add/remove calls made before the script
    // finishes loading are replayed against the live DOM (by selector).
    const sir = function sir() {
        (sir.q = sir.q || []).push(arguments);
    };
    sir.l = Date.now();
    sir.o = {
        theme: false,
        language: "en",
    };
    window.SIR = sir;

    const script = document.createElement("script");
    script.async = true;
    script.src = WIDGET_LOADER_SRC;
    script.setAttribute("n", "SIR");

    const firstScript = document.getElementsByTagName("script")[0];
    if (firstScript && firstScript.parentNode) {
        firstScript.parentNode.insertBefore(script, firstScript);
    } else {
        document.head.appendChild(script);
    }
};

const toMatchId = (parentMatchId) => {
    const numericId = Number(parentMatchId);
    if (Number.isFinite(numericId) && numericId > 0) {
        return numericId;
    }
    return parentMatchId;
};

const getWidgetConfig = (parentMatchId) => ({
    matchId: toMatchId(parentMatchId),
    streamToggle: "onPitchButton",
    layout: "double",
    detailedScoreboard: "disable",
    tabsPosition: "top",
});

const callSir = (method, ...args) => {
    if (typeof window.SIR !== "function") {
        return;
    }

    try {
        window.SIR(method, ...args);
    } catch (error) {
        // Ignore remove/add races while SIR is still booting.
    }
};

const MatchWidget = ({ parentMatchId }) => {
    const containerRef = useRef(null);
    const containerId = useMemo(
        () => `sr-match-widget-${String(parentMatchId).replace(/[^a-zA-Z0-9_-]/g, "")}`,
        [parentMatchId]
    );

    useEffect(() => {
        if (!parentMatchId) {
            return undefined;
        }

        ensureSirLoader();

        const selector = `#${containerId}`;
        let cancelled = false;
        let rafId = 0;

        const mountWidget = () => {
            if (cancelled) {
                return;
            }

            const node = containerRef.current;
            // Wait until the container is in the document so selector-based
            // SIR calls resolve to this match-details instance.
            if (!node || !document.body.contains(node)) {
                rafId = requestAnimationFrame(mountWidget);
                return;
            }

            callSir("removeWidget", selector);
            node.innerHTML = "";
            callSir("addWidget", selector, WIDGET_TYPE, getWidgetConfig(parentMatchId));
        };

        rafId = requestAnimationFrame(mountWidget);

        return () => {
            cancelled = true;
            if (rafId) {
                cancelAnimationFrame(rafId);
            }
            callSir("removeWidget", selector);
            if (containerRef.current) {
                containerRef.current.innerHTML = "";
            }
        };
    }, [parentMatchId, containerId]);

    if (!parentMatchId) {
        return null;
    }

    return (
        <div className="widgets match-widget-container">
            <div
                id={containerId}
                ref={containerRef}
                className="sr-widget sr-widget-1"
            />
        </div>
    );
};

export default MatchWidget;
