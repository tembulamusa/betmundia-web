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
            <div className="col-md-12 py-2 px-4">
                Please ensure that You read and understand these terms prior to using the Service. Acceptance of
                these terms and conditions is a personal undertaking to be bound by these Terms. If you do not accept
                these Terms, please do not use betmundials’s Services. The terms contain important information about the
                legal agreement between You and Us and provide information about what other documents form part of our
                relationship with You.

                <p>•	Reference to "betmundial" "We" "our" or "Us" is reference to BetMundial Limited, betmundial and or its successors in title and assigns;</p>
                <p>•	BetMundial Limited t/a betmundial, is licensed and regulated by the Betting Control and Licensing Board of Kenya (“BCLB”) under the Betting, Lotteries and Gaming Act, Cap 131, Laws of Kenya;</p>
                <p>•	betmundial is a licensed trademark owned and operated by BetMundial Limited and/or its affiliates and group companies. BetMundial Limited is a company registered under the Companies Act of Kenya, 2015 and having its registered address at 1st floor, Milestone Business Center Kiambu Road, Ridgeways, Nairobi and postal address at P.O. Box 2772-00606 (Sarit Centre) Nairobi.</p>
                <p>•	Reference to “You” “Your’ the “Player” or “Customer(s)” is reference to any person using the Service.</p>
                <p>•	Reference to "Applicable Laws" means all duly promulgated applicable state and local laws, regulations, rules, ordinances, codes, decrees, judgments, directives, judicial or administrative orders, permits and other duly authorized actions of any government authority having the force of law in the Republic of Kenya as they may be issued and enforced from time to time.</p>
                <p>•	Reference to "Data Protection Laws" means any law, statute, subordinate legislation, regulation, order, mandatory guidance or code of practice, judgment of a relevant court of law, or directives or requirements of any regulatory body which relates to the protection of individuals with regard to the processing of personal data to which You are subject including the Data Protection Act, 2019 and any statutory modification or re-enactment thereof.</p>
                <p>•	It is important that you read these Terms together with any other policy (including our Data protection policy or any privacy policy we may provide on specific occasions when we are collecting or processing personal data about You so that You are fully aware of how and why we are using your Personal Data. These Terms supplement other policies and terms and is not intended to override them. We also recommend that you print a copy of these Terms for future reference.</p>

            </div>

            <div className="col-md-12 py-5 px-4">
                <Accordion allowZeroExpanded>

                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>1. Introduction</AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <p>1.1. These Terms constitute a binding contract between You and betmundial. These Terms apply to all services offered
                                by betmundial as described in paragraph 1.2. below. By using the Service, You agree to be bound by these Terms
                                and Conditions.</p>
                            <p>1.2.  The Service includes:</p>
                            <p>1.2.1. betmundial's Website (www.betmundial.com) and any other remote product We may offer from time to time |("Website");</p>
                            <p>1.2.2. betmundial's Tele-betting services i.e. betting via USSD or SMS; and</p>

                            <p>1.3. The Terms apply equally irrespective of whether the Service is accessed via telephone, desktop browser, mobile
                                browser, mobile, tablet device, or any other device.</p>
                            <p>1.4. By using the Service (including visiting any element of the Service, by entering any details into the Service or by
                                opening an account to access the Service), You agree that: </p>
                            <p>1.4.3.  You have understood and accepted these Terms;</p>
                            <p>1.4.2 You are bound by the content as specified in these Terms;</p>
                            <p>1.4.3 You are bound by the applicable rules relating to the games or products You are playing;</p>

                            <p>1.4.4. You have the mental capacity to take responsibility for Your own actions and can enter into this
                                contract with us, which is enforceable by law;</p>
                            <p>1.4.5. You are responsible for complying with all applicable laws</p>
                            <p>1.4.6. There is a risk of losing money and You accept full responsibility for such losses</p>
                            <p>1.4.7. You will only use the Service for lawful purposes and in a lawful manner</p>
                            <p>1.4.8.  You will only use the Service in compliance with applicable laws in your jurisdiction.</p>
                            <p>1.4.9. You will not use the Service in any way which could be considered defamatory, abusive, obscene,
                                unlawful, racist, sexist, discriminatory, or which could cause offence.</p>

                            <p>1.5. In addition, as part of these Terms, You agree to be bound by:</p>
                            <p>1.5.1. The rules applicable to sports betting, virtual sports, Jackpot, casino or any other products that may be provided from time to time. The rules are available in the "How to Play" section of this Website.</p>
                            <p>1.5.2.  betmundial's Betting Rules.</p>

                            <p>1.5.3.  betmundial's Privacy Policy.</p>

                            <p>1.5.4.  Any other terms, policies or rules applicable to the Service</p>
                        </AccordionItemPanel>
                    </AccordionItem>

                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>2. AMENDMENTS TO THE TERMS</AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <p>2.1. betmundial reserves the right to update the Terms from time to time in order to address legal and regulatory changes, to incorporate changes in our business or the services offered, or to improve the clarity of the Terms.</p>
                            <p>2.2. All changes will be published on the Website. The most-up-to-date Terms will be available on the Website. If you continue using the Services after the date on which the Terms come into effect, you will be deemed to have accepted those changes.</p>
                        </AccordionItemPanel>
                    </AccordionItem>

                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>3. ACCOUNT REGISTRATION</AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <p>3.1. To register an account with betmundial, You must be at least 18 years old. betmundial reserves the right to ask for proof of age from any customer and suspend their account until satisfactory documentation is provided.</p>
                            <p>3.2. Where an underage user is discovered, betmundial reserves the right to close the account indefinitely. ALL funds deposited in such account will be forfeited. betmundial shall also report the incident to BCLB or any other relevant authority and the player shall suffer the consequences of such reporting.</p>

                            <p>3.3. As part of the registration process, You will be required to enter Your personal details which include mobile phone number.</p>

                            <p>3.4. You may not access the Services by means of another person's account. Should You attempt to access the Service by means of another person's account, We reserve the right to immediately close all Your accounts and bar You from future use of any of our Services.</p>
                            <p>3.5. You may not transfer Your account to any other player or third party.</p>
                            <p>3.6. You are required to keep Your registration details up to date at all times. If You change Your phone number or any other contact or personal information, please contact us in order to update Your account information.  betmundial reserves the right to close the account when the information provided is deemed to be false or inaccurate.</p>
                        </AccordionItemPanel>
                    </AccordionItem>

                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>4. ACCOUNT SECURITY AND PRIVACY</AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <p>4.1. As you are responsible for all bets placed on your account, You must keep Your account access information ("Access Information") including Your username, password, account number or any other information used to access Your account secret and confidential. betmundial shall not be held liable in such cases.</p>
                            <p>4.2. If there are sufficient funds in your accounts, all Bets will stand if your username and password have been entered correctly (whether or not authorized by you).</p>
                            <p>4.3. If, at any time, you feel that a third party may be aware of your Access Information, You should change it immediately via the Website. Please contact us if you are unable to make the changes.</p>

                            <p>4.4. Should you lose your account details or believe that someone else may have your Access Information, you should contact us.</p>
                            <p>4.5. All your personal information (e.g. your name, email address, identification numbers, account number) shall be processed in accordance with our Privacy Policy.</p>
                        </AccordionItemPanel>
                    </AccordionItem>

                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>5. DORMANT ACCOUNTS</AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <p>5.1. Your account shall be considered dormant where it has not had any activity for 6 months. Account activity is defined as the following: (i) making a deposit (ii) withdrawal or (iii) placement of a bet.</p>

                            <p>5.2. After the expiry of 6 months, betmundial reserves the right to close Your account and thereafter either refund the balance to You or where applicable deal with it in the manner provided for in law less any costs accruing thereon.</p>
                        </AccordionItemPanel>
                    </AccordionItem>

                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>6. ACCOUNT CLOSURE (BY PLAYER)</AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <p>6.1. If You want to close Your account, You should inform us either in writing, through email or letter addressed to us. Any activity on Your account will remain Your responsibility up to the point of actual account closure.</p>
                            <p>6.2. Should You wish to resume Your use of the Service you will be required to open a new account in accordance with these Terms.</p>
                            <p>6.3. Once We receive confirmation that You wish to close Your account, if requested, You shall be paid the balance of Your funds.</p>
                            <p>6.4. We may withhold any outstanding balance or outstanding bet settlements in respect of Your account in accordance with these Terms.</p>
                            <p>6.5. Following account closure, any stake, winnings, promotional bonuses, benefits or prizes will be forfeited by You.</p>
                            <p>(BY betmundial)</p>
                            <p>6.6. We have the right to suspend Your account (preventing Your use of the Service and the provision of promotional benefits) or permanently close Your account as directed by the Terms and/or at any time and for any reason.</p>
                            <p>6.7. We may withhold any outstanding balance or outstanding bet settlements in respect of Your account in accordance with these Terms.</p>
                            <p>6.8. Following account closure, any stake, winnings, promotional bonuses, benefits or prizes will be forfeited by You.</p>
                        </AccordionItemPanel>
                    </AccordionItem>

                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>7. PROHIBITED ACTS</AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <p>7.1. The following acts (“Prohibited Acts”) are expressly prohibited in relation to Your use of the Service and will constitute a material breach of the Terms:</p>
                            <p>7.1.1. use of the service when underage</p>
                            <p>7.1.2. fraud or attempt to defraud</p>
                            <p>7.1.3. money laundering (including where this is linked to terrorist funding)</p>
                            <p>7.1.4. involvement in collusion, match rigging, or cheating of any kind </p>
                            <p>7.1.5.  placing bets:</p>
                            <p>7.1.5.1. which may breach the governing rules of the relevant sport or event in question</p>
                            <p>7.1.5.2. which may jeopardize the integrity of the sport or event in question;</p>
                            <p>7.1.5.3. on an event that has already occurred or there is a clear indication of the likely outcome</p>
                            <p>7.1.5.4. on the basis of ‘inside information’ known to the customer and which is not in the public domain</p>
                            <p>7.1.6. any other criminal activity</p>
                            <p>7.1.7. bonus or promotional abuse</p>
                            <p>7.2. Where We have reason to believe that You (or Your account) are connected to Prohibited Act(s), or otherwise We have reason to believe that You are in breach of the Terms of Your Agreement, We will have the right at our sole discretion in respect of any betmundial account held by You to:</p>
                            <p>7.2.1.  refuse a bet or any part of a bet offered to us;</p>
                            <p>7.2.2. void any accepted bets and withhold settlement (there may be other instances where we may void a bet as detailed under the specific sport/event in our rules, or otherwise as instructed by the appropriate regulator or authority);</p>
                            <p>7.2.3.  permanently close your account(s) and terminate this agreement;</p>
                            <p>7.2.4.  withhold all or part of your account balances or stakes (which will be deemed as forfeited by you);</p>
                            <p>7.2.5.  inform the applicable authorities and regulator, and supply the relevant customer information.</p>
                            <p>7.3. We will not be liable for any loss or damage which you may incur as a result of any prohibited acts. you agree to cooperate in any investigation in respect of Prohibited Acts.</p>
                        </AccordionItemPanel>
                    </AccordionItem>

                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>8. PROMOTIONAL OFFERS</AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <p>8.1. The terms of these promotional offers will be clearly stated for each individual promotion. It is Your responsibility to ensure that these terms are read and fulfilled by You in order to qualify for the respective bonus, credit or prize, and also to facilitate any subsequent redemption and/or withdrawal. All promotional terms are to be read in conjunction with these Terms.  </p>
                            <p>8.2. betmundial specifically retains the rights, at any time and without notice, to remove, alter or add to promotions, tournaments or similar and related activities without liability to You.</p>
                        </AccordionItemPanel>
                    </AccordionItem>

                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>9. SELF-EXCLUSION</AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <p>9.1. You may, at any time, instruct Us to exclude You from placing any Bets and using our services for a specified or unspecified period by contacting our Customer Service Center.</p>
                            <p>9.2. By asking Us to exclude You from our Services, You acknowledge and agree that We will block Your account from placing bets for the period requested starting as soon as possible after Your request. The self-exclusion will apply to all Service operated by Us.</p>
                        </AccordionItemPanel>
                    </AccordionItem>

                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>10. PLACING BETS</AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <p>10.1. You can only place a bet if You have been duly registered with betmundial and an account has been opened and assigned to You.  </p>
                            <p>10.2. All bets are subject to the Rules for the relevant sport/market/game set out In the "How to Play" Section of the Website.</p>
                            <p>10.3. betmundial reserves the right to decline all, or part, of any bet requested at our sole and absolute discretion. All bets are placed at your own risk and discretion.</p>
                            <p>10.4. It is Your responsibility to ensure that Your bet details are accurate. betmundial reserves the right to cancel any bet at any time.</p>
                            <p>10.5. Without limiting our discretion to refuse or limit bets at our discretion, You agree that We may void any bets in our absolute discretion if: 10.5.1.1. We suspect that You have engaged in any Prohibited Activities;</p>
                            <p>10.5.1.2. You have breached any of these Terms;</p>
                            <p>10.5.1.3. There is a technological error related to the Service or placing of Your bet;</p>
                            <p>10.5.1.4. We are required to do so by any law or regulation.</p>
                            <p>10.6. Bets will not be placed if there are insufficient funds in your account.</p>
                        </AccordionItemPanel>
                    </AccordionItem>

                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>11. ERRORS</AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <p>11.1. betmundial will not be liable for any errors in respect of bets including where:-</p>
                            <p>(i) betmundial has incorrectly stated the relevant odds/spreads/handicap/total amounts</p>
                            <p>(ii) betmundial incorrectly continues to accept bets on closed or suspended markets;</p>
                            <p>(iii) betmundial incorrectly calculates or pays settlement amounts; or (iv) any error occurs in a random number generator or pay tables included, incorporated or used in any game or product.</p>
                            <p>11.2. We reserve the right to void any winnings that were obtained as a result of hardware/software error or malfunction. We are not liable to You for any loss that You may incur as a result of such suspension or delay.</p>
                            <p>11.3. We are not liable for any downtime, server disruptions, lagging, or any technical disturbances or disruptions to the game play. We are not liable for any acts or omissions made by Your internet service provider or any third party with whom You rely upon to gain access to our Services.</p>
                        </AccordionItemPanel>
                    </AccordionItem>

                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>12. FINANCIAL MATTERS AND PAYMENTS</AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <p><b>Deposits</b></p>
                            <p>12.1. You may deposit money into Your betmundial account through Mobile Money.</p>
                            <p>12.2. You shall only deposit money in Your account for the purposes of You using such money to place bets or stakes on our platforms. betmundial shall be entitled to suspend or close Your account if betmundial reasonably considers or has reason to believe that You are depositing money without any intention of placing bets.</p>
                            <p>12.3. By depositing funds with betmundial You certify that the funds You deposit in Your account are not from an illegal source. You shall not use the Service for the purpose of transferring such funds from illegal sources. You will not use our Services for any illicit or fraudulent activity, or for any unlawful or fraudulent transactions. We reserve the right to suspend or close Your account at any time if We suspect that You may be engaging in, or have engaged in fraudulent, unlawful or improper activity, including money laundering activities or any conduct which violates these Terms. If Your account is terminated or blocked for these reasons, We are under no obligation to refund to You any money that may be in Your account. In addition, We are entitled to inform relevant authorities of Your suspected unlawful, fraudulent or improper activity.</p>
                            <p><b>Payments/Withdrawals</b></p>
                            <p>12.4. The "Potential Win" calculation available on the Website is for information purposes only, and all bets will be calculate using the stake/risk at the odds accepted.</p>
                            <p>12.5. Should You include a non-runner or void selection in a multiple bet/parlay, the bet will be settled on the remaining selections.</p>
                            <p>12.6. We reserve the right to withhold payment and to declare bets on an event void if we have evidence that the following has occurred:</p>
                            <p>(i) the integrity of the event has been called into question; </p>
                            <p>(ii) the price(s) or pool has been manipulated; or </p>
                            <p>(iii) match-rigging has taken place. Evidence of the above may be based on the size, volume or pattern of bets placed with us across any or all of our betting channels. Any decision made by us in this regard will be conclusive. If any customer owes any money to us for any reason, we have the right to take that into account before making any payments to that customer.</p>
                            <p>12.7. Winnings from settled bets are added to the balance of your betting account. Any funds/winnings credited to an account in error are not available for use and betmundial reserves the right to void any transactions involving such funds and/or withdraw the relevant amount from your account and/or reverse the transaction either at the time or retrospectively.</p>
                            <p>12.8. We reserve the right to undertake reasonable diligence to verify the validity of any bets, wagers or winnings as a precondition to paying out any wins or permitting player withdrawals.</p>
                            <p></p>
                            <p>12.9. You will incur charges when using SMS services. The charges shall be communicated to you from time to time.  </p>
                            <p>12.10. Any monies held in Your account shall NOT attract interest.</p>
                            <p>12.11. You are solely responsible for any applicable taxes on any stake, prizes and/or winnings that You collect from Your use of the Service over and above taxes collected by us on Your behalf. We will deduct applicable taxes from any stake, prizes or winnings prior to payment to You; as a result, You acknowledge and agree that any amounts You receive shall be net of such deductions.</p>
                            <p>12.12. betmundial reserves the right to monitor any irregular activity. We further reserve the right to withhold any withdrawals and/or confiscate all winnings which We reasonably believe to be related to irregular activity.  </p>
                        </AccordionItemPanel>
                    </AccordionItem>

                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>13. INDEMNITY</AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <p>13.1. You agree fully to indemnify, defend and hold us, and our officers, directors, employees, agents, contractors and suppliers, harmless immediately on demand, from and against all claims, liabilities, damages, losses, costs and expenses including legal fees, arising out of any breach of the Terms by You or any other liabilities arising out of Your access and use of the Service (or by anyone else using Your Access Information and/or accessing Your account).</p>
                            <p>13.2. Any breach will be regarded as a material breach and entitles us to terminate our Agreement with You immediately.  As a result of Your actions We may use monies in Your account to settle any liabilities We may incur.</p>
                        </AccordionItemPanel>
                    </AccordionItem>

                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>14. COMPLAINTS</AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <p>14.1. If You have a complaint or experience any difficulties, please contact our customer service center.  </p>
                            <p>14.2. All written complaints will be processed and responded within fourteen days of receipt of the complaint. We maintain records of complaints received and actions taken in response to the complaints.</p>
                            <p>14.3. If after our internal process has been fully exhausted, You remain unsatisfied as to the outcome of Your complaint, You have a right to escalate this complaint to BCLB.</p>
                        </AccordionItemPanel>
                    </AccordionItem>

                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>15. WARRANTY DISCLAIMERS</AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <p>15.1. The service is provided 'as is' and we make no warranties or representations, whether express or implied (whether by law, statute or otherwise) including but not limited to implied warranties and conditions of merchantability, non-infringement, satisfactory quality, fitness for a particular purpose, or compliance with applicable laws and regulations.</p>
                            <p>15.2. The entire risk of as to the use, quality and performance of the Service is Yours. We make no warranty that the Service will meet Your requirements, be uninterrupted, timely, secure or error-free, that defects will be corrected</p>

                            <p>or that the software or server that makes it available are free from viruses or bugs or represents that the full functionality, accuracy and reliability of the Service as to results or accuracy of any information obtained by You.</p>
                            <p>15.3. We reserve the right to suspend, modify or remove or add to our Website any games or software at our sole discretion with immediate effect and without notice. We shall not be liable to You for any loss suffered by You resulting from any changes made or for any modification or suspension of or discontinuance of the Service and You shall have no claims against us in such regard.</p>
                            <p>15.4. We do not take responsibility for computer malfunctions, failure of telecommunications service or Internet connections nor attempts by You to participate in games by methods, means or ways not intended by us.</p>
                            <p>15.5. We cannot guarantee that the Service will never be faulty, but We will undertake efforts to correct reported faults as soon as We reasonably can. If a fault occurs, You should report the fault by e-mail or in writing to our customer service centre.</p>
                            <p>15.6. Although We shall take all reasonable measures to ensure that the Service is free from computer viruses We cannot and do not guarantee that the Service is free of such problems. It is Your responsibility to protect Your systems and have in place the ability to reinstall any data or programs lost due to a virus.</p>
                            <p></p>
                            <p>15.7. We may temporarily suspend the whole or any part of the Service for any reason at our sole discretion. We may, but shall not be obliged to, give You as much notice as is reasonably practicable of such suspension. We will restore the Service, as soon as is reasonably practicable, after such temporary suspension.</p>
                        </AccordionItemPanel>
                    </AccordionItem>

                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>16. INTELLECTUAL PROPERTY</AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <p>16.1. The Service is intended solely for personal and non-commercial use by Players. In any event, no one is authorised to copy, modify, tamper with, distribute, transmit, display, reproduce, upload or otherwise alter the content of our Service.</p>
                            <p>.</p>
                            <p>16.2. You are not the owner of the Software; the Software is owned and is exclusive property of Us, the licensor, an associate, or a third-party software provider company, (the "Software Provider").
                                The Software used and offered, and associated documentation are proprietary products of the Software Provider and it is protected through the world by copyright law. betmundial is the sole owner of the trademark betmundial and the betmundial logo.
                                Any unauthorized use of any URL containing betmundial and or the betmundial logo may result in prosecution. Your use of the Software does not allow You or grant You any right of any intellectual property right in the Software.
                                betmundial is the owner or the rightful licensee of the rights to the technology, software and business systems used within this Website; this also includes, but is not limited to, the special promotional software and intellectual property of this concept.
                                The contents and structure of the betmundial Website pages are subject to copyright © and database right in the name of BetMundial Limited. All rights reserved. The copyright in this Website including all text, graphics, code, files and links belongs to BetMundial Limited and the site may not be reproduced, transmitted or stored in whole or in part without BetMundial Limited’s written consent.
                            </p>
                        </AccordionItemPanel>
                    </AccordionItem>

                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>17. THIRD PARTY CONTENT</AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <p>17.1. betmundial receives feeds, commentaries and content from a number of suppliers. Certain third-party product providers may require the Customer to agree to additional Terms and Conditions governing the use of their feeds, commentaries and content. If the Customer does not accept the relevant third-party Terms and Conditions, the Customer acknowledges that he/she may not use the relevant feeds, commentaries or content.  </p>
                            <p>17.2. betmundial does not accept any liability in respect of third-party feeds, commentaries and content.</p>
                            <p></p>
                            <p>17.3. Where link to third party resources appear on the Mobile service, Website and any other media/electronic platform, these links are provided for the information of the Customer only. betmundial is not responsible and has no control over the content of third party Websites sites or services offered therein, does not make any representations regarding the content or accuracy of materials on such third-party Websites and will accept no liability for any direct or indirect loss or damage that may arise from the access or use of the information provided therein by the Customer. The inclusion of a link to a third party does not constitute an endorsement of that third party’s product or services (if applicable)</p>
                        </AccordionItemPanel>
                    </AccordionItem>

                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>18. OUR LIABILITYS</AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <p></p>
                            <p>18.1. In no event shall we or the software provider, or any of our or their affiliates and related parties, be</p>
                            <p>liable to you for any direct, consequential, indirect, incidental or special damage or loss of any kind, including without limitation loss of business, profits, revenue, contracts or anticipated savings, or loss or damage arising from loss, damage or corruption of any data, whether or not the possibility of such loss or damage has been notified to us ahead of time.</p>
                            <p></p>
                            <p>18.2. The Website and the Service (including all material and information displayed on or via the Website and the Service) are provided without any guarantees, conditions or warranties as to their accuracy.  Save where otherwise set out in these Terms and Conditions, and to the extent permitted by Applicable Law, We, the Software Provider, and any of our affiliates and related parties, hereby expressly exclude all conditions, warranties and other terms which might otherwise be implied by statute, common law or the law of equity; and We exclude all liability for:</p>
                            <p></p>
                            <p>18.2.1.  any error made due to the input of incorrect information by You;</p>
                            <p>18.2.2.  any fraud, deception or misrepresentations by You;</p>
                            <p>18.2.3.  our decision not to accept a deposit from You;</p>
                            <p>18.2.4.  any delay in receiving or accepting a deposit by us or withholding a Withdrawal by us for the purpose of conducting identity verification procedures;</p>
                            <p>18.2.5.  use of Your Account for purposes that may be considered illegal under applicable laws;</p>
                            <p>18.2.6.  any transactions on Your Account which are conducted after the correct entry of Your username and password, including any actions or transactions by an individual that uses Your username and password; </p>
                            <p>18.2.7.  any unauthorized interception or use of data relating to You or Your Account;</p>
                            <p>18.2.8.  any inability to use or access the Website for any reason;</p>
                            <p></p>
                            <p>18.2.9.  any cause over which We do not have direct control, including problems attributable to computer hardware or software (including computer viruses and including the Software), data transmission systems, telephone or other communications, or Internet service providers;</p>
                            <p></p>
                            <p>18.2.10. the loss of any transactions caused by the loss or malfunction of any communications device used by Yourself or any entity relaying information between You, us, or any other payment solution company;</p>
                            <p></p>
                            <p>18.2.11.  the accuracy, completeness or currency of any information services provided (including, without limitation, prices, runners, times, results or general statistics) or any live scores, statistics and intermediate results shown on the Websites </p>
                            <p>18.2.12. any undelivered e-mail communications;</p>
                            <p></p>
                            <p>18.2.13.  the quality or availability (or lack thereof) of the Website or the Services;</p>
                            <p></p>
                            <p>18.2.14.  any results of any acts of government or authority or any force majeure event;</p>
                            <p>18.2.15.  any losses that Were not foreseeable to both parties when the contract between us was formed</p>
                            <p>18.2.16.  any losses arising from Your breach of these Terms</p>
                            <p>18.2.17.  any losses which are not caused by a breach of these Terms & Conditions on our part </p>
                            <p>18.2.18.  business losses;</p>
                            <p>18.2.19.  the defamatory, offensive or illegal conduct of any other customer;</p>
                            <p>18.2.20.  any loss whatsoever arising from the use, abuse or misuse of Your Player Account or any of Our products and services and the corresponding Website;</p>
                            <p>18.2.21. any loss incurred in transmitting information to the Website by the internet or by e-mail</p>
                            <p>18.2.22. any failure on our part to interact with You where We may have concerns about Your activities</p>
                            <p></p>
                        </AccordionItemPanel>
                    </AccordionItem>

                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>19. YOUR LIABLITY</AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <p>19.1. You agree to fully compensate, defend and hold us (and our subsidiaries, employees, agents and/or partners) harmless from any claims, liabilities, costs, damages and expenses (including legal fees) that may arise as a result of:</p>
                            <p>19.1.1. Your breach of these Terms; and</p>
                            <p>19.1.2. access and use of the Website, the Services or the Software by Yourself or by anyone else using Your username and password.</p>
                            <p></p>
                        </AccordionItemPanel>
                    </AccordionItem>

                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>20. MISCELLANEOUS</AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <p></p>
                            <p>20.1. Events Beyond our Control We shall not be in breach of these Terms nor be liable for delay in performing, or failure to perform, any of our obligations under these Terms if such delay or failure results from events, circumstances or causes beyond our reasonable control.</p>
                            <p></p>
                            <p>20.2. Waiver</p>
                            <p>Our failure or delay in enforcing or partially enforcing any term of these Terms shall not be interpreted as a waiver of any of our rights or remedies. No single or partial exercise of such right or remedy shall preclude or restrict the further exercise of that or any other right or remedy.</p>
                            <p>20.3. Entire Agreement</p>
                            <p>These Terms, including any document expressly referred to in them, represent the entire agreement between You and us and replace any prior agreement, understanding or arrangement between You and us. Both parties acknowledge that neither party has relied on any representation, undertaking or promise made by the other except as expressly stated in these Terms & Conditions.</p>
                            <p>20.4. Transfer of Agreement</p>
                            <p>20.5. We may at any time assign or transfer any or all of our rights and obligations under these Terms. In particular We may assign or transfer our rights and obligations to any purchaser of all or part of our business. We may also subcontract or delegate in any manner any or all of our obligations under these Terms to any third party or agent.</p>
                            <p>20.6. These Terms are personal to You and You may not assign, sub-license or otherwise transfer in any manner whatsoever any of Your rights or obligations under these Terms</p>
                            <p></p>
                        </AccordionItemPanel>
                    </AccordionItem>

                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>21. NOTICES</AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <p></p>
                            <p>21.1.  You agree to receive communications from us in an electronic form. Electronic communications include communications posted on the pages within the Website and/or the message in Your mobile phone, and/or delivered to Your email address, as decided by us from time to time. All communications in electronic format will be considered to be "in writing" and to have been received no later than five business days after posting or dissemination, whether or not You have actually received or retrieved the communication. We reserve the right, but assume no obligation, to provide communications in paper format.</p>
                            <p></p>
                            <p>21.2. Any notices required to be given in writing to us or any questions concerning these Terms & Conditions should be addressed to us.</p>
                            <p></p>
                        </AccordionItemPanel>
                    </AccordionItem>

                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>22. GOVERNING LAW AND JURISDICTION</AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <p></p>
                            <p>22.1. These terms and conditions are governed by laws of Kenya.</p>
                            <p>22.2. The competent courts in Kenya will have exclusive jurisdiction in any matter arising from or related to these terms and conditions.</p>
                            <p></p>
                            <p>22.3. However, this shall not prevent us from bringing any action in the court of any other jurisdiction for injunctive or similar relief.</p>
                        </AccordionItemPanel>
                    </AccordionItem>

                </Accordion>
            </div>
        </>
    )
}

export default TermsAndConditions
