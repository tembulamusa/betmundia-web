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
                    {/* J. PRIVACY POLICY */}
                    <AccordionItem>
                        <AccordionItemHeading>
                            <AccordionItemButton>
                                J. PRIVACY POLICY
                            </AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>

                            {/* Introduction */}
                            <h5>1. Introduction</h5>
                            <p>
                                Your privacy is important to Betmundial. We follow closely the laws and ensure legality.
                                We endeavour to keep your personal information protected at all times by implementing
                                adequate technical and organizational controls. Please take a moment to read the
                                following policy to learn how we handle your personal information, as your use of
                                our services will indicate your acceptance of its content.
                            </p>

                            {/* Privacy Policy */}
                            <h5>2. Privacy Policy</h5>
                            <p>
                                This Privacy Policy is agreed between you and Betmundial’s corporate entities
                                (‘Betmundial’, ‘We’, ‘Us’ or ‘Our’ as appropriate). Betmundial will only process
                                your personal data for the purposes for which it collected it, namely to provide
                                you with an online betting service.
                            </p>

                            <p>
                                Betmundial does not normally share your data with any other third parties; however,
                                at times we may be required by law or legal process to disclose your personal
                                information. We may also disclose information about you if we believe that disclosure
                                is necessary for the public interest.
                            </p>

                            <p>
                                You have a right to access your data and request it to be changed or deleted at no
                                cost to yourself.
                            </p>

                            <p>
                                By submitting your information to us and using the Website you confirm your consent
                                to the use of your personal information as set out in this Privacy Policy. If you
                                do not agree with the terms of this Privacy Policy please do not use the Website
                                or otherwise provide us with your personal information.
                            </p>

                            {/* AI Assistant */}
                            <h5>3. AI Assistant</h5>
                            <p>
                                As part of our commitment to enhancing user experience, Betmundial may utilize
                                an AI-powered assistant to respond to general inquiries and support customer service.
                            </p>

                            <p>
                                Please be aware that the AI assistant is an automated tool. Its responses are
                                generated based on data-driven patterns and machine learning, not human judgment.
                                While we actively monitor and refine the AI system to improve its performance
                                and accuracy, we do not guarantee the completeness, correctness, or relevance
                                of its responses at all times.
                            </p>

                            <p>
                                All information provided by the AI assistant is for general informational purposes
                                only and should not be regarded as professional advice, binding commitments, or
                                definitive guidance. Users are advised not to rely solely on the AI assistant's
                                responses, particularly when making decisions related to transactions, account
                                management, betting activities, or matters involving legal, financial, or
                                personal implications.
                            </p>

                            <p>
                                To protect your privacy and ensure accurate handling of sensitive or personal data,
                                users are encouraged to contact our human Customer Support team via official
                                channels for case-specific issues or clarification.
                            </p>

                            <p>
                                Betmundial shall not be held liable, to the maximum extent permitted by applicable
                                law, for any direct, indirect, incidental, consequential, or special loss, damage,
                                claim, or expense (including but not limited to service disruption, data errors,
                                or financial loss) resulting from reliance on information provided by the AI assistant.
                            </p>

                            <p>
                                By choosing to interact with the AI assistant, you consent to this form of
                                communication and acknowledge the limitations and risks associated with
                                automated responses.
                            </p>

                            {/* Purpose of Collection */}
                            <h5>4. Purpose of Collection</h5>
                            <p>
                                We collect and use your personal information to satisfy legal and regulatory
                                requirements; for historical and statistical purposes; for security and control
                                and for the smooth provision of our services.
                            </p>

                            <p>
                                From time to time, we may also use your personal information to contact you by mail,
                                email, telephone or mobile phone to introduce you to our products or any events,
                                activities, projects, plans, developments, undertakings and special offers taking
                                place, being promoted or supported by Betmundial.
                            </p>

                            <p>
                                The data supplied by you upon registering online or thereafter shall be kept by
                                Betmundial and will solely be used to determine the legality of registration and
                                activity on the Website.
                            </p>

                            <p>
                                By supplying us with your information you confirm that you do not consider use of
                                your information in accordance with this Privacy Policy to be a breach of your
                                rights under “The Act”.
                            </p>

                            <p>
                                We encourage you to contact us at any time and remind you of your right to opt out
                                at any time from receiving any promotional or marketing materials from us.
                            </p>

                            {/* Disclosure */}
                            <h5>5. Disclosure to Third Parties</h5>
                            <p>
                                As a policy, Betmundial will not disclose your personal information to anyone other
                                than those employees, partners and affiliates that may require your data to provide
                                a particular service.
                            </p>

                            <p>
                                We may also be required by law or legal process to disclose your information to
                                relevant authorities.
                            </p>

                            {/* Protection */}
                            <h5>6. Protection of Information</h5>
                            <p>
                                Betmundial safeguards the security of the data you provide us with physical,
                                electronic, and managerial procedures. Please note that we cannot guarantee that
                                any data transmitted over the Internet is completely secure.
                            </p>

                            <p>
                                Accordingly, we encourage you to take every precaution to protect your personal
                                data when you are on the Internet.
                            </p>

                            {/* Access */}
                            <h5>7. Access of Information</h5>
                            <p>
                                The Management of Betmundial together with the Fraud Team will have the right to
                                access the submitted personal information relating to the registered players.
                            </p>

                            <p>
                                You always have a right of access the information we have about you. To review
                                and update your personal contact information, simply contact Betmundial and you
                                will be provided with information about your personal data we hold.
                            </p>

                            <p>
                                Additionally, you have the right to have any inaccurate information corrected and
                                where applicable, erased. It is our right to ask you to provide us with a written
                                request for information we hold about you.
                            </p>

                            {/* KDPA */}
                            <h5>8. Kenya Data Protection Act (KDPA)</h5>
                            <p>
                                Betmundial processes personal data strictly in accordance with the Kenya Data
                                Protection Act (KDPA). As our services are exclusively available to users who
                                are residents of and physically located in Kenya, only such users are entitled
                                to exercise their data protection rights under the applicable Kenyan law.
                            </p>

                            <p>
                                If you would like to access, correct, or request the deletion of your personal
                                data, please contact our Customer Service team via the Help Section:
                            </p>

                            <p>
                                <a
                                    href="https://www.Betmundial.com/support"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    https://www.Betmundial.com/support
                                </a>
                            </p>

                            {/* Commitment */}
                            <h5>9. Commitment to Privacy</h5>
                            <p>
                                To make sure your personal information remains confidential; we communicate
                                these privacy guidelines to every Betmundial employee.
                            </p>

                            <p>
                                Betmundial’s Website may, from time to time, contain links to other sites.
                                Betmundial does not share your personal information with those websites and
                                is not responsible for their privacy practices.
                            </p>

                            <p>
                                If we are going to use your personal information differently from that stated
                                at the time of collection, we will inform you accordingly.
                            </p>

                            <p>
                                Betmundial’s Privacy Policy is subject to change at any time. It is in your
                                interest to review the privacy policy regularly for any changes.
                            </p>

                        </AccordionItemPanel>
                    </AccordionItem>
                </Accordion>
            </div>
        </>
    );
}

export default PrivacyPolicy;
