import React, { useContext, useEffect, useRef, useState } from "react";
import Modal from "react-bootstrap/Modal";
import {
    FaFacebook,
    FaGift,
    FaInstagram,
    FaPercent,
    FaPlus,
    FaShareAlt,
    FaWhatsapp,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import makeRequest from "../../utils/fetch-request";
import {
    getFromLocalStorage,
    setLocalStorage,
} from "../../utils/local-storage";
import { Context } from "../../../context/store";
import { formatToFloat } from "../../utils/formatters";
import {
    getAffiliateShareUrl,
    openAffiliateSocialShare,
} from "./affiliate-share";

/** Narrow full-height greeting silhouette for Detail has-code panel only */
function AffiliateGreetingSilhouette() {
    return (
        <svg
            className="promo-wins-code-silhouette-svg"
            viewBox="0 0 72 200"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
            focusable="false"
        >
            <g fill="currentColor">
                <ellipse cx="22" cy="28" rx="11" ry="12" />
                <path d="M8 46c0-4 5.5-7 14-7s14 3 14 7v38c0 2-1.5 3.5-3.5 3.5H11.5C9.5 87.5 8 86 8 84V46z" />
                <path d="M11 84v78c0 3 2 5 5 5h8c3 0 5-2 5-5V84H11z" />
                <path d="M33 58c8 4 16 14 22 24 2 3.5-.5 7-4 7.5-2.5.4-4.8-1-6.2-3.2-4.5-7-10-14.5-15.8-18.8V58z" />
                <ellipse cx="52" cy="34" rx="10" ry="11" />
                <path d="M38 50c0-3.5 5-6.5 14-6.5s14 3 14 6.5v36c0 2-1.5 3.5-3.5 3.5H41.5c-2 0-3.5-1.5-3.5-3.5V50z" />
                <path d="M42 86v72c0 3 2 5 5 5h7c3 0 5-2 5-5V86H42z" />
                <path d="M40 62c-7 5-14 14-19 23-2 3.5.8 7.2 4.2 7.4 2.4.2 4.6-1.4 5.8-3.5 3.8-6.8 8.5-13.5 13.5-18.2V62z" />
                <ellipse
                    cx="40"
                    cy="88"
                    rx="9"
                    ry="6"
                    transform="rotate(-18 40 88)"
                />
            </g>
        </svg>
    );
}

const AFFILIATE_TERMS = [
    {
        title: "Eligibility",
        body: "The Betmundial Affiliate Program is open to registered Betmundial account holders who are of legal gambling age in their jurisdiction. Betmundial reserves the right to approve or decline affiliate participation at its discretion.",
    },
    {
        title: "Your affiliate code",
        body: "Each approved participant may generate one unique affiliate code. You are responsible for how your code is shared. Codes must not be used in misleading, spam, or fraudulent promotions.",
    },
    {
        title: "Earnings & payouts",
        body: "Commissions are calculated on eligible referred activity as defined by Betmundial. Payouts are subject to minimum thresholds, verification checks, and applicable schedules. Betmundial may adjust or withhold earnings linked to abuse, self-referrals, or suspicious activity.",
    },
    {
        title: "Prohibited conduct",
        body: "You may not create fake accounts, incentivize registrations with unauthorized offers, misrepresent Betmundial, target minors, or use paid brand bidding without written approval. Violations may result in code suspension and forfeiture of unpaid earnings.",
    },
    {
        title: "Changes & termination",
        body: "Betmundial may update these terms, commission rates, or program rules at any time. Continued participation after changes constitutes acceptance. Either party may end affiliate participation; unpaid eligible earnings remain subject to verification.",
    },
];

const CODE_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9_-]{2,31}$/;
const CHECK_DEBOUNCE_MS = 450;

