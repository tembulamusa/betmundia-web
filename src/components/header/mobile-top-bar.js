import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoins } from '@fortawesome/free-solid-svg-icons';
import { MdCancel } from 'react-icons/md';
import logo from '../../assets/img/logo.svg';
import { Context } from '../../context/store';
import { formatToFloat } from '../utils/formatters';
import HeaderNav from './header-nav';
import FreebetNotice from './freebet-notice';
import MobileChat from './mobile-chat';
import MobileMenu from './mobile-menu';
import { ANDROID_PLAY_STORE_URL, getAppDownloadTarget } from '../utils/app-download';
import '../../assets/css/mobile-top-bar.css';

const MobileTopBar = ({ user }) => {
    const [, dispatch] = useContext(Context);
    const balance = formatToFloat(user?.balance || 0);
    const [appDownloadHref, setAppDownloadHref] = useState(ANDROID_PLAY_STORE_URL);
    const [showAppPromo, setShowAppPromo] = useState(true);

    useEffect(() => {
        setAppDownloadHref(getAppDownloadTarget().href);
    }, []);

    useEffect(() => {
        document.body.classList.toggle('app-promo-dismissed', !showAppPromo);
        return () => document.body.classList.remove('app-promo-dismissed');
    }, [showAppPromo]);

    return (
        <div
            className="mobile-top-bar"
            aria-label="Mobile navigation"
        >
            {showAppPromo && (
                <div className="mobile-top-bar__app-promo-row">
                    <a
                        href={appDownloadHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mobile-top-bar__app-promo"
                    >
                        <span className="mobile-top-bar__app-promo-text">Download the Betmundial App</span>
                        <span className="mobile-top-bar__app-promo-cta">Download Now</span>
                    </a>
                    <button
                        type="button"
                        className="mobile-top-bar__app-promo-dismiss"
                        aria-label="Close app download banner"
                        onClick={() => setShowAppPromo(false)}
                    >
                        <MdCancel aria-hidden="true" />
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
                </div>
            </div>

            <div className="mobile-top-bar__auth-bar">
                {user ? (
                    <div className="mobile-top-bar__wallet">
                        <div className="mobile-top-bar__balance" title="Available balance">
                            <span className="mobile-top-bar__balance-label">KES</span>
                            <span className="mobile-top-bar__balance-value">{balance}</span>
                        </div>
                        <div className="mobile-top-bar__wallet-actions">
                            <Link to="/deposit" className="mobile-top-bar__deposit sportpesa-deposit-btn">
                                <FontAwesomeIcon icon={faCoins} className="deposit-coins-icon" aria-hidden="true" />
                                Deposit
                            </Link>
                            <Link to="/withdraw" className="mobile-top-bar__withdraw sportpesa-withdraw-btn">
                                Withdraw
                            </Link>
                            <div className="mobile-top-bar__account">
                                <MobileMenu user={user} />
                            </div>
                        </div>
                    </div>
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
            <FreebetNotice user={user} className="freebet-notice--mobile" />
        </div>
    );
};

export default React.memo(MobileTopBar);
