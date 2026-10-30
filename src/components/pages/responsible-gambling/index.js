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
    FaBalanceScale,
    FaCalendarAlt,
    FaClock,
    FaExclamationCircle,
    FaHandsHelping,
    FaHeadset,
    FaHeart,
    FaInfoCircle,
    FaPhoneAlt,
    FaRegClock,
    FaRegLightbulb,
    FaShieldAlt,
    FaTrophy,
    FaUserFriends,
    FaUserLock,
    FaUserShield,
    FaWallet,
    FaWineGlassAlt,
} from "react-icons/fa";
import { MdChevronRight, MdExpandMore } from "react-icons/md";

const HELP_URL = "https://gamhelpkenya.com/";

const TIP_CARDS = [
    { icon: FaWallet, text: "Only bet what you can afford to lose." },
    { icon: FaRegLightbulb, text: "Never chase your losses." },
    { icon: FaClock, text: "Keep track of the time and money you spend." },
    { icon: FaBalanceScale, text: "Balance gambling with other hobbies and activities." },
    { icon: FaTrophy, text: "Gambling is for entertainment, not a way to make money." },
    { icon: FaExclamationCircle, text: "Avoid gambling when upset, stressed or angry." },
    { icon: FaRegClock, text: "Take regular breaks and use self-exclusion tools if necessary." },
    { icon: FaWineGlassAlt, text: "Avoid gambling under the influence of alcohol." },
];

