import React, { useEffect, useState, useContext, Suspense } from 'react';
import Container from 'react-bootstrap/Container';
import { Context } from '../../context/store';
import { getFromLocalStorage, removeItem, setLocalStorage, USER_STORAGE_TTL_MS } from '../utils/local-storage';
import makeRequest from '../utils/fetch-request';
import 'react-lazy-load-image-component/src/effects/blur.css';
import logo from '../../assets/img/logo.svg';
import { Navbar } from "react-bootstrap";
import BigIconNav from './big-icon-nav';
import useInterval from "../../hooks/set-interval.hook";
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import socket, { ensureSocketConnected } from '../utils/socket-connect';
import HeaderNav from './header-nav';
import MobileChat from './mobile-chat';
import MobileTopBar from './mobile-top-bar';
import FreebetNotice from './freebet-notice';
import {
    getJackpotTypes,
    persistJackpotTypes,
    refreshJackpotTypes,
} from '../utils/jackpot-data';
import { registerSessionAuthHandlers } from '../utils/session-auth';
import { startSessionKeepAlive } from '../utils/session-keep-alive';
import { dismissLoginModalIfSessionPresent } from '../utils/login-redirect';
import { scheduleIdle } from '../utils/defer-idle';

const ProfileMenu = React.lazy(() => import('./profile-menu'));
const HeaderLogin = React.lazy(() => import('./top-login'));
const ShareModal = React.lazy(() => import('../sharemodal'));
const LoginModal = React.lazy(() => import('../loginmodal'));
const CheckMpesaDepositStatus = React.lazy(() => import('../webmodals/check-mpesa-deposit-status'));
const DepositModal = React.lazy(() => import('../webmodals/deposit-modal'));
const FreeBetModal = React.lazy(() => import('../webmodals/freebet-modal'));

/** Keep modal chunk mounted after first open so close/reopen stays instant. */
const useKeepWhen = (when) => {
    const [armed, setArmed] = useState(Boolean(when));
    useEffect(() => {
        if (when) setArmed(true);
    }, [when]);
    return armed;
};

const sportsSocketPath = (pathname = '') => {
    if (!pathname) return true;
    if (
        pathname === '/' ||
        pathname.startsWith('/live') ||
        pathname.startsWith('/match') ||
        pathname.startsWith('/jackpot') ||
        pathname.startsWith('/survivor') ||
        pathname.startsWith('/my-bets') ||
        pathname.startsWith('/betslip') ||
        pathname.startsWith('/sports') ||
        pathname.startsWith('/verify-account')
    ) {
        return true;
    }
    return false;
};

