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
    FaEnvelope,
    FaHeadset,
    FaMinus,
    FaPlus,
    FaQuestion,
    FaSearch,
    FaThumbsDown,
    FaThumbsUp,
} from "react-icons/fa";
import { MdExpandMore } from "react-icons/md";

const SUPPORT_EMAIL = "mailto:customercare@betmundial.com";

const FAQ_ITEMS = [
    {
        id: "what-is-betmundial",
        title: "What is betmundial.com?",
        content: (
            <p>
                betmundial is a leading betting site in Kenya, offering a wide range of sports
                betting options and games. We are licensed by the Betting Control and Licensing
                Board (BCLB) and are committed to providing a safe and enjoyable betting experience
                for all our users.
            </p>
        ),
    },
    {
        id: "contact-support",
        title: "How do I contact betmundial customer support?",
        content: (
            <p>
                You can contact our customer support team via email at customercare@betmundial.com
                or call our helpline at +254143444142. Our team is available 24/7 to assist you
                with any queries or issues you may have.
            </p>
        ),
    },
    {
        id: "create-account",
        title: "How to create an account",
        content: (
            <>
                <p>
                    There are two ways to register with betmundial: via SMS and using our online
                    platform.
                </p>
                <p>
                    <strong>SMS Registration:</strong> Send an SMS &quot;JOIN&quot; to 29280. You
                    will receive a confirmation message from 29280 confirming that you are
                    registered.
                </p>
                <p>
                    <strong>Online Registration:</strong> Go to www.betmundial.com and click on the
                    Register button on the top right corner of the page. Fill the required fields
                    (including phone number and creating a unique password), read and accept the
                    terms and conditions, and confirm that you are over 18 years old.
                </p>
            </>
        ),
    },
    {
        id: "forgot-password",
        title: "Forgot Password",
        content: (
            <>
                <p>To reset your password:</p>
                <ol>
                    <li>Open your web browser and go to betmundial.com.</li>
                    <li>Click on login.</li>
                    <li>
                        Click on &lsquo;forgot password&rsquo; then enter your phone number and
                        click GET RESET CODE.
                    </li>
                    <li>
                        You will receive an SMS with a reset CODE. Enter the CODE and choose your
                        new password.
                    </li>
                </ol>
            </>
        ),
    },
    {
        id: "check-bets",
        title: "How to check my bets",
        content: (
            <>
                <p>To check your Bet outcomes:</p>
                <p>
                    <strong>On our betmundial Website:</strong> Click on &apos;Bet History&apos;.
                </p>
                <p>
                    <strong>On betmundial App:</strong> Tap on the &apos;My Bets&apos; icon to view
                    your bet history.
                </p>
                <p>
                    <strong>On SMS:</strong> Send R#Bet ID to 29280, for example, R#CTMSYA to 29280.
                </p>
            </>
        ),
    },
    {
        id: "sms-betting",
        title: "SMS betting",
        content: (
            <>
                <p>To place a bet via SMS:</p>
                <ol>
                    <li>Send an SMS &quot;JOIN&quot; to 29280 to register.</li>
                    <li>To place a bet, SMS your prediction to 29280.</li>
                    <li>
                        The minimum stake is 1 Kshs and the maximum stake is 500,000 Kshs.
                    </li>
                    <li>
                        Example for a single bet: 1234#2#5000, where 1234 is the Game ID, 2 is the
                        prediction, and 5000 KSH is the bet amount.
                    </li>
                    <li>Example for a multi-bet: 1234#2#5678#1#9101#X#5000.</li>
                </ol>
            </>
        ),
    },
    {
        id: "web-betting",
        title: "Web betting",
        content: (
            <>
                <p>To place a bet online:</p>
                <ol>
                    <li>Open your web browser and go to betmundial.com.</li>
                    <li>Log in by entering your phone number and password.</li>
                    <li>
                        Select your preferred sport and events up to a maximum of 30 matches.
                    </li>
                    <li>Enter your stake amount and click on &quot;Place Bet&quot;.</li>
                </ol>
            </>
        ),
    },
    {
        id: "deposit-mpesa-web",
        title: "Deposit using Mpesa directly from betmundial.com",
        content: (
            <>
                <p>To deposit using Mpesa from the betmundial website:</p>
                <ol>
                    <li>
                        Go to the DEPOSIT tab on betmundial.com and enter the deposit amount.
                    </li>
                    <li>
                        A pop-up notification will appear on your phone for M-PESA payment
                        confirmation.
                    </li>
                </ol>
            </>
        ),
    },
    {
        id: "deposit-mpesa-menu",
        title: "Deposit using Mpesa menu",
        content: (
            <>
                <p>To deposit via M-PESA menu on your phone:</p>
                <ol>
                    <li>Select Lipa na M-PESA Then Pay Bill.</li>
                    <li>
                        Enter 444142 as the Business Number and your betmundial registered number
                        as the Account Number
                    </li>
                    <li>Enter your amount and M-PESA PIN and send.</li>
                </ol>
            </>
        ),
    },
    {
        id: "withdrawal-sms",
        title: "How to request a withdrawal via SMS",
        content: (
            <ol>
                <li>
                    Send an SMS &apos;W#Amount&apos; to 29280 using the phone number associated
                    with your account.
                </li>
            </ol>
        ),
    },
    {
        id: "withdrawal-web",
        title: "How to request a withdrawal via web",
        content: (
            <>
                <ol>
                    <li>
                        <strong>Open</strong> your web browser and go to:{" "}
                        <strong>betmundial.com</strong>.
                    </li>
                    <li>
                        <strong>Select login</strong>, (If Not Logged In).
                    </li>
                    <li>
                        Enter your <strong>phone number</strong> and <strong>password</strong> to
                        access your account.
                    </li>
                    <li>
                        Select <strong>&apos;Menu&apos;</strong> at the top left.
                    </li>
                    <li>
                        Select <strong>&lsquo;Withdrawal&rsquo;</strong>.
                    </li>
                    <li>
                        Enter the <strong>amount</strong> you wish to withdraw (minimum{" "}
                        <strong>50 Kshs</strong>).
                    </li>
                    <li>
                        Select <strong>&lsquo;Request Withdrawal&rsquo;</strong>.
                    </li>
                </ol>
                <p className="faqs-note">
                    Note: Withdrawals are processed instantly. The minimum withdrawal amount is{" "}
                    <strong>50 Kshs</strong>. Additional carrier fees may apply. The maximum
                    withdrawal amount per day is <strong>70,000 Kshs</strong>.
                </p>
            </>
        ),
    },
];

