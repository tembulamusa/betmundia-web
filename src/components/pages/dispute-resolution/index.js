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
    FaEnvelope,
    FaHeadset,
    FaMinus,
    FaSearch,
    FaThumbsDown,
    FaThumbsUp,
} from "react-icons/fa";
import { MdChevronRight, MdExpandMore, MdOutlineShield } from "react-icons/md";

const SUPPORT_EMAIL = "mailto:customercare@betmundial.com";

const DISPUTE_ITEMS = [
    {
        id: "commitment",
        title: "Commitment to Customer Satisfaction",
        content: (
            <>
                <p>
                    betmundial aims to offer all of the company&apos;s clients from Kenya the
                    greatest possible Customer experience in the industry. We want to make sure
                    that all of our clients are completely satisfied with the products and
                    service the company has to offer, as well as their quality and transparency.
                </p>
                <p>
                    At the same time, betmundial realizes that sometimes there might be cases when
                    the company hasn&apos;t been able to deliver. If you are not happy with the
                    service that our platform provides, you can always send a query to our
                    Customer Services team.
                </p>
            </>
        ),
    },
    {
        id: "contacting-cs",
        title: "Contacting Customer Services",
        content: (
            <p>
                You can contact the betmundial Customer Services team by way of email
                customercare@betmundial.com or call our customer care lines or inbox us through
                our social Media Pages Facebook, betmundial, Instagram betmundial etc. Queries
                will always be processed within one business day. However, if, after your issue
                has been processed, you&apos;re still not satisfied with the decision or believe
                that the situation is at a deadlock, you can always ask BCLB (The Betting
                Control and Licensing Board) to conduct an investigation.
            </p>
        ),
    },
    {
        id: "escalating-bclb",
        title: "Escalating to BCLB",
        content: (
            <>
                <p>
                    BCLB is an impartial external agent that provides independent judgments for
                    gambling/betting-related disputes. BCLB will not charge you for its services.
                    To raise your dispute or complaint with BCLB, you will need to request a
                    Deadlock Email from our CS Agent. This email will outline the full details of
                    your dispute or complaint and will include a unique reference number that must
                    be quoted when submitting a dispute or complaint with BCLB. You can then
                    submit your dispute or complaint to BCLB via info@bclb.go.ke.
                </p>
                <p>
                    BCLB as a regulator, is also an independent adjudication service for resolving
                    disputes between licensed gambling companies and their clients. To start
                    looking at the detail of any dispute, BCLB will ask a complainant to confirm
                    that they have made every reasonable effort possible to resolve the dispute
                    before addressing BCLB and that they agree to comply with BCLB&apos;s terms
                    and conditions.
                </p>
            </>
        ),
    },
    {
        id: "bclb-role",
        title: "BCLB's Role in Dispute Resolution",
        content: (
            <p>
                Decisions are not made based on which party makes a better presentation of the
                disputed case. Gambling companies and their clients do not need to think of the
                quality of the presentation or their writing skills. The part of BCLB is to
                identify relevant issues. Therefore, decisions are always based on the facts of a
                case and not on either of the parties&apos; rhetoric. The only thing BCLB asks for
                is that statements submitted cover as many facts as a complainant considers
                relevant to their dispute.
            </p>
        ),
    },
    {
        id: "policy",
        title: "betmundial's Dispute Resolution Policy",
        content: (
            <p>
                In the event of a dispute arising between us and you, we each agree to follow the
                procedure set out in our Dispute Resolution policy as amended from time to time.
            </p>
        ),
    },
    {
        id: "finalizing",
        title: "Finalizing the Dispute",
        content: (
            <p>
                If betmundial is unable to settle the dispute, betmundial will refer the dispute
                to BCLB, whose decision will be final (save in respect of any manifest error)
                subject to full representation given to all parties involved. No dispute regarding
                any bet/wager will result in litigation, court action or objection to a
                bookmaker&apos;s license or permit (including any remote operator&apos;s license
                or personal license) unless betmundial fails to implement the decision given by
                arbitration.
            </p>
        ),
    },
];

