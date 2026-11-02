import React, { useEffect, Suspense, useContext } from "react";
import { createRoot } from 'react-dom/client';
import {
    BrowserRouter,
    Navigate,
    Route,
    Routes,
    useLocation,
} from 'react-router-dom'
import reportWebVitals from './reportWebVitals';
import Spinner from 'react-bootstrap/Spinner';
import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/css/application.css';
import './assets/css/tolkits.css';
import './assets/css/sidebar-menu.css';
import './assets/css/header-search-overlay.css';
import './assets/css/bonanza-drawer.css';
import './assets/css/account-drawer.css';
import './assets/css/site-footer.css';
import './assets/css/mobile-bottom-nav.css';
import 'react-toastify/dist/ReactToastify.css'
import Store from './context/store';
import ProtectedRoute from './components/utils/protected-route';
import Right from "./components/right/index";
import Footer from "./components/footer/footer";
import Header from "./components/header/header";
import MobileBottomNav from "./components/header/mobile-bottom-nav";
import Sidebar from "./components/sidebar/awesome/Sidebar";
import { Context } from './context/store';
import ReactGA from "react-ga4";
import PageviewTracker from "./components/utils/pageview-tracker";
import { PromoTracker } from "./promo-tracker";
import useIpAddress from './hooks/use-ip-address';
import { scheduleIdle } from './components/utils/defer-idle';
import { startDeferredThirdParty } from './components/utils/deferred-third-party';
import './index.css';
import './assets/css/mobile-top-bar.css';

// Route-level code splitting — shell (Header/Sidebar/Right/Footer/nav) stays eager.
const Index = React.lazy(() => import('./components/index'));
const MatchAllMarkets = React.lazy(() => import('./components/all-markets'));
const Jackpot = React.lazy(() => import('./components/jackpot'));
const Survivor = React.lazy(() => import('./components/survivor'));
const Live = React.lazy(() => import('./components/live'));
const MyBets = React.lazy(() => import('./components/my-bets'));
const HowToPlay = React.lazy(() => import('./components/pages/HowToPlay'));
const TermsAndConditions = React.lazy(() => import('./components/pages/terms-and-conditions/index'));
const CookiePolicy = React.lazy(() => import('./components/pages/cookie-policy/index'));
const FAQs = React.lazy(() => import("./components/pages/faqs"));
const DisputeResolution = React.lazy(() => import('./components/pages/dispute-resolution/index'));
const ResponsibleGambling = React.lazy(() => import('./components/pages/responsible-gambling'));
const AntimoneyLaundering = React.lazy(() => import('./components/pages/anti-money-laundering'));
const PrivacyPolicy = React.lazy(() => import('./components/pages/privacy-policy/index'));
const Withdraw = React.lazy(() => import('./components/pages/deposit-withraw/Withdraw'));
const Deposit = React.lazy(() => import('./components/pages/deposit-withraw/Deposit'));
const Signup = React.lazy(() => import('./components/pages/signup'));
const ResetPassword = React.lazy(() => import('./components/pages/auth/reset-password'));
const VerifyAccount = React.lazy(() => import('./components/pages/auth/verify-account'));
const Promotions = React.lazy(() => import('./components/pages/promotions/Promotions'));
const FreeBetPage = React.lazy(() => import('./components/pages/freebet'));
const Casino = React.lazy(() => import('./components/pages/casino/Casino'));
const CheckDepositStatus = React.lazy(() => import("./components/check-deposit-status"));
const Exclude = React.lazy(() => import("./components/pages/exclude"));
const Login = React.lazy(() => import('./components/pages/login'));
const LiveScore = React.lazy(() => import('./components/pages/livescore/LiveScore'));
const Logout = React.lazy(() => import("./components/pages/auth/logout"));
const ForgotPassword = React.lazy(() => import("./components/pages/auth/forgot-password"));
const SureCoin = React.lazy(() => import("./components/pages/sure-coin"));
const SureBoxIndex = React.lazy(() => import("./components/pages/sure-box/surebox-index"));
const SureboxMines = React.lazy(() => import("./components/pages/sure-box/surebox-mines"));
const SkipRopeIndex = React.lazy(() => import("./components/pages/skip-rope/skiprope-index"));
const JumpRopeIndex = React.lazy(() => import("./components/pages/sure-jumprope/jumprope-index"));
const CasinoLaunchedGame = React.lazy(() => import("./components/pages/casino/casino-launched-game"));
const CasinoHome = React.lazy(() => import("./components/pages/casino/casino-home"));
const PromoWins = React.lazy(() => import("./components/pages/promo-wins"));
const LiveCasino = React.lazy(() => import("./components/pages/casino/LiveCasino"));
const CrashTerms = React.lazy(() => import("./components/pages/terms-and-conditions/crash-terms"));
const AffiliateTerms = React.lazy(() => import("./components/pages/affiliate-terms"));
const ReactivateAccount = React.lazy(() => import("./components/pages/reactivate-account"));
const LoyaltyPointsHowToUse = React.lazy(() => import("./components/pages/loyalty-points"));

