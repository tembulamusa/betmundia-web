import React, { useEffect, useRef, useState } from "react";
import '../../assets/css/theme.css';

// Client id provided for Betmundial Sportradar SIR.
const WIDGET_CLIENT_ID = "d9d6a9c373db18dfdf63352e1c1d9321";
const WIDGET_LOADER_SRC =
    `https://widgets.sir.sportradar.com/${WIDGET_CLIENT_ID}/widgetloader`;
// Same CSS selector the working historic widget and Sportradar docs use.
const WIDGET_SELECTOR = ".sr-widget-1";
const WIDGET_TYPE = "match.lmtPlus";
const LOAD_TIMEOUT_MS = 15000;

let loaderStarted = false;
let loaderPromise = null;

/**
 * Official Sportradar SIR bootstrap (queue stub + async widgetloader).
 * theme:false so imported theme.css applies.
 */
const ensureSirLoader = () => {
    if (typeof window === "undefined") {
        return Promise.reject(new Error("no-window"));
    }

    if (typeof window.SIR === "function" && window.SIR.l && document.querySelector(`script[src*="widgetloader"]`)) {
        // Real loader already present (or stub that will flush).
        return Promise.resolve(window.SIR);
    }

    if (loaderPromise) {
        return loaderPromise;
    }

    loaderPromise = new Promise((resolve, reject) => {
        if (loaderStarted && typeof window.SIR === "function") {
            resolve(window.SIR);
            return;
        }
        loaderStarted = true;

        const sir = function sir() {
            (sir.q = sir.q || []).push(arguments);
        };
        sir.l = Date.now();
        sir.o = {
            theme: false,
            language: "en",
        };
        window.SIR = sir;

        const existing = document.querySelector(`script[src*="${WIDGET_CLIENT_ID}/widgetloader"]`);
        if (existing) {
            existing.addEventListener("load", () => resolve(window.SIR));
            existing.addEventListener("error", () => reject(new Error("widgetloader-error")));
            return;
        }

        const script = document.createElement("script");
        script.async = true;
        script.src = WIDGET_LOADER_SRC;
        script.setAttribute("n", "SIR");
        script.onload = () => resolve(window.SIR);
        script.onerror = () => reject(new Error("widgetloader-error"));

        const firstScript = document.getElementsByTagName("script")[0];
        if (firstScript && firstScript.parentNode) {
            firstScript.parentNode.insertBefore(script, firstScript);
        } else {
            document.body.appendChild(script);
        }
    });

    return loaderPromise;
};

const getWidgetConfig = (matchId, onError) => ({
    // Sportradar docs type matchId as number; coerce when possible.
    matchId: Number.isFinite(Number(matchId)) ? Number(matchId) : matchId,
    streamToggle: "onPitchButton",
    layout: "double",
    detailedScoreboard: "disable",
    tabsPosition: "top",
    silent: true,
    onTrack: (eventType, data) => {
        if (
            eventType === "error" ||
            (eventType === "data_change" && data && data.error)
        ) {
            if (typeof onError === "function") {
                onError();
            }
        }
    },
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

const widgetHasContent = (rootEl) => {
    if (!rootEl) {
        return false;
    }
    return Boolean(
        rootEl.querySelector(".sr-bb, .sr-lmt, iframe, canvas, svg") ||
        (rootEl.childElementCount > 0 && rootEl.textContent.trim().length > 0)
    );
};

/**
 * Match-details LMT+.
 * Falls back to bold home/away names if the widget never mounts.
 */
const MatchWidget = ({ parentMatchId, homeTeam, awayTeam }) => {
    const [showFallback, setShowFallback] = useState(false);
    const widgetRootRef = useRef(null);
    const failedRef = useRef(false);

    useEffect(() => {
        if (!parentMatchId) {
            setShowFallback(true);
            return undefined;
        }

        let cancelled = false;
        failedRef.current = false;
        setShowFallback(false);

        const markFailed = () => {
            if (cancelled || failedRef.current) {
                return;
            }
            failedRef.current = true;
            setShowFallback(true);
            callSir("removeWidget", WIDGET_SELECTOR);
        };

        const timeoutId = window.setTimeout(() => {
            if (!widgetHasContent(widgetRootRef.current)) {
                markFailed();
            }
        }, LOAD_TIMEOUT_MS);

        ensureSirLoader()
            .then(async () => {
                if (cancelled) {
                    return;
                }

                // Fail fast when this host is not on the Sportradar domain allowlist.
                try {
                    const licRes = await fetch(
                        `https://widgets.sir.sportradar.com/${WIDGET_CLIENT_ID}/licensing`,
                        { credentials: "omit" }
                    );
                    const lic = await licRes.json();
                    if (lic && lic.valid === false) {
                        markFailed();
                        return;
                    }
                } catch (_err) {
                    // Network blip — still attempt addWidget; timeout covers hard failure.
                }

                callSir("removeWidget", WIDGET_SELECTOR);
                callSir(
                    "addWidget",
                    WIDGET_SELECTOR,
                    WIDGET_TYPE,
                    getWidgetConfig(parentMatchId, markFailed)
                );
            })
            .catch(() => {
                markFailed();
            });

        return () => {
            cancelled = true;
            window.clearTimeout(timeoutId);
            callSir("removeWidget", WIDGET_SELECTOR);
        };
    }, [parentMatchId]);

    if (!parentMatchId && !homeTeam && !awayTeam) {
        return null;
    }

    return (
        <div className="widgets match-widget-container">
            <div>
                <div
                    ref={widgetRootRef}
                    className="sr-widget sr-widget-1"
                    hidden={showFallback}
                />
                {showFallback && (
                    <div className="match-widget-fallback" aria-live="polite">
                        <span className="match-widget-fallback__team">
                            {homeTeam || "Home"}
                        </span>
                        <span className="match-widget-fallback__sep">-</span>
                        <span className="match-widget-fallback__team">
                            {awayTeam || "Away"}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MatchWidget;
