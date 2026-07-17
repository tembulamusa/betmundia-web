import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "react-bootstrap";
import { GiSoccerBall } from "react-icons/gi";
import {
    FaShieldAlt,
    FaStopwatch,
    FaCoins,
    FaGift,
    FaUserPlus,
    FaTicketAlt,
    FaTrophy,
    FaCheckCircle,
    FaInfoCircle,
    FaChevronRight,
    FaChevronUp,
    FaMoneyBillWave,
} from "react-icons/fa";
import makeRequest from "../../utils/fetch-request";
import { getFromLocalStorage } from "../../utils/local-storage";
import HomeTeamDefaultFlag from "../../../assets/team-jersies/home-default.png";
import AwayTeamDefaultFlag from "../../../assets/team-jersies/away-default.png";

const MODAL_VARIANTS = {
    register: {
        title: "Register for Free Bet",
        message:
            "This Product is meant for New Registrations. Register to automatically get your freebet",
        redirectTo: "/signup",
    },
    hasFreebet: {
        title: "Free Bet",
        message: "You already have a Free Bet. Find it on the homepage.",
        redirectTo: "/",
    },
    noFreebet: {
        title: "Free Bet",
        message: "You don't currently have a Free Bet available.",
        redirectTo: "/",
    },
};

const getClaimModalVariant = () => {
    const user = getFromLocalStorage("user");
    const isLoggedIn = Boolean(user?.token);

    if (!isLoggedIn) {
        return MODAL_VARIANTS.register;
    }

    if (user?.has_freebet == 1) {
        return MODAL_VARIANTS.hasFreebet;
    }

    return MODAL_VARIANTS.noFreebet;
};

const FEATURES = [
    {
        icon: FaShieldAlt,
        title: "Risk-Free Betting",
        text: "Place bets without risking your own money.",
    },
    {
        icon: FaStopwatch,
        title: "Easy to Claim",
        text: "Claim in seconds after completing registration.",
    },
    {
        icon: FaCoins,
        title: "Real Winnings",
        text: "Win real money with your Free Bet.",
    },
    {
        icon: FaGift,
        title: "Limited Time Offer",
        text: "Don't miss out on this exclusive welcome bonus.",
    },
];

const STEPS = [
    {
        icon: FaUserPlus,
        title: "Sign Up",
        text: "Create your BetMundial account.",
    },
    {
        icon: FaShieldAlt,
        title: "Verify Your Account",
        text: "Complete phone number verification.",
    },
    {
        icon: FaTicketAlt,
        title: "Claim Free Bet",
        text: "Your Free Bet will be added automatically.",
    },
    {
        icon: FaTrophy,
        title: "Place Your Bet",
        text: "Use your Free Bet and win real cash!",
    },
];

const DETAILS = [
    { icon: FaMoneyBillWave, label: "Free Bet Amount", value: "KSh 30" },
    { icon: FaTicketAlt, label: "Applicable Markets", value: "Sportsbook (Pre-match)" },
    { icon: FaCoins, label: "Stake", value: "Free Bet (Not Real Money)" },
    { icon: FaTrophy, label: "Returns", value: "Real Money (Winnings Only)" },
];

const IMPORTANT = [
    "Free Bet cannot be cashed out.",
    "Only one Free Bet per new customer.",
    "Bet must be placed on single (1X2) pre-match markets only.",
    "Winnings from your Free Bet will be credited as real money.",
];

const TERMS = {
    Eligibility: [
        "Offer available to new BetMundial customers only.",
        "Customers must complete registration and account verification.",
        "One Free Bet per customer, household, IP address or device.",
    ],
    "General Rules": [
        "BetMundial reserves the right to amend or withdraw this offer at any time.",
        "Standard BetMundial terms and conditions apply.",
        "Abuse of this promotion may result in voided bets and account restrictions.",
    ],
    "Free Bet Rules": [
        "Free Bet stake is not returned with winnings.",
        "Free Bet cannot be cashed out or withdrawn.",
    ],
    "Bet Settlement": [
        "Only settled winning free bets return real-money winnings.",
        "Void or cancelled free bets may not be reissued.",
        "Winnings are credited to the main wallet after settlement.",
    ],
};

const formatMatchDateTime = (startTime) => {
    if (!startTime) {
        return { dateLabel: "", timeLabel: "" };
    }

    const raw = String(startTime).trim();
    const parsed = new Date(raw.replace(" ", "T"));

    if (!Number.isNaN(parsed.getTime())) {
        const year = parsed.getFullYear();
        const month = String(parsed.getMonth() + 1).padStart(2, "0");
        const day = String(parsed.getDate()).padStart(2, "0");
        const hours = String(parsed.getHours()).padStart(2, "0");
        const minutes = String(parsed.getMinutes()).padStart(2, "0");
        return {
            dateLabel: `${year}-${month}-${day}`,
            timeLabel: `${hours}:${minutes}`,
        };
    }

    const parts = raw.split(/\s+/);
    if (parts.length >= 2) {
        return {
            dateLabel: parts[0],
            timeLabel: parts[1].slice(0, 5),
        };
    }

    return { dateLabel: raw, timeLabel: "" };
};

