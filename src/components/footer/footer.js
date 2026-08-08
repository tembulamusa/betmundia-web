import React from 'react';
import {
    FaEnvelope,
    FaFacebook,
    FaXTwitter,
    FaInstagram,
    FaWhatsapp,
    FaLocationDot,
    FaPhone,
    FaComments,
    FaShieldHalved,
    FaLock,
    FaHeadset,
    FaScaleBalanced,
    FaChevronRight,
} from 'react-icons/fa6';

const TERM_LINKS = [
    { href: '/terms-and-conditions', label: 'Terms and Conditions' },
    { href: '/crash-terms', label: 'Crash Terms' },
    { href: '/responsible-gambling', label: 'Responsible Gambling' },
    { href: '/privacy-policy', label: 'Privacy Policy' },
    { href: '/cookie-policy', label: 'Cookie Policy' },
    { href: '/how-to-play', label: 'How To Play' },
    { href: '/faqs', label: 'Frequently asked questions' },
];

const SOCIAL_LINKS = [
    { href: 'https://www.facebook.com/kebetmundial', icon: FaFacebook, label: 'Facebook' },
    { href: 'https://x.com/Kenya_betmundial', icon: FaXTwitter, label: 'X' },
    { href: 'https://www.instagram.com/betmundial_kenya_official', icon: FaInstagram, label: 'Instagram' },
    { href: 'https://wa.me/254143444142', icon: FaWhatsapp, label: 'WhatsApp' },
];

const Footer = () => {
    return (
        <footer className="site-footer">
            <div className="site-footer__inner">
                <div className="site-footer__grid">
                    <div className="site-footer__col site-footer__col--brand">
                        <p className="site-footer__tagline">
                            Your ultimate destination for sports betting, casino and exciting games.
                        </p>

                        <ul className="site-footer__contact">
                            <li>
                                <span className="site-footer__contact-icon" aria-hidden="true">
                                    <FaLocationDot />
                                </span>
                                <span>
                                    83 Ndoto Road, James Gichuru Road, Lavington, Nairobi, Kenya
                                </span>
                            </li>
                            <li>
                                <a href="mailto:support@betmundial.com">
                                    <span className="site-footer__contact-icon" aria-hidden="true">
                                        <FaEnvelope />
                                    </span>
                                    <span>support@betmundial.com</span>
                                </a>
                            </li>
                            <li>
                                <a href="tel:+254143444142">
                                    <span className="site-footer__contact-icon" aria-hidden="true">
                                        <FaPhone />
                                    </span>
                                    <span>254143444142</span>
                                </a>
                            </li>
                        </ul>

                        <div className="site-footer__connected">
                            <h5 className="site-footer__heading site-footer__heading--plain">
                                Stay Connected
                            </h5>
                            <div className="site-footer__social">
                                {SOCIAL_LINKS.map(({ href, icon: Icon, label }) => (
                                    <a
                                        key={label}
                                        href={href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={label}
                                        className="site-footer__social-btn"
                                    >
                                        <Icon />
                                    </a>
                                ))}
                            </div>
                        </div>

                        <a
                            className="site-footer__help"
                            href="https://wa.me/254143444142"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <span className="site-footer__help-icon" aria-hidden="true">
                                <FaComments />
                            </span>
                            <span className="site-footer__help-copy">
                                <strong>Need Help?</strong>
                                <span>Chat with our support team</span>
                            </span>
                            <FaChevronRight className="site-footer__help-chevron" aria-hidden="true" />
                        </a>
                    </div>

                    <div className="site-footer__col">
                        <h5 className="site-footer__heading">Terms and Conditions</h5>
                        <ul className="site-footer__links">
                            {TERM_LINKS.map(({ href, label }) => (
                                <li key={href}>
                                    <a href={href}>
                                        <FaChevronRight aria-hidden="true" />
                                        <span>{label}</span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="site-footer__col">
                        <h5 className="site-footer__heading">Legal</h5>
                        <div className="site-footer__age">
                            <span className="site-footer__age-badge" aria-hidden="true">
                                18+
                            </span>
                            <span>18 year and above</span>
                        </div>
                        <p className="site-footer__legal-copy">
                            You MUST be 18 years of age or older to register or play at Betmundial.
                            Gambling may have adverse effects if not done with moderation. When the
                            fun stops, STOP!
                        </p>
                        <div className="site-footer__legal-actions">
                            <a href="/dispute-resolution" className="site-footer__legal-row">
                                <FaShieldHalved aria-hidden="true" />
                                <span>Dispute Resolution</span>
                                <FaChevronRight aria-hidden="true" />
                            </a>
                            <a href="/anti-money-laundering" className="site-footer__legal-row">
                                <FaScaleBalanced aria-hidden="true" />
                                <span>Anti-money Laundering</span>
                                <FaChevronRight aria-hidden="true" />
                            </a>
                        </div>
                    </div>

                    <div className="site-footer__col">
                        <h5 className="site-footer__heading">Licensing</h5>
                        <p className="site-footer__licensing">
                            AIB Petals Limited is licensed by the Gambling Regulatory Authority of
                            Kenya (GRAK- formerly BCLB) under the Betting, Lotteries and gaming Act,
                            1966 (now repealed by the Gambling Control Act, 2025) and any regulations
                            made thereunder under License Numbers: Book Maker&apos;s - 0001303 and
                            Public Gaming 0001211
                        </p>
                    </div>
                </div>

                <div className="site-footer__trust">
                    <div className="site-footer__trust-item">
                        <FaShieldHalved aria-hidden="true" />
                        <div>
                            <strong>Secure &amp; Encrypted</strong>
                            <span>Your data is 100% protected</span>
                        </div>
                    </div>
                    <div className="site-footer__trust-item">
                        <FaLock aria-hidden="true" />
                        <div>
                            <strong>Licensed &amp; Regulated</strong>
                            <span>Licensed in Kenya</span>
                        </div>
                    </div>
                    <div className="site-footer__trust-item">
                        <FaHeadset aria-hidden="true" />
                        <div>
                            <strong>24/7 Customer Support</strong>
                            <span>We&apos;re here to help anytime</span>
                        </div>
                    </div>
                </div>

                <div className="site-footer__copyright">
                    Copyright &copy; {new Date().getFullYear()} Betmundial. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
