import React from "react";
import {
    Accordion,
    AccordionItem,
    AccordionItemHeading,
    AccordionItemButton,
    AccordionItemPanel,
} from 'react-accessible-accordion';
import 'react-accessible-accordion/dist/fancy-example.css';
const Header = React.lazy(() => import('../../header/header'));
const SideBar = React.lazy(() => import('../../sidebar/awesome/Sidebar'));
const Footer = React.lazy(() => import('../../footer/footer'));
const Right = React.lazy(() => import('../../right/index'));

const CookiePolicy = () => {
    return (
        <>
            <div className='col-md-12 bg-primary p-4 text-center profound-text'>
                <h4 className="inline-block"> Cookie Policy </h4>
            </div>
            <div className="col-md-12 py-5 px-4">
                <p>
                    Cookies are files with small amounts of data, often used as an anonymous unique identifier. These are sent to your browser from the website that you visit and are stored on your device. We use cookies for the following purposes:
                </p>

            </div>
            <div className="col-md-12 py-2 px-4">

                <Accordion allowZeroExpanded>
                    {/* K. INFORMATION SECURITY POLICY */}
                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>
                                K. INFORMATION SECURITY POLICY
                            </AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>

                            {/* Introduction */}
                            <h5>1. Introduction</h5>
                            <p>
                                AIB Petals LTD is a licensed and Kenyan regulated provider of B2C sports betting
                                and Igaming solutions. The company offers a online casino, network-based fantasy
                                sports solution, coupled with sports games and Jackpot. The Platform provides
                                support for all major sports and leagues through various partners, which also
                                provides real-time information to players.
                            </p>

                            {/* Scope */}
                            <h5>2. Scope</h5>
                            <p>
                                Information takes many forms. The scope of this Information Security Policy
                                includes, but is not limited to:
                            </p>

                            <ul>
                                <li>
                                    All information processed by AIB in pursuit of its operational activities,
                                    regardless of whether it is processed electronically, or in paper form including
                                    but not limited to:
                                    <ul>
                                        <li>External customer information;</li>
                                        <li>Operational documents, plans and minutes;</li>
                                        <li>Financial, compliance, and other company records;</li>
                                        <li>Employee records.</li>
                                    </ul>
                                </li>

                                <li>
                                    All information processing facilities used in support of AIB’s operational
                                    activities to store, process, transmit or otherwise interact with information;
                                </li>

                                <li>
                                    All external organizations that provide services to AIB in respect of
                                    information processing facilities.
                                </li>
                            </ul>

                            <p>
                                This Policy applies to all employees, consultants, contractors and third parties
                                engaged by AIB (collectively referred to as “users”).
                            </p>

                            <p>
                                All users shall read, understand, and comply with this Policy when storing,
                                processing, communicating or otherwise interacting with information in the
                                course of performing their duties.
                            </p>

                            <p>
                                All users shall comply with all controls, practises, protocols, and training
                                to ensure such compliance. Any breach of this Policy may result in disciplinary
                                or regulatory action.
                            </p>

                            {/* Definitions */}
                            <h5>3. Definitions</h5>

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

                            {/* Risks */}
                            <h5>4. Risks</h5>
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

                            {/* Objectives */}
                            <h5>5. Objectives</h5>
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

                            {/* Responsibilities */}
                            <h5>6. Responsibilities</h5>

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

                            {/* Policy Requirements */}
                            <h5>7. Policy Requirements</h5>

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

                            {/* Compliance Monitoring */}
                            <h5>8. Compliance Monitoring</h5>
                            <p>
                                Information security objectives shall be agreed annually and supported by KPIs.
                                These measures shall be reported to the ISF for review.
                            </p>

                            {/* Changes */}
                            <h5>9. Changes to this Policy</h5>
                            <p>
                                This Policy shall be reviewed annually by the ISF and may be updated periodically
                                to remain consistent with AIB’s strategic objectives.
                            </p>

                            <p>
                                Changes shall be communicated to all users.
                            </p>

                        </AccordionItemPanel>
                    </AccordionItem>
                </Accordion>
            </div>
        </>
    );
}

export default CookiePolicy;
