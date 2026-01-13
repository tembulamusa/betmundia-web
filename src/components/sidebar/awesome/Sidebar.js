import React, { useCallback, useEffect, useState, useContext } from 'react';
import {
    ProSidebar as ProSidebar2,
    Sidebar,
    Menu,
    MenuItem,
    SubMenu,
    SidebarHeader,
    //SidebarContent 
} from 'react-pro-sidebar';

//import 'react-pro-sidebar/dist/css/styles.css';
import { getFromLocalStorage, setLocalStorage, removeItem } from "../../utils/local-storage";
import makeRequest from "../../utils/fetch-request";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PerfectScrollbar from 'react-perfect-scrollbar';

import 'react-perfect-scrollbar/dist/css/styles.css';
import { Context } from '../../../context/store';
import LiveSideBar from '../live-sidebar';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import gameCategories from '../../utils/static-data';
import Notify from '../../utils/Notify';
import CasinoSidebar from '../../pages/casino/casino-sidebar';

const ProSidebar = (props) => {

    const [collapsed, setCollapsed] = useState(false)
    const [toggled, setToggled] = useState(false)
    const [sport, setSport] = useState(79)
    const [loc, setLoc] = useState("/");
    const [state, dispatch] = useContext(Context);
    const location = useLocation()
    const [searchParams,] = useSearchParams();
    const queryParamValue = searchParams.get('id');
    const [competitions, setCompetitions] = useState(null);
    const [focusSportId, setFocusSportId] = useState(null);
    // const []
    const excludeSidebar = ["/login", "/signup", '/livescore']
    const navigate = useNavigate()

    useEffect(() => {
        setLoc(location?.pathname)
    }, [location])

    const handleToggleSidebar = (value) => {
        setToggled(value);
    };

    const changeMatches = (gameType, competition) => {

        setLocalStorage('active_item', competition.sport_id);
        if (gameType == "competition") {
            dispatch({ type: "SET", key: "filtercompetition", payload: { competition_id: competition?.competition_id } })
        }
    }

    const fetchData = async () => {


        // get all categories
        let endpoint2 = "/sports";
        let cached_competitions = getFromLocalStorage('categories');
        if (!cached_competitions || cached_competitions?.length < 1) {
            const [competition_result] = await Promise.all([
                makeRequest({ url: endpoint2, method: "get", api_version: 2 }),
            ]);
            let [c_status, c_result] = competition_result;
            if (c_status == 200) {
                setCompetitions(c_result?.data);
                setLocalStorage('categories', c_result?.data, 3 * 60 * 60 * 1000);
                dispatch({ type: "SET", key: "categories", payload: c_result });
            }
        } else {
            setCompetitions(cached_competitions);
            dispatch({ type: "SET", key: "categories", payload: cached_competitions });
        }
        setFocusSportId(location.pathname !== "/" ? getFromLocalStorage("filtersport")?.sport_id : 79);
    };

    useEffect(() => {
        let currentlySelectedSport = getFromLocalStorage("filtersport");
        if (currentlySelectedSport) {
            dispatch({ type: "SET", key: "filtersport", payload: currentlySelectedSport })
        }
        fetchData();
    }, []);

    const [width, setWidth] = useState(window.innerWidth);

    useEffect(() => {
        if (state?.filtersport) {
            setFocusSportId(state?.filtersport?.sport_id)
        }
    }, [state?.filtersport]);

    const updateDimensions = () => {
        setWidth(window.innerWidth);
        if (width >= 768 && width <= 991) {
            setCollapsed(true)
        } else {
            setCollapsed(false)
        }
    }
    const updateSidebarState = () => {
        let sport_id = (new URL(window.location.href).searchParams.get('sport_id'))
        if (sport_id == null && window.location.pathname == '/') {
            sport_id = 79
        }
        setSport(sport_id)
    }

    const getActiveSport = (matchId) => {
        return (Number(sport) == Number(matchId))

    }

    useEffect(() => {
        updateDimensions()
        updateSidebarState()
        window.addEventListener("resize", updateDimensions);
        return () => window.removeEventListener("resize", updateDimensions);
    }, [width]);

    useEffect(() => {
        if (location?.pathname == "/") {
            removeItem("filtersport");
            dispatch({ type: "DEL", key: "filtersport" });
        }
    }, [location])

    const getSportImageIcon = (sport_name, folder = 'svg', topLeagues = false) => {

        let default_img = 'default';
        let sport_image;
        try {
            sport_image = topLeagues ? require(`../../../assets/img/flags-1-1/${sport_name}.svg`) : require(`../../../assets/${folder}/${sport_name}.svg`);
        } catch (error) {
            sport_image = require(`../../../assets/${folder}/${default_img}.gif`);
        }
        return sport_image
    }

    const getDefaultMarketsForSport = (competition) => {
        return competition?.default_display_markets
    }

    const getSportCompetitions = async () => {

        let endpoint = `/sports/competitions/${focusSportId || state?.filtersport?.sport_id || getFromLocalStorage("filtersport")?.sport_id || 79}`;
        let cached_competitions = getFromLocalStorage('categories') || state?.categories;

        // get item whose id is equal the id

        let sport = competitions?.find(obj => obj?.sport_id == focusSportId);
        // check if the sport has competitions
        let hasCompetitions = sport && Object.keys(sport).includes('competitions');
        // Only make request for a focussport if the competitions are not existent
        // if (!hasCompetitions){
        makeRequest({ url: endpoint, method: 'GET', api_version: 2 }).then(([status, response]) => {
            let sportIndex = competitions?.findIndex(obj => obj?.sport_id == focusSportId);
            // update the sport with competitions
            if (sport && status == 200) {
                sport.competitions = response?.data?.items || []
                // for now, we just want to set the top competitions as soccer. later we'll set for every sport,
                // so, on the basis of current situation
                // if it's soccer, we take a slice of the games and set to top soccer

                dispatch({ type: "SET", key: "topcompetitions", payload: response?.data?.items || [] });
                setLocalStorage("topcompetitions", response?.data?.items || [], 7 * 24 * 60 * 1000);

                let newCompetitions = competitions;

                // get new competitions with the updated stuff
                newCompetitions[sportIndex] = sport;

                // update the state and the localStorage
                setCompetitions(newCompetitions);
                dispatch({ type: "SET", key: "categories", payload: newCompetitions })
                setLocalStorage("categories", newCompetitions, 5 * 60 * 1000)

            }

        })
        // }
    }
    const handleOpenChange = (sport) => {
        dispatch({ type: "SET", key: "filtersport", payload: sport });
        setLocalStorage("filtersport", sport, 5 * 60 * 1000);
        navigate(`/sports/matches/${sport?.sport_id}?sportId=${sport?.sport_id}`)
    }
    // comment for normal games

    const getSportCategories = () => {
        // Check for and update for categories
        let endpoint = "/sports/categories/" + focusSportId
        let sport = competitions?.find(obj => obj?.sport_id == focusSportId);
        makeRequest({ url: endpoint, method: 'GET', api_version: 2 }).then(([status, response]) => {
            let sportIndex = competitions?.findIndex(obj => obj?.sport_id == focusSportId);
            // update the sport with competitions
            if (status == 200) {
                sport.categories = response?.data[0]?.categories
                let newCompetitions = competitions;
                // get new competitions with the updated stuff
                newCompetitions[sportIndex] = sport;
                setCompetitions(newCompetitions);
                dispatch({ type: "SET", key: "categories", payload: newCompetitions })
                setLocalStorage("categories", newCompetitions, 24 * 7 * 60 * 60 * 1000)
            } else {
                sport.categories = [];
            }

        })
    }


    useEffect(() => {
        // if(competitions !== null ) {

        getSportCompetitions();
        // }
    }, [focusSportId])


    return (
        <>
            {
                !(excludeSidebar.includes(location.pathname) || location.pathname.includes("casino")) &&
                (loc.includes("live") ? <LiveSideBar /> :
                    <div style={{
                        display: 'flex',
                        overflow: 'scroll initial',
                        zIndex: 10,
                        top: "100px"
                    }}
                        className={`vh-100 sticky-top d-none d-md-block up col-md-2 pr-[12px]`}>

                        {!competitions &&
                            <>All Sports</>
                        }

                        {/* The new  */}

                        <Sidebar
                            style={{ backgroundColor: '#0f0f1f !important' }}
                            image={false}
                            onToggle={handleToggleSidebar}
                            collapsed={collapsed}
                            toggled={toggled}>
                            <Menu iconShape="circle">
                                {
                                    competitions?.map((sport, idx) => (
                                        <div>
                                            <SubMenu title={sport?.sport_name} defaultOpen={sport?.sport_name == "Soccer"}
                                                icon={<img style={{ borderRadius: '50%', height: '24px' }}
                                                    src={getSportImageIcon(sport?.sport_name)} alt='' />}
                                                label={sport?.sport_name}
                                                onOpenChange={() => handleOpenChange(sport)}
                                                open={focusSportId == sport?.sport_id}
                                                className={`${['bandy', 'pesapallo', 'dota 2', 'starcraft', 'gaelic football', 'gaelic hurling', 'gaelic football'].includes(sport?.sport_name?.toLowerCase()) && 'force-reduce-img'}`}
                                                key={idx}>
                                                {/* <SubMenu title={'Countries'}
                                             style={{maxHeight: '300px', overflowY: 'auto', overflowX: 'hidden'}}> */}
                                                <PerfectScrollbar >

                                                    {/* For soccer, let's have the top soccer leagues here as well */}

                                                    {
                                                        sport?.sport_id == focusSportId &&
                                                        sport?.competitions?.map((competition, idx) => (
                                                            <MenuItem
                                                                title={competition?.competition_name}
                                                                // label = {country.category_name}
                                                                key={competition?.competition_id}
                                                                icon={<img style={{ borderRadius: '1px', height: '13px', width: "13px" }}
                                                                    src={getSportImageIcon(competition?.flag_icon, 'img/flags-1-1', true)}
                                                                    alt='' className='inline-block mr-2' />}
                                                            >
                                                                <Link className={`sidebar-link ${(queryParamValue == competition.competition_id) && 'active'}`} to={`/sports/competition/matches?id=${competition.competition_id}`}
                                                                    onClick={() => changeMatches("competition", competition)}>
                                                                    <span>{competition?.competition_name}</span>
                                                                </Link>
                                                            </MenuItem>
                                                        ))

                                                    }
                                                    <div
                                                        onClick={() => getSportCategories()}
                                                    ><SubMenu
                                                        title="Countries"
                                                        label="Countries"
                                                        icon={<img style={{ borderRadius: '50%', height: '15px' }}
                                                            className=''
                                                            src={getSportImageIcon("more", 'img/flags-1-1')}
                                                            alt=''
                                                        />}

                                                    >
                                                            {sport?.sport_id == focusSportId &&
                                                                sport?.categories?.map((category, idx) => (
                                                                    <SubMenu
                                                                        title={category?.category_name}
                                                                        label={category?.category_name}
                                                                        icon={<img style={{ borderRadius: '50%', height: '15px' }}
                                                                            className=''
                                                                            src={getSportImageIcon(category?.cat_flag, 'img/flags-1-1')}
                                                                            alt='' />}
                                                                        className={`inner-submenu`}
                                                                        key={idx}>

                                                                        {category?.competitions?.map((league, leagueKey) => (
                                                                            <MenuItem
                                                                                title={league.competition_name}
                                                                                // label = {country.category_name}
                                                                                key={league?.competition_id}
                                                                            >
                                                                                <Link className='country-competition-item' to={`/competition/country/league/${league.competition_id}/all`}
                                                                                    onClick={() => changeMatches("competition", league)}>
                                                                                    <span>{league?.competition_name}</span>
                                                                                </Link>
                                                                            </MenuItem>
                                                                        ))
                                                                        }

                                                                    </SubMenu>))}
                                                        </SubMenu>
                                                    </div>

                                                </PerfectScrollbar >
                                                { /* </SubMenu> */}
                                            </SubMenu>
                                        </div>
                                    ))
                                }
                            </Menu>
                        </Sidebar>

                    </div>

                )

            }

            {
                (!excludeSidebar.includes(location.pathname) && location.pathname.includes("casino")) &&

                <div className={`d-none d-md-block col-md-2`}>
                    <div>
                        {location.pathname == "/signup" && "signup"}
                        <CasinoSidebar categories={state?.casinogames?.gameTypes} providers={state?.casinogames?.providers} />
                    </div>
                </div>
            }
        </>

    );
};

export default ProSidebar;
