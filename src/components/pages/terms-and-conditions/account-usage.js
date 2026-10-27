import {
    AccordionItem,
    AccordionItemHeading,
    AccordionItemButton,
    AccordionItemPanel,
} from 'react-accessible-accordion';
import 'react-accessible-accordion/dist/fancy-example.css';
import React from "react";

const AccountUsage = () => {
    return (
        <AccordionItem>
            <AccordionItemHeading>
                <AccordionItemButton className='accordion-button'>
                    ACCOUNT USAGE
                </AccordionItemButton>
            </AccordionItemHeading>
            <AccordionItemPanel className='accordion-item-panel'>
                <ol>
                    <li>
                        In consideration of our accepting your application to open an
                        account, you represent to us (and acknowledge that we rely on these
                        representations) as follows:
                    </li>
                    <ul style={{ 'marginLeft': '30px' }}>
                        <li>
                            You are 18 years of age or over. It is an offence for anyone
                            under the age of 18 to open an account or to gamble on betmundial;
                        </li>
                        <li>
                            You are of sound mind and capable of taking responsibility for
                            your own actions and that you can enter into a legally binding
                            agreement with us.
                        </li>
                        <li>
                            You accept betmundial’ Terms and Conditions, Privacy Policy and
                            all other rules and regulations.
                        </li>
                        <li>
                            You agree to provide accurate registration information,
                            including without limitation your correct date of birth, phone
                            number and your country of residence. You agree to inform us of
                            any
                            changes in such details.
                        </li>
                        <li>
                            You are the person whose details are provided in connection with
                            your registration, or, in the case of legal entities, you are a
                            duly
                            authorized representative of the relevant legal entity;
                        </li>
                        <li>
                            You are acting as a principal and not as an agent on behalf of a
                            third party.
                        </li>
                        <li>
                            You are not an undischarged bankrupt or in a voluntary
                            arrangement with your creditors.
                        </li>
                        <li>
                            You are not in using any credit or debit cards that you are
                            not authorized to use or fraudulently acquired funds.
                        </li>
                        <li>
                            You are not located in a country where the use of our services
                            is prohibited. You are entirely responsible for complying with
                            your
                            own local, national, federal, state or other laws concerning
                            betting
                            and gaming prior to opening an account, placing any bets or
                            using
                            our services.
                        </li>
                        <li>
                            You are not in any way, form or manner attempting to illegally
                            hack into the company’s system, commit fraud, attempt to
                            duplicate,
                            or do any other thing that would contravene the company’s
                            intellectual rights.
                        </li>
                        <li>
                            You are not currently subject to a self-exclusion from a
                            betmundial’ account and neither we nor any other operator has
                            excluded
                            you from gambling; and
                        </li>
                        <li>
                            You will, following a request from us (which may be made at any
                            time before or after you open an account with us), promptly
                            provide
                            any documentation or information which we request in order to
                            evidence your identity, age, address, country of birth or
                            authorization to use a particular credit or debit card (and you
                            agree that we may perform checks in order to verify any such
                            documentation or information).
                        </li>
                    </ul>

                    <li>
                        It is your responsibility to keep your contact details up to date
                        on your account. Failure to do so may result in you failing to
                        receive important account related notifications and information from
                        betmundial, including changes we make to our terms and conditions.
                    </li>
                    <li>
                        You are solely responsible for the security and confidentiality
                        of your account. In particular, you agree to keep your username and
                        password strictly confidential and you are responsible for any
                        misuse of your password.
                    </li>
                    <li>
                        Provided that we have been correctly supplied with the account
                        information requested, we are entitled to assume that offers and
                        payments are made by you. You should change your password on a
                        regular basis and never disclose it to any third party. You
                        undertake to protect your username and password in the same way that
                        you would in respect of your bank cards and any failure to do so
                        shall be at your sole risk and expense. If another person accesses
                        your account, you are solely responsible for all their actions
                        whether or not their access was authorized by you, and you hereby
                        indemnify us and hold us harmless against all costs, claims,
                        expenses and damages howsoever arising in connection with the use of
                        or access to your account by any third party.
                    </li>
                    <li>
                        If you have any reason to suspect that a third party has access
                        to your account, kindly, but urgently, CONTACT US IMMEDIATELY. The
                        company will however not accept liability for any losses or damages
                        incurred as a result of the same.
                    </li>
                    <li>
                        You will open only one account per customer and not attempt to
                        fraudulently mislead the company on the same. The Company reserves
                        the right to terminate multiple accounts without prior notice should
                        it suspect ongoing or occurred criminal activities and confiscate
                        the initial deposit and all available funds.
                    </li>

                    <li>
                        You will not attempt to sell or otherwise transfer your account
                        to any third party and nor will you acquire or attempt to acquire an
                        account which has been opened in the name of a third party.
                    </li>
                    <li>
                        All accounts will be subject to the KYC process from the
                        application to register phase and all transactions shall be
                        performed in Kenyan Shillings.

                    </li>
                    <li>
                        If you would like information about tools to help you manage your
                        gambling activity, please visit our Responsible Gambling page by
                        going to www.betmundial.com/responsible_gambling. You can also find
                        contact details for organizations where you can seek further support
                        if needed on this website.

                    </li>
                    <li>
                        Should you not comply or be in breach of any of the conditions
                        applicable under this Account regulations, your account will be
                        suspended pending investigation without any prior communication to
                        you. Thereafter, betmundial reserves the right to report any suspect or
                        illegal activity to the relevant authority and, with absolute
                        discretion to restrict and terminate your account. Following this,
                        the Company also reserves the right to seize all available funds.
                    </li>
                    <li>
                        You SHALL BE LIABLE for any and all claims, losses, liabilities,
                        damages, costs and expenses incurred or suffered by the Company
                        (together "Claims") arising therefrom and shall indemnify and hold
                        the Company harmless on demand for such Claims. The Company shall
                        also be entitled to withhold and/or retain any and all amounts which
                        would otherwise have been paid or payable to you (including any
                        winnings or bonus payments).
                    </li>

                    <li>
                        The Company SHALL NOT under any circumstances accept liability
                        from third parties resulting from incorrect, false or misleading
                        information or data.
                    </li>
                    <li>
                        The Company reserves the right to exclude users from its website
                        and services at its discretion. Should the company choose to do so,
                        the company will promptly refund the residual credit balance in the
                        account using the agreed upon payment methods. It should be noted
                        that if the company restricts or terminates the account as a result
                        of fraudulent, criminal activity or any collusion activity
                        whatsoever, the residual credit balance and winnings from open bets
                        will be forfeited.
                    </li>
                    <li>
                        betmundial reserves the right to cancel the Services, and/or refuse
                        to distribute profits to anyone for any legitimate reason including,
                        but not limited to:
                    </li>
                    <ul>
                        <li>
                            any instance when betmundial has cause to believe that a person's
                            activities on the WEBSITE may be illegal.

                        </li>
                        <li>
                            any instance where betmundial may suffer any fiscal, regulatory, or
                            pecuniary disadvantage in virtue of anyone’s activities.
                        </li>
                        <li>
                            any occurrence that is deemed to be match fixing.
                        </li>
                        <li>
                            palpable errors, that is where a bet is confirmed, or a payment
                            is performed, by us in error in the following circumstances:
                        </li>
                        <ul>
                            <li>
                                Whenever the prices/spreads/terms offered are significantly
                                dissimilar from those available in the general market,
                            </li>
                            <li>
                                Whenever the prices/spreads/terms offered at the time the
                                bet is
                                placed are clearly wrong given the probability of the
                                forecast
                                occurring,
                            </li>
                            <li>
                                Whenever a bet has been erroneously accepted on a market
                                which
                                should have been suspended or removed,
                            </li>
                            <li>
                                Where a bet containing incompatible events is accidentally
                                accepted, because of human or technical error,
                            </li>
                            <li>
                                Whenever a settlement error is made while computing or
                                crediting
                                the amount of winnings,
                            </li>
                            <li>
                                Any other situation that may be referred to as an error.
                            </li>
                            <li>
                                any instance where one or more transactions on the WEBSITE
                                are
                                judged by betmundial to have been performed in violation of
                                this
                                Agreement.
                            </li>
                        </ul>
                        <li>
                            betmundial prohibits match fixing and player collusion and takes
                            measures to prohibit use of devices, such as robots, that
                            distort
                            normal game play. Further to this, betmundial will exercise its
                            right
                            to terminate an event as soon as it is aware of the
                            illegalities.

                            betmundial reserves the right to terminate events or games without
                            prior notice, whenever it deems necessary and / or due to errors
                            in
                            the software or games, which cause games to work incorrectly or
                            malfunction.
                        </li>
                    </ul>

                    <li>
                        All accounts without activity for a period of six calendar
                        months will be deemed to be inactive and the deposit forfeited to
                        the company.
                    </li>
                </ol>
            </AccordionItemPanel>
        </AccordionItem>
    )
}

export default AccountUsage
