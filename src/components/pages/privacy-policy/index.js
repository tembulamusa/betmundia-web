import React from "react";
import { useNavigate } from "react-router-dom";
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
} from "@mui/material";
import { FaArrowLeft, FaShieldAlt } from "react-icons/fa";
import { MdExpandMore } from "react-icons/md";

const RIGHTS_ROWS = [
    {
        right: "Be informed",
        meaning:
            "receive clear information about how and why your personal data is processed.",
    },
    {
        right: "Access",
        meaning:
            "request confirmation whether we process your personal data and obtain a copy, subject to lawful limitations.",
    },
    {
        right: "Rectification",
        meaning: "ask us to correct inaccurate or incomplete personal data.",
    },
    {
        right: "Erasure",
        meaning:
            "request deletion of personal data where there is no lawful reason for continued processing, subject to legal and regulatory retention duties.",
    },
    {
        right: "Restriction",
        meaning:
            "request restriction of processing in circumstances permitted by law.",
    },
    {
        right: "Object",
        meaning:
            "object to processing based on legitimate interests and to direct marketing.",
    },
    {
        right: "Data portability",
        meaning:
            "receive certain personal data in a structured, commonly used and machine-readable format where applicable.",
    },
    {
        right: "Withdraw consent",
        meaning:
            "withdraw consent at any time where consent is the lawful basis, without affecting processing already carried out lawfully.",
    },
    {
        right: "Automated decisions",
        meaning:
            "seek human review where a decision based solely on automated processing produces legal or similarly significant effects, where applicable.",
    },
    {
        right: "Complain",
        meaning:
            "raise a concern with us and, where applicable, lodge a complaint with the competent privacy or data-protection authority in your jurisdiction.",
    },
];

