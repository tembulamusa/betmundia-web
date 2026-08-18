import React, { useContext, useState } from "react";
import Offcanvas from "react-bootstrap/Offcanvas";
import { Link } from "react-router-dom";
import { Context } from "../../context/store";

import { IoMdLogOut } from "react-icons/io";
import { FaGifts, FaRegUser, FaUser, FaCheckCircle, FaGift, FaLock, FaChevronRight, FaBullhorn, FaShieldAlt, FaCoins } from "react-icons/fa";
import { IoListCircleOutline, IoWalletOutline } from "react-icons/io5";
import { MdOutlineFileUpload, MdLockOutline, MdPhoneIphone } from "react-icons/md";

import ComingSoon from "../pages/comingsoon/ComingSoon";
import { formatToFloat } from "../utils/formatters";

const PROMO_WINS_COUNT = 0;

function formatMsisdn(msisdn) {
  if (!msisdn) return "";
  const digits = String(msisdn).replace(/\D/g, "");
  if (digits.startsWith("254") && digits.length >= 12) {
    return `+254 ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9, 12)}`;
  }
  if (digits.startsWith("0") && digits.length === 10) {
    return `+254 ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 10)}`;
  }
  if (digits.length === 9) {
    return `+254 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)}`;
  }
  return String(msisdn);
}