const HeroGraphic = () => (
    <div className="faqs-hero-graphic" aria-hidden="true">
        <div className="faqs-hero-glow" />
        <div className="faqs-hero-ring">
            <span className="faqs-hero-bubble">
                <FaQuestion />
            </span>
        </div>
    </div>
);

const FeedbackRow = ({ itemId, feedback, onFeedback }) => (
    <div className="faqs-feedback" role="group" aria-label="Was this helpful?">
        <span className="faqs-feedback-label">Was this helpful?</span>
        <div className="faqs-feedback-actions">
            <button
                type="button"
                className={`faqs-feedback-btn${feedback === "yes" ? " is-active" : ""}`}
                aria-pressed={feedback === "yes"}
                onClick={() => onFeedback(itemId, "yes")}
            >
                <FaThumbsUp aria-hidden="true" />
                Yes
            </button>
            <button
                type="button"
                className={`faqs-feedback-btn${feedback === "no" ? " is-active" : ""}`}
                aria-pressed={feedback === "no"}
                onClick={() => onFeedback(itemId, "no")}
            >
                <FaThumbsDown aria-hidden="true" />
                No
            </button>
        </div>
    </div>
);

const FAQs = () => {
    const navigate = useNavigate();
    const [expanded, setExpanded] = React.useState("what-is-betmundial");
    const [feedback, setFeedback] = React.useState({});

    const handleChange = (panel) => (_event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    const handleFeedback = (itemId, value) => {
        setFeedback((prev) => ({
            ...prev,
            [itemId]: prev[itemId] === value ? null : value,
        }));
    };

    return (
        <div className="faqs-page">
            <header className="faqs-header">
                <IconButton
                    aria-label="Go back"
                    onClick={() => navigate(-1)}
                    className="faqs-back"
                >
                    <FaArrowLeft />
                </IconButton>

                <h1 className="faqs-header-title">FAQs</h1>

                <IconButton aria-label="Search FAQs" className="faqs-search" disableRipple>
                    <FaSearch />
                </IconButton>
            </header>

            <div className="faqs-inner">
                <section className="faqs-hero" aria-labelledby="faqs-hero-heading">
                    <HeroGraphic />
                    <h2 id="faqs-hero-heading" className="faqs-hero-title">
                        Frequently Asked Questions
                    </h2>
                    <p className="faqs-hero-subtitle">
                        Find answers to the most common questions about{" "}
                        <span className="faqs-accent">betmundial.com</span>
                    </p>
                </section>

                <div className="faqs-accordion-list">
                    {FAQ_ITEMS.map(({ id, title, content }) => {
                        const isOpen = expanded === id;

                        return (
                            <Accordion
                                key={id}
                                expanded={isOpen}
                                onChange={handleChange(id)}
                                disableGutters
                                elevation={0}
                                square
                                className={`faqs-accordion${isOpen ? " is-open" : ""}`}
                            >
                                <AccordionSummary
                                    expandIcon={<MdExpandMore />}
                                    aria-controls={`${id}-content`}
                                    id={`${id}-header`}
                                    className="faqs-summary"
                                >
                                    <span className="faqs-summary-main">
                                        <span
                                            className={`faqs-toggle-icon${isOpen ? " is-open" : ""}`}
                                            aria-hidden="true"
                                        >
                                            {isOpen ? <FaMinus /> : <FaPlus />}
                                        </span>
                                        <Typography component="span" className="faqs-row-title">
                                            {title}
                                        </Typography>
                                    </span>
                                </AccordionSummary>

                                <AccordionDetails className="faqs-details">
                                    <div className="faqs-details-inner">{content}</div>
                                    <FeedbackRow
                                        itemId={id}
                                        feedback={feedback[id]}
                                        onFeedback={handleFeedback}
                                    />
                                </AccordionDetails>
                            </Accordion>
                        );
                    })}
                </div>

                <aside className="faqs-help-card" aria-label="Still need help">
                    <div className="faqs-help-card-icon" aria-hidden="true">
                        <FaHeadset />
                    </div>
                    <div className="faqs-help-card-copy">
                        <h2>Still need help?</h2>
                        <p>Our support team is available 24/7 to assist you.</p>
                    </div>
                    <Button
                        component="a"
                        href={SUPPORT_EMAIL}
                        variant="outlined"
                        className="faqs-help-card-button"
                        startIcon={<FaEnvelope />}
                    >
                        Contact Support
                    </Button>
                </aside>
            </div>
        </div>
    );
};

export default FAQs;
