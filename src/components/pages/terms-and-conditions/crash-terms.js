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

const CrashTerms = () => {
    return (
        <>
            <div className='col-md-12 bg-primary p-4 text-center profound-text'>
                <h4 className="inline-block">Crash Terms & Conditions</h4>
            </div>
            <div className="col-md-12 mt-2 py-2 px-4">
                <Accordion allowZeroExpanded>
                    {/* 1. Terms Acceptance */}
                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>
                                1. Acceptance of Terms
                            </AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <p>
                                These Terms relate to the Crash Games and other related products on our platforms. By playing any of the Crash Games, you agree to be bound by these Terms, including any amendments or variations.
                            </p>
                        </AccordionItemPanel>
                    </AccordionItem>

                    {/* 2. Additional Rules */}
                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>
                                2. Additional Rules
                            </AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <p>
                                You acknowledge and agree to follow any additional rules that may apply to Crash Games, including rules in the “Help” or “Game Info” tabs, as well as rules relating to minimum/maximum bets, maximum pay-outs, jackpots, disconnections, and system malfunctions.
                            </p>
                        </AccordionItemPanel>
                    </AccordionItem>

                    {/* 3. Bet Acceptance */}
                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>
                                3. Bet Acceptance
                            </AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <p>
                                A Crash Game bet is considered accepted once it has been registered on our server and confirmed online. Accepted bets cannot be canceled or amended.
                            </p>
                        </AccordionItemPanel>
                    </AccordionItem>

                    {/* 4. Limits */}
                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>
                                4. Crash Game Limits
                            </AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <p>
                                Crash Game limits may be revised individually or cumulatively, permanently, or for particular bet types. All applicable limits are displayed on our website. Customers must check limits before betting.
                            </p>
                        </AccordionItemPanel>
                    </AccordionItem>

                    {/* 5. Funds Credited in Error */}
                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>
                                5. Funds Credited in Error
                            </AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <p>
                                Any funds or winnings credited in error are not available for use. Betmundial, in consultation with the GRA, may void transactions, withdraw amounts, or reverse transactions in cases of system error, prohibited activities, or other circumstances deemed necessary.
                            </p>
                        </AccordionItemPanel>
                    </AccordionItem>

                    {/* 6. Maximum Winnings */}
                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>
                                6. Maximum Winnings
                            </AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <p>
                                If system-generated winnings exceed the allowed maximum limit, any amount above the limit is void. Once the maximum limit is reached, no further bets can be placed for that day.
                            </p>
                        </AccordionItemPanel>
                    </AccordionItem>

                    {/* 7. Game Availability */}
                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>
                                7. Game Availability
                            </AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <p>
                                Crash Games may not be available on all devices or at all times. Their availability is not guaranteed.
                            </p>
                        </AccordionItemPanel>
                    </AccordionItem>

                    {/* 8. Amendments */}
                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>
                                8. Amendments
                            </AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <p>
                                These Terms may be amended from time to time in consultation with the Gambling Regulatory Authority of Kenya (GRA).
                            </p>
                        </AccordionItemPanel>
                    </AccordionItem>

                    {/* 9. Prohibited Activities */}
                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>
                                9. Prohibited Activities
                            </AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <p>
                                In case of suspected prohibited activities, Betmundial may void winnings or transactions, suspend accounts, limit withdrawals, or block IP addresses.
                            </p>
                        </AccordionItemPanel>
                    </AccordionItem>

                    {/* 10. Complaints */}
                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>
                                10. Complaints
                            </AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <p>
                                Contact Customer Service at <a href="mailto:support@betmundial.com">support@betmundial.com</a> or +254140444142 for complaints. If dissatisfied with the internal resolution, complaints may be escalated to the Gambling Appeals Tribunal.
                            </p>
                        </AccordionItemPanel>
                    </AccordionItem>

                    {/* 11. Warranty Disclaimer */}
                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>
                                11. Warranty Disclaimer
                            </AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <p>
                                Crash Games are provided “as is” without warranties, except those implied by law that cannot be excluded. This includes accuracy, availability, timing, merchantability, or fitness for a particular purpose.
                            </p>
                        </AccordionItemPanel>
                    </AccordionItem>

                    {/* 12. Governing Terms */}
                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>
                                12. Governing Terms
                            </AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <p>
                                These Terms are governed by Betmundial’s General Terms and Conditions. In case of inconsistency, the General Terms and Conditions prevail.
                            </p>
                        </AccordionItemPanel>
                    </AccordionItem>

                    {/* Crash Limits Section */}
                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>
                                13. Crash Limits
                            </AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <ul>
                                <li>Limits may be revised individually or cumulatively, permanently, or for particular bet types.</li>
                                <li>Minimum stake per play ranges from KSH 1 to KSH 10 depending on the game.</li>
                                <li>Maximum stake per play is up to KSH 10,000. Maximum daily winnings apply across all games.</li>
                                <li>Maximum daily winnings per customer is KSH 500,000 or less depending on the game.</li>
                            </ul>
                        </AccordionItemPanel>
                    </AccordionItem>
                </Accordion>
            </div>
        </>
    );
};

export default CrashTerms;