const SECTIONS = [
    {
        id: "responsible-gambling-tips",
        number: 1,
        title: "Responsible Gambling Tips",
        icon: FaShieldAlt,
        content: (
            <>
                <div className="responsible-gambling-tip-grid">
                    {TIP_CARDS.map(({ icon: Icon, text }) => (
                        <article key={text} className="responsible-gambling-tip-card">
                            <span className="responsible-gambling-tip-icon" aria-hidden="true">
                                <Icon />
                            </span>
                            <p>{text}</p>
                        </article>
                    ))}
                </div>
            </>
        ),
    },
    {
        id: "getting-help",
        number: 2,
        title: "Getting Help",
        icon: FaHeadset,
        content: (
            <>
                <p>
                    If you or someone you know may have a gambling problem, we strongly recommend
                    seeking professional assistance.
                </p>
                <p><strong>24/7 Counselling Support</strong></p>
                <p>
                    <a href={HELP_URL} target="_blank" rel="noopener noreferrer">
                        gamhelpkenya.com
                    </a>
                    <br />
                    Phone: +254 0116 444 142
                </p>
                <h3>Warning signs of problem gambling</h3>
                <ul>
                    <li>Uncontrolled spending</li>
                    <li>Lying about gambling behavior</li>
                    <li>Borrowing money or stealing to gamble</li>
                    <li>Loss of interest in hobbies</li>
                    <li>Neglecting work or studies</li>
                </ul>
                <p>
                    If you notice these signs, we encourage you to seek help from friends, family,
                    or professional support services.
                </p>
            </>
        ),
    },
    {
        id: "contact-customer-care",
        number: 3,
        title: "Contact Customer Care",
        icon: FaPhoneAlt,
        content: (
            <>
                <p>If you need assistance, our support team is available to help.</p>
                <ul>
                    <li>Live Chat</li>
                    <li>Email: support@betmundial.com</li>
                </ul>
            </>
        ),
    },
    {
        id: "self-exclusion",
        number: 4,
        title: "Self Exclusion",
        icon: FaUserLock,
        content: (
            <>
                <p>
                    Our Self-Exclusion option allows players to temporarily close their accounts for
                    a specified period.
                </p>
                <h3>How it works</h3>
                <ul>
                    <li>You cannot place bets or play games during the exclusion period.</li>
                    <li>You may still log in to withdraw remaining funds if eligible.</li>
                    <li>The account cannot be reactivated until the exclusion period ends.</li>
                    <li>Bonuses may expire during the exclusion period.</li>
                    <li>Creating new accounts during self-exclusion is prohibited.</li>
                </ul>
                <p>
                    To activate self-exclusion or permanently close your account, please contact
                    Customer Care. Identity verification may be required.
                </p>
            </>
        ),
    },
    {
        id: "protecting-minors",
        number: 5,
        title: "Protecting Minors",
        icon: FaUserShield,
        content: (
            <>
                <p>
                    Gambling is strictly prohibited for individuals under the age of 18. Betmundial
                    takes strong measures to prevent underage gambling.
                </p>
                <ul>
                    <li>Players must confirm they are 18+ during registration.</li>
                    <li>Personal information is verified during signup.</li>
                    <li>Mobile money registration requires valid national ID.</li>
                    <li>Parents should secure login credentials and shared devices.</li>
                    <li>Educate minors about gambling risks.</li>
                </ul>
                <h3>Recommended filtering software</h3>
                <ul>
                    <li>Net Nanny - www.netnanny.com</li>
                    <li>CYBERsitter - www.cybersitter.com</li>
                    <li>GamBlock - www.gamblock.com</li>
                </ul>
            </>
        ),
    },
    {
        id: "self-assessment",
        number: 6,
        title: "Self Assessment",
        icon: FaInfoCircle,
        content: (
            <>
                <p>
                    Ask yourself the following questions to determine whether gambling may be
                    becoming a problem:
                </p>
                <ol>
                    <li>Do you feel depressed after losing money?</li>
                    <li>Do you try to win back losses immediately?</li>
                    <li>Have you run out of money due to gambling?</li>
                    <li>Have you borrowed money to gamble?</li>
                    <li>Has gambling affected relationships or hobbies?</li>
                    <li>Have you ever felt hopeless or suicidal due to gambling?</li>
                </ol>
            </>
        ),
    },
    {
        id: "support-for-family",
        number: 7,
        title: "Support for Friends & Family",
        icon: FaUserFriends,
        content: (
            <>
                <p>
                    Gambling problems can also affect loved ones. If you are concerned about
                    someone, encourage open discussion and suggest professional help.
                </p>
                <ul>
                    <li>Listen without judgment and talk openly about the impact gambling is having.</li>
                    <li>Encourage practical limits, professional counselling, and time away from betting.</li>
                    <li>Reach out to support services if you need guidance on how to help.</li>
                </ul>
            </>
        ),
    },
    {
        id: "emergency-contacts",
        number: 8,
        title: "Emergency Contacts",
        icon: FaHandsHelping,
        content: (
            <>
                <p>
                    If gambling is affecting your safety, finances, or mental wellbeing, seek
                    immediate support from trusted family, friends, professional counsellors, or
                    emergency services in your area.
                </p>
                <ul>
                    <li>GamHelp Kenya: +254 0116 444 142</li>
                    <li>Customer Care: support@betmundial.com</li>
                    <li>Use live chat if you need urgent account assistance.</li>
                </ul>
            </>
        ),
    },
];

const HeroGraphic = () => (
    <div className="responsible-gambling-hero-graphic" aria-hidden="true">
        <div className="responsible-gambling-hero-glow" />
        <div className="responsible-gambling-hero-shield">
            <FaShieldAlt />
            <span className="responsible-gambling-hero-heart">
                <FaHeart />
            </span>
        </div>
        <span className="responsible-gambling-hero-star responsible-gambling-hero-star-one" />
        <span className="responsible-gambling-hero-star responsible-gambling-hero-star-two" />
        <span className="responsible-gambling-hero-star responsible-gambling-hero-star-three" />
        <span className="responsible-gambling-hero-star responsible-gambling-hero-star-four" />
    </div>
);

