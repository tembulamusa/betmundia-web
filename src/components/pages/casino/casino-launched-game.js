import React, { useContext, useEffect, useState } from "react";
import { Context } from "../../../context/store";
import { getFromLocalStorage, setLocalStorage } from "../../utils/local-storage";
import { useNavigate, useParams } from "react-router-dom";
import { MdOutlineClose } from "react-icons/md";
import { FaArrowLeftLong } from "react-icons/fa6";
import { isMobile } from "react-device-detect";
import makeRequest from "../../utils/fetch-request";
import { MdFullscreen } from "react-icons/md";


const CasinoLaunchedGame = (props) => {
    const [state, dispatch] = useContext(Context);
    const navigate = useNavigate();
    const user = getFromLocalStorage("user");
    const [noStateGame, setNoStateGame] = useState();
    const fullScreens = ["aviatrix"];
    const { provider, gameName } = useParams();
    const surePopular = window.location.pathname.includes("sure-popular");
    const directLaunch = ['virtual-league', 'aviator']

    const findGameId = (provider, gameName) => {
        const games = state?.casinofilters?.games?.[0]?.gameList || [];
        const matchedGame = games.find(
            (game) =>
                game.provider_name.toLowerCase() === provider.toLowerCase() &&
                game.game_name.toLowerCase().replace(/\s+/g, "-") === gameName.toLowerCase()
        );
        return matchedGame?.game_id;
    };

    const fetchGameUrl = async (provider, gameId) => {
        let endpoint;
        endpoint = `${provider}/casino/game-url/${isMobile ? "mobile" : "desktop"}/${1}/${gameId}`;

        await makeRequest({ url: endpoint, method: "GET", api_version: "CasinoGameLaunch" }).then(
            ([status, result]) => {
                if (status === 200) {
                    setNoStateGame(result?.gameUrl || result?.game_url);
                } else {
                    navigate("/casino");
                }
            }
        );
    };

    const launchOldWay = async () => {
        let endpoint = `Eurovirtuals/casino/game-url/${isMobile ? "mobile" : "desktop"}/${1}/${"550e8400-e29b-41d4-a716-446655440000"}`;
        if (provider.toLowerCase() === "aviator") {
            endpoint = `intouchvas/casino/game-url/${isMobile ? "mobile" : "desktop"}/${1}/1-Aviator`;
        }
        await makeRequest({ url: endpoint, method: "GET", api_version: "CasinoGameLaunch" }).then(
            ([status, result]) => {
                if (status === 200) {
                    setNoStateGame(result?.gameUrl || result?.game_url);
                } else {
                    navigate("/casino");
                }
            }
        );
        dispatch({ type: "SET", key: "casinolaunch", payload: { game: '', url: '' } });
        setLocalStorage("casinolaunch", { game: '', url: '' })

    };

    useEffect(() => {
        dispatch({ type: "SET", key: "iscasinopage", payload: true });

        if (surePopular) {
            // New way: Handle advertised games
            const gameId = findGameId(provider, gameName);

            if (gameId) {
                fetchGameUrl(provider, gameId);
            } else {
                navigate("/casino");
            }
        } else {
            if (directLaunch.includes(gameName.toLowerCase())) {
                launchOldWay();
            } else {
                let game = state?.casinolaunch || getFromLocalStorage("casinolaunch");
                dispatch({ type: "SET", key: "casinolaunch", payload: game });
                setNoStateGame(game.url);
            }
        }

        // Cleanup function
        return () => {
            dispatch({ type: "DEL", key: "iscasinopage" });
            dispatch({ type: "DEL", key: "fullcasinoscreen" });
            dispatch({ type: "DEL", key: "casinolaunch" });
        };
    }, [provider, gameName, surePopular, state?.casinofilters?.games]);

    const fullScreen = (mode) => {
        if (mode === "view-full") {
            let iframe = document.getElementById("myIframe");
            if (iframe.requestFullscreen) {
                iframe.requestFullscreen();
            } else if (iframe.mozRequestFullScreen) { // Firefox
                iframe.mozRequestFullScreen();
            } else if (iframe.webkitRequestFullscreen) { // Chrome, Safari, Opera
                iframe.webkitRequestFullscreen();
            } else if (iframe.msRequestFullscreen) { // IE/Edge
                iframe.msRequestFullscreen();
            }
        }
    }
    return (
        <>
            {(!state?.fullcasinoscreen && !state?.hideBigIconNav) && (
                <section className="launched-game-header">
                    <div className="row">
                        <div className="col-10">
                            <span
                                className="py-1 pl-2 pr-3 mt-1 ml-3 bg-[rgba(255,255,255,0.1)] cursor-pointer"
                                onClick={() => navigate("/casino")}
                            >
                                <FaArrowLeftLong className="inline-block" />
                            </span>
                        </div>
                        <div className="dismiss-casino-game col-2 mx-auto">
                            <button
                                className="float-end px-2 my-2 rounded-md border border-gray-50 bg-[rgba(255,255,255,0.2)]"
                                onClick={() => fullScreen("view-full")}>
                                Fullscreen <MdFullscreen size={20} className="inline-block" />
                            </button>
                            {/* <span
                                className="casino-page-close cursor-pointer"
                                onClick={() => navigate("/casino")}
                            >
                                <MdOutlineClose />
                            </span> */}
                        </div>
                    </div>
                </section>
            )}
            <div className={`casino-launched-game-frame flex items-center justify-center ${state?.fullcasinoscreen && "h-[100vh]"}`}>
                <iframe
                    id="myIframe"
                    allow="autoplay; clipboard-write"
                    title={state?.casinolaunch?.game?.game?.game_name + state?.casinolaunch?.game?.game?.id}
                    width="100%"
                    height="100%"
                    allowFullScreen          // ✅ required
                    webkitAllowFullScreen    // ✅ Safari
                    mozAllowFullScreen       // ✅ Firefox (older)
                    src={noStateGame || ""}
                ></iframe>
            </div>
        </>
    );
};

export default React.memo(CasinoLaunchedGame);
