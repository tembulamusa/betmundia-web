import React, { useContext, useEffect, useState } from "react";
import { FaCopy, FaPercent, FaPlus, FaShareAlt } from "react-icons/fa";
import makeRequest from "../../utils/fetch-request";
import {
    getFromLocalStorage,
    setLocalStorage,
} from "../../utils/local-storage";
import { Context } from "../../../context/store";

const PromoCode = ({ commissions, isLoading }) => {
    const user = getFromLocalStorage("user");
    const [state, dispatch] = useContext(Context);
    const [subscribers, setSubscribers] = useState(
        commissions?.subscribers ?? commissions?.subscriber_count ?? 0
    );
    const [localPromoCode, setLocalPromoCode] = useState(user?.promo_code || null);
    const [generating, setGenerating] = useState(false);
    const [message, setMessage] = useState(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (commissions?.subscribers != null) {
            setSubscribers(commissions.subscribers);
        } else if (commissions?.subscriber_count != null) {
            setSubscribers(commissions.subscriber_count);
        }
        if (commissions?.promo_code) {
            setLocalPromoCode(commissions.promo_code);
        }
    }, [commissions]);

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

    const handleCreatePromo = () => {
        if (generating) return;
        setGenerating(true);
        setMessage(null);

        // Existing UI previously stubbed create; call backend when available.
        makeRequest({
            url: "/user/promo-code",
            method: "POST",
            api_version: 2,
        }).then(([status, response]) => {
            setGenerating(false);
            const code =
                response?.promo_code ||
                response?.data?.promo_code ||
                response?.code;

            if ((status === 200 || status === 201) && code) {
                persistPromoCode(code);
                setMessage({ type: "success", text: "Promo code created." });
            } else {
                setMessage({
                    type: "error",
                    text:
                        response?.message ||
                        response?.error ||
                        "Unable to create promo code. Please try again.",
                });
            }
        });
    };

    const handleShare = async (code) => {
        const shareText = `Use my betmundial promo code ${code} and start winning! https://betmundial.com`;
        try {
            if (navigator.share) {
                await navigator.share({
                    title: "Betmundial Promo Wins",
                    text: shareText,
                });
                return;
            }
        } catch (_) {
            /* user cancelled or share unavailable */
        }
        try {
            await navigator.clipboard.writeText(shareText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (_) {
            setMessage({
                type: "error",
                text: "Unable to share. Please copy your code manually.",
            });
        }
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

    const promoCode = localPromoCode || user?.promo_code;

    if (promoCode) {
        return (
            <section
                className="promo-wins-status promo-wins-status--active"
                aria-label="Your promo code"
            >
                <div className="promo-wins-status-icon" aria-hidden="true">
                    <FaPercent />
                </div>
                <div className="promo-wins-status-copy">
                    <p className="promo-wins-status-title">Your promo code</p>
                    <p className="promo-wins-status-code">{promoCode}</p>
                    <p className="promo-wins-status-sub">
                        Subscribers:{" "}
                        <strong>{isLoading ? "…" : subscribers}</strong>
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
                <div className="promo-wins-status-actions">
                    <button
                        type="button"
                        className="promo-wins-create-btn promo-wins-create-btn--ghost"
                        onClick={() => handleCopy(promoCode)}
                    >
                        <span className="promo-wins-create-plus" aria-hidden="true">
                            <FaCopy />
                        </span>
                        Copy
                    </button>
                    <button
                        type="button"
                        className="promo-wins-create-btn"
                        onClick={() => handleShare(promoCode)}
                    >
                        <span className="promo-wins-create-plus" aria-hidden="true">
                            <FaShareAlt />
                        </span>
                        Share
                    </button>
                </div>
            </section>
        );
    }

    return (
        <section className="promo-wins-status" aria-label="Promo code status">
            <div className="promo-wins-status-icon" aria-hidden="true">
                <FaPercent />
            </div>
            <div className="promo-wins-status-copy">
                <p className="promo-wins-status-title">You do not have a promo code.</p>
                <p className="promo-wins-status-sub">
                    Create your own promo code and start sharing to earn amazing rewards.
                </p>
                {message?.text ? (
                    <p
                        className={`promo-wins-status-msg promo-wins-status-msg--${message.type}`}
                    >
                        {message.text}
                    </p>
                ) : null}
            </div>
            <button
                type="button"
                className="promo-wins-create-btn"
                onClick={handleCreatePromo}
                disabled={generating}
            >
                <span className="promo-wins-create-plus" aria-hidden="true">
                    <FaPlus />
                </span>
                {generating ? "Creating…" : "Create Promo"}
            </button>
        </section>
    );
};

export default React.memo(PromoCode);
