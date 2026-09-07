import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoins } from '@fortawesome/free-solid-svg-icons';
import { MdClose } from 'react-icons/md';
import logo from '../../assets/img/logo.svg';
import { Context } from '../../context/store';
import { formatToFloat } from '../utils/formatters';
import { ANDROID_PLAY_STORE_URL, getAppDownloadTarget } from '../utils/app-download';
import { getFromLocalStorage, setLocalStorage } from '../utils/local-storage';
import HeaderNav from './header-nav';
import MobileChat from './mobile-chat';
import MobileMenu from './mobile-menu';
import '../../assets/css/mobile-top-bar.css';

const APP_PROMO_DISMISS_KEY = 'mobile_app_promo_dismissed';
const APP_PROMO_DISMISS_TTL_MS = 1000 * 60 * 60 * 24 * 365; // 1 year

const MobileTopBar = ({ user }) => {
    const [, dispatch] = useContext(Context);
    const balance = formatToFloat(user?.balance || 0);
    const [appDownload, setAppDownload] = useState({
        href: ANDROID_PLAY_STORE_URL,
        external: true,
    });
    const [promoDismissed, setPromoDismissed] = useState(
        () => Boolean(getFromLocalStorage(APP_PROMO_DISMISS_KEY))
    );

    useEffect(() => {
        setAppDownload(getAppDownloadTarget());
    }, []);

    // Keep layout spacing in sync with promo visibility (persisted via localStorage).
    useEffect(() => {
        document.body.classList.toggle('app-promo-dismissed', promoDismissed);
        return () => {
            document.body.classList.remove('app-promo-dismissed');
        };
    }, [promoDismissed]);

    const dismissPromo = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setLocalStorage(APP_PROMO_DISMISS_KEY, true, APP_PROMO_DISMISS_TTL_MS);
        setPromoDismissed(true);
    };

    const promoContent = (
        <>
            <span className="mobile-top-bar__app-promo-text">
                Download the App and enjoy 50/= bonus!
            </span>
            <span className="mobile-top-bar__app-promo-cta">Download</span>
        </>
    );

    return (
        <div
            className={`mobile-top-bar${promoDismissed ? ' mobile-top-bar--promo-hidden' : ''}`}
            aria-label="Mobile navigation"
        >
            {!promoDismissed && (
                <div className="mobile-top-bar__app-promo-row">
                    {appDownload.external ? (
                        <a
                            href={appDownload.href}
                            className="mobile-top-bar__app-promo"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {promoContent}
                        </a>
                    ) : (
                        <Link to={appDownload.href} className="mobile-top-bar__app-promo">
                            {promoContent}
                        </Link>
                    )}
                    <button
                        type="button"
                        className="mobile-top-bar__app-promo-dismiss"
                        onClick={dismissPromo}
                        aria-label="Dismiss app download banner"
                    >
                        <MdClose aria-hidden="true" />
                    </button>
                </div>
            )}

            <div className="mobile-top-bar__brand">
                <Link to="/" className="mobile-top-bar__logo" title="Betmundial">
                    <img src={logo} alt="Betmundial" />
                </Link>

                <div className="mobile-top-bar__tools">
                    <HeaderNav />
                    <MobileChat />
                    {user && (
                        <div className="mobile-top-bar__account">
                            <MobileMenu user={user} />
                        </div>
                    )}
                </div>
            </div>

            <div className="mobile-top-bar__auth-bar">
                {user ? (
                    <>
                        <div className="mobile-top-bar__balance" title="Available balance">
                            <span className="mobile-top-bar__balance-label">KES</span>
                            <span className="mobile-top-bar__balance-value">{balance}</span>
                        </div>
                        <Link to="/deposit" className="mobile-top-bar__deposit sportpesa-deposit-btn">
                            <FontAwesomeIcon icon={faCoins} className="deposit-coins-icon" aria-hidden="true" />
                            Deposit
                        </Link>
                    </>
                ) : (
                    <div className="mobile-top-bar__auth header-login-links uppercase">
                        <button
                            type="button"
                            className="top-item uppercase top-login-btn btn red-bg"
                            onClick={() => dispatch({ type: 'SET', key: 'showloginmodal', payload: true })}
                        >
                            Login
                        </button>
                        <Link
                            to="/signup"
                            className="top-login-btn btn register-btn-purple top-item"
                            title="Join now"
                        >
                            <span className="register-labl uppercase">Register</span>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default React.memo(MobileTopBar);
