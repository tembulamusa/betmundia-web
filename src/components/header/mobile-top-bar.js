import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoins } from '@fortawesome/free-solid-svg-icons';
import logo from '../../assets/img/logo.svg';
import { Context } from '../../context/store';
import { formatToFloat } from '../utils/formatters';
import HeaderNav from './header-nav';
import FreebetNotice from './freebet-notice';
import MobileChat from './mobile-chat';
import MobileMenu from './mobile-menu';
import '../../assets/css/mobile-top-bar.css';

const MobileTopBar = ({ user }) => {
    const [, dispatch] = useContext(Context);
    const balance = formatToFloat(user?.balance || 0);
    // The "Download the App" promo row was removed. The body class is kept so the
    // layout spacing rules (previously used after dismissing the promo) still apply.
    useEffect(() => {
        document.body.classList.add('app-promo-dismissed');
        return () => {
            document.body.classList.remove('app-promo-dismissed');
        };
    }, []);

    return (
        <div
            className="mobile-top-bar mobile-top-bar--promo-hidden"
            aria-label="Mobile navigation"
        >
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
