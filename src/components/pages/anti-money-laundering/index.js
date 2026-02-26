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
const Footer = React.lazy(() => import('../../footer/footer'));
const Right = React.lazy(() => import('../../right/index'));
const SideBar = React.lazy(() => import('../../sidebar/awesome/Sidebar'));

const AntiMoneyLaundering = () => {
    return (
        <>
            <div className='col-md-12 bg-primary p-4 text-center profound-text'>
                <h4 className="inline-block"> Anti Money Laundering </h4>
            </div>
            <div className="col-md-12 py-2 px-4">
                <Accordion allowMultipleExpanded>
                    {/* L. ANTI-MONEY LAUNDERING (AML/CFT) POLICY */}
                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>
                                L. ANTI-MONEY LAUNDERING (AML/CFT) POLICY
                            </AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>

                            {/* A. Introduction */}
                            <h5>A. Introduction</h5>

                            <p><strong>1.</strong> Company Name – AIB Petals trading as Betmundial (www.betmundial.com)</p>
                            <p><strong>2.</strong> Director Shareholder – Antony Odiero. Chief Executive Officer – Job Weku. Victoria Mwiti.</p>
                            <p><strong>3.</strong> The Company has adapted money-laundering policies and procedures appropriate to its size and risk profile.</p>
                            <p><strong>4.</strong> The Company has adopted a General Policy Statement as well as the specific anti-money laundering policies and procedures mentioned below.</p>

                            {/* B. Services */}
                            <h5>B. Services provided by the Company</h5>

                            <p>The Company provides services in the following areas:</p>
                            <ul>
                                <li>Entertainment</li>
                                <li>Online Sports Betting</li>
                                <li>Online Casino</li>
                                <li>Landbased/ Retail gaming</li>
                            </ul>

                            {/* C. Current Policies and Procedures */}
                            <h5>C. Current Policies and Procedures</h5>

                            <h6>Corporate Governance</h6>

                            <p><strong>1.</strong> In order to prevent money laundering and terrorist financing the Company is under a legal obligation to have procedures and systems in place.</p>

                            <ul>
                                <li>Staff responsible for prevention and detection;</li>
                                <li>Implementation of risk management systems and training;</li>
                                <li>Appointment of responsible officers.</li>
                            </ul>

                            <p>
                                The CEO assumes the functions of the Money Laundering Compliance Officer (MLCO).
                                The GM assumes the function of Deputy MLCO in the CEO’s absence.
                                The GM assumes the function of Money Laundering Reporting Officer (MLRO).
                            </p>

                            {/* Risk Assessment */}
                            <h6>Risk Assessment</h6>

                            <p><strong>3.</strong> The Company conducts and documents a business risk assessment, reviewed annually.</p>

                            <p><strong>5.</strong> Systems include:</p>
                            <ul>
                                <li>Client Due Diligence (CDD) procedures;</li>
                                <li>Reporting to the Financial Reporting Centre (FRC);</li>
                                <li>Employee screening;</li>
                                <li>Training and awareness;</li>
                                <li>Record keeping;</li>
                                <li>Liaison with relevant authorities.</li>
                            </ul>

                            <p><strong>7.</strong> Objectives include:</p>
                            <ul>
                                <li>Culture of openness;</li>
                                <li>Concerns addressed within 48 hours;</li>
                                <li>Full compliance with procedures.</li>
                            </ul>

                            <p><strong>9.</strong> Payment handling approach:</p>
                            <ul>
                                <li>Near absolute prohibition on cash handling;</li>
                                <li>Source of funds enquiries;</li>
                                <li>Risk-based monitoring of invoice settlements.</li>
                            </ul>

                            <p><strong>10.</strong> Risk factors considered:</p>
                            <ul>
                                <li>Nature and complexity of business;</li>
                                <li>Products and services;</li>
                                <li>Customer types;</li>
                                <li>Countries and institutions involved.</li>
                            </ul>

                            {/* Client Due Diligence */}
                            <h6>Client Due Diligence (CDD)</h6>

                            <p><strong>12.</strong> Objectives include:</p>
                            <ul>
                                <li>Identification and verification of applicants;</li>
                                <li>Beneficial ownership identification;</li>
                                <li>Understanding purpose of relationship;</li>
                                <li>Verification of source of funds and wealth;</li>
                                <li>Ongoing monitoring and updates.</li>
                            </ul>

                            {/* Identification */}
                            <h6>Identification and Verification</h6>

                            <ul>
                                <li>At outset of relationship;</li>
                                <li>Before occasional transactions;</li>
                                <li>When identification details change;</li>
                                <li>Where suspicion arises.</li>
                            </ul>

                            {/* Ongoing Monitoring */}
                            <h6>Ongoing Monitoring</h6>

                            <p>
                                High-risk and ongoing relationships reviewed annually.
                                Unusual or complex transactions are scrutinised.
                            </p>

                            {/* Reporting */}
                            <h6>Reporting Obligations</h6>

                            <p>
                                Staff must report suspicions immediately to the MLRO/MLCO.
                                External Suspicious Activity Reports (SARs) are submitted where required.
                            </p>

                            {/* Training */}
                            <h6>Screening, Awareness & Training</h6>

                            <ul>
                                <li>Induction training within 10 working days;</li>
                                <li>Training every two years;</li>
                                <li>Biannual awareness measures;</li>
                                <li>Employee screening procedures.</li>
                            </ul>

                            {/* Record Keeping */}
                            <h6>Record Keeping</h6>

                            <p>
                                Records retained for minimum five years after relationship ends.
                                SAR-related records retained separately and longer where required.
                            </p>

                            <ul>
                                <li>Client records;</li>
                                <li>Risk assessments;</li>
                                <li>Senior management reviews;</li>
                                <li>Training records;</li>
                                <li>MLCO/MLRO qualification records.</li>
                            </ul>

                            <p>The Company will periodically test access to records.</p>

                            {/* Audit */}
                            <h6>Audit of Process Effectiveness</h6>

                            <p>
                                The MLCO and partners will review effectiveness of systems annually,
                                including high-risk relationships, CDD issues, breaches and reporting statistics.
                            </p>

                        </AccordionItemPanel>
                    </AccordionItem>
                </Accordion>
            </div>
        </>
    );
};

export default AntiMoneyLaundering;
