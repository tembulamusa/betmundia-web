import React from 'react';
import { FaEnvelope, FaFacebook, FaXTwitter, FaInstagram, FaWhatsapp } from "react-icons/fa6"; import Breakfast from '../../assets/img/banner/carousel/breakfast.png';

import PlayStore from '../../assets/img/general-website/google-play-badge.png';
import AppStore from '../../assets/img/general-website/appstore_badge.svg';
import { FaMobile, FaPhone, FaPhoneAlt } from 'react-icons/fa';

const Footer = (props) => {
    //#24367e
    return (
        <footer className="footer-custom">
            <div className="row">
                <div className="col-xs-12 col-sm-6 col-md-3 col-lg-3 text-white">
                    <h5 className='text-2x uppercase font-bld'>betmundial</h5>
                    <ul>
                        <li className="text-white">
                            BOX 2772 - 00606, NAIROBI
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <a target='_blank' href="mailto:info@BetMundialbiz.com" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <FaEnvelope className="icon" />
                                <span>info@BetMundialbiz.com</span>
                            </a>
                        </li>
                        <li className="footer-icon" style={{ display: 'flex', justifyContent: 'flex-start', gap: '15px' }}>
                            <a target='_blank' href="https://www.facebook.com/kebetmundial">
                                <span><FaFacebook className="social-icon" /></span>
                            </a>
                            <a target='_blank' href="https://x.com/Kenya_betmundial">
                                <span><FaXTwitter className="social-icon" /></span>
                            </a>
                            <a target='_blank' href="https://www.instagram.com/betmundial_kenya_official">
                                <span><FaInstagram className="social-icon" /></span>
                            </a>
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <a
                                href="https://wa.me/254724599488"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ display: 'flex', alignItems: 'center', gap: '15px' }}
                            >
                                <FaWhatsapp className="icon" />
                                <span>Chat with Us</span>
                            </a>
                        </li>
                        <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <a target='_blank' href='tel:+254724599488' className='flex'>
                                <FaPhoneAlt className="icon inline-block mr-3" />
                                <span className='text-3xl'>0724 599 488</span>
                            </a>
                        </li>
                    </ul>
                </div>
                <div className="col-xs-12 col-sm-6 col-md-3 col-lg-3">
                    <h5>TERMS AND CONDITIONS</h5>
                    <ul>
                        <li className="">
                            <a href="/terms-and-conditions">Terms and Conditions</a>
                        </li>
                        <li className="">
                            <a href="/crash-terms">Crash Terms</a>
                        </li>
                        <li className="">
                            <a href="/responsible-gambling">Responsible Gambling</a>
                        </li>
                        <li className="">
                            <a href="/privacy-policy">Privacy Policy</a>
                        </li>
                        <li className="">
                            <a href="/cookie-policy">Cookie Policy</a>
                        </li>
                        <li className="">
                            <a href="/how-to-play">How To Play</a>
                        </li>

                        <li className="">
                            <a href="/faqs">Frequently asked questions</a>
                        </li>
                    </ul>
                </div>
                <div className="col-xs-12 col-sm-6 col-md-3 col-lg-3">
                    <h5>LEGAL</h5>
                    <ul>
                        <li className="text-danger">
                            You must be 18 Years+ to use this website.
                        </li>
                        <li className="">
                            <a href="/dispute-resolution">Dispute Resolution</a>
                        </li>
                        <li className="">
                            <a href="/anti-money-laundering">Anti-money Laundering</a>
                        </li>
                    </ul>
                    <div className="flex gap-2 items-center flex-wrap mt-2">

                        {/* <img src={PlayStore} alt="Google Play Store" className="w-40 h-16" />
                        <img src={AppStore} alt="Apple App Store" className="w-40 h-16" /> */}
                    </div>
                </div>
                <div className="col-xs-12 col-sm-6 col-md-3 col-lg-3">
                    <h5>LICENSING</h5>
                    <hr />
                    <p>
                        betmundial is a Trademark of BetMundial Limited. BetMundial Limited is authorized and regulated by Betting Control and Licencing Board of Kenya (BCLB) under the betting, lotteries and gaming Act, Cap 131 under Licence No. BK-0001303, PG-0001211
                    </p>
                </div>
            </div>
            <div className="container" id="navbar-collapse-main">
                <div className="footer-bottom text-center">
                    Copyright &copy; {new Date().getFullYear()} All rights Reserved.
                </div>
            </div>
        </footer>
    )
}

export default Footer