const ResponsibleGambling = () => {
    const navigate = useNavigate();
    const [expanded, setExpanded] = React.useState("responsible-gambling-tips");

    const handleChange = (panel) => (_event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    return (
        <div className="responsible-gambling-page">
            <header className="responsible-gambling-header">
                <IconButton
                    aria-label="Go back"
                    onClick={() => navigate(-1)}
                    className="responsible-gambling-back"
                >
                    <FaArrowLeft />
                </IconButton>

                <div className="responsible-gambling-header-copy">
                    <h1 className="responsible-gambling-title">Responsible Gambling</h1>
                    <p className="responsible-gambling-subtitle">Your wellbeing is our priority.</p>
                </div>

                <div className="responsible-gambling-header-icon" aria-hidden="true">
                    <FaShieldAlt />
                </div>
            </header>

            <div className="responsible-gambling-inner">
                <section className="responsible-gambling-hero-card">
                    <HeroGraphic />

                    <div className="responsible-gambling-hero-content">
                        <div className="responsible-gambling-hero-copy">
                            <h2>Gamble Responsibly</h2>
                            <p>
                                Healthy gambling should always be fun, entertaining and within your
                                financial limits.
                            </p>
                        </div>

                        <div className="responsible-gambling-hero-footer">
                            <div className="responsible-gambling-help-inline">
                                <span className="responsible-gambling-help-inline-icon" aria-hidden="true">
                                    <FaHeadset />
                                </span>
                                <span>
                                    <strong>Need help?</strong>
                                    <small>We are here for you.</small>
                                </span>
                            </div>

                            <Button
                                component="a"
                                href={HELP_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="responsible-gambling-cta"
                                endIcon={<MdChevronRight />}
                            >
                                Learn More
                            </Button>
                        </div>
                    </div>
                </section>

                <div className="responsible-gambling-accordion-list">
                    {SECTIONS.map(({ id, number, title, icon: Icon, content }) => (
                        <Accordion
                            key={id}
                            expanded={expanded === id}
                            onChange={handleChange(id)}
                            disableGutters
                            elevation={0}
                            square
                            className="responsible-gambling-accordion"
                        >
                            <AccordionSummary
                                expandIcon={<MdExpandMore />}
                                aria-controls={`${id}-content`}
                                id={`${id}-header`}
                                className="responsible-gambling-summary"
                            >
                                <span className="responsible-gambling-summary-main">
                                    <span className="responsible-gambling-row-icon" aria-hidden="true">
                                        <Icon />
                                    </span>
                                    <span className="responsible-gambling-row-copy">
                                        <span className="responsible-gambling-row-num">{number}.</span>
                                        <Typography component="span" className="responsible-gambling-row-title">
                                            {title}
                                        </Typography>
                                    </span>
                                </span>
                            </AccordionSummary>

                            <AccordionDetails className="responsible-gambling-details">
                                <div className="responsible-gambling-details-inner">
                                    {content}
                                </div>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </div>

                <aside className="responsible-gambling-help-card" aria-label="Help reminder">
                    <div className="responsible-gambling-help-card-icon" aria-hidden="true">
                        <FaInfoCircle />
                    </div>
                    <div className="responsible-gambling-help-card-copy">
                        <h2>Remember</h2>
                        <p>
                            If gambling is no longer fun or is affecting your life, do not hesitate
                            to seek help. You are not alone.
                        </p>
                    </div>
                    <Button
                        component="a"
                        href={HELP_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="outlined"
                        className="responsible-gambling-help-card-button"
                    >
                        Get Help Now
                    </Button>
                </aside>

                <footer className="responsible-gambling-meta">
                    <div className="responsible-gambling-meta-item">
                        <FaShieldAlt aria-hidden="true" />
                        <span>
                            This page is part of our commitment to promote safe and responsible gambling.
                        </span>
                    </div>
                    <div className="responsible-gambling-meta-item responsible-gambling-meta-date">
                        <FaCalendarAlt aria-hidden="true" />
                        <span>Last Updated: 12 January 2026</span>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default ResponsibleGambling;
