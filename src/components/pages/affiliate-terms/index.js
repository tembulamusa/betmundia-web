import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
} from "@mui/material";
import { FaArrowLeft, FaLock, FaShieldAlt } from "react-icons/fa";
import {
    MdExpandMore,
    MdOutlineBlock,
    MdOutlineChatBubbleOutline,
    MdOutlineCheckBox,
    MdOutlineDescription,
    MdOutlineEdit,
    MdOutlineGroups,
    MdOutlineLink,
    MdOutlinePayments,
    MdOutlinePersonAdd,
    MdOutlineShare,
    MdOutlineVerifiedUser,
    MdOutlineWarningAmber,
} from "react-icons/md";

const TERMS_SECTIONS = [
    {
        id: "acceptance",
        number: "01",
        title: "Acceptance of Terms",
        Icon: MdOutlineDescription,
        content: (
            <>
                <p>
                    These Affiliate Program Terms &amp; Conditions (“Terms”) govern
                    participation in the Betmundial Affiliate Program. By creating,
                    sharing, or using an affiliate code, or by earning commissions
                    through referrals, you agree to be bound by these Terms and by
                    Betmundial’s General{" "}
                    <Link to="/terms-and-conditions">Terms and Conditions</Link>.
                </p>
                <p>
                    If you do not agree, do not generate or promote an affiliate
                    code. Betmundial may refuse, suspend, or end affiliate
                    participation at its discretion.
                </p>
            </>
        ),
    },
    {
        id: "eligibility",
        number: "02",
        title: "Eligibility",
        Icon: MdOutlinePersonAdd,
        content: (
            <ul>
                <li>
                    You must hold a registered Betmundial account in good standing
                    and be of legal gambling age in your jurisdiction.
                </li>
                <li>
                    Participation may be limited to residents of Kenya or other
                    markets where Betmundial is licensed to operate.
                </li>
                <li>
                    Employees, agents, and contractors of Betmundial (and their
                    immediate family) may be excluded unless expressly approved
                    in writing.
                </li>
                <li>
                    Betmundial reserves the right to approve, decline, or revoke
                    affiliate participation at any time.
                </li>
            </ul>
        ),
    },
    {
        id: "affiliate-codes",
        number: "03",
        title: "How Affiliate Codes Work",
        Icon: MdOutlineLink,
        content: (
            <>
                <p>
                    Approved participants may create one unique affiliate code
                    (custom or auto-generated). New players who sign up using your
                    code may be linked to your account for referral tracking,
                    subject to Betmundial’s attribution rules.
                </p>
                <ul>
                    <li>
                        You are responsible for how your code is shared and for any
                        claims you make when promoting Betmundial.
                    </li>
                    <li>
                        Codes must not be misleading, offensive, or impersonate
                        Betmundial, brands, or other users.
                    </li>
                    <li>
                        Self-referrals, duplicate accounts, and circular sign-ups
                        are not eligible for commission.
                    </li>
                </ul>
            </>
        ),
    },
    {
        id: "code-permanence",
        number: "04",
        title: "Code Permanence",
        Icon: MdOutlineCheckBox,
        content: (
            <>
                <p>
                    Once created and confirmed, your affiliate code is generally
                    permanent and cannot be changed or transferred to another
                    account. Betmundial may retire, suspend, or reassign a code
                    where required for security, abuse prevention, branding, or
                    legal compliance.
                </p>
                <p>
                    If your code is suspended or closed, previously tracked
                    members may remain attributed according to Betmundial’s
                    systems, but unpaid or future commissions may be withheld or
                    adjusted as described in these Terms.
                </p>
            </>
        ),
    },
    {
        id: "commissions",
        number: "05",
        title: "Commissions & Earnings",
        Icon: MdOutlinePayments,
        content: (
            <>
                <p>
                    Commissions are calculated on eligible referred activity as
                    defined by Betmundial (for example, qualifying deposits,
                    bets, or other program metrics). Rates, structures, and
                    eligibility criteria may change and will be reflected in the
                    Affiliate area of your account where applicable.
                </p>
                <ul>
                    <li>
                        Payouts are subject to minimum thresholds, identity and
                        account verification, and Betmundial’s payment schedules.
                    </li>
                    <li>
                        Betmundial may adjust, reverse, or withhold earnings
                        linked to chargebacks, voids, bonus abuse, fraud, or
                        technical error.
                    </li>
                    <li>
                        Displayed balances and leaderboards are informational and
                        may be corrected if inaccurate.
                    </li>
                </ul>
            </>
        ),
    },
    {
        id: "sharing-rules",
        number: "06",
        title: "Sharing Rules",
        Icon: MdOutlineShare,
        content: (
            <ul>
                <li>
                    Share your code honestly via personal networks, social media,
                    or other channels that comply with applicable advertising and
                    gambling marketing laws.
                </li>
                <li>
                    Do not spam, scrape contacts, or send unsolicited bulk
                    messages. Do not target minors or vulnerable persons.
                </li>
                <li>
                    Do not use Betmundial logos, trademarks, or creative assets
                    in a way that suggests you are Betmundial or an official
                    partner, unless you have written permission.
                </li>
                <li>
                    Paid search or brand-bidding on Betmundial names or domains
                    requires prior written approval.
                </li>
            </ul>
        ),
    },
    {
        id: "prohibited",
        number: "07",
        title: "Prohibited Use",
        Icon: MdOutlineBlock,
        content: (
            <>
                <p>Without limitation, you must not:</p>
                <ul>
                    <li>
                        Create fake accounts, incentivize sign-ups with
                        unauthorized cash or bonus offers, or manipulate
                        referral tracking.
                    </li>
                    <li>
                        Misrepresent odds, promotions, or Betmundial products.
                    </li>
                    <li>
                        Use malware, forced redirects, cookie stuffing, or any
                        deceptive attribution methods.
                    </li>
                    <li>
                        Promote Betmundial on sites or channels that host illegal
                        content, hate speech, or adult material involving
                        minors.
                    </li>
                </ul>
                <p>
                    Violations may result in immediate suspension of your code,
                    forfeiture of unpaid earnings, account restrictions, and
                    further action under Betmundial’s General Terms.
                </p>
            </>
        ),
    },
    {
        id: "members",
        number: "08",
        title: "Referred Members",
        Icon: MdOutlineGroups,
        content: (
            <p>
                Players who join with your code remain customers of Betmundial.
                You have no ownership of their accounts, data, or activity.
                Member status, KYC outcomes, self-exclusion, and betting history
                are confidential; Betmundial may show limited affiliate
                dashboards (such as counts or aggregated stats) at its
                discretion.
            </p>
        ),
    },
    {
        id: "liability",
        number: "09",
        title: "Liability & Disclaimer",
        Icon: MdOutlineWarningAmber,
        content: (
            <>
                <p>
                    The Affiliate Program is provided on an “as is” basis.
                    Betmundial does not guarantee continuous availability of
                    tracking, dashboards, or any particular commission amount.
                </p>
                <p>
                    To the fullest extent permitted by law, Betmundial is not
                    liable for indirect, incidental, or consequential losses
                    arising from participation in the program, including lost
                    commissions due to technical issues, third-party platforms,
                    or your promotional activities. You remain responsible for
                    taxes or reporting obligations on earnings you receive.
                </p>
            </>
        ),
    },
    {
        id: "changes",
        number: "10",
        title: "Changes to Terms",
        Icon: MdOutlineEdit,
        content: (
            <p>
                Betmundial may update these Terms, commission rates, or program
                rules at any time. Material changes may be communicated via the
                website, the Affiliate area, email, or other reasonable means.
                Continued use of your affiliate code after changes take effect
                constitutes acceptance. If you do not agree, stop promoting your
                code and contact support to end participation.
            </p>
        ),
    },
    {
        id: "governing",
        number: "11",
        title: "Governing Terms",
        Icon: MdOutlineVerifiedUser,
        content: (
            <p>
                These Terms are governed by Betmundial’s General Terms and
                Conditions and applicable Kenyan law. In case of inconsistency,
                the General Terms and Conditions prevail unless these Affiliate
                Terms expressly state otherwise for program-specific matters.
            </p>
        ),
    },
    {
        id: "contact",
        number: "12",
        title: "Contact",
        Icon: MdOutlineChatBubbleOutline,
        content: (
            <p>
                Questions about the Affiliate Program or these Terms can be
                sent to{" "}
                <a href="mailto:customercare@betmundial.com">
                    customercare@betmundial.com
                </a>{" "}
                or via Betmundial customer care channels listed on the site. For
                dispute escalation, see our{" "}
                <Link to="/dispute-resolution">Dispute Resolution</Link> policy.
            </p>
        ),
    },
];