function resolveReferralCount(commissions) {
    if (!commissions) return 0;
    const raw =
        commissions.total_referrals ??
        commissions.subscriber_count ??
        (typeof commissions.subscribers === "number"
            ? commissions.subscribers
            : null) ??
        (Array.isArray(commissions.subscribers)
            ? commissions.subscribers.length
            : null) ??
        (Array.isArray(commissions.referrals)
            ? commissions.referrals.length
            : null) ??
        (Array.isArray(commissions.members)
            ? commissions.members.length
            : null);
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
}

function resolveTotalEarnings(commissions) {
    if (!commissions) return 0;
    const raw =
        commissions.total_earnings ??
        commissions.affiliate_balance ??
        commissions.commission_balance ??
        commissions.commissions_balance ??
        commissions.total_commission ??
        commissions.earnings ??
        commissions.balance ??
        0;
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
}

function normalizeSuggestedCode(value) {
    return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-");
}

/**
 * Parse availability check responses from likely API shapes.
 * Confirm with backend: GET /user/promo-code/check?code=
 */
function parseAvailability(status, response) {
    if (status === 404 || status === 410) {
        return { state: "taken", text: "This code is already taken." };
    }
    if (status === 409) {
        return { state: "taken", text: "This code is already taken." };
    }
    if (status === 400 || status === 422) {
        return {
            state: "invalid",
            text:
                response?.message ||
                response?.error ||
                "This code is invalid.",
        };
    }
    if (status !== 200 && status !== 201) {
        return {
            state: "error",
            text:
                response?.message ||
                response?.error ||
                "Unable to check availability.",
        };
    }

    const data = response?.data ?? response ?? {};
    const available =
        data.available ??
        data.is_available ??
        data.isAvailable ??
        (typeof data.exists === "boolean" ? !data.exists : undefined) ??
        (typeof data.taken === "boolean" ? !data.taken : undefined) ??
        (typeof data.in_use === "boolean" ? !data.in_use : undefined);

    if (available === true) {
        return { state: "available", text: "Code is available." };
    }
    if (available === false) {
        const msg = String(data.message || data.error || "").toLowerCase();
        if (msg.includes("invalid")) {
            return {
                state: "invalid",
                text: data.message || data.error || "This code is invalid.",
            };
        }
        return {
            state: "taken",
            text: data.message || data.error || "This code is already taken.",
        };
    }

    const msg = String(data.message || data.error || data.status || "").toLowerCase();
    if (msg.includes("available") && !msg.includes("not")) {
        return { state: "available", text: "Code is available." };
    }
    if (
        msg.includes("taken") ||
        msg.includes("exists") ||
        msg.includes("in use") ||
        msg.includes("already")
    ) {
        return {
            state: "taken",
            text: data.message || data.error || "This code is already taken.",
        };
    }
    if (msg.includes("invalid")) {
        return {
            state: "invalid",
            text: data.message || data.error || "This code is invalid.",
        };
    }

    // Successful check with no explicit flag — treat as available
    return { state: "available", text: "Code is available." };
}

/**
 * Shared affiliate share modal (WhatsApp, Facebook, X, Instagram + copy).
 * Owned by parent so Earnings / Detail can both open it.
 */
