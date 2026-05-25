import React, { useEffect, useCallback, useState, useContext, useRef } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import { Context } from '../../context/store';
import { getFromLocalStorage, removeItem } from '../utils/local-storage';
import { ToastContainer } from 'react-toastify';
import makeRequest from '../utils/fetch-request';
import { setLocalStorage } from '../utils/local-storage';
import 'react-lazy-load-image-component/src/effects/blur.css';
import ShareModal from "../sharemodal";
import logo from '../../assets/img/logo.svg';
import { Navbar } from "react-bootstrap";
import MobileRightMenu from './mobile-right-menu';
import MobileLoggedInBals from './mobile-logged-in-bals';
import LoginModal from '../loginmodal';
import BigIconNav from './big-icon-nav';
import CheckMpesaDepositStatus from '../webmodals/check-mpesa-deposit-status';
import DepositModal from '../webmodals/deposit-modal';
import useInterval from "../../hooks/set-interval.hook";
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import socket from '../utils/socket-connect';
import HeaderNav from './header-nav';


const ProfileMenu = React.lazy(() => import('./profile-menu'));
const HeaderLogin = React.lazy(() => import('./top-login'));

const INACTIVITY_MS = 60 * 20 * 1000; // 1 hour

const Header = (props) => {
    const [user, setUser] = useState(getFromLocalStorage("user"));
    const [state, dispatch] = useContext(Context);
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const inactivityTimerRef = useRef(null);



    const NotifyToastContaner = () => {
        return <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
        />
    };


    useEffect(() => {
        handleTokenRefresh();
    }, []);

    const updateUserOnHistory = async () => {
        if (!user) {
            return;
        }

        let endpoint = "/user/balance";
        await makeRequest({ url: endpoint, method: "GET", api_version: 2 }).then(([_status, response]) => {
            if (_status == 200) {
                let u = { ...user, ...response?.data, bonus_balace: response?.data?.bonus };
                let prevUser = user;
                setUser(u);
                // check if still on deposit page and if has next url and navigate
                if (parseInt(prevUser?.balance) < parseInt(response?.data?.balance)) {
                    nextNavigate();
                }
                return
            }
        });
    };

    useInterval(async () => {
        if (user?.balance) {
            if (!socket.connected) {
                updateUserOnHistory()
            }
        }
    }, user ? 1000 * 60 : null);

    useInterval(async () => {
        const checkIfExpired = () => {
            try {
                const user = getFromLocalStorage("user");
                if (!user) {
                    setUser(null);
                    dispatch({ type: "DEL", key: "user" });
                    if (state?.showloginmodal == false) {
                        dispatch({ type: "SET", key: "showloginmodal", payload: true });
                    }
                }
                return false;
            } catch (err) {
                console.error("Expiry check failed:", err);
                return false;
            }
        };
        checkIfExpired();
    }, (1000 * 60 * 60))

    const handleTokenRefresh = () => {
        if (!user) {
            return false;
        }
        let endpoint = "/auth/token/refresh";
        let values = { refresh_token: user?.refresh_token }
        makeRequest({ url: endpoint, method: 'POST', data: values, api_version: 2 }).then(([status, response]) => {
            if (status == 200 || status == 201 || status == 204) {
                if (response.status == 200 || response.status == 201) {
                    setUser(response?.data);
                } else {
                    removeItem("user");
                    setUser(null);
                    dispatch({ type: "DEL", key: "user" });
                    dispatch({ type: "SET", key: "showloginmodal", payload: true });
                    dispatch({ type: "SET", key: "sessionMessage", payload: "User Session Expired. Please Login Again" })
                }
            } else {
                removeItem("user");
                setUser(null);
                dispatch({ type: "DEL", key: "user" });
                dispatch({ type: "SET", key: "showloginmodal", payload: true });
                dispatch({ type: "SET", key: "sessionMessage", payload: "User Session Expired. Please Login Again" })
            }
        })
    }

    useInterval(async () => {
        if (user) {
            handleTokenRefresh();
        };
    }, user ? 60 * 60 * 1000 * 7 : null);
    useEffect(() => {
        if (user) {
            setLocalStorage("user", user, 1000 * 60 * 60 * 24 * 7);
        }
    }, [user]);
    useEffect(() => {
        if (user) {
            if (socket.connected) {
                socket.emit('user.profile', user?.profile_id);
            }
            socket.on(`user#profile#${user?.profile_id}`, (data) => {
                setUser({ ...user, balance: data.balance, bonus_balance: data.bonus })
            });
        }
    }, [socket.connected, user])

    const nextNavigate = () => {
        const path = location.pathname
        const next = searchParams.get("next") || "/";
        if (path == "/deposit") {
            navigate(next)
        }

    }

    useEffect(() => {
        if (location.pathname == "/casino-game/eurovirtuals/virtual-league") {
            dispatch({ type: "SET", key: "hideBigIconNav", payload: true })
            removeItem("casinolaunch");
        } else {
            dispatch({ type: "DEL", key: "hideBigIconNav" })
        }
    }, [location.pathname])
    const expand = "md"
    // toggle bal requ every 7 seconds


    return (
        <>
            <Navbar expand="md" className="mb-0 ck pc os app-navbar top-nav" fixed="top" variant="dark" style={{ flexWrap: "wrap" }}>
                <div className="flex items-center md:!hidden w-full gap-2 bg-yellow-400 px-2 py-2">                    <div className="flex-1 text-black text-[10px] font-[500]">
                    Download the App and Enjoy bonuses of Upto 500!
                </div>

                    <Link
                        to="/app"
                        className="
                        bg-pink-700 px-3 py-2 
                        rounded-md text-[10px] 
                        font-bold flex 
                        items-center justify-center"
                    >
                        Download Now
                    </Link>
                </div>
                <div className='main-header-top w-full px-2 py-2  md:!p-0'>
                    <Container fluid className={'d-flex justify-content-between mobile-change'}>

                        <div className="e col-md-5 col-sm-6 logo align-self-start  items-center pl-0" title="betmundial">
                            <a className="mt-2 inline-block" href="/" style={{ display: "inline-block" }}>
                                <img src={logo} alt="betmundial" title="betmundial" effects="blur" style={{ height: "auto" }} className="w-[220px]" />
                            </a>
                        </div>

                        <div className="col-md-7 col-sm-6" id="navbar-collapse-main">
                            {/* {user ? <ProfileMenu user={user}/> : <HeaderLogin setUser={setUser}/>} */}
                            <div className="flex justify-end">
                                <HeaderNav />
                                {user ? <ProfileMenu user={user} /> : <HeaderLogin setUser={setUser} />}
                            </div>
                        </div>

                    </Container>
                </div>

                <div className={`block w-full ${state?.hideBigIconNav && 'hidden'}`}><BigIconNav /></div>
            </Navbar >

            {/* mobile bottom menu */}


            {/* Only show if they are visible/third nav is available */}




            <ShareModal shown={state?.showsharemodal == false} />

            <LoginModal setUser={setUser} />
            <CheckMpesaDepositStatus />
            <DepositModal />
        </>

    )
}

export default React.memo(Header);