const AffiliateTerms = () => {
    const navigate = useNavigate();
    const [expanded, setExpanded] = React.useState(false);

    const handleChange = (panel) => (_event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    return (
        <Box className="affiliate-terms-page">
            <header className="affiliate-terms-page-header">
                <button
                    type="button"
                    className="affiliate-terms-page-back"
                    aria-label="Go back"
                    onClick={() => navigate(-1)}
                >
                    <FaArrowLeft />
                </button>

                <div className="affiliate-terms-page-heading">
                    <h1 className="affiliate-terms-page-title">
                        Affiliate Terms &amp; Conditions
                    </h1>
                    <p className="affiliate-terms-page-subtitle">
                        Rules for the Betmundial Create, Share &amp; Earn program.
                    </p>
                </div>

                <span
                    className="affiliate-terms-page-shield"
                    aria-hidden="true"
                    title="Secure"
                >
                    <FaShieldAlt />
                </span>
            </header>

            <div className="affiliate-terms-page-inner">
                <div className="affiliate-terms-list">
                    {TERMS_SECTIONS.map(({ id, number, title, Icon, content }) => (
                        <Accordion
                            key={id}
                            className="affiliate-terms-accordion"
                            expanded={expanded === id}
                            onChange={handleChange(id)}
                            disableGutters
                            elevation={0}
                            square
                        >
                            <AccordionSummary
                                className="affiliate-terms-summary"
                                expandIcon={
                                    <MdExpandMore
                                        style={{ color: "#e91e8c", fontSize: "20px" }}
                                    />
                                }
                                aria-controls={`${id}-content`}
                                id={`${id}-header`}
                            >
                                <span
                                    className="affiliate-terms-row-icon"
                                    aria-hidden="true"
                                >
                                    <Icon />
                                </span>
                                <span className="affiliate-terms-row-num">
                                    {number}.
                                </span>
                                <span className="affiliate-terms-row-title">
                                    {title}
                                </span>
                            </AccordionSummary>
                            <AccordionDetails className="affiliate-terms-details">
                                <div className="affiliate-terms-details-inner">
                                    {content}
                                </div>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </div>

                <aside
                    className="affiliate-terms-notice"
                    aria-label="Important notice"
                >
                    <span
                        className="affiliate-terms-notice-badge"
                        aria-hidden="true"
                    >
                        <FaShieldAlt className="affiliate-terms-notice-shield" />
                        <FaLock className="affiliate-terms-notice-lock" />
                    </span>
                    <div className="affiliate-terms-notice-copy">
                        <h2 className="affiliate-terms-notice-title">
                            Important Notice
                        </h2>
                        <p className="affiliate-terms-notice-text">
                            Please read and understand these terms before creating
                            or sharing an affiliate code.
                        </p>
                        <p className="affiliate-terms-notice-text">
                            By participating in the Betmundial Affiliate Program,
                            you agree to be bound by these terms and conditions.
                        </p>
                    </div>
                </aside>
            </div>
        </Box>
    );
};

export default AffiliateTerms;
