import React, { useContext, useEffect, useState } from "react";
import { Context } from "../../../context/store";
import { getFromLocalStorage, setLocalStorage, removeItem } from "../../utils/local-storage";
import { useNavigate, useParams } from "react-router-dom";
import { MdOutlineClose } from "react-icons/md";
import { FaArrowLeftLong } from "react-icons/fa6";
import { isMobile } from "react-device-detect";
import makeRequest from "../../utils/fetch-request";
import { MdFullscreen } from "react-icons/md";
import { useLocation } from "react-router-dom";


const CasinoLaunchedGame = (props) => {
    const [state, dispatch] = useContext(Context);
    const navigate = useNavigate();
    const user = getFromLocalStorage("user");
    const [noStateGame, setNoStateGame] = useState();
    const fullScreens = ["aviatrix"];
    const { provider, gameName } = useParams();
    const [bitvilleGame, setBitvilleGame] = useState(false);
    const surePopular = window.location.pathname.includes("sure-popular");
    const directLaunch = ['mundial-league', 'aviator', 'jetx', 'aviatrix'];
    const location = useLocation();


    const handleSessionExpired = () => {
        removeItem("user");
        removeItem("casinolaunch");
        dispatch({ type: "DEL", key: "user" });
        dispatch({ type: "SET", key: "casinolaunch", payload: { game: "", url: "" } });
        dispatch({ type: "SET", key: "showloginmodal", payload: true });
        dispatch({ type: "SET", key: "sessionMessage", payload: "Session expired. Please log in again." });
        navigate("/casino");
    };

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
                    const url = result?.gameUrl || result?.game_url || result?.token;
                    if (url) {
                        setNoStateGame(url);
                        if (result?.aggregator?.toLowerCase() == "bitville") {
                            dispatch({ type: "SET", key: "bitvilleGame", payload: result });
                        }
                    } else {
                        handleSessionExpired();
                    }
                } else {
                    navigate("/casino");
                }
            }
        );
    };

    const launchOldWay = async () => {
        let endpoint = `Unicraft/casino/game-url/${isMobile ? "mobile" : "desktop"}/${1}/${"uicraftvirtuals"}`;
        if (provider.toLowerCase() === "aviatorllc") {
            endpoint = `Bitville/casino/game-url/${isMobile ? "mobile" : "desktop"}/${1}/14914`;
        }
        if (gameName.toLowerCase() === "aviator") {
            endpoint = `Bitville/casino/game-url/${isMobile ? "mobile" : "desktop"}/${1}/1370`;
        }
        if (gameName.toLowerCase() === "jetx") {
            endpoint = `SmartSoft/casino/game-url/${isMobile ? "mobile" : "desktop"}/${1}/13`;
        }
        if (gameName.toLowerCase() === "aviatrix") {
            endpoint = `Aviatrix/casino/game-url/${isMobile ? "mobile" : "desktop"}/${1}/nft-aviatrix`;
        }
        await makeRequest({ url: endpoint, method: "GET", api_version: "CasinoGameLaunch" }).then(
            ([status, result]) => {
                if (status === 200) {
                    const url = result?.gameUrl || result?.game_url || result?.token;
                    if (url) {
                        setNoStateGame(url);
                        if (result?.aggregator?.toLowerCase() == "bitville") {
                            dispatch({ type: "SET", key: "bitvilleGame", payload: result });
                            setBitvilleGame(true);
                        }
                    } else {
                        handleSessionExpired();
                    }
                } else {
                    navigate("/casino");
                }
                // alert("Launching game, please wait..." + JSON.stringify(result));
            }
        );
        dispatch({ type: "SET", key: "casinolaunch", payload: { game: '', url: '' } });
        setLocalStorage("casinolaunch", { game: '', url: '' })

    };


    useEffect(() => {
        dispatch({ type: "SET", key: "iscasinopage", payload: true });
        if (surePopular) {
            const gameId = findGameId(provider, gameName);
            if (gameId) {
                fetchGameUrl(provider, gameId);
            } else {
                navigate("/casino");
            }
        } else {
            if (directLaunch?.includes(gameName.toLowerCase())) {
                launchOldWay();
            } else {
                let game = state?.casinolaunch || getFromLocalStorage("casinolaunch");
                dispatch({ type: "SET", key: "casinolaunch", payload: game });
                const parsedUrl = game?.url || game?.game?.token || game?.gameUrl || game?.game?.game_url;
                if (parsedUrl || game?.game?.aggregator?.toLowerCase() === "bitville") {
                    if (game?.aggregator?.toLowerCase() === "bitville"
                        || game?.game?.aggregator?.toLowerCase() === "bitville"
                    ) {
                        setBitvilleGame(true);
                        if (!state?.bitvilleGame) {
                            dispatch({ type: "SET", key: "bitvilleGame", payload: game?.game ? game.game : game });
                        }
                    }
                    setNoStateGame(parsedUrl);
                } else {
                    handleSessionExpired();
                }
            }
        }

        // Cleanup function
        return () => {
            dispatch({ type: "DEL", key: "iscasinopage" });
            dispatch({ type: "DEL", key: "fullcasinoscreen" });
            dispatch({ type: "DEL", key: "casinolaunch" });
            dispatch({ type: "DEL", key: "bitvilleGame" });
            removeItem("casinolaunch");
            removeItem("bitvilleGame");
            setBitvilleGame(false);
            setNoStateGame(null);

        };
    }, [provider, gameName, surePopular, state?.casinofilters?.games, location.pathname]);

    const requestTokenSuccess = async () => {
        let game = state?.casinolaunch || getFromLocalStorage("casinolaunch");
        game = game?.game ? game.game : game;
        let endpoint = `${game?.aggregator ? game?.aggregator : game?.provider_name}/casino/game-url/${isMobile ? "mobile" : "desktop"}/1/${game.game_id}`;
        await makeRequest({ url: endpoint, method: "GET", api_version: 'CasinoGameLaunch' }).then(([status, result]) => {
            // alert("Requesting new token, please wait..." + JSON.stringify(result));
            if (status == 200 && result?.tea_pot == null) {
                let launchUrl = result?.game_url || result?.gameUrl;
                dispatch({ type: "SET", key: "casinolaunch", payload: { game: game, url: launchUrl } });
                setLocalStorage("casinolaunch", { game: game, url: launchUrl })
                if (game?.aggregator?.toLowerCase() == "bitville") {
                    dispatch({ type: "SET", key: "bitvilleGame", payload: result });
                }
                return true;
            } else {
                return false
            }
        });
        return false;

    }
    useEffect(() => {
        if (!bitvilleGame) return;
        let urlRequestAttemps = state?.bitvilleGame?.token ? 1 : 0;
        if (urlRequestAttemps === 0) {
            const requestUrl = requestTokenSuccess();
            if (requestUrl) {
                urlRequestAttemps = 1;
            }
        }
        if (urlRequestAttemps !== 1) {
            handleSessionExpired();
            return
        };
        const script = document.createElement("script");
        script.src = `${state?.bitvilleGame?.game_base_url}/js/BVComponents.min.js?v=1.1.0`;
        script.async = true;

        script.onload = () => {
            if (!window.bv?.Parent) return;
            const bvComponent = new window.bv.Parent(
                "bv-loader",
                `${state?.bitvilleGame?.game_base_url}/partner`
            );

            bvComponent.setParam("token", state?.bitvilleGame?.token);
            bvComponent.setParam("provider", state?.bitvilleGame?.provider);
            bvComponent.setParam("game", state?.bitvilleGame?.game);
            bvComponent.setParam("demoMode", state?.bitvilleGame?.demo);
            bvComponent.setParam("demoOverlay", state?.bitvilleGame?.demo_overlay);
            bvComponent.createComponent();
        };

        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, [bitvilleGame]);

    const fullScreen = (mode) => {
        if (mode === "view-full") {
            let iframe = document.getElementById("myIframe")
                ||
                document.getElementById("bv-loader")?.getElementsByTagName("iframe")[0];
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
                {
                    bitvilleGame
                        ?
                        <div
                            id="bv-loader"
                            style={{ height: "100%", width: "100%" }}
                        >
                            {
                                !state?.bitvilleGame?.token
                                &&
                                <div class="flex items-start gap-3 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-red-800">
                                    <svg class="h-10 w-10 text-red-500 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round"
                                            d="M12 9v2m0 4h.01M5.455 19h13.09c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.723 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>

                                    <div>
                                        <p class="font-semibold text-2xl">Error</p>
                                        <p class="">
                                            Something went wrong. Please try again.
                                        </p>
                                    </div>
                                </div>
                            }
                        </div>
                        :
                        <>
                            <iframe
                                id="myIframe"
                                key={provider + gameName}
                                allow="autoplay; clipboard-write, fullscreen; encrypted-media; picture-in-picture; web-share"
                                title={state?.casinolaunch?.game?.game?.game_name + state?.casinolaunch?.game?.game?.id}
                                width="100%"
                                height="100%"
                                allowFullScreen          // ✅ required
                                webkitAllowFullScreen    // ✅ Safari
                                mozAllowFullScreen       // ✅ Firefox (older)
                                src={noStateGame || ""}
                            ></iframe>
                        </>
                }
            </div>
        </>
    );
};

export default React.memo(CasinoLaunchedGame);
