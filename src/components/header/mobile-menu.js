import React, { useContext, useEffect, useState } from "react";
import Offcanvas from "react-bootstrap/Offcanvas";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../../context/store";

import { IoMdLogOut } from "react-icons/io";
import { FaGifts, FaRegUser, FaUser, FaCheckCircle, FaGift, FaChevronRight, FaBullhorn, FaShieldAlt, FaCoins, FaInfoCircle, FaPlus, FaShareAlt, FaStar } from "react-icons/fa";
import { IoListCircleOutline, IoWalletOutline } from "react-icons/io5";
import { MdOutlineFileUpload, MdLockOutline, MdPhoneIphone } from "react-icons/md";

import ComingSoon from "../pages/comingsoon/ComingSoon";
import {
  AffiliateGetCodeModal,
  AffiliateShareModal,
} from "../pages/promo-wins/promo-code";
import { formatToFloat } from "../utils/formatters";
import makeRequest from "../utils/fetch-request";
import { useBonusCatalog } from "../utils/useBonusCatalog";
import BonusTermsModal, { findBonus, DEPOSIT_BONUS_CODE } from "../right/bonus-terms-modal";
import {
  getFromLocalStorage,
  setLocalStorage,
  USER_STORAGE_TTL_MS,
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
  // Daily deposit bonus terms come from GET /bonuses (fetched once, cached).
  const { catalog, bonusStakePct, cashStakePct, minOdds, maxGames, minGames, expiryHours } = useBonusCatalog();
  const depositBonus = findBonus(catalog?.bonuses, DEPOSIT_BONUS_CODE);
  const [affiliateCode, setAffiliateCode] = useState(
    user?.promo_code || null
  );
  const [affiliateBalance, setAffiliateBalance] = useState(null);
  const [showGetCodeModal, setShowGetCodeModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  useEffect(() => {
    if (state?.showaccountdrawer) {
      setShow(true);
      dispatch({ type: "DEL", key: "showaccountdrawer" });
    }
  }, [state?.showaccountdrawer, dispatch]);

  const closeThen = (fn) => () => {
    setShow(false);
    if (typeof fn === "function") fn();
  };

  const balance = formatToFloat(user?.balance || 0);
  const bonus = formatToFloat(user?.bonus || user?.bonus_balance || 0);
  const loyaltyPointsRaw =
    user?.loyalty_points ??
    user?.loyaltyPoints ??
    user?.loyalty ??
    user?.points ??
    0;
  const loyaltyPoints = Number.isFinite(Number(loyaltyPointsRaw))
    ? Math.max(0, Math.round(Number(loyaltyPointsRaw)))
    : 0;
  const loyaltyPointsDisplay = `${loyaltyPoints.toLocaleString("en-KE")} pts`;

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

  const handleCodeCreated = (code) => {
    setAffiliateCode(code);
    // AffiliateGetCodeModal already persists user.promo_code; keep local drawer state in sync.
    const storedUser = getFromLocalStorage("user") || user || {};
    if (storedUser?.promo_code !== code) {
      setLocalStorage("user", { ...storedUser, promo_code: code }, USER_STORAGE_TTL_MS);
    }
    if (state?.user && state.user.promo_code !== code) {
      dispatch({
        type: "SET",
        key: "user",
        payload: { ...state.user, promo_code: code },
      });
    }
  };

  const openGetCodeModal = (e) => {
    e?.stopPropagation?.();
    e?.preventDefault?.();
    setShowGetCodeModal(true);
  };

  const openShareModal = (e) => {
    e?.stopPropagation?.();
    e?.preventDefault?.();
    if (!affiliateCode) return;
    setShowShareModal(true);
  };

  const handleAffiliateSectionClick = () => {
    if (!affiliateCode) {
      setShowGetCodeModal(true);
      return;
    }
    setShow(false);
    navigate("/affiliate");
  };

  const affiliateBalanceDisplay = formatToFloat(
    affiliateBalance != null && Number.isFinite(Number(affiliateBalance))
      ? Number(affiliateBalance)
      : 0
  );

  return (
    <span className="inline-block" style={{ height: "auto" }}>
      <span
        className="font-[500] cursor-pointer user-profile"
        onClick={handleShow}
        aria-label="Account"
      >
        <FaRegUser className="inline-block user-profile-icon" aria-hidden="true" />
      </span>

      <Offcanvas
        placement="end"
        show={show}
        onHide={handleClose}
        className="account-drawer"
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
                        onClick={() => setShowBonusTooltip(true)}
                      >
                        Terms
                        <FaInfoCircle className="bonus-tooltip-icon" aria-hidden="true" />
                      </button>

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
                  : "Get your affiliate code"
              }
            >
              <div className="account-drawer-affiliate-label">Affiliate</div>
              <div className="account-drawer-wallet-grid">
                <div className="account-drawer-affiliate-code-wrap">
                  <p className="account-drawer-wallet-main-label">Code</p>
                  {affiliateCode ? (
                    <div className="account-drawer-affiliate-code-row">
                      <button
                        type="button"
                        className="account-drawer-affiliate-code"
                        onClick={openShareModal}
                        aria-haspopup="dialog"
                        aria-label={`Share affiliate code ${affiliateCode}`}
                      >
                        {affiliateCode}
                      </button>
                      <button
                        type="button"
                        className="account-drawer-affiliate-share"
                        onClick={openShareModal}
                        aria-haspopup="dialog"
                      >
                        <FaShareAlt aria-hidden="true" />
                        Share
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="account-drawer-affiliate-generate"
                      onClick={openGetCodeModal}
                    >
                      <FaPlus aria-hidden="true" />
                      Generate code
                    </button>
                  )}
                </div>
                <div className="account-drawer-wallet-divider" aria-hidden="true" />
                <div className="account-drawer-affiliate-bal">
                  <p className="account-drawer-affiliate-bal-amount">
                    <span className="account-drawer-affiliate-bal-prefix">
                      Balance:
                    </span>{" "}
                    {affiliateBalanceDisplay}
                  </p>
                  {affiliateCode ? (
                    <button
                      type="button"
                      className="account-drawer-affiliate-cta"
                      onClick={openShareModal}
                      aria-haspopup="dialog"
                    >
                      <FaShareAlt aria-hidden="true" />
                      Promote
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="account-drawer-affiliate-cta"
                      onClick={openGetCodeModal}
                      aria-haspopup="dialog"
                    >
                      <FaPlus aria-hidden="true" />
                      Join
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="account-drawer-loyalty">
              <div className="account-drawer-loyalty-left">
                <span className="account-drawer-loyalty-icon" aria-hidden="true">
                  <FaStar />
                </span>
                <div className="account-drawer-loyalty-copy">
                  <span className="account-drawer-loyalty-label">Loyalty Points</span>
                  <Link
                    to="/loyalty-points"
                    className="account-drawer-loyalty-use"
                    onClick={handleClose}
                  >
                    How to use
                  </Link>
                </div>
              </div>
              <div className="account-drawer-loyalty-right">
                <span className="account-drawer-loyalty-amount">
                  {loyaltyPointsDisplay}
                </span>
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
                <span className="account-drawer-item-label">Bet History</span>
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

      <AffiliateGetCodeModal
        show={showGetCodeModal}
        onHide={() => setShowGetCodeModal(false)}
        onCreated={handleCodeCreated}
      />
      <AffiliateShareModal
        show={showShareModal}
        onHide={() => setShowShareModal(false)}
        promoCode={affiliateCode}
      />
      <BonusTermsModal
        show={showBonusTooltip}
        onHide={() => setShowBonusTooltip(false)}
        bonus={depositBonus}
        title="Daily Deposit Bonus Terms"
        intro={(
          <p className="bonus-terms-modal-intro">
            Qualifying bonus bets use {cashStakePct}% cash and {bonusStakePct}% bonus,
            with {minGames}–{maxGames} games at min odds {minOdds} each. Bonus expires {expiryHours} hours after award.
            If the slip does not qualify, the bet is placed from cash only.
          </p>
        )}
      />
    </span>
  );
}

export default MobileMenu;
