import React from "react";
import { useNavigate } from "react-router-dom";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Button,
    IconButton,
    Typography,
} from "@mui/material";
import {
    FaArrowLeft,
    FaCalendarAlt,
    FaCheckCircle,
    FaClipboardList,
    FaEnvelope,
    FaFileAlt,
    FaHeartbeat,
    FaHeadset,
    FaIdCard,
    FaLock,
    FaMinus,
    FaPlus,
    FaShieldAlt,
    FaUser,
} from "react-icons/fa";
import { MdExpandMore } from "react-icons/md";

const SUPPORT_EMAIL = "mailto:customercare@betmundial.com";

const ID_DATA = [
    "Full name",
    "Date of birth",
    "Residential or registered address",
    "Source of funds",
];

const REQUIRED_DOCS = [
    {
        text: "Passport, ID card, or equivalent document containing:",
        children: ["Name", "Date of birth", "Photograph"],
    },
    { text: "Additional supporting documents where necessary" },
    { text: "Notarized copies in certain cases" },
];

const HeroGraphic = () => (
    <div className="aml-hero-graphic" aria-hidden="true">
        <div className="aml-hero-glow" />
        <div className="aml-hero-shield">
            <FaShieldAlt />
            <span className="aml-hero-lock">
                <FaLock />
            </span>
        </div>
    </div>
);

const SectionHeading = ({ icon: Icon, children }) => (
    <div className="aml-section-heading">
        <span className="aml-section-icon" aria-hidden="true">
            <Icon />
        </span>
        <h3>{children}</h3>
    </div>
);

const CheckList = ({ items }) => (
    <ul className="aml-check-list">
        {items.map((item) => (
            <li key={typeof item === "string" ? item : item.text}>
                <FaCheckCircle className="aml-check-icon" aria-hidden="true" />
                <div className="aml-check-body">
                    <span>{typeof item === "string" ? item : item.text}</span>
                    {item.children ? (
                        <ul className="aml-check-sublist">
                            {item.children.map((child) => (
                                <li key={child}>{child}</li>
                            ))}
                        </ul>
                    ) : null}
                </div>
            </li>
        ))}
    </ul>
);

