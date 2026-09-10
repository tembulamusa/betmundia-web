import React, { useEffect } from "react";
import '../../assets/css/theme.css';

// Client id + options from the last known-working LMT embed (255e985).
const WIDGET_LOADER_SRC =
    "https://widgets.sir.sportradar.com/d9d6a9c373db18dfdf63352e1c1d9321/widgetloader";
// Same CSS selector the working historic widget and Sportradar docs use.
const WIDGET_SELECTOR = ".sr-widget-1";
const WIDGET_TYPE = "match.lmtPlus";

let loaderStarted = false;

/**
 * Official Sportradar SIR bootstrap (queue stub + async widgetloader).
 * Written without comma-operator expressions for ESLint.
 * theme:false so imported theme.css applies.
 */
const ensureSirLoader = () => {
    if (typeof window === "undefined" || loaderStarted) {
        return;
    }
    loaderStarted = true;

    if (typeof window.SIR === "function") {
        return;
    }

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
        document.body.appendChild(script);
    }
};

const getWidgetConfig = (parentMatchId) => ({
    // Same id the working SideBets openLiveStats popup uses (parent_match_id as-is).
    matchId: parentMatchId,
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
        // Ignore remove/add races while the loader is still booting.
    }
};

/**
 * Match-details LMT+. Restores the working historic mount contract:
 * - selector `.sr-widget-1` (not a DOM node / unique id)
 * - matchId = parent_match_id string (no Number coercion)
 * - nested `.widgets > div > .sr-widget.sr-widget-1` markup
 * Plus the official SIR queue stub so calls before onload still apply.
 */
const MatchWidget = ({ parentMatchId }) => {
    useEffect(() => {
        if (!parentMatchId) {
            return undefined;
        }

        ensureSirLoader();

        // useEffect runs after commit, so `.sr-widget-1` is in the document.
        callSir("removeWidget", WIDGET_SELECTOR);
        callSir("addWidget", WIDGET_SELECTOR, WIDGET_TYPE, getWidgetConfig(parentMatchId));

        return () => {
            callSir("removeWidget", WIDGET_SELECTOR);
        };
    }, [parentMatchId]);

    if (!parentMatchId) {
        return null;
    }

    return (
        <div className="widgets match-widget-container">
            <div>
                <div className="sr-widget sr-widget-1" />
            </div>
        </div>
    );
};

export default MatchWidget;
