import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaArrowLeft,
    FaChevronRight,
    FaGift,
    FaHeadset,
    FaPencilAlt,
    FaShieldAlt,
    FaUsers,
} from "react-icons/fa";
import PromoCode from "./promo-code";
import makeRequest from "../../utils/fetch-request";

const SUPPORT_EMAIL = "mailto:customercare@betmundial.com";

const HOW_IT_WORKS = [
    {
        id: "create",
        title: "Create",
        description: "Create your unique promo code.",
        Icon: FaPencilAlt,
    },
    {
        id: "share",
        title: "Share",
        description: "Share with friends and your network.",
        Icon: FaUsers,
    },
    {
        id: "earn",
        title: "Earn",
        description: "Your friends play, you earn rewards.",
        Icon: FaGift,
    },
];

const PromoWins = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [commissions, setCommissions] = useState(null);

    const getUserCommision = () => {
        const endpoint = "/user/commissions";
        setIsLoading(true);

        makeRequest({ url: endpoint, method: "GET", api_version: 2 }).then(
            ([status, response]) => {
                setIsLoading(false);
                if (status === 200) {
                    setCommissions(response?.data ?? response ?? null);
                }
            }
        );
    };

    useEffect(() => {
        getUserCommision();
    }, []);

    return (
        <div className="promo-wins-page">
            <header className="promo-wins-header">
                <button
                    type="button"
                    className="promo-wins-back"
                    aria-label="Go back"
                    onClick={() => navigate(-1)}
                >
                    <FaArrowLeft />
                </button>
                <h1 className="promo-wins-title">Promo Wins</h1>
            </header>

            <div className="promo-wins-inner">
                <section className="promo-wins-hero" aria-label="Promo Wins intro">
                    <div className="promo-wins-hero-glow" aria-hidden="true" />
                    <div className="promo-wins-hero-confetti" aria-hidden="true" />
                    <div className="promo-wins-hero-icon" aria-hidden="true">
                        <FaGift />
                    </div>
                    <div className="promo-wins-hero-copy">
                        <h2 className="promo-wins-hero-title">Promo Wins</h2>
                        <p className="promo-wins-hero-sub">
                            Create, share and earn exciting rewards with{" "}
                            <span className="promo-wins-brand">betmundial</span>.
                        </p>
                    </div>
                </section>

                <PromoCode commissions={commissions} isLoading={isLoading} />

                <section className="promo-wins-how" aria-label="How it works">
                    {HOW_IT_WORKS.map(({ id, title, description, Icon }) => (
                        <div className="promo-wins-how-item" key={id}>
                            <span className="promo-wins-how-icon" aria-hidden="true">
                                <Icon />
                            </span>
                            <h3 className="promo-wins-how-title">{title}</h3>
                            <p className="promo-wins-how-desc">{description}</p>
                        </div>
                    ))}
                </section>

                <a
                    className="promo-wins-trust"
                    href={SUPPORT_EMAIL}
                    aria-label="Trusted and Secure"
                >
                    <span className="promo-wins-trust-icon" aria-hidden="true">
                        <FaShieldAlt />
                    </span>
                    <span className="promo-wins-trust-copy">
                        <strong>Trusted &amp; Secure</strong>
                        <span>Our platform is 100% secure and fair.</span>
                    </span>
                    <FaChevronRight
                        className="promo-wins-trust-chevron"
                        aria-hidden="true"
                    />
                </a>

                <div className="promo-wins-footer">
                    <a className="promo-wins-footer-link" href={SUPPORT_EMAIL}>
                        <FaHeadset aria-hidden="true" />
                        <span>
                            Need help?{" "}
                            <strong>Contact Support &gt;</strong>
                        </span>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default React.memo(PromoWins);
