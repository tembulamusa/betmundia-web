import { useEffect, useState } from "react";
import makeRequest from "./fetch-request";

// Live EGT Digital jackpot amounts, shared by every tile that shows one.
//
// Why a module-level store instead of state inside the tile: CasinoGame is
// rendered once per game and is reused by the carousels, the category
// listing and the home page, so fetching inside it would mean one request
// per visible jackpot title on every mount -- eight today, and eight again
// each time the user navigates back to the lobby. Here the subscribers
// share one in-flight request and one interval, and the interval exists
// only while something is actually subscribed.
//
// The gateway caches these for 15s and serves its last good read when EGT
// Digital is unreachable, so polling faster than this buys nothing.
const POLL_MS = 30000;

// JACKPOT_PROVIDER is the only provider whose games have a pot. Tiles for
// anything else never subscribe.
const JACKPOT_PROVIDER = "egtdigital";

let games = {};
let subscribers = new Set();
let timer = null;
let inflight = null;

const notify = () => {
    subscribers.forEach((fn) => fn(games));
};

const fetchJackpots = () => {
    if (inflight) return inflight;

    inflight = makeRequest({
        url: "egtdigital/casino/jackpots",
        method: "GET",
        api_version: "CasinoGameLaunch",
    })
        .then(([status, result]) => {
            // Fail quietly and keep whatever we last had. These amounts are
            // decoration: the money path for a jackpot win is a wallet
            // callback on the gateway, nothing here. An error also cannot
            // mean "EGT Digital is down" -- the gateway absorbs that and
            // serves stale -- so it means our own API is unreachable, and
            // then the lobby has larger problems than a missing figure.
            if (status === 200 && result?.games) {
                games = result.games;
                notify();
            }
        })
        .catch(() => { })
        .finally(() => {
            inflight = null;
        });

    return inflight;
};

const subscribe = (fn) => {
    subscribers.add(fn);
    // Hand a late subscriber what we already have, so a tile mounted
    // between polls shows its pot immediately rather than after 30s.
    fn(games);

    if (!timer) {
        fetchJackpots();
        timer = setInterval(fetchJackpots, POLL_MS);
    }

    return () => {
        subscribers.delete(fn);
        if (subscribers.size === 0 && timer) {
            clearInterval(timer);
            timer = null;
        }
    };
};

/**
 * useGameJackpot returns the live pot for one game, or null when that game
 * has none. game_code on the gateway is the same value as game_id here.
 */
export const useGameJackpot = (gameId, providerName) => {
    const code = gameId === null || gameId === undefined ? "" : String(gameId);
    const eligible = String(providerName || "").toLowerCase() === JACKPOT_PROVIDER && code !== "";
    const [pot, setPot] = useState(null);

    useEffect(() => {
        if (!eligible) {
            setPot(null);
            return undefined;
        }
        return subscribe((next) => setPot(next?.[code] || null));
    }, [eligible, code]);

    return pot;
};

/**
 * formatJackpot renders a pot for display. Whole shillings only: every pot
 * runs to five or six figures, where the cents are noise on a tile.
 */
export const formatJackpot = (amount, currency = "KES") => {
    const value = Number(amount);
    if (!isFinite(value) || value <= 0) return null;
    return `${currency} ${value.toLocaleString("en-KE", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    })}`;
};
