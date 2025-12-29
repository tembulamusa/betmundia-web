import React, { useRef, useState, useEffect, useContext } from "react";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ListGroup from 'react-bootstrap/ListGroup';
import { MdOutlineKeyboardArrowLeft, MdOutlineKeyboardArrowRight } from "react-icons/md";
import { Context } from "../../context/store";
import DefaultImg from "../../assets/img/casino/icons/default.svg";
import { getFromLocalStorage, setLocalStorage } from "../utils/local-storage";


const BigIconMenu = () => {
    const { pathname } = useLocation();
    const scrollContainerRef = useRef(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);
    const [state, dispatch] = useContext(Context);
    const [categories, setCategories] = useState([]);
    const [casinoProviders, setCasinoProviders] = useState([]);
    const navigate = useNavigate();
    const loc = useLocation();


    const linkItems = [
        // {name: "home", icon:"home.svg", link:"/", parentTo:null},
        { name: "live", icon: "livescore.svg", link: "/live", parentTo: null },
        { name: "jackpot", icon: "jackpot.svg", link: "/jackpot", parentTo: null },
        // {name: "aviator", icon:"aviator.svg", link:"/aviator", parentTo:null},
        // {name: "surecoin", icon:"surecoin.svg", link:"/surecoin", parentTo:null},
        { name: "casino", icon: "casino.svg", link: "/casino", parentTo: null },
        // {name: "surebox", icon:"virtuals.svg", link:"/surebox", parentTo:null},
        //These next 3 Links did not exist before we removed SPORTS
        // {name: "aviatrix", icon:"aviatrix.svg", link:"/aviatrix", parentTo:null},
        // {name: "numbers", icon:"numbers.svg", link:"/numbers", parentTo:null},
        { name: "sport", icon: "sports.svg", link: null, parentTo: "sportscategories" },
        // {name: "virtuals", icon:"virtuals.svg", link:"/virtuals", parentTo:null},
        // {name: "league", icon:"league.svg", link:"/sure-league", parentTo:null},
        { name: "promotions", icon: "promos.svg", link: "/promotions", parentTo: null },
        { name: "livescore", icon: "livescore.svg", link: "/livescore", parentTo: null },
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

                    return (
                        provider?.name.toLowerCase() !== "aviatrix" && (
                            <li
                                key={idx}
                                className={`cursor-pointer ${loc?.pathname?.includes(provider?.name) ? "active" : ''} big-icon-item text-center capitalize relative`}
                                onClick={() => filterGames("provider", provider)}
                            >
                                <span title={provider?.name} className="relative inline-block">
                                    <div className="big-icon-icon">
                                        <img
                                            className="mx-auto"
                                            src={getSportImageIcon(`${provider?.name?.toLowerCase()}.svg`, "casino")}
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
                        )
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
                sport_image = require(`../../assets/img/colorsvgicons/${sport_name}`);
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
        setCasinoProviders(state?.casinofilters?.providers);
    }, [state?.casinofilters])

    useEffect(() => {
        if (state?.categories && state?.categories instanceof Array) {
            {/* NO SPORTS CURRENTLY. UNCOMMENT WHEN AVAILABLE */ }
            setCategories(state?.categories);
        }
    }, [state?.categories])

    const changeUserSelection = (category) => {
        dispatch({ type: "SET", key: "filtersport", payload: category });
        setLocalStorage("filtersport", category, 5 * 60 * 1000)
    }
    return (
        <div className="relative flex items-center big-icon-container">
            {showLeftArrow && (
                <div className="big-icon-arrows left cursor-pointer" onClick={scrollLeft}>
                    <MdOutlineKeyboardArrowLeft className="text-white" />
                </div>
            )}

            <div
                ref={scrollContainerRef}
                className="flex overflow-x-auto space-x-4 big-icon-scrollbar-hide"
                style={{ maxWidth: '100%', backgroundColor: 'transparent' }}
            >
                <ListGroup as="ul" horizontal className="flex space-x-4 big-icon-list">
                    <li key={"home-menu-item"} className={`${pathname === "/" || pathname === "/home" ? "active" : ''} big-icon-item text-center capitalize`}>
                        <a href={"/"} title={"home"}>
                            <div className="big-icon-icon"><img className="mx-auto" src={getSportImageIcon("home.svg")} alt={"home"} /></div>
                            <div className="big-icon-name">{"Home"}</div>
                        </a>
                    </li>
                    {(linkItems || []).map((item, idx) => {
                        return (
                            <li key={idx} className={`${pathname == item.link ? "active" : ''} big-icon-item text-center capitalize`}>
                                <Link to={item.link} title={item.name}>
                                    <div className="big-icon-icon"><img className="mx-auto" src={getSportImageIcon(item.icon)} alt={item.name} /></div>
                                    <div className="big-icon-name">{item.name}</div>
                                </Link>
                            </li>
                        )
                    }
                    )}

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
        </div>
    );
};

export default React.memo(BigIconMenu);
