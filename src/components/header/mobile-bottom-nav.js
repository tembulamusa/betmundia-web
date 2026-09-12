import React, { useContext, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaHome, FaGamepad, FaTrophy, FaUser } from "react-icons/fa";
import { Context } from "../../context/store";
import { getFromLocalStorage } from "../utils/local-storage";
import { JACKPOT_PATH, jackpotsPathWithType, getJackpotTypes, typeParamValue } from "../utils/jackpot-data";

const isJackpotPath = (pathname) =>
    pathname === JACKPOT_PATH ||
    pathname === "/jackpot" ||
    pathname.startsWith(`${JACKPOT_PATH}/`) ||
    pathname.startsWith("/jackpot/");

const MobileBottomNav = () => {
    const [state, dispatch] = useContext(Context);
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const onJackpotPage = isJackpotPath(pathname);

    const slipCount = useMemo(() => {
        const slip = onJackpotPage ? state?.jackpotbetslip : state?.betslip;
        return Object.keys(slip || {}).length;
    }, [onJackpotPage, state?.betslip, state?.jackpotbetslip]);

    const hideChrome =
        state?.casinolaunch ||
        state?.fullpagewidth ||
        state?.surecoinlaunched ||
        state?.fullcasinoscreen ||
        pathname.startsWith("/casino-game/");

    if (hideChrome) {
        return null;
    }

    const isHome =
        pathname === "/" ||
        pathname === "/home" ||
        pathname.startsWith("/sports") ||
        pathname.startsWith("/live") ||
        pathname.startsWith("/match");
    const isCasino = pathname === "/casino" || pathname.startsWith("/casino/");

    const openBetslip = () => {
        if (onJackpotPage) {
            dispatch({ type: "SET", key: "isjackpot", payload: true });
            dispatch({ type: "SET", key: "betslipkey", payload: "jackpotbetslip" });
        } else {
            dispatch({ type: "DEL", key: "isjackpot" });
            dispatch({ type: "SET", key: "betslipkey", payload: "betslip" });
        }
        dispatch({ type: "SET", key: "showmobileslip", payload: true });
    };

    const openAccount = () => {
        const user = getFromLocalStorage("user") || state?.user;
        if (!user) {
            dispatch({ type: "SET", key: "showloginmodal", payload: true });
            return;
        }
        dispatch({ type: "SET", key: "showaccountdrawer", payload: true });
    };

    const goJackpots = (event) => {
        event.preventDefault();
        const types = getJackpotTypes(state);
        const first = types?.[0];
        navigate(first ? jackpotsPathWithType(typeParamValue(first)) : JACKPOT_PATH);
    };

    return (
        <nav className="mobile-bottom-nav d-md-none" aria-label="Primary">
            <Link
                to="/"
                className={`mobile-bottom-nav__item${isHome && !isCasino && !onJackpotPage ? " is-active" : ""}`}
            >
                <FaHome className="mobile-bottom-nav__icon" aria-hidden="true" />
                <span className="mobile-bottom-nav__label">Home</span>
            </Link>

            <Link
                to="/casino"
                className={`mobile-bottom-nav__item${isCasino ? " is-active" : ""}`}
            >
                <FaGamepad className="mobile-bottom-nav__icon" aria-hidden="true" />
                <span className="mobile-bottom-nav__label">Casino</span>
            </Link>

            <button
                type="button"
                className="mobile-bottom-nav__betslip"
                onClick={openBetslip}
                aria-label={`${onJackpotPage ? "Jackpot betslip" : "Betslip"}, ${slipCount} selections`}
            >
                <span className="mobile-bottom-nav__betslip-count">{slipCount}</span>
            </button>

            <a
                href={JACKPOT_PATH}
                className={`mobile-bottom-nav__item${onJackpotPage ? " is-active" : ""}`}
                onClick={goJackpots}
            >
                <FaTrophy className="mobile-bottom-nav__icon" aria-hidden="true" />
                <span className="mobile-bottom-nav__label">Jackpots</span>
            </a>

            <button
                type="button"
                className="mobile-bottom-nav__item"
                onClick={openAccount}
            >
                <FaUser className="mobile-bottom-nav__icon" aria-hidden="true" />
                <span className="mobile-bottom-nav__label">Account</span>
            </button>
        </nav>
    );
};

export default React.memo(MobileBottomNav);
