import React, { useState, useContext, useEffect } from "react";
import makeRequest from "../utils/fetch-request";
import { Context } from "../../context/store";
import { Link, useNavigate } from "react-router-dom";
import { getFromLocalStorage, setLocalStorage } from "../utils/local-storage";
import { LazyLoadImage } from "react-lazy-load-image-component";
import MundialLeagueImg from '../../assets/img/casino/mundial-league-thumbnail.jpg';
import { Button } from "react-bootstrap";
import { isMobile } from 'react-device-detect';



const PopularGames = (props) => {
    const [state, dispatch] = useContext(Context);
    const [fetching, setFetching] = useState(false);
    const navigate = useNavigate();
    const [alertMessage, setAlertMessage] = useState({})

    const fetchTopCasino = async () => {
        let endpoint = "top-games-list";
        await makeRequest({ url: endpoint, method: "GET", api_version: "casinoGames" }).then(([status, result]) => {
            if (status == 200) {
                setLocalStorage("toppopularcasino", result)
                dispatch({ type: "SET", key: "toppopularcasino", payload: result });
            }
        });
    }
    useEffect(() => {
        // check for casino top
        const getTopCasino = getFromLocalStorage("toppopularcasino");
        if (!getTopCasino) {
            fetchTopCasino();
        } else {
            dispatch({ type: "SET", key: "toppopularcasino", payload: getTopCasino });
        }

    }, [])

    const getCasinoImageIcon = (imgUrl) => {

        let sport_image;
        try {
            sport_image = imgUrl;
            if (sport_image.trim() == "") {
                sport_image = require(`../../assets/img/casino/default.png`);
            }
        } catch (error) {
            sport_image = require(`../../assets/img/casino/default.png`);
        }
        return sport_image
    }

    const launchGame = async (game, moneyType = 1) => {
        if (game?.aggregator?.toLowerCase() == "suregames") {
            navigate(`/${game?.game_id.toLowerCase()}`)
            return
        }
        setFetching(true);
        let endpoint = `${game?.aggregator ? game?.aggregator : game?.provider_name}/casino/game-url/${isMobile ? "mobile" : "desktop"}/${moneyType}/${game.game_id}`;

        if (game?.aggregator && game?.aggregator?.toLowerCase() == "intouchvas") {
            endpoint = endpoint + `-${game?.provider_name}`
        }
        if (moneyType == 1 && !getFromLocalStorage("user")?.token) {
            // later check if token is still valid
            dispatch({ type: "SET", key: "showloginmodal", payload: true });
            return false
        }
        await makeRequest({ url: endpoint, method: "GET", api_version: 'CasinoGameLaunch' }).then(([status, result]) => {
            if (status == 200 && result?.tea_pot == null) {
                let launchUrl = result?.game_url || result?.gameUrl;
                dispatch({ type: "SET", key: "casinolaunch", payload: { game: game, url: launchUrl } });
                setLocalStorage("casinolaunch", { game: game, url: launchUrl })
                navigate(`/casino-game/${game?.provider_name.split(' ').join('-').toLowerCase()}/${game?.game_name.split(' ').join('-').toLowerCase()}`)
            } else {
                setAlertMessage({ status: 400, message: "Unable to launch Game" })
                return false
            }
        });
    }
    return (
        <div className="popular-games marquee-card !mr-0 !pl-3">
            {
                state?.toppopularcasino &&
                state?.toppopularcasino[0]?.gameList?.map((game, idx) => (
                    <div>
                        <div
                            className="cursor-pointer popular-game casino-game"
                            onClick={() => launchGame(game, 1)}
                            key={game.game_id}>
                            <LazyLoadImage
                                src={game?.provider_name.toLowerCase() === "unicraft" ? MundialLeagueImg : getCasinoImageIcon(game.image_url)}
                                alt={game?.game_name}
                                className={'virtual-game-image'} />
                        </div>
                    </div>
                ))

            }

        </div>
    )
}


export default React.memo(PopularGames);