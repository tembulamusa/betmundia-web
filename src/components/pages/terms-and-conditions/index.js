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
const SideBar = React.lazy(() => import('../../sidebar/awesome/Sidebar'));
const Right = React.lazy(() => import('../../right/index'));

const General = React.lazy(() => import('./general'));
const AccountUsage = React.lazy(() => import('./account-usage'));
const Deposits = React.lazy(() => import('./deposits'));
const Withdrawals = React.lazy(() => import('./withdrawals'));
const LiveBetting = React.lazy(() => import('./live-betting'));
const BonusesAndPromotions = React.lazy(() => import('./bonuses-and-promotions'));
const Complaints = React.lazy(() => import('./complaints'));
const Misconduct = React.lazy(() => import('./misconduct'));
const ErrorsOrOmissions = React.lazy(() => import('./errors-or-omissions'));
const IntellectualProperty = React.lazy(() => import('./intellectual-property'));
const ThirdPartyLinking = React.lazy(() => import('./third-party-linking'));
const Assignment = React.lazy(() => import('./assignment'));
const Indemnification = React.lazy(() => import('./indemnification'));
const Waiver = React.lazy(() => import('./waiver'));
const Severability = React.lazy(() => import('./severability'));
const DisputeResolution = React.lazy(() => import('./dispute-resolution'));
const Ammendments = React.lazy(() => import('./ammendments'));
const CommunicationsAndNotices = React.lazy(() => import('./communications-and-notices'));
const ApplicableLaw = React.lazy(() => import('./applicable-law'));
const TermAndTermination = React.lazy(() => import('./term-and-termination'));


