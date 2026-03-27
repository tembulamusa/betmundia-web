import React, { useEffect, useContext } from "react";
import {
    Accordion,
    AccordionItem,
    AccordionItemHeading,
    AccordionItemButton,
    AccordionItemPanel,
} from 'react-accessible-accordion';
import 'react-accessible-accordion/dist/fancy-example.css';
import { getBetslip } from '../utils/betslip';
import { Context } from '../../context/store';

const Header = React.lazy(() => import('../header/header'));
const Footer = React.lazy(() => import('../footer/footer'));
const SideBar = React.lazy(() => import('../sidebar/awesome/Sidebar'));
const Right = React.lazy(() => import('../right/index'));

const HowToPlay = () => {
    const [, dispatch] = useContext(Context);

    useEffect(() => {
        let betslip = getBetslip();
        if (betslip) {
            dispatch({ type: "SET", key: "betslip", payload: betslip });
        }
    }, [dispatch]);

    return (
        <>
            <div className='col-md-12 bg-primary p-4 text-center'>
                HOW TO PLAY - BETTING RULES
            </div>
            <div className="col-md-12 py-2 px-4">
                <Accordion allowZeroExpanded>
                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>
                                INTRODUCTION
                            </AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <p>The betting rules are subject to the general terms and conditions and shall be read in conjunction with those provisions found on our online platform</p>
                        </AccordionItemPanel>
                    </AccordionItem>

                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>
                                DEFINITION OF BETTING TERMS
                            </AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <p>Extra Time: This is a period of time in a sports game in which play continues if neither team has won in the usual time allowed for the game where a winning result is required for advancement to the next stage of a specific competition or tournament.</p>
                            <p>Injury time: This is the period of time added to the end of a football game because play was stopped during the match when players were injured or for any reason that the referee saw fit. This is the added time after 90 minutes of normal play.</p>
                            <p><b>Live bet:</b> This is a bet placed when the game is in-play or regular time has begun. Live bets cannot be cancelled once made.</p>
                            <p><b>Multi bet:</b> This is a bet placed on several selections or markets. When placing multi bets, the return depends on the outcome of all the matches within the bet.</p>
                            <p><b>Postponed/Cancelled Match:</b> Postponed/cancelled games will be deemed to be games which do not get to kick off on the specified calendar date but have been scheduled to take place at a later date.</p>
                            <p><b>Regular/Normal Time:</b> This is the period of time, which includes injury time, over which a sport is played and is set out as the normal duration of play within a sport’s rules. This period does not include extra time</p>
                            <p><b>Retired Match:</b> When a match is incomplete as the result of one player it is considered a "Retired" match. For example, when one of the players in a tennis match withdraws or is disqualified</p>
                            <p><b>Single bet: </b>Single bet is a bet placed on just one selection or market. When placing single bets, your return will not depend on the outcome of several matches.</p>
                        </AccordionItemPanel>
                    </AccordionItem>

                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>
                                PLACING A BET
                            </AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <p>As a registered customer, you can bet on a variety of sporting events, either before a match or in-play, by accepting a published bet offer on our platform.<br />
                                Every bet placed is a contractual obligation between you and us, entitling you to the payout of winnings following from the bet offer in the case of a win, and us to the stake of your bet in the case of a loss.</p>
                            <p>You cannot make wagers exceeding your player account balance.<br />
                                Bets shall be taken for the outcome of regular time (the normal running time of any specified sport without any injury time, penalties or extra time) unless otherwise noted in the bet type description.</p>
                        </AccordionItemPanel>
                    </AccordionItem>

                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>
                                LIMITATION ON BET AMOUNTS AND PAYOUTS
                            </AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <p><b>Minimum Bet:</b> The minimum betting amount for a single/multi bet is Kshs 10</p>
                            <p><b>Maximum Bet:</b> The maximum betting amount for a pre-match single/multi bet is Kshs 20,000.</p>
                            <p><b>Maximum Bet for Live bets:</b> The maximum betting amount for a live bet is Kshs 20,000.</p>
                            <p><b>Maximum Bet Winning:</b> The Single/Multi bet winning amount is limited to Kshs 500,000</p>
                            <p><b>Maximum Payout:</b> The Maximum winning amount per customer per day is limited to Kshs 500,000 unless it’s a Grand Jackpot prize or bonus.</p>
                        </AccordionItemPanel>
                    </AccordionItem>

                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>
                                WITHDRAWAL
                            </AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <p>Minimum withdrawable amount is Kshs. 50. Maximum withdrawable amount per day is Kshs. 70,000.</p>
                        </AccordionItemPanel>
                    </AccordionItem>

                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>
                                CANCELLATION
                            </AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <p>You can cancel a bet within fifteen (15) minutes after placing that particular bet. This should be before the kick-off time of a match(es) selected in that bet.
                                The maximum number of bets that can be cancelled in a day is three (3). However, any new user cannot cancel their first 3 bets.
                                Live bets CANNOT be cancelled.</p>
                            <p>Bet cancellation is only available on SMS; cancel bet by sending CANCEL#BET ID to the applicable number or shortcode.</p>
                        </AccordionItemPanel>
                    </AccordionItem>

                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>
                                VOID BETS
                            </AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <p><b>Void Bet</b> means the bet is nil or invalid. This occurs when an event is postponed/cancelled, or when it has started but not finished within the period specified in our policy.<br />
                                If a game has been cancelled or postponed there is always a 24 hours wait until the match will be set as void. Once the match has been set as void (with odd 1.00) the rest of the winning ticket will then be paid out.<br />
                                If a selection in a single bet is made void the stake will be returned. Void selections in multiple bets will be treated as non-runners and the stake will run onto the remaining selections in the bet.</p>
                        </AccordionItemPanel>
                    </AccordionItem>

                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>
                                ABANDONED/POSTPONED MATCHES
                            </AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <p>If a match is abandoned after it has commenced, all bets on that match will be made void except where settlement has already been determined. For example, where the first goal has been scored by a player the First Goal scorer and Time of First Goal markets, amongst others, will stand.</p>
                            <p>A postponed match is void unless it is re-scheduled to commence within 24 hours of the original start time and this is confirmed within 12 hours of the original start time. In such circumstances where a void match is included in an accumulator, the bet will be settled on the remaining selections.</p>
                        </AccordionItemPanel>
                    </AccordionItem>
                </Accordion>
            </div>
            <div className="col-md-12 py-2 px-1 w-100 text-white accordion-container"></div>
        </>
    );
}

export default HowToPlay;
