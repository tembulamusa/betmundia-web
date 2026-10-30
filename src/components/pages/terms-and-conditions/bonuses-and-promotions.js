import {
    AccordionItem,
    AccordionItemHeading,
    AccordionItemButton,
    AccordionItemPanel,
} from 'react-accessible-accordion';
import 'react-accessible-accordion/dist/fancy-example.css';
import React from "react";

const BonusesAndPromotions = () => {
    return (
        <AccordionItem>
            <AccordionItemHeading>
                <AccordionItemButton className='accordion-button'>
                    BONUSES AND PROMOTIONS
                </AccordionItemButton>
            </AccordionItemHeading>
            <AccordionItemPanel className='accordion-item-panel'>
                <p>
                    Bonuses being offered and their details of crediting bonus money will be available on the
                    bonus/promotions section of the website. The amount of bonus money is determined by betmundial and set
                    out on the website.
                </p>

                <p>The CLIENT binds himself/herself not to abuse the ability of opening accounts in order to benefit
                    from bonus credits and other promotional offers that may be offered. The company reserves the right
                    in case of an abusive behavior on the CLIENT’S part as related to bonus credits and/or to
                    promotional offered by betmundial to rescind or block CLIENT accounts created to that end as well as
                    their transactions.</p>
                <p>betmundial reserves the right to revoke and/or cancel any bonus and/or promotional winnings which are
                    deemed to have occurred due to abuse and/or misuse of any promotional system. In the event of any
                    dispute the general conditions set out in the complaints procedure on the company’s website will
                    apply.</p>

                <p>The bonus money will be kept separately from the CASH on the account. The BONUS will not be paid
                    directly until it has been transformed into REAL CASH winnings.
                    If the cash account contains both BONUS and CASH, the bet used for wages will be subject to BONUS
                    BET conditions.</p>


                <p>Specific bonus bet conditions will be published on the website.
                    Any indication of fraud, manipulation, cash-back arbitrage or other forms of deceitful or fraudulent
                    activity based on the provision of the bonus will render the account inactive along with any and all
                    profits and losses generated.

                </p>
                <p>
                    ALL BONUSES and PROMOTIONAL OFFERS are subject to the terms ad conditions made available when
                    communicating the bonus offer
                </p>
                <p>
                    If the cash account contains both Bonus and real money, the total
                    bet
                    used
                    for wagers will be subject to bonus bet conditions. Specific bonus
                    bet
                    conditions will be published on the website.
                </p>
                <p>
                    Any indication of fraud, manipulation, cash-back arbitrage, or other
                    forms
                    of deceitful or fraudulent activity based on the provision of the
                    bonus
                    will
                    render the account inactive along with any and all profits or losses
                    generated.
                </p>
                <p>
                    All bonuses and promotional offers are subject to the terms and
                    conditions
                    made available when communicating the bonus offer.
                </p>
                Rules on betmundial Bonuses
                <br />
                <strong className="text-decoration-underline">GENERAL BONUS/PROMOTION RULES</strong>
                <br />
                <ol>
                    <li>
                        Daily deposit bonus: 50% on your first successful deposit of each calendar day, up to a maximum of KES 200; valid 24 hours from award.
                    </li>
                    <li>
                        Bonus balance cannot be withdrawn directly; winnings from qualifying bonus bets are credited to your cash balance and may be withdrawn.
                    </li>
                    <li>
                        Qualifying bonus bets: 1–3 games, minimum 1.50 odds per selection, funded 70% cash / 30% bonus when rules are met. Non-qualifying slips are placed from cash only.
                    </li>
                    <li>
                        Mshipi (acca win boost) requires at least 4 qualifying games; see Promotions for full Mshipi rules.
                    </li>
                    <li>
                        Each promotion may have additional terms on the Promotions page and via GET /v2/bonuses.
                    </li>
                    <li>
                        Abuse, fraud, or bonus manipulation may result in forfeiture and account action.
                    </li>
                    <li>
                        Promotions are subject to change; management decisions are final.
                    </li>
                </ol>
                <p><strong>NB: Bonus balance is not withdrawable; bonus winnings from qualifying bets go to your cash balance.</strong></p>
            </AccordionItemPanel>
        </AccordionItem>
    )
}

export default BonusesAndPromotions
