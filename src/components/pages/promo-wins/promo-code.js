import React, { useContext, useEffect, useRef, useState } from "react";
import Modal from "react-bootstrap/Modal";
import {
    FaCopy,
    FaFacebook,
    FaGift,
    FaInstagram,
    FaPercent,
    FaPlus,
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

const SHARE_MESSAGE = (code) =>
    `Use my betmundial affiliate code ${code} and start winning! https://betmundial.com`;

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

const PromoCode = ({
    commissions,
    isLoading,
    onPromoCodeChange,
    openCustomizeSignal = 0,
}) => {
    const user = getFromLocalStorage("user");
    const [state, dispatch] = useContext(Context);
    const [localPromoCode, setLocalPromoCode] = useState(
        user?.promo_code || null
    );
    const [generating, setGenerating] = useState(false);
    const [message, setMessage] = useState(null);
    const [copied, setCopied] = useState(false);
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

    const promoCode = localPromoCode || user?.promo_code || null;

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

    const handleCopy = async (code) => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (_) {
            setMessage({
                type: "error",
                text: "Unable to copy code.",
            });
        }
    };

    const handleSocialShare = async (platform, code) => {
        const text = SHARE_MESSAGE(code);
        const encoded = encodeURIComponent(text);
        const urlEncoded = encodeURIComponent("https://betmundial.com");

        const urls = {
            whatsapp: `https://wa.me/?text=${encoded}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${urlEncoded}&quote=${encoded}`,
            x: `https://twitter.com/intent/tweet?text=${encoded}`,
            instagram: null,
        };

        if (platform === "instagram") {
            try {
                await navigator.clipboard.writeText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
                setMessage({
                    type: "success",
                    text: "Message copied — paste it in Instagram.",
                });
            } catch (_) {
                setMessage({
                    type: "error",
                    text: "Unable to copy. Please share your code manually.",
                });
            }
            return;
        }

        const shareUrl = urls[platform];
        if (shareUrl) {
            window.open(shareUrl, "_blank", "noopener,noreferrer");
        }
    };

    if (promoCode) {
        return (
            <>
                <section
                    className="promo-wins-code-card"
                    aria-label="Your affiliate code"
                >
                    <div className="promo-wins-code-main">
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
                            <span className="promo-wins-code-value">
                                {promoCode}
                            </span>
                            <button
                                type="button"
                                className="promo-wins-code-copy"
                                onClick={() => handleCopy(promoCode)}
                                aria-label="Copy affiliate code"
                            >
                                <FaCopy />
                            </button>
                        </div>
                        <p className="promo-wins-code-hint">
                            Share your code with friends and earn exciting
                            rewards when they join and play!
                            {copied ? " · Copied!" : null}
                        </p>
                        {message?.text ? (
                            <p
                                className={`promo-wins-status-msg promo-wins-status-msg--${message.type}`}
                            >
                                {message.text}
                            </p>
                        ) : null}
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
                            </div>
                        </div>
                    </div>
                </section>

                <section
                    className="promo-wins-social"
                    aria-label="Share your code on social media"
                >
                    <p className="promo-wins-social-label">
                        Share your code on social media
                    </p>
                    <div className="promo-wins-social-row">
                        <button
                            type="button"
                            className="promo-wins-social-btn"
                            onClick={() =>
                                handleSocialShare("whatsapp", promoCode)
                            }
                        >
                            <FaWhatsapp
                                className="promo-wins-social-icon promo-wins-social-icon--wa"
                                aria-hidden="true"
                            />
                            <span>WhatsApp</span>
                            <FaCopy
                                className="promo-wins-social-copy"
                                aria-hidden="true"
                            />
                        </button>
                        <button
                            type="button"
                            className="promo-wins-social-btn"
                            onClick={() =>
                                handleSocialShare("facebook", promoCode)
                            }
                        >
                            <FaFacebook
                                className="promo-wins-social-icon promo-wins-social-icon--fb"
                                aria-hidden="true"
                            />
                            <span>Facebook</span>
                            <FaCopy
                                className="promo-wins-social-copy"
                                aria-hidden="true"
                            />
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
                            <FaCopy
                                className="promo-wins-social-copy"
                                aria-hidden="true"
                            />
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
                            <FaCopy
                                className="promo-wins-social-copy"
                                aria-hidden="true"
                            />
                        </button>
                    </div>
                </section>
            </>
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
