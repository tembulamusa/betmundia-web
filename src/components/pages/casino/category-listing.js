import React, { useEffect } from "react";
import CasinoGame from "./casino-game";
import { useNavigate, useParams } from "react-router-dom";

const GameCategoryListing = (props) => {
    const { filterType, gameType, categoryType } = useParams();
    const navigate = useNavigate();
    const { gamestype, games, gamesprovider } = props;

    const isShowingAll = window.location.pathname.endsWith("/all");

    const fetchAllCategoryGames = (gameType) => {

        if (filterType === "providers") {
            navigate(`/casino/providers/${gameType}/all`);
        } else if (filterType === "providercategory") {
            if (gamesprovider?.id) {
                navigate(`/casino/providers/${gamesprovider.id}/categories/${gameType}/all`);
            }
        } else {
            navigate(`/casino/categories/${gameType}/all`);
        }
    };

    return (
        <>
            {!isShowingAll ? (
                <div className="category-products">
                    <section className="casino-category-header px-2 py-2">
                        {gamestype}
                        <span
                            className="hover:underline cursor-pointer float-end pr-3 mr-3"
                            onClick={() => fetchAllCategoryGames(gamestype)}
                        >
                            All
                        </span>
                    </section>

                    <section className="row !mx-0 pr-[2px]">
                        {games?.map((game, idx) => (
                            <div key={"casino-" + idx} className="casino-game col-md-2">
                                <CasinoGame game={game} />
                            </div>
                        ))}
                    </section>
                </div>
            ) : (
                <span className="!mx-0 pr-[2px]">
                    {games?.map((game, idx) => (
                        <div key={"casino-" + idx} className="casino-game col-md-2">
                            <CasinoGame game={game} />
                        </div>
                    ))}
                </span>
            )}
        </>
    );
};

export default React.memo(GameCategoryListing);