const AntiMoneyLaundering = () => {
    const navigate = useNavigate();
    const [expanded, setExpanded] = React.useState(true);

    return (
        <div className="aml-page">
            <header className="aml-header">
                <IconButton
                    aria-label="Go back"
                    onClick={() => navigate(-1)}
                    className="aml-back"
                >
                    <FaArrowLeft />
                </IconButton>
                <h1 className="aml-header-title">Anti Money Laundering</h1>
            </header>

            <div className="aml-inner">
                <section className="aml-hero-card" aria-labelledby="aml-hero-heading">
                    <HeroGraphic />
                    <div className="aml-hero-copy">
                        <h2 id="aml-hero-heading">
                            Anti Money Laundering (AML) Policy
                        </h2>
                        <p>
                            <span className="aml-accent">BetMundial</span> is committed to
                            preventing money laundering, terrorism financing and other illegal
                            activities in accordance with applicable laws and regulations.
                        </p>
                    </div>
                </section>

                <Accordion
                    expanded={expanded}
                    onChange={(_event, isExpanded) => setExpanded(isExpanded)}
                    disableGutters
                    elevation={0}
                    square
                    className={`aml-accordion${expanded ? " is-open" : ""}`}
                >
                    <AccordionSummary
                        expandIcon={<MdExpandMore />}
                        aria-controls="aml-policy-content"
                        id="aml-policy-header"
                        className="aml-summary"
                    >
                        <span className="aml-summary-main">
                            <span
                                className={`aml-toggle-icon${expanded ? " is-open" : ""}`}
                                aria-hidden="true"
                            >
                                {expanded ? <FaMinus /> : <FaPlus />}
                            </span>
                            <Typography component="span" className="aml-row-title">
                                AML Policy
                            </Typography>
                        </span>
                    </AccordionSummary>

                    <AccordionDetails className="aml-details">
                        <div className="aml-details-inner">
                            <section className="aml-section">
                                <SectionHeading icon={FaShieldAlt}>Our Commitment</SectionHeading>
                                <p>
                                    We endeavor to carry out all appropriate measures to combat
                                    money laundering and international terrorism. We are bound to
                                    inform the relevant authorities if we suspect that funds
                                    deposited by the Player are used for money laundering,
                                    terrorism financing or any other illegal activity.
                                </p>
                                <p>
                                    <span className="aml-accent">BetMundial</span> is obliged to
                                    block such funds and to undertake measures as provided in the
                                    AML policy rules.
                                </p>
                            </section>

                            <section className="aml-section">
                                <SectionHeading icon={FaUser}>User Obligations</SectionHeading>
                                <p>
                                    When you open an account, you agree to undertake the following
                                    obligations:
                                </p>
                                <ul className="aml-bullet-list">
                                    <li>
                                        You agree that you comply with all applicable laws and
                                        regulations on combating money laundering and terrorism
                                        financing, including the AML Policy.
                                    </li>
                                    <li>
                                        You confirm that you have no information or suspicions that
                                        funds used for deposits are obtained from illegal sources
                                        or related to unlawful activities.
                                    </li>
                                    <li>
                                        You agree to immediately provide any information requested
                                        in accordance with legal and regulatory requirements.
                                    </li>
                                    <li>
                                        You will not use your account to conduct transactions on
                                        behalf of any third party or for any purpose other than
                                        personal betting activity.
                                    </li>
                                </ul>
                            </section>

                            <section className="aml-section">
                                <SectionHeading icon={FaHeartbeat}>
                                    Monitoring &amp; Compliance
                                </SectionHeading>
                                <ul className="aml-bullet-list">
                                    <li>
                                        The company collects and keeps copies of ID documentation,
                                        mobile numbers, and related data during registration and
                                        withdrawals.
                                    </li>
                                    <li>All changes made to user accounts are recorded.</li>
                                    <li>
                                        The company monitors suspicious activity and special
                                        transactions.
                                    </li>
                                    <li>
                                        The company reserves the right to ban a user at any time if
                                        there is suspicion of money laundering or criminal activity.
                                    </li>
                                    <li>
                                        The company is not obliged to inform the user if suspicious
                                        activity has been reported to authorities.
                                    </li>
                                </ul>
                            </section>

                            <section className="aml-section">
                                <SectionHeading icon={FaIdCard}>
                                    Identity Verification (KYC)
                                </SectionHeading>
                                <p>
                                    The Company performs both initial and ongoing identity
                                    verification procedures based on the risk level of each user.
                                </p>
                                <ul className="aml-bullet-list">
                                    <li>
                                        The company will request minimum information to confirm
                                        your identity.
                                    </li>
                                    <li>
                                        All data and verification results are recorded and
                                        preserved.
                                    </li>
                                    <li>
                                        Through KYC, your data is checked against lists of persons
                                        suspected of terrorism maintained by authorized bodies.
                                    </li>
                                    <li>
                                        Additional verification may be required before withdrawals
                                        or when unusual account activity is detected.
                                    </li>
                                </ul>

                                <div className="aml-kyc-grid">
                                    <article className="aml-nested-card">
                                        <div className="aml-nested-heading">
                                            <span className="aml-nested-icon" aria-hidden="true">
                                                <FaClipboardList />
                                            </span>
                                            <h4>
                                                Minimum required identification data includes:
                                            </h4>
                                        </div>
                                        <CheckList items={ID_DATA} />
                                    </article>

                                    <article className="aml-nested-card">
                                        <div className="aml-nested-heading">
                                            <span className="aml-nested-icon" aria-hidden="true">
                                                <FaFileAlt />
                                            </span>
                                            <h4>Required Documents</h4>
                                        </div>
                                        <p className="aml-nested-intro">
                                            To verify your identity, the Company may request:
                                        </p>
                                        <CheckList items={REQUIRED_DOCS} />
                                    </article>
                                </div>
                            </section>
                        </div>
                    </AccordionDetails>
                </Accordion>

                <aside className="aml-help-card" aria-label="Need help">
                    <div className="aml-help-card-icon" aria-hidden="true">
                        <FaHeadset />
                    </div>
                    <div className="aml-help-card-copy">
                        <h2>Need Help?</h2>
                        <p>
                            If you have questions about our AML policy or verification process,
                            our support team is here to help.
                        </p>
                    </div>
                    <Button
                        component="a"
                        href={SUPPORT_EMAIL}
                        variant="outlined"
                        className="aml-help-card-button"
                        startIcon={<FaEnvelope />}
                    >
                        Contact Support
                    </Button>
                </aside>

                <footer className="aml-meta">
                    <div className="aml-meta-item">
                        <FaShieldAlt aria-hidden="true" />
                        <span>Version 2.4</span>
                    </div>
                    <div className="aml-meta-item aml-meta-date">
                        <FaCalendarAlt aria-hidden="true" />
                        <span>Last Updated: 12 January 2026</span>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default AntiMoneyLaundering;
