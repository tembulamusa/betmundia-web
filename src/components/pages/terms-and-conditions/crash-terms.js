import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
} from '@mui/material';
import {
    FaArrowLeft,
    FaShieldAlt,
    FaLock,
} from 'react-icons/fa';
import {
    MdOutlineDescription,
    MdOutlineFormatListBulleted,
    MdOutlineCheckBox,
    MdOutlineSpeed,
    MdOutlineWarningAmber,
    MdOutlineEmojiEvents,
    MdOutlineSportsEsports,
    MdOutlineEdit,
    MdOutlineBlock,
    MdOutlineChatBubbleOutline,
    MdOutlineVerifiedUser,
    MdOutlineBalance,
    MdOutlineTrendingUp,
    MdExpandMore,
} from 'react-icons/md';

const TERMS_SECTIONS = [
    {
        id: 'acceptance',
        number: '01',
        title: 'Acceptance of Terms',
        Icon: MdOutlineDescription,
        content: (
            <p>
                These Terms relate to the Crash Games and other related products on our platforms. By playing any of the Crash Games, you agree to be bound by these Terms, including any amendments or variations.
            </p>
        ),
    },
    {
        id: 'additional-rules',
        number: '02',
        title: 'Additional Rules',
        Icon: MdOutlineFormatListBulleted,
        content: (
            <p>
                You acknowledge and agree to follow any additional rules that may apply to Crash Games, including rules in the “Help” or “Game Info” tabs, as well as rules relating to minimum/maximum bets, maximum pay-outs, jackpots, disconnections, and system malfunctions.
            </p>
        ),
    },
    {
        id: 'bet-acceptance',
        number: '03',
        title: 'Bet Acceptance',
        Icon: MdOutlineCheckBox,
        content: (
            <p>
                A Crash Game bet is considered accepted once it has been registered on our server and confirmed online. Accepted bets cannot be canceled or amended.
            </p>
        ),
    },
    {
        id: 'crash-game-limits',
        number: '04',
        title: 'Crash Game Limits',
        Icon: MdOutlineSpeed,
        content: (
            <p>
                Crash Game limits may be revised individually or cumulatively, permanently, or for particular bet types. All applicable limits are displayed on our website. Customers must check limits before betting.
            </p>
        ),
    },
    {
        id: 'funds-error',
        number: '05',
        title: 'Funds Credited in Error',
        Icon: MdOutlineWarningAmber,
        content: (
            <p>
                Any funds or winnings credited in error are not available for use. Betmundial, in consultation with the GRA, may void transactions, withdraw amounts, or reverse transactions in cases of system error, prohibited activities, or other circumstances deemed necessary.
            </p>
        ),
    },
    {
        id: 'maximum-winnings',
        number: '06',
        title: 'Maximum Winnings',
        Icon: MdOutlineEmojiEvents,
        content: (
            <p>
                If system-generated winnings exceed the allowed maximum limit, any amount above the limit is void. Once the maximum limit is reached, no further bets can be placed for that day.
            </p>
        ),
    },
    {
        id: 'game-availability',
        number: '07',
        title: 'Game Availability',
        Icon: MdOutlineSportsEsports,
        content: (
            <p>
                Crash Games may not be available on all devices or at all times. Their availability is not guaranteed.
            </p>
        ),
    },
    {
        id: 'amendments',
        number: '08',
        title: 'Amendments',
        Icon: MdOutlineEdit,
        content: (
            <p>
                These Terms may be amended from time to time in consultation with the Gambling Regulatory Authority of Kenya (GRA).
            </p>
        ),
    },
    {
        id: 'prohibited',
        number: '09',
        title: 'Prohibited Activities',
        Icon: MdOutlineBlock,
        content: (
            <p>
                In case of suspected prohibited activities, Betmundial may void winnings or transactions, suspend accounts, limit withdrawals, or block IP addresses.
            </p>
        ),
    },
    {
        id: 'complaints',
        number: '10',
        title: 'Complaints',
        Icon: MdOutlineChatBubbleOutline,
        content: (
            <p>
                Contact Customer Service at <a href="mailto:support@betmundial.com">support@betmundial.com</a> or +254143444142 for complaints. If dissatisfied with the internal resolution, complaints may be escalated to the Gambling Appeals Tribunal.
            </p>
        ),
    },
    {
        id: 'warranty',
        number: '11',
        title: 'Warranty Disclaimer',
        Icon: MdOutlineVerifiedUser,
        content: (
            <p>
                Crash Games are provided “as is” without warranties, except those implied by law that cannot be excluded. This includes accuracy, availability, timing, merchantability, or fitness for a particular purpose.
            </p>
        ),
    },
    {
        id: 'governing',
        number: '12',
        title: 'Governing Terms',
        Icon: MdOutlineBalance,
        content: (
            <p>
                These Terms are governed by Betmundial’s General Terms and Conditions. In case of inconsistency, the General Terms and Conditions prevail.
            </p>
        ),
    },
    {
        id: 'crash-limits',
        number: '13',
        title: 'Crash Limits',
        Icon: MdOutlineTrendingUp,
        content: (
            <ul>
                <li>Limits may be revised individually or cumulatively, permanently, or for particular bet types.</li>
                <li>Minimum stake per play ranges from KSH 1 to KSH 10 depending on the game.</li>
                <li>Maximum stake per play is up to KSH 10,000. Maximum daily winnings apply across all games.</li>
                <li>Maximum daily winnings per customer is KSH 500,000 or less depending on the game.</li>
            </ul>
        ),
    },
];

