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

const ResponsibleGambling = () => {
    return (
        <>
            <div className='col-md-12 bg-primary p-4 text-center profound-text'>
                <h4 className="inline-block">Responsible Gambling</h4>
            </div>
            <div className="col-md-12 mt-2 py-2 px-4">
                <Accordion allowZeroExpanded>
                    {/* Introduction */}
                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>
                                1. Introduction
                            </AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <p>Betmundial is committed to Responsible Gaming. We are dedicated to make gaming as an enjoyable leisure activity and provide an enjoyable betting experience to all involved parties. The majority of players enjoy the entertainment and gaming services we provided but for some people gaming may stop being a harmless leisure activity and become a problem. Betmundial has a series of measures for responsible betting which allow customers to limit their spending and it is a mature way of ensuring all involved parties stay in control.</p>
                        </AccordionItemPanel>
                    </AccordionItem>

                    {/* Responsible Gambling Tips */}
                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>
                                2. Responsible Gambling Tips
                            </AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>

                            <h5>Stay in Control – It's Only a Game</h5>
                            <p>
                                Betmundial is committed to Responsible Gaming. We aim to ensure that gaming
                                remains an enjoyable leisure activity. While most players participate responsibly,
                                gambling can become problematic for some individuals.
                            </p>
                            <p>Please consider the following tips to help you stay in control:</p>

                            <ol>
                                <li>Only bet amounts you can afford to lose.</li>
                                <li>Gambling should be for entertainment, not a way to make money.</li>
                                <li>Never chase your losses.</li>
                                <li>Keep track of the time and money you spend.</li>
                                <li>Balance gambling with other hobbies and activities.</li>
                                <li>Take regular breaks and use self-exclusion tools if necessary.</li>
                                <li>Avoid gambling when upset, stressed, or under the influence of alcohol.</li>
                            </ol>

                            <hr />

                            <h5>Getting Help</h5>
                            <p>
                                If you or someone you know may have a gambling problem, we strongly recommend
                                seeking professional assistance.
                            </p>

                            <p><strong>24/7 Counselling Support:</strong></p>
                            <p>
                                <a href="https://gamhelpkenya.com/" target="_blank" rel="noopener noreferrer">
                                    https://gamhelpkenya.com/
                                </a><br />
                                Phone: +254 0116 444 142
                            </p>

                            <h6>Warning Signs of Problem Gambling</h6>
                            <ul>
                                <li>Uncontrolled spending</li>
                                <li>Lying about gambling behavior</li>
                                <li>Borrowing money or stealing to gamble</li>
                                <li>Loss of interest in hobbies</li>
                                <li>Neglecting work or studies</li>
                            </ul>

                            <p>
                                If you notice these signs, we encourage you to seek help from friends,
                                family, or professional support services.
                            </p>

                            <hr />

                            <h5>Contact Our Customer Care</h5>
                            <p>If you need assistance, our support team is available:</p>
                            <ul>
                                <li>Live Chat</li>
                                <li>Email: support@Betmundial.com</li>
                            </ul>

                            <hr />

                            <h5>Self-Exclusion</h5>
                            <p>
                                Our Self-Exclusion option allows players to temporarily close their accounts
                                for a specified period.
                            </p>

                            <h6>How It Works</h6>
                            <ul>
                                <li>You cannot place bets or play games during the exclusion period.</li>
                                <li>You may still log in to withdraw remaining funds (if eligible).</li>
                                <li>The account cannot be reactivated until the exclusion period ends.</li>
                                <li>Bonuses may expire during the exclusion period.</li>
                                <li>Creating new accounts during self-exclusion is prohibited.</li>
                            </ul>

                            <p>
                                To activate self-exclusion or permanently close your account,
                                please contact Customer Care. Identity verification may be required.
                            </p>

                            <hr />

                            <h5>Restrictions for Minors</h5>
                            <p>
                                Gambling is strictly prohibited for individuals under the age of 18.
                                Betmundial takes strong measures to prevent underage gambling.
                            </p>

                            <ul>
                                <li>Players must confirm they are 18+ during registration.</li>
                                <li>Personal information is verified during signup.</li>
                                <li>Mobile money registration requires valid national ID.</li>
                                <li>Parents should secure login credentials and shared devices.</li>
                                <li>Educate minors about gambling risks.</li>
                            </ul>

                            <h6>Recommended Filtering Software</h6>
                            <ul>
                                <li>Net Nanny – www.netnanny.com</li>
                                <li>CYBERsitter – www.cybersitter.com</li>
                                <li>GamBlock – www.gamblock.com</li>
                            </ul>

                            <hr />

                            <h5>Self-Assessment Questions</h5>
                            <p>
                                Ask yourself the following questions to determine whether gambling
                                may be becoming a problem:
                            </p>

                            <ol>
                                <li>Do you feel depressed after losing money?</li>
                                <li>Do you try to win back losses immediately?</li>
                                <li>Have you run out of money due to gambling?</li>
                                <li>Have you borrowed money to gamble?</li>
                                <li>Has gambling affected relationships or hobbies?</li>
                                <li>Have you ever felt hopeless or suicidal due to gambling?</li>
                            </ol>

                            <hr />

                            <h5>Support for Friends and Family</h5>
                            <p>
                                Gambling problems can also affect loved ones. If you are concerned
                                about someone, encourage open discussion and suggest professional help.
                            </p>

                        </AccordionItemPanel>
                    </AccordionItem>
                </Accordion >
            </div >
        </>
    );
};

export default ResponsibleGambling;
