import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    IconButton,
    List,
    ListItemButton,
    MenuItem,
    Select,
    Typography,
} from '@mui/material';
import {
    FaArrowLeft,
    FaCheck,
    FaDatabase,
    FaFileAlt,
    FaInfoCircle,
    FaLock,
    FaShieldAlt,
    FaUser,
    FaUsers,
} from 'react-icons/fa';
import { MdExpandMore } from 'react-icons/md';

const CP = {
    pink: '#e91e8c',
    pinkSoft: '#ff52d4',
    card: 'rgba(255, 255, 255, 0.1)',
    cardSoft: 'rgba(255, 255, 255, 0.08)',
    border: 'rgba(255, 255, 255, 0.12)',
    panel: 'rgba(255, 255, 255, 0.05)',
    panelBorder: 'rgba(255, 255, 255, 0.09)',
    text: '#ffffff',
    muted: 'rgba(255, 255, 255, 0.8)',
    radius: '14px',
    radiusSm: '8px',
};

const ScopeIconRow = ({ icon: Icon, children }) => (
    <Box
        sx={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.85rem',
            mt: '1rem',
        }}
    >
        <Box
            aria-hidden="true"
            sx={{
                flexShrink: 0,
                width: '2.6rem',
                height: '2.6rem',
                borderRadius: '50%',
                border: `1.5px solid ${CP.pink}`,
                color: CP.pink,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.05rem',
                mt: '0.1rem',
            }}
        >
            <Icon />
        </Box>
        <Box sx={{ minWidth: 0, flex: 1, color: CP.muted, lineHeight: 1.55 }}>
            {children}
        </Box>
    </Box>
);

