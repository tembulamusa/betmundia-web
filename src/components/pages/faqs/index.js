import React from 'react';
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

const FAQs = () => {
    return (
        <>
            <div className='col-md-12 bg-primary p-4 text-center profound-text'>
                <h4 className="inline-block"> Frequently Asked Questions (FAQs) </h4>
            </div>
            <div className="col-md-12">
                <Accordion allowZeroExpanded>
                    {/* FAQ 1 */}
                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>
                                What is betmundial.com?
                            </AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <p>betmundial is a leading betting site in Kenya, offering a wide range of sports betting options and games. We are licensed by the Betting Control and Licensing Board (BCLB) and are committed to providing a safe and enjoyable betting experience for all our users.</p>
                        </AccordionItemPanel>
                    </AccordionItem>

                    {/* FAQ 2 */}
                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>
                                How do I contact betmundial customer support?
                            </AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <p>You can contact our customer support team via email at customercare@betmundial.com or call our helpline at +254140444142. Our team is available 24/7 to assist you with any queries or issues you may have.</p>
                        </AccordionItemPanel>
                    </AccordionItem>

                    {/* FAQ 3 */}
                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>
                                How to create an account
                            </AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <p>There are two ways to register with betmundial: via SMS and using our online platform.</p>
                            <p><b>SMS Registration:</b> Send an SMS "JOIN" to 29280. You will receive a confirmation message from 29280 confirming that you are registered.</p>
                            <p><b>Online Registration:</b> Go to www.betmundial.com and click on the Register button on the top right corner of the page. Fill the required fields (including phone number and creating a unique password), read and accept the terms and conditions, and confirm that you are over 18 years old.</p>
                        </AccordionItemPanel>
                    </AccordionItem>

                    {/* FAQ 4 */}
                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>
                                Forgot Password
                            </AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <p>To reset your password:</p>
                            <ol>
                                <li>Open your web browser and go to betmundial.com.</li>
                                <li>Click on login.</li>
                                <li>Click on ‘forgot password’ then enter your phone number and click GET RESET CODE.</li>
                                <li>You will receive an SMS with a reset CODE. Enter the CODE and choose your new password.</li>
                            </ol>
                        </AccordionItemPanel>
                    </AccordionItem>

                    {/* FAQ 5 */}
                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>
                                How to check my bets
                            </AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <p>To check your Bet outcomes:</p>
                            <p><b>On our betmundial Website:</b> Click on 'Bet History'.</p>
                            <p><b>On betmundial App:</b> Tap on the 'My Bets' icon to view your bet history.</p>
                            <p><b>On SMS:</b> Send R#Bet ID to 29280, for example, R#CTMSYA to 29280.</p>
                        </AccordionItemPanel>
                    </AccordionItem>

                    {/* Add additional FAQs here following the same structure */}

                    {/* FAQ 6 */}
                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>
                                SMS betting
                            </AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <p>To place a bet via SMS:</p>
                            <ol>
                                <li>Send an SMS “JOIN” to 29280 to register.</li>
                                <li>To place a bet, SMS your prediction to 29280.</li>
                                <li>The minimum stake is 1 Kshs and the maximum stake is 500,000 Kshs.</li>
                                <li>Example for a single bet: 1234#2#5000, where 1234 is the Game ID, 2 is the prediction, and 5000 KSH is the bet amount.</li>
                                <li>Example for a multi-bet: 1234#2#5678#1#9101#X#5000.</li>
                            </ol>
                        </AccordionItemPanel>
                    </AccordionItem>

                    {/* FAQ 7 */}
                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>
                                Web betting
                            </AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <p>To place a bet online:</p>
                            <ol>
                                <li>Open your web browser and go to betmundial.com.</li>
                                <li>Log in by entering your phone number and password.</li>
                                <li>Select your preferred sport and events up to a maximum of 30 matches.</li>
                                <li>Enter your stake amount and click on “Place Bet”.</li>
                            </ol>
                        </AccordionItemPanel>
                    </AccordionItem>

                    {/* FAQ 8 */}
                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>
                                Deposit using Mpesa directly from betmundial.com
                            </AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <p>To deposit using Mpesa from the betmundial website:</p>
                            <ol>
                                <li>Go to the DEPOSIT tab on surbet.com and enter the deposit amount.</li>
                                <li>A pop-up notification will appear on your phone for M-PESA payment confirmation.</li>
                            </ol>
                        </AccordionItemPanel>
                    </AccordionItem>

                    {/* FAQ 9 */}
                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>
                                Deposit using Mpesa menu
                            </AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <p>To deposit via M-PESA menu on your phone:</p>
                            <ol>
                                <li>Select Lipa na M-PESA Then Pay Bill.</li>
                                <li>Enter 444142 as the Business Number and your betmundial registered number as the Account Number</li>
                                <li>Enter your amount and M-PESA PIN and send.</li>
                            </ol>
                        </AccordionItemPanel>
                    </AccordionItem>

                    {/* FAQ 10 */}
                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>
                                How to request a withdrawal via SMS
                            </AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <ol>
                                <li>Send an SMS 'W#Amount' to 29280 using the phone number associated with your account.</li>
                            </ol>
                        </AccordionItemPanel>
                    </AccordionItem>


                    {/* FAQ 11 */}
                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>
                                How to request a withdrawal via web
                            </AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <ol style={{ paddingLeft: '1.2em' }}>
                                <li><strong>Open</strong> your web browser and go to: <strong>betmundial.com</strong>.</li>
                                <li><strong>Select login</strong>, (If Not Logged In).</li>
                                <li>Enter your <strong>phone number</strong> and <strong>password</strong> to access your account.</li>
                                <li>Select <strong>'Menu'</strong> at the top left.</li>
                                <li>Select <strong>‘Withdrawal’</strong>.</li>
                                <li>Enter the <strong>amount</strong> you wish to withdraw (minimum <strong>50 Kshs</strong>).</li>
                                <li>Select <strong>‘Request Withdrawal’</strong>.</li>
                            </ol>
                            <p style={{ fontWeight: 'bold', color: '#d9534f', marginTop: '1em' }}>
                                Note: Withdrawals are processed instantly. The minimum withdrawal amount is <strong>50 Kshs</strong>. Additional carrier fees may apply. The maximum withdrawal amount per day is <strong>70,000 Kshs</strong>.
                            </p>
                        </AccordionItemPanel>
                    </AccordionItem>



                    {/* Additional FAQs */}
                </Accordion>
            </div>
        </>
    );
};

export default FAQs;