export function AffiliateShareModal({ show, onHide, promoCode }) {
    const [copied, setCopied] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        if (!show) {
            setCopied(false);
            setMessage(null);
        }
    }, [show]);

    const handleSocialShare = async (platform, code) => {
        const { ok, hint } = await openAffiliateSocialShare(platform, code);
        if (!hint) return;
        setMessage({ type: ok ? "success" : "error", text: hint });
        if (ok) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        }
    };

    if (!promoCode) return null;

    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            className="promo-wins-customize-modal promo-wins-share-modal"
            contentClassName="promo-wins-customize-modal-content"
        >
            <Modal.Header closeButton>
                <Modal.Title>Share your affiliate code</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p className="promo-wins-social-label">
                    Share <strong>{promoCode}</strong> on social media
                </p>
                <div
                    className="promo-wins-social-row"
                    aria-label="Share your code on social media"
                >
                    <button
                        type="button"
                        className="promo-wins-social-btn"
                        onClick={() => handleSocialShare("whatsapp", promoCode)}
                    >
                        <FaWhatsapp
                            className="promo-wins-social-icon promo-wins-social-icon--wa"
                            aria-hidden="true"
                        />
                        <span>WhatsApp</span>
                    </button>
                    <button
                        type="button"
                        className="promo-wins-social-btn"
                        onClick={() => handleSocialShare("facebook", promoCode)}
                    >
                        <FaFacebook
                            className="promo-wins-social-icon promo-wins-social-icon--fb"
                            aria-hidden="true"
                        />
                        <span>Facebook</span>
                    </button>
                    <button
                        type="button"
                        className="promo-wins-social-btn"
                        onClick={() => handleSocialShare("x", promoCode)}
                    >
                        <FaXTwitter
                            className="promo-wins-social-icon promo-wins-social-icon--x"
                            aria-hidden="true"
                        />
                        <span>X</span>
                    </button>
                    <button
                        type="button"
                        className="promo-wins-social-btn"
                        onClick={() =>
                            handleSocialShare("instagram", promoCode)
                        }
                    >
                        <FaInstagram
                            className="promo-wins-social-icon promo-wins-social-icon--ig"
                            aria-hidden="true"
                        />
                        <span>Instagram</span>
                    </button>
                </div>
                <div
                    className="promo-wins-social-sep"
                    role="separator"
                    aria-hidden="true"
                />
                <div
                    className="promo-wins-share-fields"
                    aria-label="Copy link or code"
                >
                    <div className="promo-wins-share-field">
                        <label
                            className="promo-wins-share-field-label"
                            htmlFor="affiliate-share-link"
                        >
                            Link
                        </label>
                        <div className="promo-wins-share-field-control">
                            <input
                                id="affiliate-share-link"
                                type="text"
                                className="promo-wins-share-field-input"
                                value={getAffiliateShareUrl(promoCode)}
                                readOnly
                                onFocus={(e) => e.target.select()}
                            />
                            <button
                                type="button"
                                className="promo-wins-share-field-copy"
                                onClick={() =>
                                    handleSocialShare("copy", promoCode)
                                }
                            >
                                Copy
                            </button>
                        </div>
                    </div>
                    <div className="promo-wins-share-field">
                        <label
                            className="promo-wins-share-field-label"
                            htmlFor="affiliate-share-code"
                        >
                            Code
                        </label>
                        <div className="promo-wins-share-field-control">
                            <input
                                id="affiliate-share-code"
                                type="text"
                                className="promo-wins-share-field-input"
                                value={promoCode}
                                readOnly
                                onFocus={(e) => e.target.select()}
                            />
                            <button
                                type="button"
                                className="promo-wins-share-field-copy"
                                onClick={() =>
                                    handleSocialShare("copy-code", promoCode)
                                }
                            >
                                Copy
                            </button>
                        </div>
                    </div>
                </div>
                {message?.text ? (
                    <p
                        className={`promo-wins-status-msg promo-wins-status-msg--${
                            message.type === "error" ? "error" : "success"
                        }`}
                        role="status"
                    >
                        {message.text}
                    </p>
                ) : copied ? (
                    <p
                        className="promo-wins-status-msg promo-wins-status-msg--success"
                        role="status"
                    >
                        Copied!
                    </p>
                ) : null}
            </Modal.Body>
        </Modal>
    );
}

