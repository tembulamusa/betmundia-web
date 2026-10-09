import React from "react";
import PopularGames from "./highlights/popular-games";

const HighlightsBoard = () => {
    return (
        <div
            className="flex popular-highlight-games no-freebet"
        >
            {/* Free bets now live in the free bet modal (header notice). Popular games: mobile only. */}
            <div className="highlights highlights-popular-mobile-only md:hidden">
                <PopularGames />
            </div>
        </div>
    );
};

export default React.memo(HighlightsBoard);
