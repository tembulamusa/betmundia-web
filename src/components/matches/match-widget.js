import React, { useEffect, useRef, useState } from "react";
import '../../assets/css/theme.css';

/**
 * LMT Premium uses the same widget name `match.lmtPlus` as base LMT.
 * Docs: https://apidocs.sportradar.com/resources/widgets/docs/lmt/lmt-premium
 *
 * Replace docs placeholder `sportradar` in the loader URL with our client id.
 */
const WIDGET_CLIENT_ID = "d9d6a9c373db18dfdf63352e1c1d9321";
const WIDGET_LOADER_SRC =
    `https://widgets.sir.sportradar.com/${WIDGET_CLIENT_ID}/widgetloader`;
const WIDGET_SELECTOR = "#sr-widget";
const WIDGET_TYPE = "match.lmtPlus";
const LOAD_TIMEOUT_MS = 15000;

let loaderStarted = false;
let loaderPromise = null;

/**
 * Official SIR bootstrap (queue stub + async widgetloader).
 * Programmatic API is recommended for SPAs; declarative data-sr-* attrs stay in sync.
 */
const ensureSirLoader = () => {
    if (typeof window === "undefined") {
        return Promise.reject(new Error("no-window"));
    }

    if (typeof window.SIR === "function" && window.SIR.l && document.querySelector(`script[src*="widgetloader"]`)) {
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
            language: "en",
            theme: false,
        };
        window.SIR = sir;

        const existing = document.querySelector(`script[src*="${WIDGET_CLIENT_ID}/widgetloader"]`);
        if (existing) {
            existing.addEventListener("load", () => resolve(window.SIR));
            existing.addEventListener("error", () => reject(new Error("widgetloader-error")));
            return;
        }

        const script = document.createElement("script");
        script.type = "application/javascript";
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

/**
 * LMT Premium sample props (enableVirtualised / vlmtForce2d) + SPA onTrack.
 * enableDataStream defaults true with an LMT Premium license.
 */
const getWidgetConfig = (matchId, onError) => ({
    matchId: Number.isFinite(Number(matchId)) ? Number(matchId) : matchId,
    enableVirtualised: true,
    vlmtForce2d: false,
    enableDataStream: true,
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
 * Match-details LMT Premium (`match.lmtPlus`).
 * Markup matches Sportradar declarative HTML; mount via SIR for SPA remounts.
 */
const MatchWidget = ({ parentMatchId, homeTeam, awayTeam }) => {
    const [showFallback, setShowFallback] = useState(false);
    const widgetRootRef = useRef(null);
    const failedRef = useRef(false);
    const matchIdAttr = parentMatchId != null && parentMatchId !== ""
        ? String(parentMatchId)
        : "";

    useEffect(() => {
        if (!parentMatchId) {
            setShowFallback(true);
            return undefined;
        }

        let cancelled = false;
        failedRef.current = false;
        setShowFallback(false);

        const markFailed = (reason) => {
            if (cancelled || failedRef.current) {
                return;
            }
            failedRef.current = true;
            if (reason && typeof console !== "undefined") {
                console.warn("[MatchWidget]", reason);
            }
            setShowFallback(true);
            callSir("removeWidget", WIDGET_SELECTOR);
        };

        const timeoutId = window.setTimeout(() => {
            if (!widgetHasContent(widgetRootRef.current)) {
                markFailed("Widget did not render content in time");
            }
        }, LOAD_TIMEOUT_MS);

        ensureSirLoader()
            .then(async () => {
                if (cancelled) {
                    return;
                }

                // Domain must be on this client id's Sportradar license allowlist.
                try {
                    const licRes = await fetch(
                        `https://widgets.sir.sportradar.com/${WIDGET_CLIENT_ID}/licensing`,
                        { credentials: "omit" }
                    );
                    const lic = await licRes.json();
                    if (lic && lic.valid === false) {
                        markFailed(
                            lic.emsg ||
                            `Domain not licensed for client ${WIDGET_CLIENT_ID}`
                        );
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
                    getWidgetConfig(parentMatchId, () => markFailed("Widget onTrack error"))
                );
            })
            .catch(() => {
                markFailed("Failed to load Sportradar widgetloader");
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
                {/*
                  LMT Premium declarative HTML (docs):
                  data-sr-widget / data-sr-match-id / data-sr-enable-virtualised / data-sr-vlmt-force-2d
                */}
                <div
                    id="sr-widget"
                    ref={widgetRootRef}
                    className="sr-widget"
                    data-sr-widget={WIDGET_TYPE}
                    data-sr-match-id={matchIdAttr}
                    data-sr-enable-virtualised="true"
                    data-sr-vlmt-force-2d="false"
                    data-sr-enable-data-stream="true"
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