function MobileMenu(props) {
  const { user } = props;

  const [show, setShow] = useState(false);
  const [, dispatch] = useContext(Context);
  const [showComingSoon, setShowComingSoon] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const closeThen = (fn) => () => {
    setShow(false);
    if (typeof fn === "function") fn();
  };

  const balance = formatToFloat(user?.balance || 0);
  const bonus = formatToFloat(user?.bonus || user?.bonus_balance || 0);

  return (
    <span className="inline-block" style={{ height: "auto" }}>
      <span
        className="font-[500] cursor-pointer user-profile"
        onClick={handleShow}
      >
        <FaRegUser className="inline-block user-profile-icon" />
        {user ? (
          <span className="user-profile-text hidden d-md-inline">Account</span>
        ) : (
          <span></span>
        )}
      </span>

      <Offcanvas
        placement="end"
        show={show}
        onHide={handleClose}
        className="account-drawer"
        style={{ height: "auto" }}
      >
        <Offcanvas.Body className="account-drawer-body">
          <div className="account-drawer-header">
            <div className="account-drawer-header-left">
              <span className="account-drawer-header-icon" aria-hidden="true">
                <FaUser />
              </span>
              <div>
                <h2 className="account-drawer-title">Account</h2>
                <p className="account-drawer-subtitle">Manage your account and wallet</p>
              </div>
            </div>
            <button
              type="button"
              className="account-drawer-close"
              onClick={handleClose}
              aria-label="Close"
            >
              &times;
            </button>
          </div>

          <div className="account-drawer-user">
            <span className="account-drawer-avatar" aria-hidden="true">
              <FaUser />
            </span>
            <div className="account-drawer-user-meta">
              <p className="account-drawer-phone">
                {formatMsisdn(user?.msisdn) || user?.msisdn}
              </p>
              <span className="account-drawer-verified">
                <FaCheckCircle className="account-drawer-verified-icon" />
                Verified Account
              </span>
            </div>
          </div>

          <div className="account-drawer-wallet">
            <div className="account-drawer-wallet-label">
              <IoWalletOutline aria-hidden="true" />
              WALLET
            </div>
            <div className="account-drawer-wallet-grid">
              <div>
                <p className="account-drawer-wallet-main-label">
                  Available Balance
                </p>
                <p className="account-drawer-wallet-main-amount">
                  KSh {balance}
                </p>
              </div>
              <div className="account-drawer-wallet-divider" aria-hidden="true" />
              <div className="account-drawer-wallet-side">
                <div className="account-drawer-wallet-side-row">
                  <span className="account-drawer-wallet-side-label">
                    <FaGift aria-hidden="true" />
                    Bonus
                    <span className="bonus-terms" tabIndex={0} aria-label="Bonus terms">
                      <span className="bonus-terms-icon" aria-hidden="true">i</span>
                      <span className="bonus-terms-tooltip">Bonus funds are subject to wagering requirements and expiry. See Promotions page for full T&amp;Cs.</span>
                    </span>
                  </span>
                  <p className="account-drawer-wallet-side-amount">
                    KSh {bonus}
                  </p>
                </div>
                {/* Restricted Balance removed per request */}
              </div>
            </div>
          </div>

          <div className="account-drawer-actions">
            <Link
              to="/deposit"
              className="account-drawer-action account-drawer-action-deposit sportpesa-deposit-btn"
              onClick={handleClose}
            >
              <FaCoins className="deposit-coins-icon" aria-hidden="true" />
              Deposit
            </Link>
            <Link
              to="/withdraw"
              className="account-drawer-action account-drawer-action-withdraw sportpesa-withdraw-btn"
              onClick={handleClose}
            >
              <MdOutlineFileUpload aria-hidden="true" />
              Withdraw
            </Link>
          </div>

          <div className="account-drawer-section">
            <p className="account-drawer-section-label">Activity</p>
            <div className="account-drawer-list">
              <Link
                to="/my-bets"
                className="account-drawer-item"
                onClick={handleClose}
              >
                <span className="account-drawer-item-icon" aria-hidden="true">
                  <IoListCircleOutline />
                </span>
                <span className="account-drawer-item-label">My Bets</span>
                <FaChevronRight className="account-drawer-chevron" aria-hidden="true" />
              </Link>

              <Link
                to="/promo-wins"
                className="account-drawer-item"
                onClick={handleClose}
              >
                <span className="account-drawer-item-icon" aria-hidden="true">
                  <FaGifts />
                </span>
                <span className="account-drawer-item-label">
                  Promo Wins
                  <span className="account-drawer-count">{PROMO_WINS_COUNT}</span>
                </span>
                <FaChevronRight className="account-drawer-chevron" aria-hidden="true" />
              </Link>

              <button
                type="button"
                className="account-drawer-item"
                onClick={closeThen(() =>
                  dispatch({
                    type: "SET",
                    key: "showcheckmpesadepositstatus",
                    payload: true,
                  })
                )}
              >
                <span className="account-drawer-item-icon" aria-hidden="true">
                  <MdPhoneIphone />
                </span>
                <span className="account-drawer-item-label">
                  Check MPESA Deposit status
                </span>
                <FaChevronRight className="account-drawer-chevron" aria-hidden="true" />
              </button>

              <Link
                to="/promotions"
                className="account-drawer-item"
                onClick={handleClose}
              >
                <span className="account-drawer-item-icon" aria-hidden="true">
                  <FaBullhorn />
                </span>
                <span className="account-drawer-item-label">Promotions</span>
                <FaChevronRight className="account-drawer-chevron" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="account-drawer-section">
            <p className="account-drawer-section-label">Account</p>
            <div className="account-drawer-list">
              <Link
                to="/reset-password"
                className="account-drawer-item"
                onClick={handleClose}
              >
                <span className="account-drawer-item-icon" aria-hidden="true">
                  <MdLockOutline />
                </span>
                <span className="account-drawer-item-label">Change Password</span>
                <FaChevronRight className="account-drawer-chevron" aria-hidden="true" />
              </Link>

              <Link
                to="/exclude"
                className="account-drawer-item"
                onClick={handleClose}
              >
                <span className="account-drawer-item-icon" aria-hidden="true">
                  <FaShieldAlt />
                </span>
                <span className="account-drawer-item-label">
                  Exclude myself from betting
                </span>
                <FaChevronRight className="account-drawer-chevron" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <Link
            to="/logout"
            className="account-drawer-logout"
            onClick={handleClose}
          >
            <IoMdLogOut aria-hidden="true" />
            Logout
          </Link>

          <ComingSoon
            show={showComingSoon}
            onClose={() => setShowComingSoon(false)}
          />
        </Offcanvas.Body>
      </Offcanvas>
    </span>
  );
}

export default MobileMenu;