const HeroGraphic = () => (
    <div className="dispute-hero-graphic" aria-hidden="true">
        <MdOutlineShield className="dispute-hero-shield" />
        <span className="dispute-hero-scales" aria-hidden="true">
            <FaBalanceScale />
        </span>
    </div>
);

const FeedbackRow = ({ itemId, feedback, onFeedback }) => (
    <div className="dispute-feedback" role="group" aria-label="Was this information helpful?">
        <span className="dispute-feedback-label">Was this information helpful?</span>
        <div className="dispute-feedback-actions">
            <button
                type="button"
                className={`dispute-feedback-btn${feedback === "yes" ? " is-active" : ""}`}
                aria-pressed={feedback === "yes"}
                onClick={() => onFeedback(itemId, "yes")}
            >
                <FaThumbsUp aria-hidden="true" />
                Yes
            </button>
            <button
                type="button"
                className={`dispute-feedback-btn${feedback === "no" ? " is-active" : ""}`}
                aria-pressed={feedback === "no"}
                onClick={() => onFeedback(itemId, "no")}
            >
                <FaThumbsDown aria-hidden="true" />
                No
            </button>
        </div>
    </div>
);

const DisputeResolution = () => {
    const navigate = useNavigate();
    const [expanded, setExpanded] = React.useState("commitment");
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
        <div className="dispute-page">
            <header className="dispute-header">
                <IconButton
                    aria-label="Go back"
                    onClick={() => navigate(-1)}
                    className="dispute-back"
                >
                    <FaArrowLeft />
                </IconButton>

                <h1 className="dispute-header-title">Dispute Resolution</h1>

                <IconButton aria-label="Search disputes" className="dispute-search" disableRipple>
                    <FaSearch />
                </IconButton>
            </header>

            <div className="dispute-inner">
                <section className="dispute-intro" aria-labelledby="dispute-intro-heading">
                    <HeroGraphic />
                    <div className="dispute-intro-copy">
                        <h2 id="dispute-intro-heading" className="dispute-intro-title">
                            Dispute Resolution
                        </h2>
                        <p className="dispute-intro-subtitle">
                            We are committed to fair play, transparency and delivering the best
                            experience for all our clients. If something doesn&apos;t meet your
                            expectations, we&apos;re here to help.
                        </p>
                    </div>
                </section>

                <div className="dispute-accordion-list">
                    {DISPUTE_ITEMS.map(({ id, title, content }) => {
                        const isOpen = expanded === id;

                        return (
                            <Accordion
                                key={id}
                                expanded={isOpen}
                                onChange={handleChange(id)}
                                disableGutters
                                elevation={0}
                                square
                                className={`dispute-accordion${isOpen ? " is-open" : ""}`}
                            >
                                <AccordionSummary
                                    expandIcon={<MdExpandMore />}
                                    aria-controls={`${id}-content`}
                                    id={`${id}-header`}
                                    className="dispute-summary"
                                >
                                    <span className="dispute-summary-main">
                                        <span
                                            className={`dispute-toggle-icon${isOpen ? " is-open" : ""}`}
                                            aria-hidden="true"
                                        >
                                            {isOpen ? <FaMinus /> : <MdChevronRight />}
                                        </span>
                                        <Typography component="span" className="dispute-row-title">
                                            {title}
                                        </Typography>
                                    </span>
                                </AccordionSummary>

                                <AccordionDetails className="dispute-details">
                                    <div className="dispute-details-inner">{content}</div>
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

                <aside className="dispute-help-card" aria-label="Need help">
                    <div className="dispute-help-card-icon" aria-hidden="true">
                        <FaHeadset />
                    </div>
                    <div className="dispute-help-card-copy">
                        <h2>Need Help?</h2>
                        <p>Our support team is available 24/7 to assist you.</p>
                    </div>
                    <Button
                        component="a"
                        href={SUPPORT_EMAIL}
                        variant="outlined"
                        className="dispute-help-card-button"
                        startIcon={<FaEnvelope />}
                    >
                        Contact Support
                    </Button>
                </aside>
            </div>
        </div>
    );
};

export default DisputeResolution;
