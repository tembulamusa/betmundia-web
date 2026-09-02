import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoins } from '@fortawesome/free-solid-svg-icons';
import logo from '../../assets/img/logo.svg';
import { Context } from '../../context/store';
import { formatToFloat } from '../utils/formatters';
import { getAppDownloadTarget } from '../utils/app-download';
import HeaderNav from './header-nav';
import MobileChat from './mobile-chat';
import MobileMenu from './mobile-menu';
import '../../assets/css/mobile-top-bar.css';

const MobileTopBar = ({ user }) => {
    const [, dispatch] = useContext(Context);
    const balance = formatToFloat(user?.balance || 0);
    const [appDownload, setAppDownload] = useState({ href: '/app', external: false });

    useEffect(() => {
        setAppDownload(getAppDownloadTarget());
    }, []);

    const promoContent = (
        <>
            <span className="mobile-top-bar__app-promo-text">
                Download the App and enjoy 50/= bonus!
            </span>
            <span className="mobile-top-bar__app-promo-cta">Download</span>
        </>
    );

    return (
        <div className="mobile-top-bar" aria-label="Mobile navigation">
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
