import Header from "../../header/header";
import SideBar from "../../sidebar/awesome/Sidebar";
import Footer from "../../footer/footer";
import React from "react";

import karibuBonus from '../../../assets/img/banner/products/Welcome-Bonus.png'
import MshipiBonusImg from '../../../assets/img/banner/products/Mshipi-Bonus.png'
import hundredPercentDepositBonus from '../../../assets/img/banner/products/Deposit-Bonus.png'

import earlyBirdDailyDepositBonus from '../../../assets/img/banner/products/Deposit-Bonus.png'

const Promotions = () => {
    return (
        <>
            <div
                className="bg-primary shadow-sm  p-4 shadow-sm casino-category-container ">
                Promotions
            </div>
            <div className={'row  p-3 d-flex justify-content-center'}>
                <div className="col-md-6 mb-2 p-3 shadow-md promo-pannel">
                    <div className="d-flex flex-column">
                        <h5 className="uppercase">BETMUNDIAL 3000 KARIBU BONUS</h5>
                        <img src={karibuBonus} className={'rounded'} />
                        <span><u>How to get it</u></span>
                        <ul>
                            <li>
                                Register on sms by sending the word JOIN 29280 or visiting www.Betmundial.com and creating account via signup link.
                            </li>
                        </ul>
                        <div className="col-md-12">
                            <span><u>Terms and conditions</u></span>
                            <ul>

                                <li>1. This bonus is eligible for new accounts only </li>
                                <li>2. Bonus may not be directly withdrawn</li>
                                <li>3. Redemption of this bonus is similar to all other bonus and bonus rules apply</li>

                            </ul>
                        </div>
                    </div>
                </div>
                <div className="col-md-6 mb-2 p-3 shadow-md promo-pannel">
                    <div className="d-flex flex-column">
                        <h5>100% FIRST DEPOSIT BETMUNDIAL BONUS </h5>
                        <img src={hundredPercentDepositBonus} className={'rounded'} />
                        <span><u>How to get it</u></span>
                        <ul>
                            <li>
                                Deposit KES.50 and above to Betmundial Paybill 444142/ using your phone number as the account number
                            </li>
                        </ul>
                        <div className="col-md-12">
                            <span><u>Terms and conditions</u></span>
                            <ul>
                                <li>1. All deposits above Kes 10 are eligible for 100% bonus</li>
                                <li>2. This bonus applies to your first ever deposit only</li>
                                <li>3. The maximum first deposit bonus awardable is KES 500</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <div className="row p-3  d-flex justify-content-center">
                <div className="col-md-6 mb-2 p-3 shadow-md promo-pannel">
                    <div className="d-flex flex-column">
                        <h5>FREE BET</h5>
                        <img src={MshipiBonusImg} className={'rounded'} />
                        <span><b>We offer a Freebet worth KSHS 20/= to all new customers. It’s easy to make your Freebet:</b></span>
                        <ul>
                            <li>Select Home team win (1), draw (X) or away team win (2), from day’s freebet game.</li>
                            <li>Enter your phone number</li>
                            <li>Choose your account password (6 or more characters) Select ‘Submit Freebet’</li>
                        </ul>
                        <div className="col-md-12">
                            <ul>

                                <li> Your BetMundial account will be created and your Freebet will be placed. Please don't forget to verify your account once you receive our SMS code; unverified accounts will lose their Freebet after 7 days. To view your bet, Log on to betmundial.com, go to 'Menu' and choose 'My Bets'. </li>
                                <li> Freebet offer is limited to one per customer and cannot be used in conjunction with any other offer.</li>
                                <li> The refund amount shall be refunded as bonus and bonus terms and condition apply to redeem the award</li>
                                <li>When your Freebet wins, BetMundial keeps its stake and pays the winnings into your BetMundial account. You can use these winnings to bet on more matches.</li>
                                <li><b>Abuse: </b>Persons attempting to take unfair advantage of the Freebet offer by creating multiple new accounts, inputting invalid phone numbers or depositing funds to reach the withdrawal threshold risk having all associated accounts closed and all funds confiscated.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="col-md-6 mb-2 p-3 shadow-md promo-pannel">
                    <div className="d-flex flex-column">
                        <h5>VUNA CHAPAA NA EPL</h5>
                        <img src={earlyBirdDailyDepositBonus} className={'rounded'} />
                        <span><b>Open to all new and existing customers</b></span>
                        <ul>
                            <li>Customers will be required to place a cash bet on atleast one or more EPL 2024/25 games using a stake of KShs. 49 or more. They will automatically enter into the draw to win various daily, weekly and grand prizes including but not limited to  Chapaa , phones, Airtime ,Gifts vouchers and many other gifts</li>
                            <li>Winners will receive the various prizes credited to their BetMundial account. This can be withdrawn via Mpesa</li>
                            <li>Winners are chosen randomly by BetMundial promotion systems</li>
                        </ul>
                        <div className="col-md-12">
                            <span><b>Prizes</b></span>
                            <ul>

                                <li> 1. 200 Daily winners of KShs. 200 each</li>
                                <li> 2. 5 Weekly winners of KShs. 5,000 each</li>
                                <li> 3. 1  phone per week</li>
                                <li>4. 1 Grand winners of KShs. 100,000 each</li>
                                <li>5. BetMundial branded merchandise</li>
                            </ul>
                        </div>
                        <p><b>Promo runs from 16th August 2024 to 25th May 2025</b> <br />Terms and conditions apply</p>
                    </div>
                </div>
                <div className="col-md-6 mb-2 p-3 shadow-md promo-pannel">
                    <div className="d-flex flex-column">
                        <h5>BETMUNDIAL APP BONUS</h5>
                        <img alt="" src={earlyBirdDailyDepositBonus} className={'rounded'} />
                        <ul>
                            <b>Open to all new and existing customers. </b>
                        </ul>
                        <div className="col-md-12">
                            <span><u>Terms and conditions</u></span>
                            <p>Customers will be required to DOWNLOAD the betmundialIAL APP from the Play store, Place a cash bet using a stake of Ksh 49 or more with total odds of 7.99 or more. They will automatically enter into the draw.</p>
                            <p>Winners will receive various prizes;daily or weekly bonuses</p>
                            <p>Winners are chosen randomly by the betmundialial  promotion systems</p>
                            <h5 className="uppercase pt-4">Prizes</h5>
                            <ul>

                                <li> 1. 100 Daily winners of KSh. 100 each.</li>
                                <li> 2. 1000 Weekly winners of various bonus amounts credited to their betmundialial account. This can be withdrawn via MPESA</li>
                            </ul>
                            <p>Bonus terms and conditions apply. General betmundialial terms and conditions apply</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-6 mb-2 p-3 shadow-md promo-pannel">
                    <div className="d-flex flex-column">
                        <h5>CASH BACK BONUS!</h5>
                        <img alt="" src={earlyBirdDailyDepositBonus} className={'rounded'} />
                        <ul>
                            <b>Open to all new and existing customers. </b>
                        </ul>
                        <div className="col-md-12">
                            <span><u>Terms and conditions</u></span>
                            <p>Get a 10% stake refund on your first stake of the day if you lose the bet. The refund is on stakes of upto Kshs. 200. Any stake of more than Kshs 200 will receive a stake refund of not more than Kshs. 100.</p>
                            <p>The stake refund will be in form of a bonus</p>
                            <ul>

                                <li> The stake refund can be used to play again on any type of bet and on any market on betmundialial. (No restrictions on how to use the cash back refund).</li>
                            </ul>
                            <p>Bonus terms and conditions apply. General betmundialial terms and conditions apply</p>
                        </div>
                    </div>
                </div>

                <div className="col-md-6 mb-2 p-3 shadow-md promo-pannel">
                    <div className="d-flex flex-column">
                        <h5>SHAREBET PROMO</h5>
                        <img alt="" src={earlyBirdDailyDepositBonus} className={'rounded'} />
                        <ul>
                            <b>1. Eligibility </b>
                        </ul>
                        <div className="col-md-12">
                            <span><b>How to participate</b></span>
                            <p>The Share Bet Ushinde Promotion  is open to individuals who are registered users of betmundial and who meet the eligibility criteria outlined in these terms and conditions.</p>
                            <p>Participants must be of legal age to gamble in their jurisdiction and must comply with all applicable laws and regulations</p>
                            <ul>

                                <li>The Promotion will run everyday .</li>
                                <li>To qualify for the Promotion, participants must place a bet with any amount on betmundial</li>
                                <li>Participants must share their betslip with at least 5 friends using the provided sharing options on the betmundial platform</li>
                                <li>Participants will be eligible to win a cash prize worth 5,000 Kenyan Shillings (KES) if their betslip is shared with at least 5 friends</li>
                                <li>If the participant's (group of friends) collectively place bets on the shared betslip, the participant will win the cash prize</li>
                                <li>Winners will be notified via their registered mobile number</li>
                                <li>betmundial reserves the right to use any other method of communication deemed appropriate to notify winners</li>
                                <li>The cash prize will be awarded to the participant within 24 hours of meeting the eligibility criteria</li>
                            </ul>
                            <p>Bonus terms and conditions apply. General betmundial terms and conditions apply</p>
                        </div>
                    </div>
                </div>
            </div>

        </>

    )
}

export default Promotions
