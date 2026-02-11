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
    let current_slip = getFromLocalStorage('betslip');
    if (current_slip) {
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

export const removeFromJackpotSlip = (match_id) => {
    let current_slip = getFromLocalStorage('jackpotbetslip');
    delete current_slip[match_id];
    setLocalStorage('jackpotbetslip', current_slip, 1 * 60 * 60 * 1000);
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