const FreeBetPage = () => {
    const navigate = useNavigate();
    const [showClaimPrompt, setShowClaimPrompt] = useState(false);
    const [claimModal, setClaimModal] = useState(MODAL_VARIANTS.register);
    const [freebet, setFreebet] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const isFetchingRef = useRef(false);

    const handleClaim = () => {
        setClaimModal(getClaimModalVariant());
        setShowClaimPrompt(true);
    };

    const handleClaimConfirm = () => {
        const redirectTo = claimModal.redirectTo;
        setShowClaimPrompt(false);
        navigate(redirectTo);
    };

    const fetchFreeBet = useCallback(() => {
        if (isFetchingRef.current) return;

        isFetchingRef.current = true;
        setIsLoading(true);

        makeRequest({ url: "/sports/freebet", method: "GET", api_version: 2 })
            .then(([, result]) => {
                if (["200", "201"].includes(result?.status) && result.data != null) {
                    const data = result.data;
                    const outcomes = data?.odds?.["1x2"]?.outcomes;
                    const hasMatch = Boolean(data?.home_team || data?.away_team || data?.match_id);
                    const hasOdds = Array.isArray(outcomes) && outcomes.length > 0;

                    if (!hasMatch || !hasOdds) {
                        setFreebet(null);
                        return;
                    }

                    data.odds["1x2"].outcomes = outcomes.sort(
                        (a, b) => Number(a.outcome_id) - Number(b.outcome_id)
                    );

                    setFreebet(data);
                } else {
                    setFreebet(null);
                }
            })
            .catch(() => {
                setFreebet(null);
            })
            .finally(() => {
                isFetchingRef.current = false;
                setIsLoading(false);
            });
    }, []);

    useEffect(() => {
        fetchFreeBet();
    }, [fetchFreeBet]);

    const { dateLabel, timeLabel } = formatMatchDateTime(freebet?.start_time);
    const outcomes = freebet?.odds?.["1x2"]?.outcomes || [];

    return (
        <div className="freebet-landing">
            <section className="freebet-hero">
                <div className="freebet-hero-overlay" aria-hidden="true" />
                <div className="freebet-hero-copy">
                    <span className="freebet-hero-badge">Welcome Offer</span>
                    <h1 className="freebet-hero-title">
                        <span className="freebet-hero-free">FREE</span>{" "}
                        <span className="freebet-hero-bet">BET</span>
                    </h1>
                    <p className="freebet-hero-text">
                        Bet risk-free! Get a Free Bet when you sign up and verify your account.
                    </p>
                    <button type="button" className="freebet-hero-cta" onClick={handleClaim}>
                        Claim Your Free Bet
                        <FaChevronRight aria-hidden="true" />
                    </button>
                    <div className="freebet-hero-note">
                        New customers only
                        <FaInfoCircle aria-hidden="true" />
                    </div>
                </div>

                <div className="freebet-hero-visual">
                    <div className="freebet-hero-card-stage" aria-busy={isLoading}>
                        <span className="freebet-hero-spark freebet-hero-spark-a" />
                        <span className="freebet-hero-spark freebet-hero-spark-b" />
                        <span className="freebet-hero-spark freebet-hero-spark-c" />
                        <div className="freebet-hero-glow" />

                        {isLoading && (
                            <div className="freebet-match-card freebet-match-card-skeleton">
                                <div className="freebet-match-skel-line short" />
                                <div className="freebet-match-skel-row">
                                    <div className="freebet-match-skel-block" />
                                    <div className="freebet-match-skel-block mid" />
                                    <div className="freebet-match-skel-block" />
                                </div>
                                <div className="freebet-match-skel-odds">
                                    <span />
                                    <span />
                                    <span />
                                </div>
                            </div>
                        )}

                        {!isLoading && freebet && (
                            <div className="freebet-match-card">
                                <div className="freebet-match-card-header">
                                    <GiSoccerBall aria-hidden="true" />
                                    <span>Free Bet</span>
                                </div>

                                <div className="freebet-match-teams">
                                    <div className="freebet-match-team">
                                        <div className="freebet-match-flag">
                                            <img src={HomeTeamDefaultFlag} alt="" />
                                        </div>
                                        <div className="freebet-match-team-name">{freebet?.home_team}</div>
                                    </div>

                                    <div className="freebet-match-meta">
                                        {dateLabel && <div className="freebet-match-date">{dateLabel}</div>}
                                        {timeLabel && <div className="freebet-match-time">{timeLabel}</div>}
                                        {!dateLabel && !timeLabel && freebet?.start_time && (
                                            <div className="freebet-match-date">{freebet.start_time}</div>
                                        )}
                                    </div>

                                    <div className="freebet-match-team">
                                        <div className="freebet-match-flag">
                                            <img src={AwayTeamDefaultFlag} alt="" />
                                        </div>
                                        <div className="freebet-match-team-name">{freebet?.away_team}</div>
                                    </div>
                                </div>

                                <div className="freebet-match-market" aria-hidden="true">
                                    <span>1 x 2</span>
                                </div>

                                <div className="freebet-match-odds">
                                    {outcomes.map((outcome) => (
                                        <button
                                            key={outcome?.outcome_id || outcome?.odd_key}
                                            type="button"
                                            className="freebet-match-odd"
                                            onClick={handleClaim}
                                        >
                                            {outcome?.odd_value}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {!isLoading && !freebet && (
                            <div className="freebet-match-card freebet-match-card-empty">
                                <div className="freebet-match-card-header">
                                    <GiSoccerBall aria-hidden="true" />
                                    <span>Free Bet</span>
                                </div>
                                <p className="freebet-match-empty-msg">No freebets available</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section className="freebet-features">
                {FEATURES.map((feature) => {
                    const Icon = feature.icon;
                    return (
                        <article key={feature.title} className="freebet-feature-card">
                            <div className="freebet-feature-icon">
                                <Icon aria-hidden="true" />
                            </div>
                            <h3>{feature.title}</h3>
                            <p>{feature.text}</p>
                        </article>
                    );
                })}
            </section>

            <section className="freebet-content-grid">
                <div className="freebet-panel freebet-panel-how">
                    <h2 className="freebet-panel-title">How It Works</h2>
                    <div className="freebet-steps">
                        {STEPS.map((step, index) => {
                            const Icon = step.icon;
                            return (
                                <div key={step.title} className="freebet-step">
                                    {index < STEPS.length - 1 && (
                                        <span className="freebet-step-connector" aria-hidden="true" />
                                    )}
                                    <div className="freebet-step-icon">
                                        <Icon aria-hidden="true" />
                                    </div>
                                    <span className="freebet-step-num">{index + 1}</span>
                                    <h4>{step.title}</h4>
                                    <p>{step.text}</p>
                                </div>
                            );
                        })}
                    </div>
                    <button type="button" className="freebet-secondary-cta" onClick={handleClaim}>
                        Join Now &amp; Get Free Bet
                    </button>
                </div>

                <div className="freebet-panel freebet-panel-details">
                    <h2 className="freebet-panel-title">Free Bet Details</h2>
                    <ul className="freebet-detail-list">
                        {DETAILS.map((item) => {
                            const Icon = item.icon;
                            return (
                                <li key={item.label}>
                                    <Icon aria-hidden="true" />
                                    <span className="freebet-detail-label">{item.label}</span>
                                    <span className="freebet-detail-value">{item.value}</span>
                                </li>
                            );
                        })}
                    </ul>
                </div>

                <div className="freebet-panel freebet-important">
                    <h2 className="freebet-panel-title freebet-important-title">
                        <FaInfoCircle aria-hidden="true" />
                        Important
                    </h2>
                    <ul className="freebet-important-list">
                        {IMPORTANT.map((item) => (
                            <li key={item}>
                                <FaCheckCircle aria-hidden="true" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            <section className="freebet-terms">
                <h2 className="freebet-terms-heading">Terms &amp; Conditions</h2>
                <div className="freebet-terms-accordions">
                    {Object.entries(TERMS).map(([title, rules]) => (
                        <div key={title} className="freebet-terms-item">
                            <div className="freebet-terms-item-header">
                                <span>{title}</span>
                                <FaChevronUp aria-hidden="true" />
                            </div>
                            <div className="freebet-terms-item-body">
                                <ul>
                                    {rules.map((rule) => (
                                        <li key={rule}>{rule}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <Modal
                show={showClaimPrompt}
                onHide={() => setShowClaimPrompt(false)}
                centered
            >
                <Modal.Header closeButton className="no-header">
                    <Modal.Title>{claimModal.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p className="mb-4 freebet-register-modal-text">{claimModal.message}</p>
                    <button
                        type="button"
                        className="btn text-white py-2 freebet-register-modal-ok"
                        style={{ backgroundColor: "#a71f66" }}
                        onClick={handleClaimConfirm}
                    >
                        OK
                    </button>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default FreeBetPage;
