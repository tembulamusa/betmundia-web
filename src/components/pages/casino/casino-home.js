import React, { useContext, useEffect, useState } from 'react';
import CasinoCarousel from '../../carousel/casino-carousel';
import { ShimmerTable } from 'react-shimmer-effects';
import NoEvents from '../../utils/no-events';
import CasinoGame from './casino-game';
import GameCategoryListing from './category-listing';
import { Context } from '../../../context/store';
import { getFromLocalStorage, setLocalStorage } from "../../utils/local-storage";
import makeRequest from "../../utils/fetch-request";
import { IoGameController } from "react-icons/io5";
import { FaHotjar, FaGamepad } from "react-icons/fa";
import { RiLiveFill } from "react-icons/ri";
import { HiGiftTop } from "react-icons/hi2";
import { BiSolidOffer } from "react-icons/bi";

const CasinoHome = () => {
    const [state, dispatch] = useContext(Context);
    const [games, setGames] = useState(state?.casinogames || []);
    const [fetching, setFetching] = useState(false);

    const fetchCasinoGames = async () => {
        setFetching(true);
        let endpoint = "games-list";

        if (state?.casinogamesfilter?.filterType === "category") {
            endpoint = `game-type/games-list/${state?.casinogamesfilter?.category?.id}`;
        } else if (state?.casinogamesfilter?.filterType === "provider") {
            endpoint = `provider/games-list/${state?.casinogamesfilter?.provider?.id}`;
        }

        const [status, result] = await makeRequest({ url: endpoint, method: "GET", api_version: "faziCasino" });
        if (status === 200) {
            if (Array.isArray(result.games)) {
                setGames(result.games);
                dispatch({ type: "SET", key: "casinogames", payload: result.games });
                setLocalStorage('casinogames', result.games);
            } else {
                setGames([]);
            }
        }
        setFetching(false);
    };


    useEffect(() => {
        const localGames = getFromLocalStorage("casinogames");
        if (Array.isArray(localGames)) {
            setGames(localGames);
            dispatch({ type: "SET", key: "casinogames", payload: localGames });
        } else {
            fetchCasinoGames();
        }
    }, []);

    const filteredGames = Array.isArray(games) ? games.map((category) => ({
        ...category,
        gameList: category.gameList ? category.gameList.slice(0, 4) : [],
    })) : [];

    const scrollToSection = (sectionId) => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    };


    return (
        <div className="flex">
            <main className="flex-grow ant-layout-content p-6 bg-gray-100">
                {/* Carousel Section */}
                <CasinoCarousel />

                {/* Tabs for Sections */}
                <div className="tabs-container mt-4 grid grid-cols-3 sm:grid-cols-6 gap-2 p-2 rounded-lg shadow-md">
                    <button
                        onClick={() => scrollToSection('must-play-section')}
                        className="tab-button bg-pink-200 text-black py-2 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-pink-600 hover:text-white"
                    >
                        <IoGameController />
                        Must Play
                    </button>
                    <button
                        onClick={() => scrollToSection('new-games-section')}
                        className="tab-button bg-blue-200 text-black py-2 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white"
                    >
                        <FaHotjar />
                        New Games
                    </button>
                    <button
                        onClick={() => scrollToSection('live-section')}
                        className="tab-button bg-purple-200 text-black py-2 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-purple-600 hover:text-white"
                    >
                        <RiLiveFill />
                        Live
                    </button>
                    <button
                        onClick={() => scrollToSection('tables-section')}
                        className="tab-button bg-orange-200 text-black py-2 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-orange-600 hover:text-white"
                    >
                        <FaGamepad />
                        Tables
                    </button>
                    <button
                        onClick={() => scrollToSection('drops-wins-section')}
                        className="tab-button bg-cyan-200 text-black py-2 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-cyan-600 hover:text-white"
                    >
                        <HiGiftTop />
                        Drops & Wins
                    </button>
                    <button
                        onClick={() => scrollToSection('daily-offers-section')}
                        className="tab-button bg-green-200 text-black py-2 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-indigo-600 hover:text-white"
                    >
                        <BiSolidOffer />
                        Daily Offers
                    </button>
                </div>
                {/* 
                {/* Section for each tab with cards
                <div className="casino-section mt-6">
                    {['must-play', 'new-games', 'live', 'tables', 'drops-wins', 'daily-offers'].map((section, idx) => {
                        const sectionGames = filteredGames?.find(cat => cat.game_type === section)?.gameList || [];

                        return (
                            <div id={`${section}-section`} key={idx} className="section mb-8">
                                <h2 className="section-title text-2xl font-bold mb-4 capitalize">
                                    {section.replace('-', ' ')}
                                </h2>
                                <div className="cards-container grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {sectionGames.length > 0 ? (
                                        sectionGames.map((game, idx) => (
                                            <div key={idx} className="card-item bg-white shadow-lg rounded-lg p-4">
                                                <CasinoGame game={game} />
                                            </div>
                                        ))
                                    ) : (
                                        <NoEvents message={`No games found in ${section}`} />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div> 
            */}

                {/* Section for each tab with cards */}
                <div className="casino-section mt-6">
                    {['must-play', 'new-games', 'live', 'tables', 'drops-wins', 'daily-offers'].map((section, idx) => {
                        const sectionGames = Array.isArray(games) ? games.slice(0, 4) : [];
                        return (
                            <div id={`${section}-section`} key={idx} className="section mb-8">
                                <h2 className="section-title text-2xl font-bold mb-4 capitalize">
                                    {section.replace('-', ' ')}
                                </h2>
                                <div className="casino-games-list mt-6">
                                    {fetching ? (
                                        <ShimmerTable row={3} />
                                    ) : filteredGames?.length < 1 ? (
                                        <NoEvents message="Casino Games not found" />
                                    ) : (
                                        filteredGames?.map((category, idx) => (
                                            <GameCategoryListing key={idx} games={category.gameList} />
                                        ))
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Games Listing Section 
                <div className="casino-games-list mt-6">
                    {fetching ? (
                        <ShimmerTable row={3} />
                    ) : filteredGames?.length < 1 ? (
                        <NoEvents message="Casino Games not found" />
                    ) : (
                        filteredGames?.map((category, idx) => (
                            <GameCategoryListing key={idx} games={category.gameList} gamestype={category.game_type} />
                        ))
                    )}
                </div>
                */}

            </main>
        </div>
    );
};

export default CasinoHome;
