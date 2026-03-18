import React, { useContext, useEffect, useState } from "react";
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { Button, ButtonGroup } from "react-bootstrap";
import { Context } from "../../../context/store";
import makeRequest from "../../utils/fetch-request";
import { isMobile } from 'react-device-detect';
import { useNavigate } from "react-router-dom";
import { getFromLocalStorage, setLocalStorage } from "../../utils/local-storage";
import Notify from "../../utils/Notify";
import Alert from "../../utils/alert";
import { useLocation } from "react-router-dom";
import { useParams } from "react-router-dom";


const CasinoGame = (props) => {
    const { game } = props;
    const [state, dispatch] = useContext(Context);
    const [alertMessage, setAlertMessage] = useState(null)
    const [fetching, setFetching] = useState(false);
    const user = getFromLocalStorage("user")
    const navigate = useNavigate();
    const location = useLocation();
    const { filterType, filterName } = useParams();

    const onlyInclude = ["expanse", "elbet", "onlyplay", "splitthepot"];
    const inProduction = ['pragmatic', 'aviatrix', "bitville", "spribe", "3 oaks", "aviatorllc", "kagaming", "splithepot"];
    const shouldShowGame = (filterType?.toLowerCase() === "categories" && onlyInclude.includes(filterName?.toLowerCase())
        || inProduction.includes(game?.provider_name?.toLowerCase())
    ) ? true : false;

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
        if (moneyType == 1 && !user?.token) {
            // later check if token is still valid
            dispatch({ type: "SET", key: "showloginmodal", payload: true });
            return false
        }

        await makeRequest({ url: endpoint, method: "GET", api_version: 'CasinoGameLaunch' }).then(([status, result]) => {
            if (status == 200 && result?.tea_pot == null) {
                let launchUrl = result?.game_url || result?.gameUrl;
                dispatch({ type: "SET", key: "casinolaunch", payload: { game: game, url: launchUrl } });
                setLocalStorage("casinolaunch", { game: game, url: launchUrl })
                if (game?.aggregator?.toLowerCase() == "bitville") {
                    dispatch({ type: "SET", key: "bitvilleGame", payload: result });
                }
                navigate(`/casino-game/${game?.provider_name.split(' ').join('-').toLowerCase()}/${game?.game_name.split(' ').join('-').toLowerCase()}`)
            } else {
                setAlertMessage({ status: 400, message: "Unable to launch Game" })
                return false
            }
        });


    }


    useEffect(() => {
        if (alertMessage) {
            setTimeout(() => {
                setAlertMessage(null)
            }, 3000);
        }
    }, [alertMessage])


    const getCasinoImageIcon = (imgUrl) => {

        let sport_image;
        try {
            sport_image = imgUrl;
            if (sport_image.trim() == "") {
                sport_image = require(`../../../assets/img/casino/casino-default-thumbnail.jpeg`);
            }
            if (game?.provider_name.toLowerCase() == "aviatrix") {
                sport_image = require("../../../assets/img/casino/aviatrix/aviatrix.jpg")
            }
        } catch (error) {
            sport_image = require(`../../../assets/img/casino/casino-default-thumbnail.jpeg`);
        }
        return sport_image
    }

    return (
        <>

            {shouldShowGame &&
                <>
                    <div
                        style={{}}
                        className="game-image-wrapper"
                        key={game.game_id}>
                        <LazyLoadImage
                            alt={game.game_url}
                            id={game?.game_id}
                            src={getCasinoImageIcon(game.image_url)}
                            className={'virtual-game-image'} />

                        {alertMessage && <div className="game-launch-issue"><Alert message={alertMessage} /></div>}

                        {

                            game?.game_type?.toLowerCase() == "live games"
                            &&
                            <div className="pragmatic">
                                <div id={`betlimit-${game?.['game_id']}`} className="prag-bet-limits">
                                    Kshs.10 - Kshs.20000
                                </div>
                                <div id={`table-${game['game_id']}`} className="table-prag">
                                    <div className="prag-bet-table" title="Table Closed">
                                        <img src={require("../../../assets/img/lock-red.png")} alt="C" width={18} style={{ margin: "auto" }} />
                                    </div>
                                </div>
                                <div id={`seated-players-${game['game_id']}`} class="prag-bet-players">
                                    <img src={require("../../../assets/img/casino/pragmatic/user.svg")} alt="" /> <span
                                        id={`seated-player-num-${game['game_id']}`}></span>
                                </div>
                                <div id={`result-${game['game_id']}`} class="prag-bet-result-holder flex">
                                </div>
                            </div>
                        }
                    </div>
                    <p className={'py-2 font-[500] text-elipsis text-white casino-game-title-text'}>{game?.game_name}</p>
                    <div className="game-buttons">
                        <Button className="casino-play-btn red-bg casino-cta"
                            onClick={() => launchGame(game, 1)}>
                            Play
                        </Button>

                        {game?.aggregator?.toLowerCase() != "suregames" &&
                            <Button className="casino-demo-btn casino-cta"
                                onClick={() => launchGame(game, 0)}>
                                Demo
                            </Button>
                        }
                    </div>

                </>
            }
        </>
    )
}


export default React.memo(CasinoGame);