const CrashTerms = () => {
    const navigate = useNavigate();
    const [expanded, setExpanded] = React.useState(false);

    const handleChange = (panel) => (_event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    return (
        <Box className="crash-terms-page">
            <header className="crash-terms-page-header">
                <button
                    type="button"
                    className="crash-terms-page-back"
                    aria-label="Go back"
                    onClick={() => navigate(-1)}
                >
                    <FaArrowLeft />
                </button>

                <div className="crash-terms-page-heading">
                    <h1 className="crash-terms-page-title">
                        Crash Terms &amp; Conditions
                    </h1>
                    <p className="crash-terms-page-subtitle">
                        Read our terms carefully before playing.
                    </p>
                </div>

                <span className="crash-terms-page-shield" aria-hidden="true" title="Secure">
                    <FaShieldAlt />
                </span>
            </header>

            <div className="crash-terms-page-inner">
                <div className="crash-terms-list">
                    {TERMS_SECTIONS.map(({ id, number, title, Icon, content }) => (
                        <Accordion
                            key={id}
                            className="crash-terms-accordion"
                            expanded={expanded === id}
                            onChange={handleChange(id)}
                            disableGutters
                            elevation={0}
                            square
                        >
                            <AccordionSummary
                                className="crash-terms-summary"
                                expandIcon={<MdExpandMore style={{ color: '#e91e8c', fontSize: '20px' }} />}
                                aria-controls={`${id}-content`}
                                id={`${id}-header`}
                            >
                                <span className="crash-terms-row-icon" aria-hidden="true">
                                    <Icon />
                                </span>
                                <span className="crash-terms-row-num">{number}.</span>
                                <span className="crash-terms-row-title">{title}</span>
                            </AccordionSummary>
                            <AccordionDetails className="crash-terms-details">
                                <div className="crash-terms-details-inner">
                                    {content}
                                </div>
                            </AccordionDetails>
                        </Accordion>
                    ))}
                </div>

                <aside className="crash-terms-notice" aria-label="Important notice">
                    <span className="crash-terms-notice-badge" aria-hidden="true">
                        <FaShieldAlt className="crash-terms-notice-shield" />
                        <FaLock className="crash-terms-notice-lock" />
                    </span>
                    <div className="crash-terms-notice-copy">
                        <h2 className="crash-terms-notice-title">Important Notice</h2>
                        <p className="crash-terms-notice-text">
                            Please read and understand these terms before using our crash game.
                        </p>
                        <p className="crash-terms-notice-text">
                            By playing, you agree to be bound by these terms and conditions.
                        </p>
                    </div>
                </aside>
            </div>
        </Box>
    );
};

export default CrashTerms;
