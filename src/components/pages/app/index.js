import React from "react";
import { FiCheckCircle } from "react-icons/fi";

import PlayStore from '../../../assets/img/general-website/google-play-badge.png';
import AppStore from '../../../assets/img/general-website/appstore_badge.svg';
import AppBanner from '../../../assets/img/banner/App.png';

const MobileApp = () => {

    return (
        <>
            <div className='col-md-12 bg-[rgba(255,255,255,0.1)] !mb-6 mx-auto p-4 text-center'>
                <h4 className=' inline-block'>
                    betmundial APP
                </h4>
            </div>

            <div className='std-medium-width-block mb-0 pb-0 !pr-0'>

                <div className="block">
                    <div className="w-full justify-center items-center">

                        <h3>Download Today and Enjoy bonuses</h3>

                        <div className="flex gap-2 w-full items-center mt-4 text-white justify-center">
                            <a href="https://play.google.com/store/apps/details?id=com.betmundial" target="_blank" rel="noopener noreferrer" className="btn img w-1/2 mt-2">
                                <img src={PlayStore} alt="Google Play Store" className="w-full" />
                                <div className="text-3xl text-white  mt-3">Android</div>
                            </a>
                            <a href="https://api.betmundial.com/v2/sports/app/apk/download?platform=ios" target="_blank" className="btn img w-1/2 mt-2">
                                <img src={AppStore} alt="Apple App Store" className="w-full" />
                                <div className="text-3xl text-white  mt-3">Iphone</div>
                            </a>
                        </div>

                        <div className="flex gap-2 w-full items-center mt-4 text-white justify-center">
                            <ul className="block my-4 mb-0 flex-1 w-1/2">

                                <li className="flex items-center my-2">
                                    <FiCheckCircle className="text-custom-red mr-2" />
                                    Stream LIVE games
                                </li>
                                {/* <li className="flex items-center my-2">
                                <FiCheckCircle className="text-custom-red mr-2" />
                                Play 4 virtual leagues
                            </li> */}
                                <li className="flex items-center my-2">
                                    <FiCheckCircle className="text-custom-red mr-2" />
                                    Lighter and faster
                                </li>
                                <li className="flex items-center my-2">
                                    <FiCheckCircle className="text-custom-red mr-2" />
                                    Share betslip
                                </li>
                                {/* <li className="flex items-center my-2">
                                <FiCheckCircle className="text-custom-red mr-2" />
                                Light &amp; dark mode
                            </li> */}
                                <li className="flex items-center my-2">
                                    <FiCheckCircle className="text-custom-red mr-2" />
                                    Instant notifications
                                </li>
                            </ul>

                            <div className="d-block w-1/2 mt-4">
                                <img className="hero" src={AppBanner} alt="App Banner" />
                            </div>
                        </div>
                    </div>



                </div>

            </div>

        </>
    );
}

export default MobileApp;