const RouteFallback = () => (
    <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: 180 }} aria-busy="true">
        <Spinner animation="border" role="status" variant="light" size="sm">
            <span className="visually-hidden">Loading…</span>
        </Spinner>
    </div>
);

const container = document.getElementById("app");

const AppShell = () => {
    const [state,] = useContext(Context);
    const { pathname } = useLocation();
    const launchedCasino = !!(
        state?.casinolaunch ||
        state?.surecoinlaunched ||
        pathname.startsWith("/casino-game/")
    );
    const hideSideChrome = !!(launchedCasino || state?.fullpagewidth);

    useIpAddress();

    useEffect(() => {
        const cancelGa = scheduleIdle(() => {
            ReactGA.initialize("G-P98WY6WH5S");
        }, 2000);
        const cancelThird = startDeferredThirdParty();
        return () => {
            cancelGa();
            cancelThird();
        };
    }, []);

    return (
            <div className={`${launchedCasino && "launched-casino-wrapper "} ${state?.hideBigIconNav && 'no-big-icon-nav'}`}>
                {!state?.fullcasinoscreen && <Header />}
                <div className={`${state?.fullcasinoscreen && "no-header"} amt `}>
                    <div className={`flex big-icon second-nav ck pc app-navbar app-header-nav`}>
                        {/* <HeaderNav/> */}
                    </div>
                    <div className={`${launchedCasino ? "" : "diminish-mobile-row row"}`}>
                        {!hideSideChrome && <Sidebar />}
                        <div className={`${hideSideChrome ? "" : `${state?.nosports ? "col-md-10 mx-auto y-scrollable-window" : "col-md-7 home mx-auto"}`}`}>
                            <Suspense fallback={<RouteFallback />}>
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
                                    <Route exact path="/jackpots" element={<Jackpot />} />
                                    <Route exact path="/jackpot" element={<Jackpot />} />
                                    <Route exact path="/survivor" element={<Survivor />} />
                                    <Route exact path="/survivor/:id" element={<Survivor />} />
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
                                    <Route exact path="/reactivate-account" element={<ReactivateAccount />} />
                                    <Route exact path="/loyalty-points" element={<LoyaltyPointsHowToUse />} />
                                    <Route exact path="/reset-password" element={<ResetPassword />} />
                                    <Route exact path="/forgot-password" element={<ForgotPassword />} />
                                    <Route exact path="/verify-account" element={<VerifyAccount />} />
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
                                    <Route exact path="/freebet" element={<FreeBetPage />} />
                                    <Route exact path="/crash-terms" element={<CrashTerms />} />
                                    <Route exact path="/affiliate-terms" element={<AffiliateTerms />} />
                                    <Route exact path="/deposit"
                                        element={<ProtectedRoute><Deposit /></ProtectedRoute>} />
                                    <Route exact path="/withdraw"
                                        element={<ProtectedRoute><Withdraw /></ProtectedRoute>} />
                                    <Route exact path="/my-bets"
                                        element={<ProtectedRoute><MyBets /> </ProtectedRoute>} />
                                    <Route exact path="/affiliate"
                                        element={<ProtectedRoute><PromoWins /> </ProtectedRoute>} />
                                    <Route exact path="/promo-wins"
                                        element={<Navigate to="/affiliate" replace />} />

                                    <Route path="*" element={<Index />} />

                                </Routes>
                            </Suspense>
                        </div>
                        {!hideSideChrome && <Right />}
                    </div>
                </div>
                {!state?.fullcasinoscreen && <Footer />}
                <MobileBottomNav />
            </div>
    );
};

const App = () => {
    return (
        <BrowserRouter>
            <PageviewTracker />
            <PromoTracker />
            <AppShell />
        </BrowserRouter>
    );
}




const root = createRoot(container); // createRoot(container!) if you use TypeScript
root.render(<Store><App /></Store>);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
