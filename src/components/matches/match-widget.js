import React, { useEffect, useRef } from "react";
import '../../assets/css/theme.css';

const SPORT_RADAR_CLIENT_ID = "d9d6a9c373db18dfdf63352e1c1d9321";
const WIDGET_LOADER_SRC = `https://widgets.sir.sportradar.com/${SPORT_RADAR_CLIENT_ID}/widgetloader`;

let loaderInitialized = false;

const ensureSirLoader = () => {
    if (loaderInitialized || window.SIR) {
        loaderInitialized = true;
        return;
    }

    loaderInitialized = true;

    (function (a, b, c, d, e, f) {
        if (!a[e]) {
            const i = a[e] = function () {
                (a[e].q = a[e].q || []).push(arguments);
            };
            i.l = 1 * new Date();
            i.o = f;
            const g = b.createElement(c);
            const h = b.getElementsByTagName(c)[0];
            g.async = 1;
            g.src = d;
            g.setAttribute("n", e);
            h.parentNode.insertBefore(g, h);
        }
    })(window, document, "script", WIDGET_LOADER_SRC, "SIR", {
        theme: false,
        language: "en",
    });
};

const toMatchId = (parentMatchId) => {
    const numericId = Number(parentMatchId);
    return Number.isFinite(numericId) ? numericId : parentMatchId;
};

const getWidgetConfig = (parentMatchId) => ({
    matchId: toMatchId(parentMatchId),
    streamToggle: "onPitchButton",
    layout: "double",
    detailedScoreboard: "disable",
    tabsPosition: "top",
});

const removeWidget = (container) => {
    if (!window.SIR || !container) {
        return;
    }

    try {
        window.SIR("removeWidget", container);
    } catch (error) {
        // Widget may not have been mounted yet.
    }
};

const MatchWidget = ({ parentMatchId }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!parentMatchId || !containerRef.current) {
            return undefined;
        }

        ensureSirLoader();

        const container = containerRef.current;
        removeWidget(container);
        window.SIR("addWidget", container, "match.lmtPlus", getWidgetConfig(parentMatchId));

        return () => {
            removeWidget(container);
        };
    }, [parentMatchId]);

    if (!parentMatchId) {
        return null;
    }

    return (
        <div className="widgets match-widget-container">
            <div ref={containerRef} className="sr-widget sr-widget-1" />
        </div>
    );
};

export default MatchWidget;
