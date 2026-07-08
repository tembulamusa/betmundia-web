import React, { useRef, useState, useEffect, useContext } from "react";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ListGroup from 'react-bootstrap/ListGroup';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { MdOutlineKeyboardArrowLeft, MdOutlineKeyboardArrowRight } from "react-icons/md";
import { FaHeart, FaTrophy } from 'react-icons/fa';
import { Context } from "../../context/store";
import DefaultImg from "../../assets/img/colorsvgicons/soccer.svg";
import logo from "../../assets/img/logo.svg";
import { getFromLocalStorage, setLocalStorage } from "../utils/local-storage";


const BigIconMenu = () => {
    const { pathname } = useLocation();
    const scrollContainerRef = useRef(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);
    const [state, dispatch] = useContext(Context);
    const [categories, setCategories] = useState([]);
    const [casinoProviders, setCasinoProviders] = useState([]);
    const [showBonanza, setShowBonanza] = useState(false);
    const bonanzaParticipants = 20;
    const navigate = useNavigate();
    const loc = useLocation();
    const excludedProviderList = ["unicraft"];

    const handleBonanzaOpen = () => setShowBonanza(true);
    const handleBonanzaClose = () => setShowBonanza(false);

    const bonanzaLeaderboard = [
        { rank: 1, player: 'LuckyAce', points: 245680.75, wager: 125420, netWin: 18250, games: 1254 },
        { rank: 2, player: 'SpinMaster88', points: 189450.20, wager: 98750, netWin: 12890, games: 982 },
        { rank: 3, player: 'Royal777', points: 153320.10, wager: 75310, netWin: 9430, games: 745 },
        { rank: 4, player: 'HighRoller', points: 120550.35, wager: 61250, netWin: 7650, games: 612 },
        { rank: 5, player: 'QueenOfSlots', points: 98765.80, wager: 50120, netWin: 6230, games: 501 },
    ];

    const linkItems = [
        { name: "world cup", icon: "world cup.svg", link: "/sports/competition/matches?id=18585", parentTo: null, bubble: "HOT" },
        { name: "live", icon: "livescore.svg", link: "/live", parentTo: null },
        { name: "jackpot", icon: "jackpot.svg", link: "/jackpot", parentTo: null },
        { name: "aviator", icon: "aviator.svg", link: "/casino-game/spribe/aviator", parentTo: null, bubble: "HOT" },
        { name: "jet x", icon: "jetx.svg", link: "/casino-game/smartsoft/jetx", parentTo: null, bubble: "new" },
        // {name: "surecoin", icon:"surecoin.svg", link:"/surecoin", parentTo:null},
        // {name: "surebox", icon:"virtuals.svg", link:"/surebox", parentTo:null},
        //These next 3 Links did not exist before we removed SPORTS
        { name: "aviatrix", icon: "aviatrix.svg", link: "/casino-game/aviatrix/aviatrix", parentTo: null, bubble: "Hot" },
        // {name: "numbers", icon:"numbers.svg", link:"/numbers", parentTo:null},
        { name: "mundial league", icon: "mundial-league.svg", link: "/casino-game/unicraft/mundial-league", parentTo: null, bubble: "new" },
        { name: "casino", icon: "casino.svg", link: "/casino", parentTo: null },
        { name: "Crash", icon: "crash.svg", link: "/casino/categories/Crash", parentTo: null, bubble: "new" },
        // { name: "sports", icon: "sports.svg", link: '/sports', parentTo: "sportscategories" },
        // {name: "virtuals", icon:"virtuals.svg", link:"/virtuals", parentTo:null},
        { name: "promotions", icon: "promos.svg", link: "/promotions", parentTo: null },
        // { name: "app", icon: "app.svg", link: "/app", parentTo: null },
        { name: "livescore", icon: "livescore.svg", link: "https://statshub.sportradar.com/betmundialsmts/en/sport/1/tournament/17", parentTo: null },
        // {name: "basketball", icon:"basketball.svg", link:"/#basketball", parentTo:null},
        // {name: "cricket", icon:"cricket.svg", link:"/#cricket", parentTo:null},
        // {name: "tennis", icon:"tennis.svg", link:"/#tennis", parentTo:null},       
        // {name: "rugby", icon:"rugby.svg", link:"/#rugby", parentTo:null},
        // {name: "ice hockey", icon:"icehockey.svg", link:"/#icehockey", parentTo:null},
        // {name: "aussie rules", icon:"aussie.svg", link:"/#aussie", parentTo:null},
        // {name: "a.football", icon:"americanfootball.svg", link:"/#afootball", parentTo:null},
        // {name: "darts", icon:"darts.svg", link:"/#darts", parentTo:null},
        // {name: "boxing", icon:"boxing.svg", link:"/#boxing", parentTo:null},
        // {name: "handball", icon:"handball.svg", link:"/#handball", parentTo:null},        
        // {name: "baseball", icon:"baseball.svg", link:"/#baseball", parentTo:null},
        // {name: "volleyball", icon:"volleyball.svg", link:"/#volleyball", parentTo:null},
        // {name: "mma", icon:"mma.svg", link:"/#mma", parentTo:null},
        // {name: "floorball", icon:"floorball.svg", link:"/#floorball", parentTo:null},
        // {name: "print", icon:"print.svg", link:"/print-matches", parentTo:null},
    ]


    const filterGames = (filterName, filterItem) => {
        let payload = { filterType: "provider", provider: filterItem }
        if (filterName == "provider") {
            if (filterItem?.name.toLowerCase() == "surecoin") {
                navigate("/surecoin")
            } else if (["eurovirtuals", "aviator"].includes(filterItem?.name.toLowerCase())) {
                dispatch({ type: "SET", key: "casinolaunch", payload: { game: '', url: '' } });
                setLocalStorage("casinolaunch", { game: '', url: '' })
                if (!getFromLocalStorage("user")) {
                    dispatch({ type: "SET", key: "showloginmodal", payload: true })
                    return
                } else {
                    let associativeLinks = { aviator: "aviator/aviator", eurovirtuals: "eurovirtuals/virtual-league" }
                    window.location.href = `/casino-game/${associativeLinks[filterItem?.name.toLowerCase()]}`;

                }
            } else {
                setLocalStorage("casinogamesfilter", payload);
                dispatch({ type: "SET", key: "casinogamesfilter", payload: payload });
                navigate(`/casino/providers/${filterItem?.name}`);
            }

        }
    }


    // const CasinoProviders = (props) => {

    //     return (
    //         <>
    //             {casinoProviders?.map((provider, idx) => {
    //                 return (
    //                     provider?.name.toLowerCase() !== "aviatrix" && <li key={idx} className={`cursor-pointer ${loc?.pathname?.includes(provider?.name) ? "active" : ''} big-icon-item text-center capitalize`}
    //                         onClick={() => filterGames("provider", provider)}
    //                     >
    //                         <span title={provider?.name}>
    //                             <div className="big-icon-icon"><img className="mx-auto" src={getSportImageIcon(`${provider?.name?.toLowerCase()}.svg`, "casino")} alt={provider?.name} /></div>
    //                             <div className="big-icon-name">{provider.name == 'Eurovirtuals'?'Ligi Sure':provider.name}</div>
    //                         </span>
    //                     </li>
    //                 )
    //             })}
    //         </>
    //     )
    // }

    const CasinoProviders = (props) => {
        return (
            <>
                {casinoProviders?.map((provider, idx) => {
                    const isLigiSure = provider?.name === 'Eurovirtuals';
                    const providerNameLower = provider?.name?.toLowerCase();
                    return (
                        <li
                            key={idx}
                            className={`cursor-pointer ${loc?.pathname?.includes(provider?.name) ? "active" : ''} big-icon-item text-center capitalize relative`}
                            onClick={() => filterGames("provider", provider)}
                        >
                            <span title={provider?.name} className="relative inline-block">
                                <div className="big-icon-icon">
                                    <img
                                        className="mx-auto"
                                        src={getSportImageIcon(`${providerNameLower}.svg`, "casino")}
                                        alt={provider?.name}
                                    />
                                </div>
                                <div className="big-icon-name">
                                    {isLigiSure ? 'Ligi Sure' : provider.name}
                                </div>
                                {isLigiSure && (
                                    <span
                                        className="new-alert-badge absolute top-0 right-0 bg-custom-red text-white text-xs px-1 rounded"
                                        style={{ transform: 'translate(50%, -50%)' }}
                                    >
                                        New
                                    </span>
                                )}
                            </span>
                        </li>
                    );
                })}
            </>
        );
    };


    const getSportImageIcon = (sport_name, iconGroup = null) => {
        let sport_image;
        try {
            //sport_image = require(`../../assets/img/svgicons/${sport_name}`);
            if (iconGroup == "casino") {
                sport_image = require(`../../assets/img/casino/icons/${sport_name}`)
            } else {
                sport_image = require(`../../assets/img/colorsvgicons/${sport_name || 'soccer.svg'}`);
            }
        } catch (error) {
            sport_image = DefaultImg;
        }
        return sport_image;
    };

    const handleScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setShowLeftArrow(scrollLeft > 0);
            setShowRightArrow(scrollLeft + clientWidth < scrollWidth);
        }
    };

    const scrollLeft = () => {
        scrollContainerRef.current?.scrollBy({ left: -150, behavior: 'smooth' });
    };

    const scrollRight = () => {
        scrollContainerRef.current?.scrollBy({ left: 150, behavior: 'smooth' });
    };

    useEffect(() => {
        handleScroll(); // Initial check
        const refCurrent = scrollContainerRef.current;
        refCurrent?.addEventListener('scroll', handleScroll);
        return () => refCurrent?.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const providers = state?.casinofilters?.providers || [];

        const filteredProviders = providers.filter(provider =>
            !excludedProviderList.includes(provider?.name?.toLowerCase())
        );

        setCasinoProviders(filteredProviders);
    }, [state?.casinofilters])

    useEffect(() => {
        if (state?.categories && state?.categories instanceof Array) {
            {/* NO SPORTS CURRENTLY. UNCOMMENT WHEN AVAILABLE */ }
            setCategories(state?.categories);
        }
    }, [state?.categories])

    useEffect(() => {
        const competitionId = 18585;
        const isCompetitionMatchesPage =
            loc?.pathname?.includes("/sports/competition/matches") &&
            loc?.search?.includes(`id=${competitionId}`);

        if (isCompetitionMatchesPage && state?.filtercompetition?.competition_id !== competitionId) {
            dispatch({ type: "SET", key: "filtersport", payload: { sport_id: 79, sport_name: "soccer", default_market: 1 } });
            dispatch({
                type: "SET",
                key: "filtercompetition",
                payload: { competition_id: competitionId },
            });
        }
    }, [loc?.pathname, loc?.search, state?.filtercompetition?.competition_id, dispatch]);

    const changeUserSelection = (category) => {
        dispatch({ type: "SET", key: "filtersport", payload: category });
        setLocalStorage("filtersport", category, 5 * 60 * 1000)
    }
    const prizePool = "KES 25,000,000";
    const drawerUpdateInterval = "Updates every 5 seconds";

    const BonanzaDrawer = () => (
        <Offcanvas
            placement="start"
            show={showBonanza}
            onHide={handleBonanzaClose}
            className="bonanza-drawer"
            style={{ zIndex: 11000, width: '560px', maxWidth: '100%' }}
        >
            <Offcanvas.Header closeButton className="bonanza-header-panel">
                <div className="bonanza-header-top">
                    <img src={logo} alt="Betmundial" className="bonanza-logo" />
                    <div className="bonanza-badge">Bonanza</div>
                </div>
            </Offcanvas.Header>
            <Offcanvas.Body className="bonanza-body">
                <div className="bonanza-content">
                    <div className="bonanza-hero">
                        <div className="bonanza-hero-left">
                            <div className="bonanza-hero-visual">
                                <div className="bonanza-trophy">
                                    <FaTrophy />
                                </div>
                            </div>
                            <div className="bonanza-hero-copy">
                                <div className="bonanza-hero-headline">
                                    <h2 className="bonanza-title-main">CHAMPIONS</h2>
                                    <div className="bonanza-subtitle">LEADERBOARD</div>
                                </div>
                                <p className="bonanza-hero-text">Compete. Play. Win Big!</p>
                                <div className="bonanza-hero-meta">
                                    <span>01 May 2025 00:00 – 31 May 2025 23:59 (EAT)</span>
                                    <span>{drawerUpdateInterval}</span>
                                </div>
                            </div>
                        </div>
                        <div className="bonanza-prize-card">
                            <div className="bonanza-prize-label">Total Prize Pool</div>
                            <div className="bonanza-prize-value">{prizePool}</div>
                            <div className="bonanza-prize-caption">Prize details are updated live and shown in KES.</div>
                            <button type="button" className="bonanza-prize-action">Prize details</button>
                        </div>
                    </div>

                    <div className="bonanza-metrics">
                        <div className="bonanza-metric-card">
                            <div className="metric-label">Participants</div>
                            <div className="metric-value">12,458</div>
                        </div>
                        <div className="bonanza-metric-card">
                            <div className="metric-label">Your Rank</div>
                            <div className="metric-value">24</div>
                        </div>
                        <div className="bonanza-metric-card">
                            <div className="metric-label">Your Points</div>
                            <div className="metric-value">8,350.45</div>
                        </div>
                        <div className="bonanza-metric-card">
                            <div className="metric-label">Time Left</div>
                            <div className="metric-value">12d 14h 32m 45s</div>
                        </div>
                    </div>

                    <div className="bonanza-table-wrapper">
                        <div className="bonanza-table">
                            <div className="bonanza-row bonanza-row-head">
                                <span>Rank</span>
                                <span>Player</span>
                                <span>Points</span>
                                <span>Total Wager</span>
                                <span>Net Win</span>
                                <span>Games Played</span>
                            </div>
                            {bonanzaLeaderboard.map((row) => (
                                <div key={row.rank} className="bonanza-row">
                                    <span className="rank-badge">{row.rank}</span>
                                    <span className="player-cell">
                                        <span className="player-avatar">{row.player.charAt(0)}</span>
                                        <span className="player-name">{row.player}</span>
                                        {row.rank <= 3 && <span className="player-tag">VIP</span>}
                                    </span>
                                    <span>{row.points.toLocaleString()}</span>
                                    <span>KES {row.wager.toLocaleString()}</span>
                                    <span>KES {row.netWin.toLocaleString()}</span>
                                    <span>{row.games}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bonanza-summary">
                    <div className="summary-position-card">
                        <div className="position-label">Your Position</div>
                        <div className="position-value">24</div>
                    </div>
                    <div className="summary-player">
                        <div className="summary-avatar">P</div>
                        <div className="summary-details">
                            <div className="summary-title">PlayerOne</div>
                            <div className="summary-status"><span className="status-dot" />Active</div>
                        </div>
                    </div>
                    <div className="summary-stat">
                        <div className="summary-label">Your Points</div>
                        <div className="summary-value">8,350.45</div>
                    </div>
                    <div className="summary-stat">
                        <div className="summary-label">Total Wager (KES)</div>
                        <div className="summary-value">KES 4,520.00</div>
                    </div>
                    <div className="summary-stat">
                        <div className="summary-label">Net Win (KES)</div>
                        <div className="summary-value net-win">KES 720.00</div>
                    </div>
                    <div className="summary-stat">
                        <div className="summary-label">Games Played</div>
                        <div className="summary-value">68</div>
                    </div>
                </div>
            </Offcanvas.Body>
        </Offcanvas>
    );

    return (
        <div className="relative flex items-center big-icon-container">
            {/* <div className="bonanza-trigger" onClick={handleBonanzaOpen} title="Bonanza">
                <div className="bonanza-trigger-top">
                    <span>Bonanza</span>
                    <span className="bonanza-trigger-count">({bonanzaParticipants})</span>
                </div>
                <div className="bonanza-trigger-label">Leaderboards</div>
            </div> */}

            {showLeftArrow && (
                <div className="big-icon-arrows left cursor-pointer" onClick={scrollLeft}>
                    <MdOutlineKeyboardArrowLeft className="text-white" />
                </div>
            )}

            <div
                ref={scrollContainerRef}
                className="flex overflow-x-auto space-x-4 big-icon-scrollbar-hide"
            // style={{ maxWidth: '100%', paddingLeft: '120px', backgroundColor: 'transparent' }}
            >
                <ListGroup as="ul" horizontal className="flex space-x-4 big-icon-list">
                    <li key={"home-menu-item"} className={`${pathname === "/" || pathname === "/home" ? "active" : ''} big-icon-item text-center capitalize`}>
                        <a href={"/"} title={"home"}>
                            <div className="big-icon-icon"><img className="mx-auto" src={getSportImageIcon("home.svg")} alt={"home"} /></div>
                            <div className="big-icon-name">{"Home"}</div>
                        </a>
                    </li>
                    {(linkItems || []).map((item, idx) => {
                        const isActive = item.link && pathname === item.link;
                        const itemClasses = `${isActive ? "active" : ''} big-icon-item text-center capitalize relative`;
                        const iconContent = item.icon ? (
                            <img className="mx-auto" src={getSportImageIcon(item.icon)} alt={item.name} />
                        ) : (
                            <FaHeart className="mx-auto text-white" style={{ fontSize: '24px' }} />
                        );

                        if (item?.action === "bonanza") {
                            return (
                                <li key={idx} className={`${itemClasses} bonanza-item`} onClick={handleBonanzaOpen} title="Bonanza" style={{ cursor: 'pointer' }}>
                                    <div className="bonanza-item-icon">
                                        <FaTrophy />
                                    </div>
                                    <div className="bonanza-item-content">
                                        <div className="bonanza-item-title">Bonanza</div>
                                        <div className="bonanza-item-subtitle">Leaderboard ({item.participants})</div>
                                    </div>
                                </li>
                            );
                        }

                        return (
                            <li key={idx} className={itemClasses}>
                                {item?.name.toLowerCase() === "livescore" ? (
                                    <a href={item.link} title={item.name} target="_blank" rel="noopener noreferrer">
                                        <div className="big-icon-icon relative">
                                            {iconContent}

                                            {item?.bubble && (
                                                <span className="big-icon-bubble">
                                                    {item.bubble}
                                                </span>
                                            )}
                                        </div>

                                        <div className="big-icon-name">{item.name}</div>
                                    </a>
                                ) : (
                                    <Link to={item.link} title={item.name}>
                                        <div className="big-icon-icon relative">
                                            {iconContent}

                                            {item?.bubble && (
                                                <span className="big-icon-bubble">
                                                    {item.bubble}
                                                </span>
                                            )}
                                        </div>
                                        <div className="big-icon-name">{item.name}</div>
                                    </Link>
                                )}
                            </li>
                        );
                    })}

                    {(!loc?.pathname?.includes("/casino") && categories || []).map((category, idx) => {

                        return (
                            <li onClick={() => changeUserSelection(category)} key={idx} className={`${pathname == `/sports/matches/${category?.sport_id}` ? "active" : ''} big-icon-item text-center capitalize`}>
                                <Link to={`/sports/matches/${category?.sport_id}?sportId=${category?.sport_id}`} title={category?.sport_name}>
                                    <div className="big-icon-icon"><img className="mx-auto" src={getSportImageIcon(`${category?.sport_name?.toLowerCase()}.svg`)} alt={category.sport_name} /></div>
                                    <div className="big-icon-name">{category.sport_name}</div>
                                </Link>
                            </li>
                        )
                    }
                    )}
                    {(loc?.pathname?.includes("/casino")) && <CasinoProviders />}
                </ListGroup>
            </div>

            {showRightArrow && (
                <div className="big-icon-arrows right cursor-pointer" onClick={scrollRight}>
                    <MdOutlineKeyboardArrowRight className="text-white" />
                </div>
            )}

            <BonanzaDrawer />
        </div>
    );
};

export default React.memo(BigIconMenu);
