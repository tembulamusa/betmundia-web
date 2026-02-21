import React, { useState, useContext, useEffect } from "react";
import makeRequest from "../utils/fetch-request";
import { Context } from "../../context/store";
import { useNavigate } from "react-router-dom";
import { isMobile } from 'react-device-detect';
import { getFromLocalStorage, setLocalStorage } from "../utils/local-storage";
import { LazyLoadImage } from "react-lazy-load-image-component";

const MiniGames = () => {
    const [state, dispatch] = useContext(Context);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const navigate = useNavigate();

    const fetchTopCasino = async () => {
        let endpoint = "top-games-list";
        await makeRequest({ url: endpoint, method: "GET", api_version: "casinoGames" }).then(([status, result]) => {
            if (status === 200) {
                const first12Games = result[0]?.gameList?.slice(0, 24) || [];
                setLocalStorage("minicasinogames", first12Games);
                dispatch({ type: "SET", key: "minicasinogames", payload: first12Games });
            }
        });
    }

    useEffect(() => {
        // check for casino top
        const getMiniCasino = getFromLocalStorage("minicasinogames");
        if (!getMiniCasino) {
            fetchTopCasino();
        } else {
            dispatch({ type: "SET", key: "minicasinogames", payload: getMiniCasino });
        }
    }, []);

    const getCasinoImageIcon = (imgUrl) => {
        let sport_image;
        try {
            sport_image = imgUrl;
            if (sport_image.trim() === "") {
                sport_image = require(`../../assets/img/casino/default.png`);
            }
        } catch (error) {
            sport_image = require(`../../assets/img/casino/default.png`);
        }
        return sport_image;
    }

    const launchGame = async (game, moneyType = 1) => {
        if (game?.aggregator?.toLowerCase() === "suregames") {
            navigate(`/${game?.game_id.toLowerCase()}`)
            return
        }

        let endpoint = `${game?.aggregator ? game?.aggregator : game?.provider_name}/casino/game-url/${isMobile ? "mobile" : "desktop"}/${moneyType}/${game.game_id}`;

        if (game?.aggregator && game?.aggregator?.toLowerCase() === "intouchvas") {
            endpoint = endpoint + `-${game?.provider_name}`
        }
        if (moneyType === 1 && !getFromLocalStorage("user")?.token) {
            dispatch({ type: "SET", key: "showloginmodal", payload: true });
            return false
        }

        await makeRequest({ url: endpoint, method: "GET", api_version: 'CasinoGameLaunch' }).then(([status, result]) => {
            if (status === 200 && result?.tea_pot == null) {
                let launchUrl = result?.game_url || result?.gameUrl;
                dispatch({ type: "SET", key: "casinolaunch", payload: { game: game, url: launchUrl } });
                if (game?.aggregator?.toLowerCase() === "bitville") {
                    dispatch({ type: "SET", key: "bitvilleGame", payload: result });
                }
                setLocalStorage("casinolaunch", { game: game, url: launchUrl })
                navigate(`/casino-game/${game?.provider_name.split(' ').join('-').toLowerCase()}/${game?.game_name.split(' ').join('-').toLowerCase()}`)
            }
        });
    }

    const filteredGames = state?.minicasinogames?.filter(game =>
        game.game_name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    return (
        <div className="mt-4 p-4 rounded-md" style={{ backgroundColor: 'rgba(255,255,255, 0.1)' }}>
            <div className="pb-4" style={{}}>
                <h3 className="text-white mb-2">Mini Games</h3>
                <input
                    type="text"
                    placeholder="Search games..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className={`w-full p-2 mb-4 border ${isFocused ? 'bg-dark-bg-tertiary' : 'bg-transparent'} border-gray-200 rounded-md text-white`}
                    style={{ backgroundColor: isFocused ? '#151525' : 'transparent', borderColor: 'rgba(255, 255, 255, 0.15)', color: '#ffffff' }}
                />
            </div>
            <div className="mt-4 pt-4 grid grid-cols-4 gap-4">
                {filteredGames.map(game => (
                    <div
                        key={game.game_id}
                        className="relative flex items-center justify-center w-full h-0 pb-[100%] bg-cover bg-center rounded-md cursor-pointer transition-transform transform hover:scale-105"
                    >
                        <LazyLoadImage
                            src={getCasinoImageIcon(game.image_url)}
                            className="absolute w-full h-full object-cover rounded-md"
                            onClick={() => launchGame(game, 1)}
                        />
                        <span className="absolute bottom-2 left-2 font-bold text-white opacity-0 transition-opacity duration-300 hover:opacity-100">
                            {game.game_name}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default React.memo(MiniGames);