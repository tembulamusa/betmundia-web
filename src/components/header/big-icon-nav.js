import React, { useRef, useState, useEffect, useContext } from "react";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ListGroup from 'react-bootstrap/ListGroup';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { MdOutlineKeyboardArrowLeft, MdOutlineKeyboardArrowRight } from "react-icons/md";
import {
    FaHeart,
    FaTrophy,
    FaCrown,
    FaCalendarAlt,
    FaGift,
    FaChevronRight,
    FaChevronDown,
    FaChevronUp,
    FaUsers,
    FaStar,
    FaCoins,
    FaChartLine,
    FaInfoCircle,
} from 'react-icons/fa';
import { Context } from "../../context/store";
import DefaultImg from "../../assets/img/colorsvgicons/soccer.svg";
import logo from "../../assets/img/logo.svg";
import bonanzaTrophyHero from "../../assets/img/bonanza-trophy-hero.svg";
import { getFromLocalStorage, setLocalStorage } from "../utils/local-storage";

const EXCLUDED_PROVIDERS = ["unicraft"];

const BigIconMenu = () => {
    const { pathname } = useLocation();
    const scrollContainerRef = useRef(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);
    const [state, dispatch] = useContext(Context);
    const [categories, setCategories] = useState([]);
    const [casinoProviders, setCasinoProviders] = useState([]);
    const [showBonanza, setShowBonanza] = useState(false);
    const navigate = useNavigate();
    const loc = useLocation();

    const handleBonanzaOpen = () => setShowBonanza(true);
    const handleBonanzaClose = () => setShowBonanza(false);
    const userRowRef = useRef(null);

    const CURRENT_USER_RANK = 24;
    const currentBonanzaUser = {
        rank: CURRENT_USER_RANK,
        player: 'PlayerOne',
        points: 8350.45,
        wager: 4520,
        netWin: 720,
        games: 68,
        avatarHue: 350,
        isCurrentUser: true,
    };

    const bonanzaTopPlayers = [
        { rank: 1, player: 'LuckyAce', points: 245680.75, wager: 125420, netWin: 18250, games: 1254, avatarHue: 320 },
        { rank: 2, player: 'SpinMaster88', points: 189450.20, wager: 98750, netWin: 12890, games: 982, avatarHue: 210 },
        { rank: 3, player: 'Royal777', points: 153320.10, wager: 75310, netWin: 9430, games: 745, avatarHue: 45 },
        { rank: 4, player: 'HighRoller', points: 120550.35, wager: 61250, netWin: 7650, games: 612, avatarHue: 160 },
        { rank: 5, player: 'QueenOfSlots', points: 98765.80, wager: 50120, netWin: 6230, games: 501, avatarHue: 280 },
        { rank: 6, player: 'BetKing99', points: 85420.15, wager: 44800, netWin: 5120, games: 448, avatarHue: 15 },
        { rank: 7, player: 'DiamondPlay', points: 72100.60, wager: 38950, netWin: 4380, games: 390, avatarHue: 195 },
        { rank: 8, player: 'MegaWinner', points: 65880.25, wager: 33200, netWin: 3950, games: 332, avatarHue: 120 },
    ];

    const bonanzaFillerNames = [
        'AceHunter', 'SlotNinja', 'WagerWolf', 'JackpotJoe', 'TurboSpin',
        'NightKing', 'GoldRush', 'BetBaron', 'ChipChamp', 'RollMaster',
        'CashCraze', 'WinStreak', 'LuckyLion', 'PrizePilot', 'VaultVIP',
        'NeonBet', 'StormSpin', 'BlazeBet', 'CoinCrown', 'RoyalRush',
        'SwiftStake', 'PrimePick', 'EliteEdge', 'FlashFortune', 'GrandGamer',
        'TopTier', 'MaxBet', 'PowerPlay', 'SureShot', 'WildWin',
        'StackStar', 'MintMove', 'PeakPunter', 'RapidRoll', 'SharpSpin',
        'TurboTier', 'UltraBet', 'VividVault', 'ZenithZone',
    ];

    const buildBonanzaLeaderboard = () => {
        const entries = [...bonanzaTopPlayers];

        for (let rank = 9; rank < CURRENT_USER_RANK; rank += 1) {
            const index = rank - 9;
            const factor = 1 - (index * 0.035);
            entries.push({
                rank,
                player: bonanzaFillerNames[index] || `Rival${rank}`,
                points: Math.round((62000 * factor + index * 137) * 100) / 100,
                wager: Math.round(34000 * factor - index * 420),
                netWin: Math.round(3600 * factor - index * 55),
                games: Math.round(320 * factor - index * 4),
                avatarHue: (rank * 37) % 360,
            });
        }

        entries.push(currentBonanzaUser);

        for (let rank = CURRENT_USER_RANK + 1; rank <= 60; rank += 1) {
            const index = rank - CURRENT_USER_RANK - 1;
            const factor = 0.92 - (index * 0.018);
            entries.push({
                rank,
                player: bonanzaFillerNames[index + 15] || `Challenger${rank}`,
                points: Math.round((7800 * factor - index * 95) * 100) / 100,
                wager: Math.round(4200 * factor - index * 48),
                netWin: Math.round(680 * factor - index * 9),
                games: Math.round(64 * factor - index * 0.8),
                avatarHue: (rank * 29) % 360,
            });
        }

        return entries;
    };

    const bonanzaLeaderboard = buildBonanzaLeaderboard();

    const formatBonanzaNumber = (value) => Number(value).toLocaleString('en-US', {
        minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
        maximumFractionDigits: 2,
    });

    const getRankTrophy = (rank) => {
        if (rank === 1) return <FaTrophy className="bonanza-rank-trophy gold" aria-hidden="true" />;
        if (rank === 2) return <FaTrophy className="bonanza-rank-trophy silver" aria-hidden="true" />;
        if (rank === 3) return <FaTrophy className="bonanza-rank-trophy bronze" aria-hidden="true" />;
        return <span className="bonanza-rank-number">{rank}</span>;
    };

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
        if (!showBonanza) return undefined;

        const timer = setTimeout(() => {
            userRowRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }, 280);

        return () => clearTimeout(timer);
    }, [showBonanza]);

    useEffect(() => {
        const providers = state?.casinofilters?.providers || [];

        const filteredProviders = providers.filter(provider =>
            !EXCLUDED_PROVIDERS.includes(provider?.name?.toLowerCase())
        );

        setCasinoProviders(filteredProviders);
    }, [state?.casinofilters])

    useEffect(() => {
        if (state?.categories && state?.categories instanceof Array) {
            // NO SPORTS CURRENTLY. UNCOMMENT WHEN AVAILABLE
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
            style={{ zIndex: 11000 }}
        >
            <Offcanvas.Body className="bonanza-body">
                <button type="button" className="bonanza-close" onClick={handleBonanzaClose} aria-label="Close">
                    &times;
                </button>

                <div className="bonanza-shell">
                    <section className="bonanza-header">
                        <img src={logo} alt="Betmundial" className="bonanza-header-logo" />

                        <div className="bonanza-header-body">
                            <div className="bonanza-hero-trophy">
                                <div className="bonanza-hero-trophy-glow" aria-hidden="true" />
                                <img src={bonanzaTrophyHero} alt="" aria-hidden="true" />
                            </div>

                            <div className="bonanza-hero-center">
                                <h2 className="bonanza-title-main">CHAMPIONS</h2>
                                <div className="bonanza-subtitle">LEADERBOARD</div>
                                <p className="bonanza-hero-tagline">
                                    <FaCrown aria-hidden="true" />
                                    Compete. Play. Win Big!
                                </p>
                                <div className="bonanza-hero-meta">
                                    <span className="bonanza-hero-date">
                                        <FaCalendarAlt aria-hidden="true" />
                                        01 May 2025 00:00 – 31 May 2025 23:59 (EAT)
                                    </span>
                                    <span className="bonanza-live-badge">{drawerUpdateInterval}</span>
                                </div>
                            </div>

                            <div className="bonanza-prize-card">
                                <div className="bonanza-prize-label">Total Prize Pool</div>
                                <div className="bonanza-prize-value">{prizePool}</div>
                                <button type="button" className="bonanza-prize-action">
                                    <span className="bonanza-prize-action-left">
                                        <FaGift aria-hidden="true" />
                                        Prize Details
                                    </span>
                                    <FaChevronRight aria-hidden="true" />
                                </button>
                            </div>
                        </div>
                    </section>

                    <div className="bonanza-content">
                        <section className="bonanza-metrics">
                            <div className="bonanza-metric-card">
                                <span className="bonanza-metric-icon pink"><FaUsers aria-hidden="true" /></span>
                                <div className="bonanza-metric-copy">
                                    <div className="bonanza-metric-label">Participants</div>
                                    <div className="bonanza-metric-value">12,458</div>
                                </div>
                            </div>
                            <div className="bonanza-metric-card">
                                <span className="bonanza-metric-icon gold"><FaStar aria-hidden="true" /></span>
                                <div className="bonanza-metric-copy">
                                    <div className="bonanza-metric-label">Your Rank</div>
                                    <div className="bonanza-metric-value">{currentBonanzaUser.rank}</div>
                                </div>
                            </div>
                            <div className="bonanza-metric-card">
                                <span className="bonanza-metric-icon pink"><FaCoins aria-hidden="true" /></span>
                                <div className="bonanza-metric-copy">
                                    <div className="bonanza-metric-label">Your Points</div>
                                    <div className="bonanza-metric-value">{formatBonanzaNumber(currentBonanzaUser.points)}</div>
                                </div>
                            </div>
                            <div className="bonanza-metric-card">
                                <span className="bonanza-metric-icon gold"><FaChartLine aria-hidden="true" /></span>
                                <div className="bonanza-metric-copy">
                                    <div className="bonanza-metric-label">Time Left</div>
                                    <div className="bonanza-metric-value">12D 14H 32M 45S</div>
                                </div>
                            </div>
                        </section>

                        <div className="bonanza-table-wrapper">
                            <div className="bonanza-table">
                                <div className="bonanza-row bonanza-row-head">
                                    <span>Rank</span>
                                    <span>Player</span>
                                    <span className="bonanza-th-points">
                                        Points
                                        <FaInfoCircle aria-hidden="true" />
                                    </span>
                                    <span>Total Wager (KES)</span>
                                    <span>Net Win (KES)</span>
                                    <span>Games Played</span>
                                    <span aria-hidden="true" />
                                </div>
                                {bonanzaLeaderboard.map((row) => (
                                    <div
                                        key={row.rank}
                                        ref={row.isCurrentUser ? userRowRef : null}
                                        className={`bonanza-row${row.isCurrentUser ? ' bonanza-row-current' : ''}`}
                                    >
                                        <span className="bonanza-rank-cell">{getRankTrophy(row.rank)}</span>
                                        <span className="bonanza-player-cell">
                                            <span
                                                className={`bonanza-player-avatar${row.isCurrentUser ? ' bonanza-player-avatar-current' : ''}`}
                                                style={{ background: `linear-gradient(135deg, hsl(${row.avatarHue} 70% 45%), hsl(${row.avatarHue + 40} 65% 32%))` }}
                                            >
                                                {row.player.charAt(0)}
                                            </span>
                                            <span className="bonanza-player-name">{row.player}</span>
                                            {row.rank <= 3 && <span className="bonanza-vip-tag">VIP</span>}
                                            {row.isCurrentUser && <span className="bonanza-you-tag">You</span>}
                                        </span>
                                        <span className={row.rank <= 3 ? 'bonanza-points-gold' : ''}>
                                            {formatBonanzaNumber(row.points)}
                                        </span>
                                        <span>KES {formatBonanzaNumber(row.wager)}</span>
                                        <span className="bonanza-net-win">KES {formatBonanzaNumber(row.netWin)}</span>
                                        <span>{formatBonanzaNumber(row.games)}</span>
                                        <span className="bonanza-row-expand"><FaChevronDown aria-hidden="true" /></span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <footer className="bonanza-summary">
                        <div className="bonanza-summary-position">
                            <div className="bonanza-summary-position-label">Your Position</div>
                            <div className="bonanza-summary-position-value">{currentBonanzaUser.rank}</div>
                        </div>
                        <div className="bonanza-summary-player">
                            <div className="bonanza-summary-avatar">P</div>
                            <div className="bonanza-summary-details">
                                <div className="bonanza-summary-name">{currentBonanzaUser.player}</div>
                                <div className="bonanza-summary-status">
                                    <span className="bonanza-status-dot" />
                                    Active
                                </div>
                            </div>
                        </div>
                        <div className="bonanza-summary-stat">
                            <div className="bonanza-summary-stat-label">Your Points</div>
                            <div className="bonanza-summary-stat-value points">{formatBonanzaNumber(currentBonanzaUser.points)}</div>
                        </div>
                        <div className="bonanza-summary-stat">
                            <div className="bonanza-summary-stat-label">Total Wager (KES)</div>
                            <div className="bonanza-summary-stat-value">KES {formatBonanzaNumber(currentBonanzaUser.wager)}</div>
                        </div>
                        <div className="bonanza-summary-stat">
                            <div className="bonanza-summary-stat-label">Net Win (KES)</div>
                            <div className="bonanza-summary-stat-value net-win">KES {formatBonanzaNumber(currentBonanzaUser.netWin)}</div>
                        </div>
                        <div className="bonanza-summary-stat">
                            <div className="bonanza-summary-stat-label">Games Played</div>
                            <div className="bonanza-summary-stat-value">{formatBonanzaNumber(currentBonanzaUser.games)}</div>
                        </div>
                        <button type="button" className="bonanza-summary-toggle" aria-label="Collapse summary">
                            <FaChevronUp aria-hidden="true" />
                        </button>
                    </footer>
                </div>
            </Offcanvas.Body>
        </Offcanvas>
    );

    return (
        <div className="relative flex items-center big-icon-container">
            {/* <div className="bonanza-trigger" onClick={handleBonanzaOpen} title="Bonanza">
                <div className="bonanza-trigger-top">
                    <span>Bonanza</span>
                    <span className="bonanza-trigger-count">({20})</span>
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
                                        <div className="bonanza-item-subtitle">Leaderboard ({20})</div>
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

                    {((!loc?.pathname?.includes("/casino") && categories) || []).map((category, idx) => {

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
