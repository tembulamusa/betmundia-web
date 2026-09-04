import React, { useContext, useEffect, useState } from "react";
import Offcanvas from "react-bootstrap/Offcanvas";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../../context/store";

import { IoMdLogOut } from "react-icons/io";
import { FaGifts, FaRegUser, FaUser, FaCheckCircle, FaGift, FaChevronRight, FaBullhorn, FaShieldAlt, FaCoins, FaInfoCircle, FaPlus } from "react-icons/fa";
import { IoListCircleOutline, IoWalletOutline } from "react-icons/io5";
import { MdOutlineFileUpload, MdLockOutline, MdPhoneIphone } from "react-icons/md";

import ComingSoon from "../pages/comingsoon/ComingSoon";
import { formatToFloat } from "../utils/formatters";
import makeRequest from "../utils/fetch-request";
import {
  getFromLocalStorage,
  setLocalStorage,
} from "../utils/local-storage";

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

function resolveAffiliateBalance(source) {
  if (!source || typeof source !== "object") return null;
  const raw =
    source.affiliate_balance ??
    source.commission_balance ??
    source.commissions_balance ??
    source.balance ??
    source.total_commission ??
    source.earnings ??
    null;
  if (raw == null || raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function MobileMenu(props) {
  const { user } = props;

  const [show, setShow] = useState(false);
  const [state, dispatch] = useContext(Context);
  const navigate = useNavigate();
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [showBonusTooltip, setShowBonusTooltip] = useState(false);
  const [affiliateCode, setAffiliateCode] = useState(
    user?.promo_code || null
  );
  const [affiliateBalance, setAffiliateBalance] = useState(null);
  const [generatingCode, setGeneratingCode] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const closeThen = (fn) => () => {
    setShow(false);
    if (typeof fn === "function") fn();
  };

  const balance = formatToFloat(user?.balance || 0);
  const bonus = formatToFloat(user?.bonus || user?.bonus_balance || 0);

  useEffect(() => {
    setAffiliateCode(user?.promo_code || null);
  }, [user?.promo_code]);

  useEffect(() => {
    if (!show || !user) return;

    makeRequest({ url: "/user/commissions", method: "GET", api_version: 2 }).then(
      ([status, response]) => {
        if (status !== 200) return;
        const data = response?.data ?? response ?? null;
        if (!data) return;
        if (data.promo_code) {
          setAffiliateCode(data.promo_code);
        }
        setAffiliateBalance(resolveAffiliateBalance(data));
      }
    );
  }, [show, user]);

  const persistAffiliateCode = (code) => {
    setAffiliateCode(code);
    const storedUser = getFromLocalStorage("user") || user || {};
    const updatedUser = { ...storedUser, promo_code: code };
    setLocalStorage("user", updatedUser);
    if (state?.user) {
      dispatch({
        type: "SET",
        key: "user",
        payload: { ...state.user, promo_code: code },
      });
    }
  };

  const handleGenerateAffiliateCode = (e) => {
    e?.stopPropagation?.();
    if (generatingCode) return;
    setGeneratingCode(true);

    makeRequest({
      url: "/user/promo-code",
      method: "POST",
      api_version: 2,
    }).then(([status, response]) => {
      setGeneratingCode(false);
      const code =
        response?.promo_code ||
        response?.data?.promo_code ||
        response?.code;

      if ((status === 200 || status === 201) && code) {
        persistAffiliateCode(code);
        const bal = resolveAffiliateBalance(response?.data ?? response);
        if (bal != null) setAffiliateBalance(bal);
      }
    });
  };

  const handleAffiliateSectionClick = () => {
    if (!affiliateCode) {
      handleGenerateAffiliateCode();
      return;
    }
    setShow(false);
    navigate("/affiliate");
  };

  const hasAffiliateBalance =
    affiliateBalance != null && Number(affiliateBalance) > 0;

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
                  </span>
                  <p className="account-drawer-wallet-side-amount">
                    KSh {bonus}
                    <span className="bonus-tooltip-wrap">
                      <button
                        type="button"
                        className="bonus-tooltip-trigger"
                        aria-label="Bonus terms"
                        aria-expanded={showBonusTooltip}
                        onClick={() => setShowBonusTooltip((v) => !v)}
                        onBlur={() => setShowBonusTooltip(false)}
                      >
                        Terms
                        <FaInfoCircle className="bonus-tooltip-icon" aria-hidden="true" />
                      </button>

                      {showBonusTooltip && (
                        <span className="bonus-tooltip-bubble" role="tooltip">
                          Bonus funds are subject to wagering requirements and expiry. See the Promotions page for full T&amp;Cs.
                          <span className="bonus-tooltip-arrow" aria-hidden="true" />
                        </span>
                      )}
                    </span>
                  </p>
                </div>
                {/* Restricted Balance removed per request */}
              </div>
            </div>

            <div
              className="account-drawer-affiliate"
              role="button"
              tabIndex={0}
              onClick={handleAffiliateSectionClick}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleAffiliateSectionClick();
                }
              }}
              aria-label={
                affiliateCode
                  ? "Open affiliate page"
                  : "Generate affiliate code"
              }
            >
              <div className="account-drawer-wallet-grid">
                <div className="account-drawer-affiliate-code-wrap">
                  <p className="account-drawer-wallet-main-label">Code</p>
                  {affiliateCode ? (
                    <p className="account-drawer-affiliate-code">{affiliateCode}</p>
                  ) : (
                    <button
                      type="button"
                      className="account-drawer-affiliate-generate"
                      disabled={generatingCode}
                      onClick={handleGenerateAffiliateCode}
                    >
                      <FaPlus aria-hidden="true" />
                      {generatingCode ? "Generating…" : "Generate code"}
                    </button>
                  )}
                </div>
                <div className="account-drawer-wallet-divider" aria-hidden="true" />
                <div className="account-drawer-affiliate-bal">
                  <p className="account-drawer-wallet-main-label">
                    Affiliate balance
                  </p>
                  {hasAffiliateBalance ? (
                    <p className="account-drawer-affiliate-bal-amount">
                      KSh {formatToFloat(affiliateBalance)}
                    </p>
                  ) : (
                    <p className="account-drawer-affiliate-join">join to earn</p>
                  )}
                </div>
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
                to="/affiliate"
                className="account-drawer-item"
                onClick={handleClose}
              >
                <span className="account-drawer-item-icon" aria-hidden="true">
                  <FaGifts />
                </span>
                <span className="account-drawer-item-label">Affiliate</span>
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
