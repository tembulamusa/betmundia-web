import React from "react";
import {
    Accordion,
    AccordionItem,
    AccordionItemHeading,
    AccordionItemButton,
    AccordionItemPanel,
} from 'react-accessible-accordion';
import 'react-accessible-accordion/dist/fancy-example.css';
import Footer from '../../footer/footer';
import Header from '../../header/header';
import Right from '../../right/index';
import SideBar from '../../sidebar/awesome/Sidebar';

const PrivacyPolicy = () => {
    return (
        <>
            <div className='col-md-12 bg-primary p-4 text-center profound-text'>
                <h4 className="inline-block"> Privacy Policy </h4>
            </div>
            <div className="col-md-12 py-2 px-4">
                <Accordion allowMultipleExpanded allowZeroExpanded>
                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>
                                Introduction and General Terms
                            </AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <p>This privacy policy document is used to inform customers our policies on collection, use, and disclosure of
                                Personal Information and data collected from website visitors. At betmundial we are committed to protecting and
                                respecting your privacy and maintaining the confidence and trust of our customers.</p>

                            <p>This Privacy Policy explains how and why your personal information is collected, through the use of our website
                                and all variants thereof, including our mobile app, why it is collected and how it is kept secure. The terms used
                                in this Privacy Policy have the same meanings as in our Terms and Conditions, which are accessible on our
                                website, unless otherwise defined in this Privacy Policy.</p>
                        </AccordionItemPanel>
                    </AccordionItem>

                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>
                                Types of Personal Information We Collect
                            </AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <p>We collect personal information when you interact with us and use our services. Sometimes, this information
                                is provided to us by you – like when you register for the first time and when you make use of our products or
                                get in touch with us. Sometimes third parties or publicly available sources provide us information about you.</p>

                            <h2>A. Information you provide to us through use of our services</h2>
                            <ul>

                                <li>Your personal details, such as your telephone or mobile number;</li>
                                <li>Financial details (to establish the source of funds where a transaction is involved)</li>
                                <li>Your account login details, such as your username and password</li>
                                <li>Information about how you interact with our products</li>
                                <li>Information about your online browsing behavior on the Website;</li>
                                <li>Information about any devices you have used to access our Services (such as IP address)</li>
                                <li>Recording phone calls – we may monitor or record phone calls with you. We might do this to check that
                                    we have carried out your instructions correctly; to resolve queries or issues; for regulatory purposes; to help
                                    improve our quality of service; to help us train our staff; or to help detect or prevent fraud or other crimes.</li>
                            </ul>
                            <p>Information you shared with us voluntarily or else, made public, like social media profiles.</p>

                            <h2>B. Other sources of personal data</h2>

                            <p>Where we provide personalized services, we may use third party data about you, for example, your Twitter
                                or Facebook feeds, to get to know you better and to provide more effective personalization.         Data
                                received in-house providing verification services and fraud prevention.</p>

                            <h2>C. Information about third parties</h2>
                            <p>If you give us personal information about someone else then you should not do so without their permission.
                                Where information is provided by you about someone else, or someone else discloses information about
                                you, it may be added to any personal information that is already held by us and it will be used in the ways
                                described in this Privacy Policy. This list of personal data types collected by betmundial is not exhaustive and
                                further information may be requested from you when betmundial considers it fair and necessary to do so.</p>

                            <h2>D. Special categories of data: </h2>
                            <p>Personal data collected by betmundial may include so called “special categories of
                                data”, such as data revealing health (in relation to responsible gaming policies).</p>
                        </AccordionItemPanel>
                    </AccordionItem>

                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>
                                Why Do We Collect Your Personal Data and On What Basis?
                            </AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <p>We recognize the trust and confidence our customers place in us as a service provider. In return, betmundial is open
                                about why we collect your data. First and foremost, collecting your information is essential for providing you
                                the services and products you want. In addition, your data is used to personalize and improve your experience
                                using our services, and to contact you from time to time with important information. In some cases, we need to
                                collect and use your information to comply with the law. Under data protection laws, we also need to identify a
                                specified lawful basis upon which we are processing your personal information. We rely on different bases for
                                different processing activities.</p>

                            <p><b>A. Under the contract</b> – when it is necessary for the performance of a contract to which you are a party. Our
                                Terms and Conditions , which you have accepted at registration, set out the terms of the contract and the
                                services we will provide:</p>

                            <h2>:. To make our services available to you as part of our contract</h2>

                            <p>to provide gaming and betting services, activities or online content, to provide you with information about
                                them and to deal with your requests and enquiries;</p>
                            <p>for 'service administration purposes', such as password reminders, service messages, such as site
                                maintenance, updates to our Privacy and Cookies Policy or Terms of Use, to let you know if your betmundial
                                account has become dormant and to ask if you would like to use it again before we close it;</p>
                            <p>to assess betting risk - when you make a bet, an automated system may be used to assess the risk connected
                                to your bet, in accordance with our Betting Rules. It is a system widely used by the betting operators to help
                                make fair and informed decisions on betting. Betting scoring takes account of information you provide
                                (both, at registration and through your use of our services). If your bet has been rejected or limited, you
                                have the right to ask for a manual assessment by our agents.</p>
                            <p>to process your transactions;</p>

                            <h2>B. Under legitimate interests</h2>

                            <p>It is necessary to process your data for the purposes set out below, except where our interests are overridden
                                by the interests, rights or freedoms of affected individuals (such as you).</p>
                            <p> To determine if we can process your data on this basis, we shall consider a number of factors, such as what
                                you were told at the time you provided your data, what your expectations are about the processing of the
                                data, the nature of the data, and the impact of the processing on you.</p>

                            <h2> C. To personalize your experience</h2>

                            <p>to offer a more relevant, tailored service; for instance, we could use your playing history to provide
                                personalized recommendations and products;</p>

                            <h2> D. To improve our services and products</h2>
                            <p>If you are signed-in or subscribed to our marketing offers, you will receive a personalized service. If you
                                don’t want to receive these services, you can unsubscribe from marketing offers.</p>
                            <p>to provide you with the most user-friendly online navigation experience;</p>
                            <p>for analysis and research purposes so that we may improve the services offered by betmundial;</p>
                            <p>testing new systems and checking upgrades to existing systems;</p>
                            <p>evaluating the effectiveness of marketing and for market research and training;</p>
                            <p>customer modelling, statistical and trend analysis, with the aim of developing and improving products and
                                services.</p>

                            <h2>E. To contact and interact with you</h2>

                            <p>Contact you about our services, for example by phone, email or social media;
                                Manage promotions and competitions you choose to enter;
                                Respond to your queries and complaints.</p>

                            <h2>F. To make your game safer and more enjoyable</h2>

                            <p>to deter, prevent or detect the use of third party software in peer-to-peer gambling;</p>

                            <p>to deter, prevent, or detect any activities conducted in breach of our Terms and Conditions.</p>

                            <h2>G. Under the legal obligation – when it is necessary in order to comply with mandatory legal obligations.</h2>

                            <p>to determine where you are accessing the services from to redirect you to the correct country site, in
                                accordance with our license conditions;</p>
                            <p>to make sure we offer our services to eligible persons;</p>
                            <p>crime detection, prevention, and prosecution;</p>
                            <p>to verify your identity and establish the source of funding in any transaction;</p>
                            <p>to carry out appropriate anti-fraud checks (by conducting online searches using a third party identity
                                provider). Please note that this will not affect your credit rating;</p>

                            <p>to ensure your personal information remains accurate. In connection with these obligations we may
                                periodically re-verify the personal data we hold about you to ensure it remains accurate and current
                                (including by disclosing your personal data to and receiving personal data about you from third party identity
                                and address verification services). If we update your personal data as a result of these verification processes,
                                we will take reasonable steps to inform you. If you believe any of the personal data we hold about you is
                                not accurate, please contact us through the available channels.</p>
                            <p>to assess and manage any potential risks and prevent problem gambling.</p>

                            <h2>H. Under your consent Marketing and market research</h2>

                            <p>We will send you relevant offers and news about our products and services in a number of ways including
                                by email, sms, phone call, social media targeted advertising, but only if you have previously agreed to receive
                                these marketing communications. You can opt out of the offers and news by unsubscribing through the
                                available channels.</p>
                            <p>We may use information which we hold about you to show you relevant advertising on third party sites (e.g.
                                Facebook). If you don’t want to be shown targeted advertising messages from us, some third party sites
                                allow you to request not to see messages from specific advertisers on that site in future. If you want to stop
                                all personalized services from us, including targeted advertising messages on third party sites you can contact
                                us to disable personalization. We also like to hear your views to help us to improve our services, so we may
                                contact you for market research purposes. You always have the choice about whether to take part in our
                                market research.</p>

                            <p>Special categories of data</p>

                            <p>We will only process such data if:</p>

                            <p>you have given us your explicit consent;</p>

                            <p>it relates to personal data which you have made public;</p>

                            <p>it is necessary for the establishment, exercise or defence of legal claims;</p>
                            <p>is necessary for reasons of substantial public interest, on the basis of State Law.</p>
                        </AccordionItemPanel>
                    </AccordionItem>

                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>
                                Cookies
                            </AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <p>Cookies are files with small amount of data that are commonly used an anonymous unique identifier. These are sent to your browser from the website that you visit and are stored on your phone/computer. We use cookies for the following purposes:</p>

                            <p>to identify the Account Holder's (as defined in our Terms and Conditions) preferred language, so it can be automatically selected when the Account Holder returns to the Website;</p>
                            <p>to ensure that bets placed by the Account Holder are associated with the Account Holder's betting coupon and Account;</p>
                            <p>to ensure that the Account Holder receives any bonuses for which they are eligible, and        for analysis of the Website traffic, so as to allow us to make suitable improvements.</p>
                            <p>You have the option to either accept or refuse these cookies, and know when a cookie is being sent to your phone/computer. If you choose to refuse our cookies, you may not be able to use some features of our Services.</p>
                            <h1>When do we share your personal information?</h1>
                            <p></p>
                            <p>We do not share your personal information to third parties outside betmundial for marketing purposes.  However, there are circumstances when we share your personal data with third parties that provide services to you on our behalf, and with other third parties in the course of complying with our legal obligations. Other examples of when we share your personal information include when we enter any kind of merger or business sale, as customers’ personal information is likely to be included in the sale/transfer. Additionally, the personal information may be stored and/or processed for the purposes set forth above in this Privacy Statement in any country where our affiliates, suppliers, subsidiaries or agents operate in</p>
                            <p></p>
                            <p>We would inform you prior to affecting such transfer of personal data. Even when it is shared, we ensure that your personal information will only be used for the purposes outlined in this Privacy Notice.  </p>
                            <p>We may share the personal data we collect within betmundial for the following purposes:</p>
                            <p></p>
                            <p>providing you with products and services and notifying you about either important changes or developments to the features and operation of those products and services;</p>
                            <p>responding to your enquiries and complaints; o         administering offers, competitions, and promotions; o facilitating the secure access to online platforms</p>
                            <p>updating, consolidating, and improving the accuracy of our records o undertaking transactional analysis;</p>
                            <p>testing new systems and checking upgrades to existing systems;</p>
                            <p>crime detection, prevention, and prosecution, as well as complying with regulatory requirements; </p>
                            <p>evaluating the effectiveness of marketing, and for market research and training;</p>
                            <p>customer modelling, statistical and trend analysis, with the aim of developing and improving products and services.</p>
                            <p></p>
                            <p>We may share personal data with third parties in the following circumstances:</p>
                            <p>providing you with products and services and notifying you about either important changes or developments to the features and operation of those products and services;</p>
                            <p>when ordered to do so by any regulatory body and/or under any legal provision contained in the governing law;</p>
                            <p>we may instruct and authorize the Financial Institution with which an Account Holder's account is held to disclose any information as may be requested by the Regulator in respect of an Account Holder's account; o in order to establish, exercise or defend our legal rights;</p>
                            <p>for verification, and fraud detection purposes, we may transfer your personal data to third parties, including but not limited to so-called Address Verification System service providers, Payment Service Providers, Financial Institutions, and credit reference agencies. Furthermore, we reserve the right to disclose the Account Holder’s personal data to relevant parties where betmundial has reasonable grounds to suspect irregularities involving a betmundial Account;</p>
                            <p>with service providers to enable us to provide our services, such as companies that help us with technology services, storing and combining data, and processing payments or providing relevant online advertising for our products and services;</p>
                            <p>with external auditors who may carry out independent checks as part of our accreditations o to an organisation we sell or transfer (or enter into negotiations to sell or transfer) any of our businesses or any of our rights or obligations under any agreement we may have with you. If the transfer or sale goes ahead, the organisation receiving your personal data can use your personal data in the same way as us; or</p>
                            <p>to any other successors in title to our business.</p>
                        </AccordionItemPanel>
                    </AccordionItem>

                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>
                                Your rights & choices over your personal information
                            </AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <p>We appreciate that by law and subject to certain conditions, you have a number of rights concerning the personal information we hold about you. If you wish to exercise these rights, you should contact us. These rights include the right to access, amend and erase the personal information we hold about you, the right to object to the processing of your data, the right to withdraw consent, and the right to data portability. You also have the right to complain to your data protection authority if you are concerned with how we process your information. In addition, you have certain rights relating to automated decision-making and ‘profiling’. Further information and advice about your rights can be obtained from your country’s data protection regulator. o The personal information we ask for on registration is compulsory (unless indicated in the forms as optional) and we need it to be able to process your registration, contact you and comply with gambling and financial laws to which you are subject. Unfortunately, therefore, if you do not want to provide such personal information, you will not be able to use our services.</p>
                            <p>You have a right to request a copy of the personal information we hold about you, known as a data subject access request. You also have the right to request that information we hold about you which may be incorrect, or which has been changed since you first told us, is updated or removed.  o   In some circumstances, you can ask us to erase personal information we hold about you. This includes when:</p>
                            <p></p>
                            <p>the information is no longer necessary in relation to the purpose for which it was collected; if you previously gave consent to the use of your information, but decide to withdraw it and we cannot justify another legal ground for using it under data protection law; </p>
                            <p>we process your information based on our legitimate interests and we cannot demonstrate overriding legitimate grounds to continue processing the information;</p>
                            <p>we don’t have a lawful ground under data protection law to process your information; </p>
                            <p>the data has to be erased to comply with a legal requirement; </p>
                            <p>This    right    is subject to mandatory retention periods under local laws.</p>
                            <p>You have the right to ask us to restrict the processing of your personal information. When processing is restricted, we can still store your information, but will not use it further. This right is</p>
                            <p>available to you when:</p>
                            <p></p>
                            <p>you dispute the accuracy of the personal information (while we verify matters);</p>
                            <p>the processing is unlawful, and you object to the erasure of the information and request that we restrict processing instead;</p>
                            <p>we no longer need the data, but you require it to establish, exercise or defend a legal claim; and</p>
                            <p>we process your information for our legitimate business interests but you object and while we verify the grounds for continued processing.</p>
                            <p></p>
                            <p>You have the right to receive personal information you provide to us, in a ‘commonly used machine-readable format’. This allows you to obtain and reuse your information for your own purposes across different services. For example, if you decide to switch to a different provider, this enables you to move, copy or transfer your information easily between our IT systems and theirs safely and securely, without affecting its usability. This is not a general right however, and only arises when the processing of your information is:</p>
                            <p></p>
                            <p>based on your consent or where it is necessary for the performance of a contract, and when the information is processed by solely by automated means</p>
                            <p></p>
                            <p>Based on your particular situation, you can object to the processing of your personal information, that is:</p>
                            <p></p>
                            <p>based on our legitimate business interests (including profiling); or done for research and statistical purposes</p>
                            <p></p>
                            <p>You also have the right to object to the use of your personal information for direct marketing purposes (including profiling), such as when you receive emails from us notifying you about other betmundial services which we think will be of interest to you.</p>
                            <p>When we rely on your consent as the basis to process your personal information – such as for sales and marketing communications – you have the right to withdraw your consent at any time by contacting us.</p>
                            <p>We sometimes use systems to make automated decisions based on your personal information. This helps us to make sure our decisions are quick, fair, efficient and correct, based on what we know.  These automated decisions can affect the products, services or features we may offer you now or in the future, or the ability to use our services.</p>
                            <p>We may use automate decisions making in the following situations:</p>
                            <p></p>
                            <p>tailoring products and services – we may pace you in groups with similar customers (segments) to study and learn about preferences and your needs, and offer more tailored experience for you;</p>
                            <p>detecting fraud - we use your personal information to help decide and detect if your account may be being used for fraud or money-laundering. If we think there is a risk of fraud, we may block or suspend the account;</p>
                            <p>opening account - when you open an account with us, we check that the product or service is relevant for you, based on what we know. We also check that you meet the conditions needed to open the account. This may include checking age, residency, nationality or financial position; risk assessment connected to your bet.</p>
                            <p>Data protection law seeks to safeguard individuals against harm that may arise from decision-making - including profiling - that takes place without human intervention. You have the right not to be subject to a decision - including profiling - when it is based on the automated processing of your personal information and it has a legal effect or a similarly significant effect on you. Please note that the right does not apply when the processing is:</p>
                            <p></p>
                            <p>necessary for entering into or for the performance of a contract with you; or</p>
                            <p>when it is authorized by law; or</p>
                            <p>when it is based on your explicit consent.</p>
                        </AccordionItemPanel>
                    </AccordionItem>


                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>
                                Security
                            </AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <p>We value your trust in availing your Personal Information to us, we thus strive to use commercially acceptable means of protecting it from any unauthorized external or internal access without your consent.  betmundial shall not take responsibility whatsoever for events beyond its control. These include but are not limited to inclusive of, but not limited to acts of God or natural disasters and including power cuts and strikes.  Furthermore, no method of transmission over the internet, or electronic storage is 100% secure or offers absolute reliability. We therefore cannot guarantee absolute security.  </p>
                            <h1>Children’s Privacy</h1>
                            <p>Our Services do not address anyone under the age of 18. We do not knowingly collect personal identifiable information from children under 18. In the case we discover that a child under 18 has provided us with personal information, we immediately delete this from our servers. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact us so that we will be able to do necessary actions.</p>
                            <p></p>
                            <h1>Changes to This Privacy Policy </h1>
                            <p>We may update our Privacy Policy from time to time. Thus, we advise you to review this page periodically for any changes. We will notify you of any changes by posting the new Privacy Policy on this page. These changes are effective immediately, after they are posted.  </p>
                            <h1>Contact Us</h1>
                            <p>If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us through email on customercare@betmundial.com </p>
                        </AccordionItemPanel>
                    </AccordionItem>




                </Accordion>
            </div>
        </>
    );
}

export default PrivacyPolicy;