const Header = (props) => {
    const [user, setUser] = useState(getFromLocalStorage("user"));
    const [state, dispatch] = useContext(Context);
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    const needsSocket = Boolean(user) || sportsSocketPath(location.pathname);
    const showLogin = state?.showloginmodal === true;
    const showShare = state?.showsharemodal === true;
    const showDeposit = Boolean(state?.promptdepositrequest?.show);
    const showMpesa = state?.showcheckmpesadepositstatus === true;
    const keepLogin = useKeepWhen(showLogin);
    const keepShare = useKeepWhen(showShare);
    const keepDeposit = useKeepWhen(showDeposit);
    const keepMpesa = useKeepWhen(showMpesa);

    // Centralized session keep-alive (30m after success + refresh on tab return).
    // Login is never opened from timers alone — only real HTTP 401/403 after refresh fails.
    useEffect(() => {
        registerSessionAuthHandlers({ dispatch, setUser });
        startSessionKeepAlive({
            onUserUpdated: (nextUser) => {
                setUser(nextUser);
            },
        });
    }, [dispatch]);

    // Prefetch jackpot types after shell paint (still runs; timing only).
    useEffect(() => {
        const cached = getJackpotTypes(state);
        if (cached.length) {
            persistJackpotTypes(cached, dispatch);
        }
        return scheduleIdle(() => {
            void refreshJackpotTypes(dispatch);
        }, 2200);
        // Intentionally once on header mount.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Prefetch modal chunks on idle so first open is snappy without blocking boot.
    useEffect(() => {
        return scheduleIdle(() => {
            import('../loginmodal');
            import('../sharemodal');
            import('../webmodals/deposit-modal');
            import('../webmodals/check-mpesa-deposit-status');
            import('../webmodals/freebet-modal');
        }, 3500);
    }, []);

    const updateUserOnHistory = async () => {
        if (!user) {
            return;
        }

        let endpoint = "/user/balance";
        await makeRequest({ url: endpoint, method: "GET", api_version: 2 }).then(([_status, response]) => {
            if (_status == 200) {
                let u = { ...user, ...response?.data, bonus_balace: response?.data?.bonus };
                let prevUser = user;
                setUser(u);
                // check if still on deposit page and if has next url and navigate
                if (parseInt(prevUser?.balance) < parseInt(response?.data?.balance)) {
                    nextNavigate();
                }
                return
            }
        });
    };

    useInterval(async () => {
        if (user?.balance) {
            if (!socket.connected) {
                updateUserOnHistory()
            }
        }
    }, user ? 1000 * 60 : null);

    // Connect when sports / logged-in surfaces need the socket; reconnect if dropped.
    useEffect(() => {
        if (needsSocket) {
            ensureSocketConnected();
        }
    }, [needsSocket]);

    useInterval(() => {
        if (needsSocket && !socket.connected) {
            console.log('[socket] header reconnect check: disconnected, connecting again');
            ensureSocketConnected();
        }
    }, needsSocket ? 1000 * 60 * 2 : null);

    useEffect(() => {
        const onFreebetPlaced = () => setUser((prev) => (prev ? { ...prev, has_freebet: 0 } : prev));
        window.addEventListener('freebet:placed', onFreebetPlaced);
        return () => window.removeEventListener('freebet:placed', onFreebetPlaced);
    }, []);
    useEffect(() => {
        if (user) {
            setLocalStorage("user", user, USER_STORAGE_TTL_MS);
        }
    }, [user]);
    useEffect(() => {
        if (user) {
            ensureSocketConnected();
            if (socket.connected) {
                socket.emit('user.profile', user?.profile_id);
            }
            socket.on(`user#profile#${user?.profile_id}`, (data) => {
                // alert("Your account balance has been updated. Please refresh the page to see the latest balance." + JSON.stringify(data));
                setUser({ ...user, balance: data.balance, bonus_balance: data.bonus })
            });
        }
    }, [socket.connected, user])

    const nextNavigate = () => {
        const path = location.pathname
        const next = searchParams.get("next") || "/";
        if (path == "/deposit") {
            navigate(next)
        }

    }

    useEffect(() => {
        if (location.pathname == "/casino-game/eurovirtuals/virtual-league") {
            dispatch({ type: "SET", key: "hideBigIconNav", payload: true })
            removeItem("casinolaunch");
        } else {
            dispatch({ type: "DEL", key: "hideBigIconNav" })
        }
    }, [location.pathname])
    return (
        <>
            <Navbar expand="md" className="mb-0 ck pc os app-navbar top-nav" fixed="top" variant="dark" style={{ flexWrap: "wrap" }}>
                <div className='main-header-top w-full px-2 pt-2 md:!p-0'>
                    <MobileTopBar user={user} />
                    <Container fluid className="d-none d-xl-grid mobile-change position-relative header-top-grid">
                        <div className="e logo align-self-start items-center pl-0" title="betmundial">
                            <a
                                className="header-logo-link mt-2 inline-block"
                                href="/"
                                style={{ display: "inline-block" }}
                                onClick={() => dismissLoginModalIfSessionPresent(dispatch)}
                            >
                                <img src={logo} alt="betmundial" title="betmundial" effects="blur" style={{ height: "auto" }} className="w-[220px]" />
                            </a>
                        </div>

                        <div className="header-search-slot">
                            <HeaderNav />
                            <MobileChat />
                        </div>

                        <div className="header-top-actions d-none d-md-flex" id="navbar-collapse-main">
                            <div className="flex justify-end items-center">
                                <FreebetNotice user={user} className="mr-3" />
                                <Suspense fallback={null}>
                                    {user ? <ProfileMenu user={user} /> : <HeaderLogin setUser={setUser} />}
                                </Suspense>
                            </div>
                        </div>
                    </Container>
                </div>

                <div className={`w-full ${state?.hideBigIconNav ? 'hidden' : ''}`}>
                    <BigIconNav />
                </div>
            </Navbar >

            <Suspense fallback={null}>
                {keepShare && <ShareModal shown={state?.showsharemodal == false} />}
                {keepLogin && <LoginModal setUser={setUser} />}
                {keepMpesa && <CheckMpesaDepositStatus />}
                {keepDeposit && <DepositModal />}
                {user && <FreeBetModal user={user} />}
            </Suspense>
        </>

    )
}

export default React.memo(Header);