const SECTIONS = [
    {
        id: "who-we-are",
        number: "01",
        title: "Who we are and scope of this policy",
        content: (
            <>
                <p>
                    This policy applies to personal data processed through{" "}
                    <a
                        href="https://betmundial.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        https://betmundial.com/
                    </a>{" "}
                    and related online interactions controlled by Betmundial / AIB
                    Petals Limited. It also applies where information submitted
                    through the website is subsequently used to provide or
                    administer the relevant services.
                </p>
                <p>
                    For purposes of applicable privacy and data-protection laws,
                    the entity determining the purposes and means of processing
                    personal data will ordinarily act as the data controller (or
                    equivalent role under applicable law). Service providers may
                    act as processors or service providers on our instructions,
                    while certain regulated or independent recipients may act as
                    separate controllers.
                </p>
            </>
        ),
    },
    {
        id: "personal-data",
        number: "02",
        title: "Personal data we may collect",
        content: (
            <>
                <p>
                    Account and identity information, including mobile number,
                    account credentials, name, date of birth, photograph,
                    identification documents and other verification information
                    where required.
                </p>
                <p>
                    Age-verification, KYC, anti-money laundering, sanctions and
                    fraud-prevention information, including supporting documents
                    and source-of-funds information where required.
                </p>
                <p>
                    Betting and gaming activity, including bets, selections,
                    stakes, winnings, losses, bonuses, promotions, account
                    balances and responsible-gambling interactions.
                </p>
                <p>
                    Payment and transaction information, including deposit and
                    withdrawal records, mobile-money/payment references and
                    payment-method details.
                </p>
                <p>
                    Device, security and usage information, including IP address,
                    device identifiers, browser/app information, login history,
                    cookies, session data and security events.
                </p>
                <p>
                    Communications and support records, including calls, emails,
                    chats, complaints and interactions with automated or
                    AI-powered support tools.
                </p>
                <p>
                    Marketing and preference data, including promotional
                    participation, opt-in/opt-out status and communication
                    preferences.
                </p>
                <p>
                    We may also collect information from publicly available
                    sources, regulators, service providers, business partners or
                    other persons where this is lawful and relevant to the
                    service or interaction.
                </p>
            </>
        ),
    },
    {
        id: "how-we-collect",
        number: "03",
        title: "How we collect personal data",
        content: (
            <>
                <p>
                    Directly from you when you complete a form, create an
                    account, request a quotation or service, send us a message,
                    submit documents or otherwise communicate with us.
                </p>
                <p>
                    From another person acting for or connected with you, such as
                    an employer, family member, authorised representative,
                    customer, supplier, counterparty or adviser.
                </p>
                <p>
                    Automatically when you use our website or digital services,
                    through server logs, cookies and similar technologies.
                </p>
                <p>
                    From third parties and public sources where necessary for
                    verification, service delivery, compliance, security or
                    legitimate business purposes.
                </p>
            </>
        ),
    },
    {
        id: "why-we-process",
        number: "04",
        title: "Why we process personal data",
        content: (
            <>
                <p>
                    Depending on your interaction with us, we process personal
                    data to:
                </p>
                <ul>
                    <li>
                        register and administer player accounts, verify age and
                        identity, authenticate access and provide betting/gaming
                        services;
                    </li>
                    <li>
                        process deposits, withdrawals, winnings, bonuses and
                        account transactions;
                    </li>
                    <li>
                        comply with gambling, anti-money laundering,
                        counter-terrorist financing, tax, regulatory and
                        record-keeping obligations;
                    </li>
                    <li>
                        detect and investigate fraud, collusion, money
                        laundering, account abuse, suspicious activity,
                        cybersecurity threats and breaches of our terms;
                    </li>
                    <li>
                        support responsible gambling, including account
                        restrictions, self-exclusion and other player-protection
                        measures where applicable;
                    </li>
                    <li>
                        provide customer support, including automated
                        assistance, while escalating sensitive or
                        account-specific matters to appropriate human support;
                    </li>
                    <li>
                        personalise and improve products, promotions, service
                        performance and website/app functionality; and
                    </li>
                    <li>
                        send direct marketing where permitted by law and in
                        accordance with your communication choices.
                    </li>
                </ul>
            </>
        ),
    },
    {
        id: "lawful-bases",
        number: "05",
        title: "Lawful bases for processing",
        content: (
            <>
                <p>
                    We process personal data in accordance with the privacy and
                    data-protection laws that apply to the relevant individual,
                    processing activity and jurisdiction. Where a law requires a
                    specific lawful basis, we rely on the basis appropriate to
                    the circumstances. Depending on the jurisdiction, this may
                    include:
                </p>
                <ul>
                    <li>
                        performance of a contract with you or taking steps at
                        your request before entering into a contract;
                    </li>
                    <li>compliance with a legal or regulatory obligation;</li>
                    <li>
                        our legitimate interests or those of a third party,
                        where those interests are not overridden by your rights
                        and freedoms;
                    </li>
                    <li>
                        your consent, where consent is appropriate or legally
                        required;
                    </li>
                    <li>
                        protection of vital interests in limited circumstances;
                        and
                    </li>
                    <li>
                        another lawful basis expressly recognised by applicable
                        law.
                    </li>
                </ul>
                <p>
                    Where we process sensitive personal data, we will also rely
                    on an additional condition permitted by law, such as
                    explicit consent, legal/regulatory necessity, establishment
                    or defence of legal claims, or another applicable statutory
                    basis.
                </p>
            </>
        ),
    },
    {
        id: "sensitive-data",
        number: "06",
        title: "Sensitive personal data and sector-specific processing",
        content: (
            <p>
                Betmundial does not knowingly permit persons under 18 years of
                age to register or gamble. We may use account, identity,
                transaction, device and behavioural information to detect
                suspicious activity, enforce legal and regulatory controls and
                support responsible gambling. Where automated tools are used to
                flag risk or assist customer service, significant account
                decisions should be subject to appropriate safeguards and human
                review where required by law.
            </p>
        ),
    },
    {
        id: "sharing",
        number: "07",
        title: "Sharing personal data",
        content: (
            <>
                <p>
                    We do not sell personal data. We may disclose personal data,
                    on a need-to-know basis and subject to appropriate legal and
                    contractual safeguards, to:
                </p>
                <ul>
                    <li>
                        payment service providers, mobile-money operators, banks
                        and transaction processors;
                    </li>
                    <li>
                        identity-verification, fraud-prevention, AML,
                        sanctions-screening and security service providers;
                    </li>
                    <li>
                        gaming platform, odds/data, hosting, cloud,
                        communications, analytics and customer-support
                        providers;
                    </li>
                    <li>
                        the Gambling Regulatory Authority of Kenya and other
                        regulators, law-enforcement agencies, courts or public
                        authorities where required or permitted by law; and
                    </li>
                    <li>
                        professional advisers and other parties where necessary
                        to establish, exercise or defend legal claims.
                    </li>
                </ul>
                <p>
                    Where a third party processes personal data on our
                    instructions, we require it to process the data only for
                    authorised purposes, keep it secure and comply with
                    applicable data-protection obligations. Independent
                    recipients remain responsible for their own lawful
                    processing.
                </p>
            </>
        ),
    },
    {
        id: "international-transfers",
        number: "08",
        title: "International transfers",
        content: (
            <p>
                Because our websites and services may be accessed
                internationally, personal data may be transferred to, stored in
                or accessed from countries other than the country in which you
                are located. Where applicable law regulates such transfers, we
                use a legally recognised transfer mechanism or safeguard, which
                may include adequacy decisions, standard contractual clauses,
                binding corporate rules, contractual safeguards, consent where
                valid, or another permitted mechanism. We apply additional
                safeguards to sensitive or special-category data where required.
            </p>
        ),
    },
    {
        id: "cookies",
        number: "09",
        title: "Cookies and similar technologies",
        content: (
            <p>
                Our website may use cookies, pixels, local storage and similar
                technologies to operate essential functions, remember
                preferences, maintain security, understand website performance
                and, where permitted, support analytics or marketing.
                Non-essential cookies should be used in accordance with
                applicable consent requirements. You can also manage cookies
                through your browser settings, although disabling essential
                cookies may affect website functionality.
            </p>
        ),
    },
    {
        id: "direct-marketing",
        number: "10",
        title: "Direct marketing",
        content: (
            <p>
                Where permitted by law, we may use your contact details to send
                information about relevant products, services, offers or
                updates. We will provide an appropriate opportunity to opt out
                of direct marketing. You may withdraw your marketing consent or
                object to direct marketing at any time using the unsubscribe
                mechanism provided or by contacting us through the website.
                Service, security, regulatory and transactional communications
                are not marketing and may still be sent where necessary.
            </p>
        ),
    },
    {
        id: "security",
        number: "11",
        title: "Security",
        content: (
            <p>
                We use reasonable administrative, organisational, physical and
                technical measures designed to protect personal data against
                accidental or unlawful destruction, loss, alteration,
                unauthorised disclosure or access. Measures may include access
                controls, authentication, encryption where appropriate, secure
                configurations, backups, monitoring, staff confidentiality
                obligations, vendor controls and incident-response procedures.
                No internet transmission or storage system can be guaranteed to
                be completely secure.
            </p>
        ),
    },
    {
        id: "retention",
        number: "12",
        title: "Data retention",
        content: (
            <p>
                We retain personal data only for as long as reasonably necessary
                for the purposes for which it was collected, including service
                delivery, legal and regulatory compliance, tax and accounting,
                fraud prevention, audit, dispute resolution and the
                establishment, exercise or defence of legal claims. Retention
                periods vary depending on the type of information, the
                relationship and applicable sector requirements. When
                information is no longer required, we will delete, anonymise or
                securely dispose of it, subject to lawful exceptions.
            </p>
        ),
    },
    {
        id: "rights",
        number: "13",
        title: "Your data-protection rights",
        content: (
            <>
                <p>
                    Depending on where you are located and the law applicable to
                    our processing, you may have some or all of the following
                    rights, subject to lawful limitations and exemptions:
                </p>
                <div className="privacy-policy-table-wrap">
                    <table className="privacy-policy-rights-table">
                        <thead>
                            <tr>
                                <th scope="col">Right</th>
                                <th scope="col">What it means</th>
                            </tr>
                        </thead>
                        <tbody>
                            {RIGHTS_ROWS.map((row) => (
                                <tr key={row.right}>
                                    <th scope="row">{row.right}</th>
                                    <td>{row.meaning}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p>
                    We may need to verify your identity before acting on a
                    rights request. Rights are not absolute; where we lawfully
                    decline or limit a request, we will explain the basis where
                    required.
                </p>
            </>
        ),
    },
    {
        id: "children",
        number: "14",
        title: "Children and age restrictions",
        content: (
            <p>
                Betmundial is strictly for persons aged 18 years and above. We
                do not knowingly register or provide gambling services to
                children. If we discover that an account belongs to a person
                under 18, we may restrict or close the account and take any
                action required by law or regulation.
            </p>
        ),
    },
    {
        id: "third-party-links",
        number: "15",
        title: "Third-party links",
        content: (
            <p>
                Our website may contain links to third-party websites, platforms
                or services. We are not responsible for the privacy practices of
                independent third parties. We encourage you to review their
                privacy notices before providing personal data.
            </p>
        ),
    },
    {
        id: "breaches",
        number: "16",
        title: "Personal data breaches",
        content: (
            <p>
                We maintain procedures for identifying, assessing and responding
                to personal-data breaches. Where a breach is legally reportable,
                we will notify the competent data-protection or privacy
                authority and affected individuals within the time and manner
                required by the applicable law.
            </p>
        ),
    },
    {
        id: "jurisdiction",
        number: "17",
        title: "Jurisdiction-specific privacy rights",
        content: (
            <>
                <p>
                    This is a global privacy notice. Privacy rights and our
                    obligations may vary by jurisdiction. Where applicable, we
                    will comply with mandatory local requirements, including the
                    EU General Data Protection Regulation (GDPR), the UK GDPR
                    and Data Protection Act 2018, the Kenya Data Protection Act
                    2019, South Africa&apos;s Protection of Personal Information
                    Act (POPIA), and other applicable national or state privacy
                    laws. If a mandatory local rule provides greater protection
                    than this policy, that rule will apply to the relevant
                    processing.
                </p>
                <p>
                    Residents of jurisdictions that provide additional rights
                    may, where applicable, request information about categories
                    or specific pieces of personal data collected, correction or
                    deletion, restriction or objection, portability, withdrawal
                    of consent, information about disclosures, and review of
                    certain automated decisions. Where applicable law provides
                    rights to opt out of the sale, sharing or use of personal
                    data for targeted or cross-context behavioural advertising,
                    we will honour valid requests. We do not discriminate
                    against individuals for exercising applicable privacy
                    rights.
                </p>
            </>
        ),
    },
    {
        id: "changes",
        number: "18",
        title: "Changes to this Privacy Policy",
        content: (
            <p>
                We may update this Privacy Policy from time to time to reflect
                changes in our services, technology, legal obligations or
                data-processing practices. The version published on the website
                is the current version and applies from the time it is uploaded.
                Material changes may also be communicated through an appropriate
                website or service notice.
            </p>
        ),
    },
    {
        id: "contact",
        number: "19",
        title: "Contact us",
        content: (
            <>
                <p>
                    For privacy questions, requests or complaints, please
                    contact us through the contact details or Contact Us
                    facility published on our website:
                </p>
                <p>
                    <a
                        href="https://betmundial.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        https://betmundial.com/
                    </a>
                </p>
                <p>
                    Website contact details currently published:{" "}
                    <a href="mailto:support@betmundial.com">
                        support@betmundial.com
                    </a>{" "}
                    |{" "}
                    <a href="tel:+254143444142">+254 143 444 142</a>.
                </p>
                <p>
                    You may also have the right to lodge a complaint with the
                    competent data-protection or privacy regulator in the
                    country or region where you live, work, or where you believe
                    an infringement occurred. Where Kenya law applies, this
                    includes the Office of the Data Protection Commissioner of
                    Kenya.
                </p>
            </>
        ),
    },
];

const PrivacyPolicy = () => {
    const navigate = useNavigate();
    const [expanded, setExpanded] = React.useState(false);

    const handleChange = (panel) => (_event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    return (
        <Box className="privacy-policy-page affiliate-terms-page">
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
                        Privacy Policy
                    </h1>
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
                <div className="privacy-policy-intro affiliate-terms-details-inner">
                    <p>
                        This Privacy Policy explains how Betmundial, operated by
                        AIB Petals Limited (&quot;Betmundial&quot;,
                        &quot;we&quot;, &quot;us&quot; or &quot;our&quot;),
                        processes personal data when you visit the Betmundial
                        website or app, create or use an account, place bets or
                        use gaming products, make deposits or withdrawals,
                        contact customer support, interact with our AI-enabled
                        support tools, or participate in promotions.
                    </p>
                    <p>
                        This policy is intended to be read together with any
                        service-specific terms, consent notices, cookie notice
                        or other privacy information presented at the point
                        where personal data is collected.
                    </p>
                </div>

                <div className="affiliate-terms-list">
                    {SECTIONS.map(({ id, number, title, content }) => (
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
                                        style={{
                                            color: "#e91e8c",
                                            fontSize: "20px",
                                        }}
                                    />
                                }
                                aria-controls={`${id}-content`}
                                id={`${id}-header`}
                            >
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
            </div>
        </Box>
    );
};

export default PrivacyPolicy;
