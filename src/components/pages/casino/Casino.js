import React, { useContext, useEffect, useState } from 'react';
import Header from "../../header/header";
import Footer from "../../footer/footer";
import makeRequest from "../../utils/fetch-request";
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { Link, useLocation, useParams, useSearchParams } from "react-router-dom";
import SideBar from "../../sidebar/awesome/Sidebar";
import { getFromLocalStorage, setLocalStorage } from "../../utils/local-storage";
import Notify from "../../utils/Notify";
import { Button, ButtonGroup } from "react-bootstrap";
import CasinoCarousel from '../../carousel/casino-carousel';
import { Context } from '../../../context/store';
import { ShimmerTable } from "react-shimmer-effects";
import NoEvents from '../../utils/no-events';
import CategoryListing from './category-listing';
import CasinoJackpots from './casino-jackpots';
import CasinoSidebar from './casino-sidebar';
import MobileCategoriesMenu from './mobile-categories-menu';

const Casino = (props) => {
    const { filterType, filterName } = useParams();
    const [user] = useState(getFromLocalStorage("user"));
    const [state, dispatch] = useContext(Context);
    const [games, setGames] = useState(null);
    const [fetching, setFetching] = useState(false);
    const loc = useLocation();

    const fetchCasinoGames = async () => {
        setFetching(true);
        let endpoint = "games-list";
        if (filterType === "categories") {
            if (state?.state?.casinogamesfilter?.category) {
                endpoint = `game-type/games-list/${state?.casinogamesfilter?.category?.id}`;
            } else {
                endpoint = `game-type/games-list/${state?.casinogamesfilter?.category?.id || (filterName)}`;
            }

        } else if (filterType === "providers") {
            if (state?.casinogamesfilter?.provider) {
                endpoint = `provider/games-list/${state?.casinogamesfilter?.provider?.id}`;
            } else {
                endpoint = `provider/games-list/n/${filterName}`;

            }
        } else if (filterType == "combinedprovidercategory") {
            endpoint = `provider/games-list/${state?.casinogamesfilter?.provider?.id}/`
                + `${state?.casinogamesfilter?.category?.id}/`
                + `${state?.casinogamesfilter?.page}/100`
        } else if (filterType === "providercategory") {
            const providerId = state?.casinofilters?.providers?.id || "defaultProviderId";
            const categoryId = state?.casinofilters?.gameTypes?.id || "defaultCategoryId";
            const page = state?.casinogamesfilter?.page || 1;
            const limit = 100;
            endpoint = `provider/games-list/${providerId}/${categoryId}?page=${page}&limit=${limit}`;
        }

        let search_term = state?.searchterm || "";
        let method = "GET";
        let data = null;
        if (search_term && search_term.length >= 3) {
            method = "POST";
            data = { search: search_term };
            endpoint = `games/search`;
        }
        const [status, result] = await makeRequest({ url: endpoint, method: method, data: data, api_version: "casinoGames" });
        if ([200, 201].includes(status)) {
            let fetchedGames;
            if (endpoint.includes("game-type")) {

                let res = result;
                let games = [{ gameList: result?.content }]
                delete res?.content
                res = { ...res, games: games, isCategory: true }
                fetchedGames = games
                dispatch({ type: "SET", key: "category-filters", payload: res });

            } else {
                fetchedGames = result?.games
            }
            setGames(fetchedGames);
            if (result?.games) {
                dispatch({ type: "SET", key: "casinofilters", payload: result })
                setLocalStorage("casinofilters", result, 1000 * 60 * 60 * 5)

            }

        }
        setFetching(false);
    };
    useEffect(() => {
        fetchCasinoGames();
    }, [state?.casinogamesfilter, state?.searchterm]);

    useEffect(() => {
        dispatch({ type: "SET", key: "nosports", payload: true });

        let gamesFilter = getFromLocalStorage("casinogamesfilter");
        if (gamesFilter) {
            dispatch({ type: "SET", key: "casinogamesfilter", payload: gamesFilter })
        }


        return () => {
            dispatch({ type: "DEL", key: "nosports" });
        }
    }, [])
    useEffect(() => {
        // Check if script already exists or if dga/xlg is already loaded
        const existingScript = document.querySelector('script[src="/dgAPI.js"]');
        if (existingScript || (typeof window !== 'undefined' && window.dga)) {
            return;
        }

        // Dynamically add Pragmatic DGA script
        const script = document.createElement("script");
        script.src = "/dgAPI.js";
        script.async = true;
        script.defer = true;
        script.id = "dgAPI-script"; // Add ID for easier identification
        document.body.appendChild(script);

        return () => {
            // Only cleanup if script was added by this component
            const scriptToRemove = document.getElementById("dgAPI-script");
            if (scriptToRemove && scriptToRemove === script) {
                document.body.removeChild(scriptToRemove);
            }
        };
    }, []);


    return (
        <>
            <CasinoCarousel />
            <CasinoJackpots />

            <div className="casino-mobile-categories">
                <MobileCategoriesMenu />
            </div>

            <div className="casino-games-list">
                {fetching && <ShimmerTable row={3} />}
                {!fetching && (!games || games?.length < 1) && (
                    <NoEvents message="Casino Games not found" />
                )}
                {games?.map((category, idx) => (
                    category?.gameList?.length > 0 &&
                    <CategoryListing
                        key={idx}
                        games={category?.gameList}
                        gamestype={category?.game_type}
                        gamesCategory={state?.casinofilters?.gameTypes}
                        gamesprovider={state?.casinogamesfilter?.provider}
                    />
                ))}
            </div>
        </>
    );
};

export default React.memo(Casino);
