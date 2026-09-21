import React from "react";
import { useNavigate } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import { getFromLocalStorage } from "../utils/local-storage";
import CasinoBannerMain from "../../assets/img/backgrounds/main_casino_banner.jpeg";
import defaultCasinoThumb from "../../assets/img/casino/casino-default-thumbnail.jpeg";

const formatKES = (value) =>
    `KES ${Number(value).toLocaleString("en-KE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;

/** Masked phone-style label matching the leading-bet card mock (e.g. 0***2). */
const maskUserLabel = (seed) => {
    const n = Math.abs(Number(seed) || 0);
    const first = String(n % 10);
    const last = String(Math.floor(n / 10) % 10);
    return `${first}***${last}`;
};

const resolveGameImage = (url) => {
    if (typeof url === "string" && url.trim()) return url.trim();
    return defaultCasinoThumb;
};

const fallbackLeadingBets = [
    { id: "lb-1", game: "Aviator", amount: formatKES(37920), user: "0***2", image: defaultCasinoThumb, link: "/casino/providers/spribe", requiresAuth: false },
    { id: "lb-2", game: "JetX", amount: formatKES(856432.5), user: "7***1", image: defaultCasinoThumb, link: "/casino-game/smartsoft/jetx", requiresAuth: false },
    { id: "lb-3", game: "Aviatrix", amount: formatKES(974210.8), user: "2***4", image: defaultCasinoThumb, link: "/casino-game/aviatrix/aviatrix", requiresAuth: false },
    { id: "lb-4", game: "Spaceman", amount: formatKES(642891.3), user: "5***8", image: defaultCasinoThumb, link: "/casino/providers/pragmatic", requiresAuth: false },
    { id: "lb-5", game: "Mundial League", amount: formatKES(1287654.9), user: "1***6", image: defaultCasinoThumb, link: "/casino-game/unicraft/mundial-league", requiresAuth: true },
    { id: "lb-6", game: "Live Casino", amount: formatKES(731045.6), user: "9***3", image: defaultCasinoThumb, link: "/casino/categories/livegames", requiresAuth: false },
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
                const amounts = [37920, 856432.5, 974210.8, 642891.3, 1287654.9, 731045.6, 905120.4, 1188340.7];
                const providerSlug = game.provider_name.split(" ").join("-").toLowerCase();
                const gameSlug = game.game_name.split(" ").join("-").toLowerCase();

                return {
                    id: `game-${game.game_id || index}`,
                    game: game.game_name,
                    amount: formatKES(amounts[index % amounts.length]),
                    user: maskUserLabel(game.game_id ?? index * 17 + 3),
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
                                aria-label={`${item.game}: ${item.amount}, play`}
                            >
                                <img
                                    className="casino-leading-bet-thumb"
                                    src={item.image}
                                    alt=""
                                    loading="lazy"
                                />
                                <span className="casino-leading-bet-info">
                                    <span className="casino-leading-bet-amount">{item.amount}</span>
                                    <span className="casino-leading-bet-user">
                                        <FaUser aria-hidden="true" className="casino-leading-bet-user-icon" />
                                        <span>{item.user}</span>
                                    </span>
                                </span>
                                <span className="casino-leading-bet-play" aria-hidden="true">PLAY</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default React.memo(CasinoCarousel);