const SECTIONS = [
    {
        id: 'information-security-policy',
        number: 1,
        title: 'Information Security Policy',
        content: (
            <p>
                AIB Petals LTD is a licensed and Kenyan regulated provider of B2C sports betting
                and Igaming solutions. The company offers a online casino, network-based fantasy
                sports solution, coupled with sports games and Jackpot. The Platform provides
                support for all major sports and leagues through various partners, which also
                provides real-time information to players.
            </p>
        ),
    },
    {
        id: 'scope',
        number: 2,
        title: 'Scope',
        content: (
            <>
                <p>
                    Information takes many forms. The scope of this Information Security Policy
                    includes, but is not limited to:
                </p>

                <ScopeIconRow icon={FaUser}>
                    <Typography component="p" sx={{ m: 0, color: 'inherit', lineHeight: 'inherit' }}>
                        All information processed by AIB in pursuit of its operational activities,
                        regardless of whether it is processed electronically, or in paper form including
                        but not limited to:
                    </Typography>
                    <Box component="ul" sx={{ m: '0.45rem 0 0', pl: '1.15rem' }}>
                        <li>External customer information;</li>
                        <li>Operational documents, plans and minutes;</li>
                        <li>Financial, compliance, and other company records;</li>
                        <li>Employee records.</li>
                    </Box>
                </ScopeIconRow>

                <ScopeIconRow icon={FaDatabase}>
                    <Typography component="p" sx={{ m: 0, color: 'inherit', lineHeight: 'inherit' }}>
                        All information processing facilities used in support of AIB’s operational
                        activities to store, process, transmit or otherwise interact with information;
                    </Typography>
                </ScopeIconRow>

                <ScopeIconRow icon={FaUsers}>
                    <Typography component="p" sx={{ m: 0, color: 'inherit', lineHeight: 'inherit' }}>
                        All external organizations that provide services to AIB in respect of
                        information processing facilities.
                    </Typography>
                </ScopeIconRow>

                <ScopeIconRow icon={FaShieldAlt}>
                    <>
                        <Typography component="p" sx={{ m: 0, color: 'inherit', lineHeight: 'inherit' }}>
                            This Policy applies to all employees, consultants, contractors and third parties
                            engaged by AIB (collectively referred to as “users”).
                        </Typography>
                        <Typography component="p" sx={{ m: '0.65rem 0 0', color: 'inherit', lineHeight: 'inherit' }}>
                            All users shall read, understand, and comply with this Policy when storing,
                            processing, communicating or otherwise interacting with information in the
                            course of performing their duties.
                        </Typography>
                        <Typography component="p" sx={{ m: '0.65rem 0 0', color: 'inherit', lineHeight: 'inherit' }}>
                            All users shall comply with all controls, practises, protocols, and training
                            to ensure such compliance. Any breach of this Policy may result in disciplinary
                            or regulatory action.
                        </Typography>
                    </>
                </ScopeIconRow>
            </>
        ),
    },
    {
        id: 'definitions',
        number: 3,
        title: 'Definitions',
        content: (
            <>
                <p>
                    Information security is aimed at protecting the following three attributes of AIB’s information:
                </p>
                <ul>
                    <li>
                        <strong>Confidentiality</strong> – ensuring information assets are not accessible
                        by or disclosed to unauthorized individuals, entities, or processes;
                    </li>
                    <li>
                        <strong>Integrity</strong> – ensuring the accuracy and completeness of
                        information assets;
                    </li>
                    <li>
                        <strong>Availability</strong> – ensuring information assets are accessible
                        and usable upon demand by an authorised entity.
                    </li>
                </ul>
                <p><strong>Information asset</strong> – any information and information processing facility that has value to AIB.</p>
                <p><strong>Information owner</strong> – an individual accountable for the information asset.</p>
                <p><strong>Information processing facilities</strong> – any information processing system, service, or infrastructure, or the physical locations housing them.</p>
            </>
        ),
    },
    {
        id: 'risks',
        number: 4,
        title: 'Risks',
        content: (
            <>
                <p>
                    A lack of information security can lead to incidents such as breaches of confidentiality,
                    corruption of information and availability issues which could adversely affect the
                    reputation of AIB and its customers along with its ability to meet contractual, legal,
                    and regulatory obligations.
                </p>
                <p>
                    Without defined and measurable objectives, it is not possible to determine whether
                    AIB’s information security activities meet their intended outcomes.
                </p>
            </>
        ),
    },
    {
        id: 'objectives',
        number: 5,
        title: 'Objectives',
        content: (
            <>
                <p>
                    The objective of this Information Security Policy is to enable AIB to effectively
                    manage any identified and relevant information security threats in order to meet
                    its strategic business goals and to maintain its legal, regulatory, and contractual
                    compliance obligations.
                </p>
                <p>
                    Compliance with this Information Security Policy is necessary to ensure business
                    continuity and minimize business damage.
                </p>
                <p>
                    In support of this Information Security Policy, AIB’s Senior Management Team (SMT)
                    accepts its role in being fully accountable for information security and is committed to:
                </p>
                <ul>
                    <li>Managing and reducing information security risk in an informed manner;</li>
                    <li>Minimizing the impact on AIB when information security incidents occur;</li>
                    <li>Ensuring AIB has identified applicable legal, regulatory, and contractual requirements and that they are complied with.</li>
                </ul>
            </>
        ),
    },
    {
        id: 'policy-requirements',
        number: 6,
        title: 'Policy Requirements',
        content: (
            <>
                <Typography
                    component="h3"
                    sx={{
                        m: '0 0 0.65rem',
                        fontSize: '15px',
                        fontWeight: 700,
                        color: 'rgba(255, 255, 255, 0.9)',
                    }}
                >
                    Responsibilities
                </Typography>
                <p>
                    The Management of AIB shall be accountable for ensuring that appropriate security
                    and compliance controls are identified, implemented and maintained by information
                    asset owners. It shall be supported in this task by the Information Security Forum (ISF).
                </p>
                <p>
                    AIB’s ISMS manager (role performed by Chief of Production (CoP)) shall be responsible
                    for managing information security at an operational level.
                </p>
                <ul>
                    <li>Reviewing this Policy at least every 12 months;</li>
                    <li>Establishing procedures and monitoring compliance;</li>
                    <li>Ensuring appropriate training is provided.</li>
                </ul>
                <p>
                    Unless explicitly delegated, the CTO is the appointed decision maker for risk
                    and vulnerability analysis and incident management.
                </p>
                <p>
                    Information asset owners are responsible for identification, implementation,
                    and maintenance of controls commensurate with asset value and risk exposure.
                </p>
                <p>
                    It is the responsibility of all users to adhere to this Policy and report
                    incidents promptly. Non-compliance may result in disciplinary action.
                </p>

                <Typography
                    component="h3"
                    sx={{
                        m: '1.1rem 0 0.65rem',
                        fontSize: '15px',
                        fontWeight: 700,
                        color: 'rgba(255, 255, 255, 0.9)',
                    }}
                >
                    Policy Requirements
                </Typography>
                <ul>
                    <li>Information assets are protected against unauthorized access;</li>
                    <li>Information is protected from unauthorized disclosure;</li>
                    <li>Confidentiality, integrity and availability are maintained;</li>
                    <li>Legal, regulatory and contractual obligations are met;</li>
                    <li>Continuity requirements are determined and maintained;</li>
                    <li>Unauthorized use of information assets is prohibited;</li>
                    <li>Information security training is provided;</li>
                    <li>A systematic risk management approach is followed;</li>
                    <li>A formal ISMS framework is maintained;</li>
                    <li>ISMS performance is continuously improved;</li>
                    <li>All breaches are reported and investigated;</li>
                    <li>Controls are commensurate with identified risks.</li>
                </ul>
                <p>
                    Supporting operational security policies shall be reviewed at planned intervals
                    or when significant changes occur.
                </p>
                <p>
                    Any exceptions to this Policy shall be authorised by the ISF and managed through
                    AIB’s incident or change management processes.
                </p>
            </>
        ),
    },
    {
        id: 'policy-review',
        number: 7,
        title: 'Policy Review',
        content: (
            <>
                <Typography
                    component="h3"
                    sx={{
                        m: '0 0 0.65rem',
                        fontSize: '15px',
                        fontWeight: 700,
                        color: 'rgba(255, 255, 255, 0.9)',
                    }}
                >
                    Compliance Monitoring
                </Typography>
                <p>
                    Information security objectives shall be agreed annually and supported by KPIs.
                    These measures shall be reported to the ISF for review.
                </p>
            </>
        ),
    },
    {
        id: 'changes-to-this-policy',
        number: 8,
        title: 'Changes to this Policy',
        content: (
            <>
                <p>
                    This Policy shall be reviewed annually by the ISF and may be updated periodically
                    to remain consistent with AIB’s strategic objectives.
                </p>
                <p>
                    Changes shall be communicated to all users.
                </p>
            </>
        ),
    },
];

