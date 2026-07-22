import React, { useEffect, Suspense, useContext } from "react";
import { createRoot } from 'react-dom/client';
import {
    BrowserRouter,
    Route,
    Routes,
} from 'react-router-dom'
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/css/application.css';
import './assets/css/tolkits.css';
import './assets/css/sidebar-menu.css';
import './assets/css/surecoin.css';
import './assets/css/surebox.css';
import './assets/css/skip-rope.css';
import './assets/css/jumprope.css';
import './assets/css/casino.css';
import './assets/css/header-search-overlay.css';
import './assets/css/bonanza-drawer.css';
import './assets/css/freebet-page.css';
import './assets/css/deposit-page.css';
import './assets/css/account-drawer.css';
import 'react-toastify/dist/ReactToastify.css'
import Store from './context/store';
import Index from './components/index';
import MatchAllMarkets from './components/all-markets';
import Jackpot from './components/jackpot';
import Live from './components/live';
import MyBets from './components/my-bets';
import HowToPlay from './components/pages/HowToPlay';
import TermsAndConditions from './components/pages/terms-and-conditions/index';
import CookiePolicy from './components/pages/cookie-policy/index';
import FAQs from "./components/pages/faqs";
import DisputeResolution from './components/pages/dispute-resolution/index';
import ResponsibleGambling from './components/pages/responsible-gambling';
import AntimoneyLaundering from './components/pages/anti-money-laundering';
import PrivacyPolicy from './components/pages/privacy-policy/index';
import Withdraw from './components/pages/deposit-withraw/Withdraw';
import Deposit from './components/pages/deposit-withraw/Deposit';
import Signup from './components/pages/signup';
import ResetPassword from './components/pages/auth/reset-password';
import VerifyAccount from './components/pages/auth/verify-account';
import MobileApp from './components/pages/app';
import ProtectedRoute from './components/utils/protected-route';
import Promotions from './components/pages/promotions/Promotions';
import FreeBetPage from './components/pages/freebet';
import Casino from './components/pages/casino/Casino';
import CheckDepositStatus from "./components/check-deposit-status";
import Exclude from "./components/pages/exclude";
import Login from './components/pages/login';
import LiveScore from './components/pages/livescore/LiveScore';
import Right from "./components/right/index";
import Footer from "./components/footer/footer";
import Header from "./components/header/header";
import Sidebar from "./components/sidebar/awesome/Sidebar";
import { Context } from './context/store';
import Logout from "./components/pages/auth/logout";
import ForgotPassword from "./components/pages/auth/forgot-password";
import SureCoin from "./components/pages/sure-coin";
import SureBoxIndex from "./components/pages/sure-box/surebox-index";
import SureboxMines from "./components/pages/sure-box/surebox-mines";
import SkipRopeIndex from "./components/pages/skip-rope/skiprope-index";
import JumpRopeIndex from "./components/pages/sure-jumprope/jumprope-index";
import CasinoLaunchedGame from "./components/pages/casino/casino-launched-game";
import CasinoHome from "./components/pages/casino/casino-home";
import ReactGA from "react-ga4";
import PageviewTracker from "./components/utils/pageview-tracker";
import { PromoTracker } from "./promo-tracker";
import PromoWins from "./components/pages/promo-wins";
import './index.css';
import LiveCasino from "./components/pages/casino/LiveCasino";
import CrashTerms from "./components/pages/terms-and-conditions/crash-terms";

const container = document.getElementById("app");

