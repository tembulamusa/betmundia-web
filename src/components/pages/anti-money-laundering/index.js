import React from "react";
import {
    Accordion,
    AccordionItem,
    AccordionItemHeading,
    AccordionItemButton,
    AccordionItemPanel,
} from 'react-accessible-accordion';
import 'react-accessible-accordion/dist/fancy-example.css';

const AntiMoneyLaundering = () => {
    return (
        <>
            <div className='col-md-12 bg-primary p-4 text-center profound-text'>
                <h4 className="inline-block">Anti Money Laundering</h4>
            </div>

            <div className="col-md-12 py-2 px-0">
                {/* 👇 preExpanded makes first item open */}
                <Accordion allowMultipleExpanded preExpanded={['aml']}>

                    <AccordionItem uuid="aml">
                        <AccordionItemHeading>
                            <AccordionItemButton>
                                ANTI-MONEY LAUNDERING (AML) POLICY
                            </AccordionItemButton>
                        </AccordionItemHeading>

                        <AccordionItemPanel>

                            <p>
                                We endeavor to carry out all appropriate measures to combat money laundering and international terrorism.
                                We are bound to inform the relevant authorities if we suspect that funds deposited by the Player are used
                                for money laundering, terrorism financing or any other illegal activity.
                            </p>

                            <p>
                                <strong>BetMundial</strong> is obliged to block such funds and to undertake measures as provided in the AML policy rules.
                            </p>

                            <h5>User Obligations</h5>
                            <p>When you open an account, you agree to undertake the following obligations:</p>

                            <ul>
                                <li>
                                    You agree that you comply with all applicable laws and regulations on combating money laundering
                                    and terrorism financing, including the AML Policy.
                                </li>
                                <li>
                                    You confirm that you have no information or suspicions that funds used for deposits are obtained
                                    from illegal sources or related to unlawful activities.
                                </li>
                                <li>
                                    You agree to immediately provide any information requested in accordance with legal and regulatory requirements.
                                </li>
                            </ul>

                            <h5>Monitoring & Compliance</h5>
                            <ul>
                                <li>
                                    The company collects and keeps copies of ID documentation, mobile numbers, and related data during
                                    registration and withdrawals.
                                </li>
                                <li>
                                    All changes made to user accounts are recorded.
                                </li>
                                <li>
                                    The company monitors suspicious activity and special transactions.
                                </li>
                                <li>
                                    The company reserves the right to ban a user at any time if there is suspicion of money laundering or criminal activity.
                                </li>
                                <li>
                                    The company is not obliged to inform the user if suspicious activity has been reported to authorities.
                                </li>
                            </ul>

                            <h5>Identity Verification (KYC)</h5>
                            <p>
                                The Company performs both initial and ongoing identity verification procedures based on the risk level of each user.
                            </p>

                            <ul>
                                <li>The company will request minimum information to confirm your identity.</li>
                                <li>All data and verification results are recorded and preserved.</li>
                                <li>
                                    Through KYC, your data is checked against lists of persons suspected of terrorism maintained by authorized bodies.
                                </li>
                            </ul>

                            <p><strong>Minimum required identification data includes:</strong></p>
                            <ul>
                                <li>Full name</li>
                                <li>Date of birth</li>
                                <li>Residential or registered address</li>
                                <li>Source of funds</li>
                            </ul>

                            <h5>Required Documents</h5>
                            <p>To verify your identity, the Company may request:</p>

                            <ul>
                                <li>
                                    Passport, ID card, or equivalent document containing:
                                    <ul>
                                        <li>Name</li>
                                        <li>Date of birth</li>
                                        <li>Photograph</li>
                                    </ul>
                                </li>
                                <li>Additional supporting documents where necessary</li>
                                <li>Notarized copies in certain cases</li>
                            </ul>

                        </AccordionItemPanel>
                    </AccordionItem>

                </Accordion>
            </div>
        </>
    );
};

export default AntiMoneyLaundering;