const CookiePolicy = () => {
    const navigate = useNavigate();
    const [expanded, setExpanded] = React.useState('information-security-policy');
    const sectionRefs = useRef({});

    const handleChange = (panel) => (_event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    const goToSection = (id) => {
        setExpanded(id);
        requestAnimationFrame(() => {
            const el = sectionRefs.current[id];
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    };

    return (
        <Box
            className="cookie-policy-page"
            sx={{
                '--cp-pink': CP.pink,
                color: CP.text,
                background: 'transparent',
                minHeight: '100%',
                pb: '2rem',
                boxSizing: 'border-box',
                '& *': { boxSizing: 'border-box' },
            }}
        >
            {/* Header */}
            <Box
                component="header"
                sx={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    px: { xs: '1rem', sm: '1.25rem' },
                    pt: '1rem',
                    pb: '0.5rem',
                    mb: '1.25rem',
                }}
            >
                <IconButton
                    aria-label="Go back"
                    onClick={() => navigate(-1)}
                    sx={{
                        position: 'absolute',
                        left: { xs: '0.75rem', sm: '1rem' },
                        top: '1rem',
                        width: '2.5rem',
                        height: '2.5rem',
                        border: '1.5px solid rgba(255, 255, 255, 0.35)',
                        background: 'rgba(255, 255, 255, 0.04)',
                        color: 'rgba(255, 255, 255, 0.8)',
                        '&:hover': {
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderColor: 'rgba(255, 255, 255, 0.55)',
                        },
                    }}
                >
                    <FaArrowLeft style={{ fontSize: '1.15rem' }} />
                </IconButton>

                <Box
                    aria-hidden="true"
                    title="Secure"
                    sx={{
                        position: 'relative',
                        width: '3.25rem',
                        height: '3.25rem',
                        color: CP.pink,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2.35rem',
                        mb: '0.65rem',
                    }}
                >
                    <FaShieldAlt />
                    <FaCheck
                        style={{
                            position: 'absolute',
                            left: '50%',
                            top: '54%',
                            transform: 'translate(-50%, -50%)',
                            fontSize: '0.85rem',
                            color: '#fff',
                        }}
                    />
                </Box>

                <Typography
                    component="h1"
                    sx={{
                        m: 0,
                        fontSize: { xs: '22px', sm: '24px' },
                        fontWeight: 700,
                        letterSpacing: '0.01em',
                        color: '#fff',
                        lineHeight: 1.25,
                    }}
                >
                    Cookie Policy
                </Typography>

                <Typography
                    sx={{
                        m: '0.65rem 0 0',
                        maxWidth: '36rem',
                        fontSize: '14px',
                        fontWeight: 400,
                        color: CP.muted,
                        lineHeight: 1.5,
                    }}
                >
                    Cookies are files with small amounts of data, often used as an anonymous unique
                    identifier. These are sent to your browser from the website that you visit and
                    are stored on your device.
                </Typography>
            </Box>

            {/* Info bar */}
            <Box
                sx={{
                    mx: { xs: '1rem', sm: '1.25rem' },
                    mb: '1.5rem',
                    px: '1rem',
                    py: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    background: 'rgba(0, 0, 0, 0.35)',
                    border: `1px solid ${CP.border}`,
                    borderRadius: CP.radiusSm,
                }}
            >
                <Box
                    aria-hidden="true"
                    sx={{
                        flexShrink: 0,
                        width: '1.85rem',
                        height: '1.85rem',
                        borderRadius: '50%',
                        border: '1.5px solid rgba(255, 255, 255, 0.65)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '0.85rem',
                    }}
                >
                    <FaInfoCircle />
                </Box>
                <Typography
                    sx={{
                        m: 0,
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#fff',
                        lineHeight: 1.4,
                    }}
                >
                    We use cookies for the following purposes:
                </Typography>
            </Box>

            {/* Two-column body */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '220px 1fr' },
                    gap: { xs: '1.25rem', md: '1.75rem' },
                    alignItems: 'start',
                    px: { xs: '1rem', sm: '1.25rem' },
                    maxWidth: '960px',
                    mx: 'auto',
                }}
            >
                {/* On this page — mobile select */}
                <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                    <Typography
                        sx={{
                            m: '0 0 0.5rem',
                            fontSize: '15px',
                            fontWeight: 600,
                            color: '#fff',
                        }}
                    >
                        On this page
                    </Typography>
                    <Select
                        fullWidth
                        size="small"
                        value={expanded || SECTIONS[0].id}
                        onChange={(e) => goToSection(e.target.value)}
                        sx={{
                            fontSize: '14px',
                            color: '#fff',
                            background: CP.cardSoft,
                            borderRadius: CP.radiusSm,
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: CP.border,
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(255, 255, 255, 0.25)',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: CP.pink,
                            },
                            '& .MuiSvgIcon-root': { color: CP.pink },
                        }}
                        MenuProps={{
                            PaperProps: {
                                sx: {
                                    background: '#1a1a22',
                                    color: '#fff',
                                    '& .MuiMenuItem-root': {
                                        fontSize: '14px',
                                    },
                                    '& .MuiMenuItem-root.Mui-selected': {
                                        color: CP.pink,
                                        background: 'rgba(233, 30, 140, 0.12)',
                                    },
                                },
                            },
                        }}
                    >
                        {SECTIONS.map(({ id, number, title }) => (
                            <MenuItem key={id} value={id}>
                                {number}. {title}
                            </MenuItem>
                        ))}
                    </Select>
                </Box>

                {/* On this page — desktop sticky nav */}
                <Box
                    component="nav"
                    aria-label="On this page"
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        position: 'sticky',
                        top: '1rem',
                        alignSelf: 'start',
                        background: 'rgba(255, 255, 255, 0.06)',
                    }}
                >
                    <Typography
                        sx={{
                            m: 0,
                            p: '16px 18px',
                            fontSize: '15px',
                            fontWeight: 600,
                            color: CP.muted,
                            background: CP.panel,
                        }}
                    >
                        On this page
                    </Typography>
                    <List disablePadding>
                        {SECTIONS.map(({ id, number, title }) => {
                            const active = expanded === id;
                            return (
                                <ListItemButton
                                    key={id}
                                    onClick={() => goToSection(id)}
                                    sx={{
                                        py: '0.45rem',
                                        px: '0.75rem',
                                        mb: '0.15rem',
                                        borderRadius: 0,
                                        borderLeft: active
                                            ? `3px solid ${CP.pink}`
                                            : '3px solid transparent',
                                        color: active ? CP.pink : CP.muted,
                                        background: 'transparent',
                                        '&:hover': {
                                            background: 'rgba(255, 255, 255, 0.04)',
                                            color: active ? CP.pink : 'rgba(255, 255, 255, 0.8)',
                                        },
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            fontSize: '14px',
                                            fontWeight: active ? 600 : 400,
                                            lineHeight: 1.35,
                                            color: 'inherit',
                                        }}
                                    >
                                        {number} {title}
                                    </Typography>
                                </ListItemButton>
                            );
                        })}
                    </List>
                </Box>

                {/* Accordions */}
                <Box sx={{ minWidth: 0 }}>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px',
                        }}
                    >
                        {SECTIONS.map(({ id, number, title, content }) => (
                            <Box
                                key={id}
                                ref={(el) => {
                                    sectionRefs.current[id] = el;
                                }}
                                sx={{ scrollMarginTop: '1rem' }}
                            >
                                <Accordion
                                    expanded={expanded === id}
                                    onChange={handleChange(id)}
                                    disableGutters
                                    elevation={0}
                                    square
                                    sx={{
                                        background: `${CP.panel} !important`,
                                        backgroundColor: `${CP.panel} !important`,
                                        border: `1px solid ${CP.panelBorder}`,
                                        borderRadius: `${CP.radiusSm} !important`,
                                        boxShadow: 'none !important',
                                        p: 0,
                                        overflow: 'hidden',
                                        '&::before': { display: 'none' },
                                        '&:first-of-type, &:last-of-type': {
                                            borderRadius: `${CP.radiusSm} !important`,
                                        },
                                        '&.Mui-expanded': {
                                            margin: '0 !important',
                                        },
                                    }}
                                >
                                    <AccordionSummary
                                        expandIcon={
                                            <MdExpandMore style={{ color: CP.pink, fontSize: '20px' }} />
                                        }
                                        aria-controls={`${id}-content`}
                                        id={`${id}-header`}
                                        sx={{
                                            minHeight: '0 !important',
                                            px: '1rem !important',
                                            py: '0.85rem !important',
                                            gap: '0.65rem',
                                            background: 'transparent !important',
                                            borderBottom: 'none',
                                            '&:hover': {
                                                background: 'rgba(255, 255, 255, 0.04) !important',
                                            },
                                            '&.Mui-focused, &.Mui-focusVisible': {
                                                background: 'transparent !important',
                                            },
                                            '&.Mui-expanded': {
                                                minHeight: '0 !important',
                                                borderBottom: `1px solid ${CP.panelBorder}`,
                                            },
                                            '& .MuiAccordionSummary-content': {
                                                m: '0 !important',
                                                alignItems: 'center',
                                                gap: '0.75rem',
                                                minWidth: 0,
                                            },
                                            '& .MuiAccordionSummary-content.Mui-expanded': {
                                                m: '0 !important',
                                            },
                                            '& .MuiAccordionSummary-expandIconWrapper': {
                                                color: CP.pink,
                                            },
                                        }}
                                    >
                                        <Box
                                            aria-hidden="true"
                                            sx={{
                                                flexShrink: 0,
                                                width: '2rem',
                                                height: '2rem',
                                                borderRadius: '6px',
                                                background: CP.pink,
                                                color: '#fff',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '14px',
                                                fontWeight: 700,
                                            }}
                                        >
                                            {number}
                                        </Box>
                                        <Typography
                                            sx={{
                                                flex: 1,
                                                minWidth: 0,
                                                fontSize: '16px',
                                                fontWeight: 600,
                                                color: '#fff',
                                                lineHeight: 1.3,
                                            }}
                                        >
                                            {title}
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails
                                        sx={{
                                            px: '1rem !important',
                                            pt: '0.95rem !important',
                                            pb: '1.05rem !important',
                                            '& p, & li': {
                                                m: 0,
                                                fontSize: '14px',
                                                lineHeight: 1.55,
                                                color: CP.muted,
                                            },
                                            '& p + p': { mt: '0.65rem' },
                                            '& ul': { m: 0, pl: '1.15rem' },
                                            '& li + li': { mt: '0.45rem' },
                                            '& strong': { color: 'rgba(255, 255, 255, 0.8)', fontWeight: 600 },
                                            '& a': {
                                                color: CP.pinkSoft,
                                                textDecoration: 'underline',
                                                '&:hover': { color: '#fff' },
                                            },
                                        }}
                                    >
                                        {content}
                                    </AccordionDetails>
                                </Accordion>
                            </Box>
                        ))}
                    </Box>

                    {/* Important card */}
                    <Box
                        component="aside"
                        aria-label="Important notice"
                        sx={{
                            mt: { xs: '2rem', sm: '2.5rem' },
                            p: { xs: '1.1rem 1rem', sm: '1.25rem 1.15rem' },
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            background: CP.card,
                            border: `1px solid ${CP.border}`,
                            borderRadius: CP.radius,
                            overflow: 'hidden',
                            position: 'relative',
                        }}
                    >
                        <Box
                            aria-hidden="true"
                            sx={{
                                flexShrink: 0,
                                width: '3.15rem',
                                height: '3.15rem',
                                borderRadius: '50%',
                                background: 'linear-gradient(145deg, #ff52d4 0%, #e91e8c 45%, #a71f66 100%)',
                                color: '#fff',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.35rem',
                                boxShadow: '0 4px 14px rgba(233, 30, 140, 0.35)',
                            }}
                        >
                            <FaFileAlt />
                        </Box>

                        <Box sx={{ minWidth: 0, flex: 1, pr: { xs: 0, sm: '4.5rem' } }}>
                            <Typography
                                component="h2"
                                sx={{
                                    m: '0 0 0.45rem',
                                    fontSize: '16px',
                                    fontWeight: 700,
                                    color: '#fff',
                                    lineHeight: 1.25,
                                }}
                            >
                                Important
                            </Typography>
                            <Typography
                                sx={{
                                    m: 0,
                                    fontSize: '14px',
                                    lineHeight: 1.5,
                                    color: CP.muted,
                                }}
                            >
                                This Policy shall be reviewed annually by the ISF and may be updated
                                periodically to remain consistent with AIB’s strategic objectives.
                                Changes shall be communicated to all users.
                            </Typography>
                        </Box>

                        {/* Decorative doc + shield */}
                        <Box
                            aria-hidden="true"
                            sx={{
                                display: { xs: 'none', sm: 'block' },
                                position: 'absolute',
                                right: '0.75rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: '4.5rem',
                                height: '4.5rem',
                                opacity: 0.9,
                                pointerEvents: 'none',
                            }}
                        >
                            <Box
                                sx={{
                                    position: 'absolute',
                                    inset: '0.35rem 0.55rem 0.15rem',
                                    borderRadius: '6px',
                                    border: '1.5px solid rgba(255, 255, 255, 0.2)',
                                    background: 'rgba(255, 255, 255, 0.04)',
                                    '&::before, &::after': {
                                        content: '""',
                                        position: 'absolute',
                                        left: '18%',
                                        right: '18%',
                                        height: '2px',
                                        background: 'rgba(255, 255, 255, 0.18)',
                                        borderRadius: 1,
                                    },
                                    '&::before': { top: '32%' },
                                    '&::after': { top: '48%' },
                                }}
                            />
                            <Box
                                sx={{
                                    position: 'absolute',
                                    right: 0,
                                    bottom: 0,
                                    width: '2.35rem',
                                    height: '2.35rem',
                                    color: CP.pink,
                                    fontSize: '2.1rem',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    filter: 'drop-shadow(0 2px 6px rgba(233, 30, 140, 0.45))',
                                }}
                            >
                                <FaShieldAlt />
                                <FaLock
                                    style={{
                                        position: 'absolute',
                                        left: '50%',
                                        top: '54%',
                                        transform: 'translate(-50%, -50%)',
                                        fontSize: '0.55rem',
                                        color: '#fff',
                                    }}
                                />
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default CookiePolicy;