const App = () => {
    const [state,] = useContext(Context);

    useEffect(() => {
        ReactGA.initialize("G-P98WY6WH5S");
    }, []);

    return (
        <BrowserRouter>
            <PageviewTracker />
            <PromoTracker />
            <div className={`${(state?.casinolaunch || state?.surecoinlaunched) && "launched-casino-wrapper "} ${state?.hideBigIconNav && 'no-big-icon-nav'}`}>
                <Suspense fallback={<p></p>}>
                    {!state?.fullcasinoscreen && <Header />}
                    <div className={`${state?.fullcasinoscreen && "no-header"} amt `}>
                        <div className={`flex big-icon second-nav ck pc app-navbar app-header-nav`}>
                            {/* <HeaderNav/> */}
                        </div>
                        <div className={`${state?.casinolaunch ? "" : "diminish-mobile-row row"}`}>
                            {/* Conditional load live or otherwise */}
                            {!(state?.casinolaunch || state?.fullpagewidth || state?.surecoinlaunched) && <Sidebar />}
                            <div className={`${(state?.casinolaunch || state?.fullpagewidth || state?.surecoinlaunched) ? "" : `${state?.nosports ? "col-md-10 mx-auto y-scrollable-window" : "col-md-7 home mx-auto"}`}`}>
                                <Routes>
                                    <Route exact path="/casino" element={<Casino />} />
                                    <Route exact path="/live-casino" element={<LiveCasino />} />
                                    <Route exact path="/casino1" element={<CasinoHome />} />
                                    <Route exact path="/casino/:filterType" element={<Casino />} />
                                    <Route exact path="/casino/:filterType/:filterName" element={<Casino />} />
                                    <Route exact path="/casino/:filterType/:filterName/:item" element={<Casino />} />
                                    <Route exact path="/casino-game/:provider/:gameName" element={<CasinoLaunchedGame />} />
                                    <Route exact path="/casino-game/:provider/:gameName/sure-popular" element={<CasinoLaunchedGame />} />
                                    <Route exact path="/match/live/:id" element={<MatchAllMarkets live />} />
                                    <Route exact path="/match/:id" element={<MatchAllMarkets />} />
                                    <Route exact path="/jackpot" element={<Jackpot />} />
                                    <Route exact path="/live" element={<Live />} />
                                    <Route exact path="/live/:spid/" element={<Live />} />
                                    <Route exact path="/privacy-policy" element={<PrivacyPolicy />} />
                                    <Route exact path="/anti-money-laundering" element={<AntimoneyLaundering />} />
                                    <Route exact path="/responsible-gambling" element={<ResponsibleGambling />} />
                                    <Route exact path="/dispute-resolution" element={<DisputeResolution />} />
                                    <Route exact path="/cookie-policy" element={<CookiePolicy />} />
                                    <Route exact path="/faqs" element={<FAQs />} />
                                    <Route exact path="/terms-and-conditions" element={<TermsAndConditions />} />
                                    <Route exact path="/how-to-play" element={<HowToPlay />} />
                                    <Route exact path="/signup" element={<Signup />} />
                                    <Route exact path="/signup/:promoCode" element={<Signup />} />
                                    <Route exact path="/login" element={<Login />} />
                                    <Route exact path="/reset-password" element={<ResetPassword />} />
                                    <Route exact path="/forgot-password" element={<ForgotPassword />} />
                                    <Route exact path="/verify-account" element={<VerifyAccount />} />
                                    <Route exact path="/app" element={<MobileApp />} />
                                    <Route exact path="/betslip/share/:code" element={<Index />} />
                                    <Route exact path="/logout" element={<Logout />} />
                                    <Route path="/check-deposit-status" element={<CheckDepositStatus />} />
                                    <Route exact path="/exclude" element={<Exclude />} />
                                    <Route exact path="/surecoin" element={<SureCoin />} />
                                    <Route exact path="/surebox" element={<SureBoxIndex />} />
                                    <Route exact path="/surebox-mines" element={<SureboxMines />} />
                                    <Route exact path="/skip-rope" element={<SkipRopeIndex />} />
                                    <Route exact path="/jump-rope" element={<JumpRopeIndex />} />
                                    <Route exact path="/livescore" element={<LiveScore />} />
                                    <Route exact path="/promotions" element={<Promotions />} />
                                    {/* <Route exact path="/promotions-new" element={<PromotionsNew />} /> */}
                                    <Route exact path="/freebet" element={<FreeBetPage />} />
                                    <Route exact path="/crash-terms" element={<CrashTerms />} />
                                    <Route exact path="/deposit"
                                        element={<ProtectedRoute><Deposit /></ProtectedRoute>} />
                                    <Route exact path="/withdraw"
                                        element={<ProtectedRoute><Withdraw /></ProtectedRoute>} />
                                    <Route exact path="/my-bets"
                                        element={<ProtectedRoute><MyBets /> </ProtectedRoute>} />
                                    <Route exact path="/promo-wins"
                                        element={<ProtectedRoute><PromoWins /> </ProtectedRoute>} />

                                    {/* DEFAULT CUrrently the default component. Switch to INDEX when SPORTS AVAILABLE */}
                                    <Route path="*" element={<Index />} />

                                </Routes>
                            </div>
                            {!(state?.casinolaunch || state?.fullpagewidth || state?.surecoinlaunched) && <Right />}
                        </div>
                    </div>
                    {!state?.fullcasinoscreen && <Footer />}
                </Suspense>
            </div>
        </BrowserRouter>
    )


}



const root = createRoot(container); // createRoot(container!) if you use TypeScript
root.render(<Store><App /></Store>);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