const TermsAndConditions = (props) => {
    return (
        <>
            <div className='col-md-12 bg-primary p-4 text-center profound-text'>
                <h4 className="inline-block"> Terms and Conditions </h4>
            </div>
            <Accordion allowZeroExpanded>

                {/* A. INTRODUCTION */}
                <AccordionItem>
                    <AccordionItemHeading>
                        <AccordionItemButton>
                            A. INTRODUCTION
                        </AccordionItemButton>
                    </AccordionItemHeading>
                    <AccordionItemPanel>

                        <p><strong>1.</strong> By using and/or visiting any section (including sub-domains) of the Betmundial.com website or any other websites or applications that we own (the “Website”) and/or registering on the Website, you agree to be bound by (i) these Terms and Conditions; (ii) our Privacy Policy; (iii) the Rules applicable to our sports betting, virtual sports, Jackpot, Casino or other gaming products (together the "Terms").</p>

                        <p><strong>2.</strong> Where you play any game or place a bet using the Website, you will be deemed to accept and agree to be bound by the applicable product Rules available in the "How to Play" section.</p>

                        <p><strong>3.</strong> We may amend these Terms at any time. Continued use of the Website following changes constitutes acceptance of those changes.</p>

                        <p><strong>4.</strong> "Betmundial", "We", "Us" or "Our" refers to Betmundial corporate entities.</p>

                        <p><strong>5.</strong> "You", "Your" or "Customer" refers to any person using the Website or registered account holder.</p>

                        <p><strong>6.</strong> You are responsible for ensuring gambling is legal in your jurisdiction.</p>

                    </AccordionItemPanel>
                </AccordionItem>


                {/* B. YOUR BETMUNDIAL ACCOUNT */}
                <AccordionItem>
                    <AccordionItemHeading>
                        <AccordionItemButton>
                            B. YOUR BETMUNDIAL ACCOUNT
                        </AccordionItemButton>
                    </AccordionItemHeading>
                    <AccordionItemPanel>

                        <p><strong>1.</strong> You must register personally and only one account per person is permitted.</p>

                        <p><strong>2.</strong> You must be 18 years or older. Proof of age may be requested.</p>

                        <p><strong>3.</strong> All information provided must be accurate and updated when necessary.</p>

                        <p><strong>4.</strong> You are responsible for your Username and password. All transactions made using your credentials are valid.</p>

                        <p><strong>5.</strong> We may suspend or terminate accounts if Terms are breached, fraud is suspected, or required by law.</p>

                    </AccordionItemPanel>
                </AccordionItem>


                {/* C. YOUR FINANCES */}
                <AccordionItem>
                    <AccordionItemHeading>
                        <AccordionItemButton>
                            C. YOUR FINANCES
                        </AccordionItemButton>
                    </AccordionItemHeading>
                    <AccordionItemPanel>

                        <h5>Deposits</h5>
                        <ul>
                            <li>Bets may only be placed with cleared funds.</li>
                            <li>No credit betting is allowed.</li>
                            <li>Funds are held in designated accounts.</li>
                        </ul>

                        <h5>Withdrawals</h5>
                        <ul>
                            <li>Subject to identity verification.</li>
                            <li>Processed to original payment method where possible.</li>
                            <li>Deposits must be wagered before withdrawal.</li>
                        </ul>

                        <h5>Limits</h5>
                        <ul>
                            <li>Minimum bet: KES 1</li>
                            <li>Maximum single bet winnings: KES 5,000,000</li>
                            <li>Maximum daily winnings: KES 15,000,000</li>
                        </ul>

                    </AccordionItemPanel>
                </AccordionItem>


                {/* D. BETTING PROCEDURES */}
                <AccordionItem>
                    <AccordionItemHeading>
                        <AccordionItemButton>
                            D. BETTING PROCEDURES
                        </AccordionItemButton>
                    </AccordionItemHeading>
                    <AccordionItemPanel>

                        <p><strong>1. Placing Bets</strong></p>
                        <ul>
                            <li>Bets are accepted online only.</li>
                            <li>Bets cannot be cancelled once placed.</li>
                            <li>Sufficient funds are required.</li>
                        </ul>

                        <p><strong>2. Settlement</strong></p>
                        <ul>
                            <li>Results follow official governing body decisions.</li>
                            <li>If one selection in a multiple bet loses, the entire bet loses.</li>
                        </ul>

                        <p><strong>3. Live & Late Bets</strong></p>
                        <ul>
                            <li>May be subject to delay.</li>
                            <li>Bets placed after an outcome is known will be void.</li>
                        </ul>

                        <p><strong>4. Errors</strong></p>
                        <ul>
                            <li>Incorrect odds</li>
                            <li>System errors</li>
                            <li>Obvious pricing errors</li>
                        </ul>

                    </AccordionItemPanel>
                </AccordionItem>


                {/* E. USE OF THE WEBSITE */}
                <AccordionItem>
                    <AccordionItemHeading>
                        <AccordionItemButton>
                            E. USE OF THE WEBSITE
                        </AccordionItemButton>
                    </AccordionItemHeading>
                    <AccordionItemPanel>

                        <ul>
                            <li>No automated bots or malicious software.</li>
                            <li>No fraudulent or illegal use.</li>
                            <li>Software is licensed, not owned.</li>
                            <li>Reverse engineering prohibited.</li>
                        </ul>

                    </AccordionItemPanel>
                </AccordionItem>


                {/* F. OUR LIABILITY */}
                <AccordionItem>
                    <AccordionItemHeading>
                        <AccordionItemButton>
                            F. OUR LIABILITY
                        </AccordionItemButton>
                    </AccordionItemHeading>
                    <AccordionItemPanel>

                        <ul>
                            <li>No liability for indirect or consequential damages.</li>
                            <li>Maximum liability limited to affected bet value or USD 5,000.</li>
                        </ul>

                    </AccordionItemPanel>
                </AccordionItem>


                {/* G. INTELLECTUAL PROPERTY */}
                <AccordionItem>
                    <AccordionItemHeading>
                        <AccordionItemButton>
                            G. INTELLECTUAL PROPERTY
                        </AccordionItemButton>
                    </AccordionItemHeading>
                    <AccordionItemPanel>

                        <ul>
                            <li>All content is protected by copyright.</li>
                            <li>No commercial reproduction permitted.</li>
                            <li>User content may be used by Betmundial.</li>
                        </ul>

                    </AccordionItemPanel>
                </AccordionItem>


                {/* H. OTHER PROVISIONS */}
                <AccordionItem>
                    <AccordionItemHeading>
                        <AccordionItemButton>
                            H. OTHER PROVISIONS
                        </AccordionItemButton>
                    </AccordionItemHeading>
                    <AccordionItemPanel>

                        <ul>
                            <li>Entire agreement clause applies.</li>
                            <li>Invalid provisions do not affect remaining clauses.</li>
                            <li>Force majeure applies.</li>
                        </ul>

                    </AccordionItemPanel>
                </AccordionItem>


                {/* I. COMPLAINTS & GOVERNING LAW */}
                <AccordionItem>
                    <AccordionItemHeading>
                        <AccordionItemButton>
                            I. COMPLAINTS & GOVERNING LAW
                        </AccordionItemButton>
                    </AccordionItemHeading>
                    <AccordionItemPanel>

                        <ul>
                            <li>Complaints must be submitted within 30 days.</li>
                            <li>Disputes may be referred to arbitration.</li>
                            <li>Governing law: Kenya.</li>
                        </ul>

                    </AccordionItemPanel>
                </AccordionItem>


                {/* APPENDICES */}
                <AccordionItem>
                    <AccordionItemHeading>
                        <AccordionItemButton>
                            APPENDICES
                        </AccordionItemButton>
                    </AccordionItemHeading>
                    <AccordionItemPanel>

                        <h5>Appendix One – Currency</h5>
                        <p>Kenya Shillings (KES)</p>

                        <h5>Appendix Two – Betting Provisions</h5>
                        <ul>
                            <li>Official governing body settlement rules apply.</li>
                            <li>Venue changes may affect settlement.</li>
                            <li>Special event betting rules apply where stated.</li>
                        </ul>

                    </AccordionItemPanel>
                </AccordionItem>

            </Accordion>
        </>
    )
}

export default TermsAndConditions