const PromoCode = ({
    commissions,
    isLoading,
    onPromoCodeChange,
    openCustomizeSignal = 0,
    onOpenShare,
}) => {
    const user = getFromLocalStorage("user");
    const [state, dispatch] = useContext(Context);
    // TEMP (dev): dummy affiliate code so has-code UI shows; remove when done.
    const [localPromoCode, setLocalPromoCode] = useState(
        user?.promo_code || "moses-tembula"
    );
    const [generating, setGenerating] = useState(false);
    const [message, setMessage] = useState(null);
    const [showTerms, setShowTerms] = useState(false);
    const [showCustomize, setShowCustomize] = useState(false);
    const [createMode, setCreateMode] = useState("custom"); // "custom" | "auto"
    const [customCode, setCustomCode] = useState("");
    const [availability, setAvailability] = useState({
        state: "idle",
        text: "",
    });

    const checkTimerRef = useRef(null);
    const checkSeqRef = useRef(0);
    const lastCustomizeSignalRef = useRef(openCustomizeSignal);

    useEffect(() => {
        if (commissions?.promo_code) {
            setLocalPromoCode(commissions.promo_code);
        }
    }, [commissions]);

    // TEMP (dev): fall back to moses-tembula when user has none; real API code always wins.
    const promoCode = localPromoCode || user?.promo_code || "moses-tembula";

    useEffect(() => {
        if (typeof onPromoCodeChange === "function") {
            onPromoCodeChange(promoCode);
        }
    }, [promoCode, onPromoCodeChange]);

    useEffect(() => {
        return () => {
            if (checkTimerRef.current) clearTimeout(checkTimerRef.current);
        };
    }, []);

    useEffect(() => {
        if (!openCustomizeSignal) return;
        if (openCustomizeSignal === lastCustomizeSignalRef.current) return;
        lastCustomizeSignalRef.current = openCustomizeSignal;
        if (promoCode) return;
        if (checkTimerRef.current) clearTimeout(checkTimerRef.current);
        checkSeqRef.current += 1;
        setCreateMode("custom");
        setCustomCode("");
        setAvailability({ state: "idle", text: "" });
        setMessage(null);
        setShowCustomize(true);
    }, [openCustomizeSignal, promoCode]);

    const referrals = resolveReferralCount(commissions);
    const totalEarnings = resolveTotalEarnings(commissions);

    const persistPromoCode = (code) => {
        setLocalPromoCode(code);
        const updatedUser = { ...(user || {}), promo_code: code };
        setLocalStorage("user", updatedUser);
        if (state?.user) {
            dispatch({
                type: "SET",
                key: "user",
                payload: { ...state.user, promo_code: code },
            });
        }
    };

    const resetCustomizeForm = () => {
        if (checkTimerRef.current) clearTimeout(checkTimerRef.current);
        checkSeqRef.current += 1;
        setCreateMode("custom");
        setCustomCode("");
        setAvailability({ state: "idle", text: "" });
        setMessage(null);
    };

    const openCustomizeForm = () => {
        resetCustomizeForm();
        setShowCustomize(true);
    };

    const closeCustomizeForm = () => {
        if (generating) return;
        setShowCustomize(false);
        resetCustomizeForm();
    };

    const runAvailabilityCheck = (rawValue) => {
        const code = normalizeSuggestedCode(rawValue);
        const seq = ++checkSeqRef.current;

        if (!code) {
            setAvailability({ state: "idle", text: "" });
            return;
        }
        if (!CODE_PATTERN.test(code)) {
            setAvailability({
                state: "invalid",
                text: "Use 3–32 characters: letters, numbers, - or _.",
            });
            return;
        }

        setAvailability({ state: "checking", text: "Checking availability…" });

        makeRequest({
            url: `/user/promo-code/check?code=${encodeURIComponent(code)}`,
            method: "GET",
            api_version: 2,
        }).then(([status, response]) => {
            if (seq !== checkSeqRef.current) return;
            setAvailability(parseAvailability(status, response));
        });
    };

    const scheduleAvailabilityCheck = (value) => {
        if (checkTimerRef.current) clearTimeout(checkTimerRef.current);
        // Invalidate any in-flight check as soon as input changes
        checkSeqRef.current += 1;

        const code = normalizeSuggestedCode(value);
        if (!code) {
            setAvailability({ state: "idle", text: "" });
            return;
        }

        setAvailability({ state: "checking", text: "Checking availability…" });
        checkTimerRef.current = setTimeout(() => {
            runAvailabilityCheck(value);
        }, CHECK_DEBOUNCE_MS);
    };

    const handleCustomCodeChange = (e) => {
        const next = e.target.value;
        setCustomCode(next);
        setMessage(null);
        scheduleAvailabilityCheck(next);
    };

    const handleCustomCodeBlur = () => {
        if (checkTimerRef.current) clearTimeout(checkTimerRef.current);
        runAvailabilityCheck(customCode);
    };

    const switchCreateMode = (mode) => {
        if (generating || mode === createMode) return;
        if (checkTimerRef.current) clearTimeout(checkTimerRef.current);
        checkSeqRef.current += 1;
        setCreateMode(mode);
        setMessage(null);
        if (mode === "custom" && customCode) {
            scheduleAvailabilityCheck(customCode);
        } else {
            setAvailability({ state: "idle", text: "" });
        }
    };

    const canGenerateCustom =
        Boolean(normalizeSuggestedCode(customCode)) &&
        availability.state === "available" &&
        !generating;

    const canGenerateAuto = !generating;

    const canGenerate =
        createMode === "auto" ? canGenerateAuto : canGenerateCustom;

    const handleCreatePromo = () => {
        if (!canGenerate) return;

        const isAuto = createMode === "auto";
        const code = isAuto ? null : normalizeSuggestedCode(customCode);
        setGenerating(true);
        setMessage(null);

        const request = {
            url: "/user/promo-code",
            method: "POST",
            api_version: 2,
        };
        if (!isAuto && code) {
            request.data = { promo_code: code, code };
        }

        makeRequest(request).then(([status, response]) => {
            setGenerating(false);
            const created =
                response?.promo_code ||
                response?.data?.promo_code ||
                response?.code ||
                response?.data?.code ||
                code;

            if ((status === 200 || status === 201) && created) {
                persistPromoCode(created);
                setShowCustomize(false);
                resetCustomizeForm();
                setMessage({ type: "success", text: "Affiliate code created." });
            } else {
                setMessage({
                    type: "error",
                    text:
                        response?.message ||
                        response?.error ||
                        "Unable to create affiliate code. Please try again.",
                });
                if (
                    !isAuto &&
                    (status === 409 ||
                        String(response?.message || response?.error || "")
                            .toLowerCase()
                            .includes("taken") ||
                        String(response?.message || response?.error || "")
                            .toLowerCase()
                            .includes("exists"))
                ) {
                    setAvailability({
                        state: "taken",
                        text: "This code is already taken.",
                    });
                }
            }
        });
    };

    const openShare = () => {
        if (typeof onOpenShare === "function") {
            onOpenShare();
        }
    };

    if (promoCode) {
        return (
            <section
                className="promo-wins-code-card"
                aria-label="Your affiliate code"
            >
                <div className="promo-wins-code-main">
                    <div
                        className="promo-wins-code-silhouette"
                        aria-hidden="true"
                    >
                        <AffiliateGreetingSilhouette />
                    </div>
                    <div className="promo-wins-code-main-body">
                        <div className="promo-wins-code-heading">
                            <span
                                className="promo-wins-status-icon"
                                aria-hidden="true"
                            >
                                <FaGift />
                            </span>
                            <p className="promo-wins-code-label">
                                Your Affiliate Code
                            </p>
                        </div>
                        <div className="promo-wins-code-box">
                            <button
                                type="button"
                                className="promo-wins-code-value"
                                onClick={openShare}
                                aria-haspopup="dialog"
                                aria-label={`Share affiliate code ${promoCode}`}
                            >
                                {promoCode}
                            </button>
                            <button
                                type="button"
                                className="promo-wins-code-share"
                                onClick={openShare}
                                aria-haspopup="dialog"
                            >
                                <FaShareAlt aria-hidden="true" />
                                <span>Click to share</span>
                            </button>
                        </div>
                        <p className="promo-wins-code-hint">
                            Share your code with friends and earn exciting
                            rewards when they join and play!
                        </p>
                        {message?.text ? (
                            <p
                                className={`promo-wins-status-msg promo-wins-status-msg--${message.type}`}
                            >
                                {message.text}
                            </p>
                        ) : null}
                    </div>
                </div>

                <div className="promo-wins-code-stats" aria-label="Affiliate stats">
                    <div className="promo-wins-code-stat">
                        <span
                            className="promo-wins-code-stat-icon promo-wins-code-stat-icon--pink"
                            aria-hidden="true"
                        >
                            <FaPercent />
                        </span>
                        <div>
                            <p className="promo-wins-code-stat-label">
                                Total Referrals
                            </p>
                            <p className="promo-wins-code-stat-value">
                                {isLoading ? "…" : referrals}
                            </p>
                        </div>
                    </div>
                    <div className="promo-wins-code-stat">
                        <span
                            className="promo-wins-code-stat-icon promo-wins-code-stat-icon--yellow"
                            aria-hidden="true"
                        >
                            <FaGift />
                        </span>
                        <div>
                            <p className="promo-wins-code-stat-label">
                                Total Earnings
                            </p>
                            <p className="promo-wins-code-stat-value promo-wins-code-stat-value--yellow">
                                {isLoading
                                    ? "…"
                                    : `KES ${formatToFloat(totalEarnings)}`}
                            </p>
                            <button
                                type="button"
                                className="promo-wins-code-earnings-share"
                                onClick={openShare}
                                aria-haspopup="dialog"
                            >
                                <FaShareAlt aria-hidden="true" />
                                <span>Click to share/promote</span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <>
            <section
                className="promo-wins-nocode-cta"
                aria-label="Get your affiliate code"
            >
                <h2 className="promo-wins-nocode-heading">
                    Join 20000+ others to earn with betmundial
                </h2>
                <button
                    type="button"
                    className="promo-wins-create-btn promo-wins-create-btn--large"
                    onClick={openCustomizeForm}
                >
                    <span className="promo-wins-create-plus" aria-hidden="true">
                        <FaPlus />
                    </span>
                    Get your affiliate code
                </button>
                {message?.text && !showCustomize ? (
                    <p
                        className={`promo-wins-status-msg promo-wins-status-msg--${message.type}`}
                    >
                        {message.text}
                    </p>
                ) : null}
                <p className="promo-wins-nocode-desc">
                    You earn and grow with betmundial through your network.
                </p>
                <button
                    type="button"
                    className="promo-wins-terms-link"
                    onClick={() => setShowTerms(true)}
                >
                    Terms
                </button>
            </section>

            <Modal
                show={showCustomize}
                onHide={closeCustomizeForm}
                centered
                className="promo-wins-customize-modal"
                contentClassName="promo-wins-customize-modal-content"
            >
                <Modal.Header closeButton closeVariant="white">
                    <Modal.Title>Get your affiliate code</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div
                        className="promo-wins-create-mode"
                        role="tablist"
                        aria-label="Code creation mode"
                    >
                        <button
                            type="button"
                            role="tab"
                            id="affiliate-mode-custom"
                            aria-selected={createMode === "custom"}
                            aria-controls="affiliate-mode-panel"
                            className={`promo-wins-create-mode-btn${
                                createMode === "custom"
                                    ? " promo-wins-create-mode-btn--active"
                                    : ""
                            }`}
                            onClick={() => switchCreateMode("custom")}
                            disabled={generating}
                        >
                            Custom
                        </button>
                        <button
                            type="button"
                            role="tab"
                            id="affiliate-mode-auto"
                            aria-selected={createMode === "auto"}
                            aria-controls="affiliate-mode-panel"
                            className={`promo-wins-create-mode-btn${
                                createMode === "auto"
                                    ? " promo-wins-create-mode-btn--active"
                                    : ""
                            }`}
                            onClick={() => switchCreateMode("auto")}
                            disabled={generating}
                        >
                            Autogenerate
                        </button>
                    </div>

                    <div
                        id="affiliate-mode-panel"
                        role="tabpanel"
                        aria-labelledby={
                            createMode === "auto"
                                ? "affiliate-mode-auto"
                                : "affiliate-mode-custom"
                        }
                    >
                        {createMode === "custom" ? (
                            <>
                                <label
                                    className="promo-wins-customize-label"
                                    htmlFor="affiliate-custom-code"
                                >
                                    Customize code
                                </label>
                                <input
                                    id="affiliate-custom-code"
                                    type="text"
                                    className={`promo-wins-customize-input${
                                        availability.state === "taken" ||
                                        availability.state === "invalid"
                                            ? " promo-wins-customize-input--error"
                                            : ""
                                    }${
                                        availability.state === "available"
                                            ? " promo-wins-customize-input--ok"
                                            : ""
                                    }`}
                                    placeholder="moses-tembula"
                                    value={customCode}
                                    onChange={handleCustomCodeChange}
                                    onBlur={handleCustomCodeBlur}
                                    autoComplete="off"
                                    autoCapitalize="off"
                                    spellCheck={false}
                                    maxLength={32}
                                    disabled={generating}
                                    aria-describedby="affiliate-code-availability"
                                />
                                {availability.text ? (
                                    <p
                                        id="affiliate-code-availability"
                                        className={`promo-wins-customize-feedback promo-wins-customize-feedback--${availability.state}`}
                                        role="status"
                                        aria-live="polite"
                                    >
                                        {availability.text}
                                    </p>
                                ) : (
                                    <p
                                        id="affiliate-code-availability"
                                        className="promo-wins-customize-hint"
                                    >
                                        Pick a unique code friends will remember.
                                    </p>
                                )}
                            </>
                        ) : (
                            <>
                                <p className="promo-wins-customize-hint promo-wins-autogen-copy">
                                    We&apos;ll create a unique affiliate code for you
                                    automatically. You can share it right away once
                                    it&apos;s ready.
                                </p>
                                <p
                                    className="promo-wins-autogen-notice"
                                    role="note"
                                >
                                    Once generated, you won&apos;t be able to update
                                    your code. We recommend creating a custom code
                                    instead.
                                </p>
                            </>
                        )}
                    </div>

                    {message?.text ? (
                        <p
                            className={`promo-wins-status-msg promo-wins-status-msg--${message.type}`}
                        >
                            {message.text}
                        </p>
                    ) : null}
                </Modal.Body>
                <Modal.Footer>
                    <button
                        type="button"
                        className="promo-wins-customize-cancel"
                        onClick={closeCustomizeForm}
                        disabled={generating}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="promo-wins-customize-generate"
                        onClick={handleCreatePromo}
                        disabled={!canGenerate}
                    >
                        {generating
                            ? "Creating…"
                            : createMode === "auto"
                              ? "Generate"
                              : "Submit"}
                    </button>
                </Modal.Footer>
            </Modal>

            <Modal
                show={showTerms}
                onHide={() => setShowTerms(false)}
                centered
                className="promo-wins-terms-modal"
                contentClassName="promo-wins-terms-modal-content"
            >
                <Modal.Header closeButton closeVariant="white">
                    <Modal.Title>Affiliate Terms &amp; Conditions</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="promo-wins-terms-intro">
                        By generating and using an affiliate code, you agree to
                        these program terms in addition to Betmundial&apos;s
                        general Terms of Use.
                    </p>
                    {AFFILIATE_TERMS.map((section) => (
                        <div className="promo-wins-terms-block" key={section.title}>
                            <h3>{section.title}</h3>
                            <p>{section.body}</p>
                        </div>
                    ))}
                    <p className="promo-wins-terms-note">
                        Placeholder terms pending official affiliate program
                        copy. Contact support for the latest policy details.
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <button
                        type="button"
                        className="promo-wins-terms-close"
                        onClick={() => setShowTerms(false)}
                    >
                        Close
                    </button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default React.memo(PromoCode);
