import { useContext } from 'react';
import {
    getFromLocalStorage,
    setLocalStorage,
    removeItem
} from './local-storage';
import { Context } from '../../context/store';

export const addToSlip = (slip) => {
    let current_slip = getFromLocalStorage('betslip');
    let liveCount = getFromLocalStorage("liveCount");
    // save the game live status


    if (current_slip) {
        current_slip[slip.match_id] = slip;
    } else {
        current_slip = { [slip.match_id]: slip };
        if (slip?.bet_type == 1) {
            let liveCount = getFromLocalStorage("liveCount");
            if (liveCount) {
                liveCount += 1;
            } else {
                liveCount = 1
            }
            setLocalStorage("liveCount", liveCount);

        }
    }
    setLocalStorage('betslip', current_slip, 1 * 60 * 60 * 1000);

    return current_slip;
}

export const removeFromSlip = (match_id) => {
    let current_slip = getFromLocalStorage('betslip') || {};
    if (current_slip[match_id]) {
        let liveCount = getFromLocalStorage("liveCount");

        if (current_slip[match_id].bet_type == 1) {
            if (liveCount > 0) {
                liveCount--;
                setLocalStorage("liveCount", liveCount);
            }
        }

        delete current_slip[match_id];
        setLocalStorage('betslip', current_slip, 1 * 60 * 60 * 1000);
    }

    return current_slip;
}

export const clearSlip = () => {
    removeItem('betslip');
}
export const getBetslip = () => {
    return getFromLocalStorage('betslip');
}

export const getJackpotBetslip = () => {
    return getFromLocalStorage('jackpotbetslip');
}

export const addToJackpotSlip = (slip) => {
    let current_slip = getFromLocalStorage('jackpotbetslip');
    if (current_slip) {
        current_slip[slip.match_id] = slip;
    } else {
        current_slip = { [slip.match_id]: slip };
    }
    setLocalStorage('jackpotbetslip', current_slip, 1 * 60 * 60 * 1000);
    return current_slip;
}

// Jackpot picks must follow the order of the games on the jackpot page.
// The stored slip is an object keyed by numeric match_id, which JS iterates in
// ascending id order, so sort by each game's position in the jackpot payload.
// Returns [match_id, slip] pairs; games not found in the payload go last.
export const orderJackpotSlips = (slips, jackpotData) => {
    const entries = Object.entries(slips || {});
    const games = Object.values(jackpotData?.matches || {});
    if (!games.length) return entries;
    const position = new Map();
    games.forEach((game, index) => {
        if (game?.match_id != null) position.set(String(game.match_id), index);
    });
    const rank = (matchId) => (position.has(String(matchId)) ? position.get(String(matchId)) : Number.MAX_SAFE_INTEGER);
    return entries
        .map((entry, index) => ({ entry, index }))
        .sort((a, b) => (rank(a.entry[0]) - rank(b.entry[0])) || (a.index - b.index))
        .map(({ entry }) => entry);
};

export const removeFromJackpotSlip = (match_id) => {
    let current_slip = getFromLocalStorage('jackpotbetslip') || {};
    if (current_slip[match_id]) {
        delete current_slip[match_id];
        setLocalStorage('jackpotbetslip', current_slip, 1 * 60 * 60 * 1000);
    }
    return current_slip;
}

export const clearJackpotSlip = () => {
    removeItem('jackpotbetslip');
}
export const formatNumber = (number) => {
    return number == undefined || number == 0 ? '0' : number.toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
        .replace(".00", '');
}