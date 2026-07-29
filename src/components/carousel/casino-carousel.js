import React from "react";
import { useNavigate } from "react-router-dom";
import { FaUsers } from "react-icons/fa";
import { getFromLocalStorage } from "../utils/local-storage";
import CasinoBannerMain from "../../assets/img/backgrounds/main_casino_banner.jpeg";
import defaultCasinoThumb from "../../assets/img/casino/casino-default-thumbnail.jpeg";

const formatKSh = (value) =>
    `KSh ${Number(value).toLocaleString("en-KE", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
    })}`;

const resolveGameImage = (url) => {
    if (typeof url === "string" && url.trim()) return url.trim();
    return defaultCasinoThumb;
};

const fallbackLeadingBets = [
    { id: "lb-1", game: "Aviator", amount: formatKSh(1123456.2), players: "2,451", image: defaultCasinoThumb, link: "/casino/providers/spribe", requiresAuth: false },
    { id: "lb-2", game: "JetX", amount: formatKSh(856432.5), players: "1,832", image: defaultCasinoThumb, link: "/casino-game/smartsoft/jetx", requiresAuth: false },
    { id: "lb-3", game: "Aviatrix", amount: formatKSh(974210.8), players: "3,104", image: defaultCasinoThumb, link: "/casino-game/aviatrix/aviatrix", requiresAuth: false },
    { id: "lb-4", game: "Spaceman", amount: formatKSh(642891.3), players: "1,567", image: defaultCasinoThumb, link: "/casino/providers/pragmatic", requiresAuth: false },
    { id: "lb-5", game: "Mundial League", amount: formatKSh(1287654.9), players: "4,220", image: defaultCasinoThumb, link: "/casino-game/unicraft/mundial-league", requiresAuth: true },
    { id: "lb-6", game: "Live Casino", amount: formatKSh(731045.6), players: "2,018", image: defaultCasinoThumb, link: "/casino/categories/livegames", requiresAuth: false },
];

const CasinoCarousel = () => {
    const navigate = useNavigate();
    const user = getFromLocalStorage("user");
    const storedGames = getFromLocalStorage("casinogames");

    const leadingBets = Array.isArray(storedGames)
        ? storedGames
            .flatMap((category) => Array.isArray(category?.gameList) ? category.gameList : [])
            .filter((game) => game?.game_name && game?.provider_name)
            .slice(0, 8)
            .map((game, index) => {
                const amounts = [1123456.2, 856432.5, 974210.8, 642891.3, 1287654.9, 731045.6, 905120.4, 1188340.7];
                const playerCounts = [2451, 1832, 3104, 1567, 4220, 2018, 2789, 1643];
                const providerSlug = game.provider_name.split(" ").join("-").toLowerCase();
                const gameSlug = game.game_name.split(" ").join("-").toLowerCase();

                return {
                    id: `game-${game.game_id || index}`,
                    game: game.game_name,
                    amount: formatKSh(amounts[index % amounts.length]),
                    players: playerCounts[index % playerCounts.length].toLocaleString("en-KE"),
                    image: resolveGameImage(game.image_url),
                    link: `/casino-game/${providerSlug}/${gameSlug}`,
                    requiresAuth: false,
                };
            })
        : fallbackLeadingBets;

    const handleNavigation = (item) => {
        if (!item?.link) return;

        if (item.requiresAuth && !user) {
            navigate(`/login?next=${encodeURIComponent(item.link)}`);
        } else {
            navigate(item.link);
        }
    };

    return (
        <section
            className="casino-leading-bets-banner"
            style={{ backgroundImage: `linear-gradient(90deg, rgba(7, 13, 37, 0.92), rgba(18, 21, 48, 0.72)), url(${CasinoBannerMain})` }}
        >
            <div className="casino-leading-bets-inner">
                <div className="casino-leading-bets-label">
                    <span className="casino-leading-bets-kicker">Casino</span>
                    <span className="casino-leading-bets-title">Leading Bets</span>
                </div>

                <div className="casino-leading-bets-marquee" aria-label="Leading bets ticker">
                    <div className="casino-leading-bets-track">
                        {[...leadingBets, ...leadingBets].map((item, index) => (
                            <button
                                key={`${item.id}-${index}`}
                                type="button"
                                className="casino-leading-bet-item"
                                onClick={() => handleNavigation(item)}
                            >
                                <img
                                    className="casino-leading-bet-thumb"
                                    src={item.image}
                                    alt={item.game}
                                    loading="lazy"
                                />
                                <span className="casino-leading-bet-info">
                                    <span className="casino-leading-bet-amount">{item.amount}</span>
                                    <span className="casino-leading-bet-meta">
                                        <span className="casino-leading-bet-players">
                                            <FaUsers aria-hidden="true" className="casino-leading-bet-players-icon" />
                                            <span>{item.players}</span>
                                        </span>
                                        <span className="casino-leading-bet-play">PLAY</span>
                                    </span>
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default React.memo(CasinoCarousel);
