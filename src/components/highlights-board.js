import React from "react";
import FreeBet from "./highlights/free-bet";
import PopularGames from "./highlights/popular-games"
const HighlightsBoard = (props) => {

    return (
        <>
            <div className="flex popular-highlight-games">
                <div className=""><FreeBet /></div>
                <div className="highlights"><PopularGames /></div>
            </div>
        </>
    )
}

export default React.memo(HighlightsBoard)