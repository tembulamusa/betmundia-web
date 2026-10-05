import React, { useContext } from "react";
import FreeBet from "./highlights/free-bet";
import PopularGames from "./highlights/popular-games";
import { Context } from "../context/store";
import { getFromLocalStorage } from "./utils/local-storage";

const HighlightsBoard = () => {
    const [state] = useContext(Context);
    const user = state?.user || getFromLocalStorage("user");
    const hasFreebet = Number(user?.has_freebet) === 1;

    return (
        <div
            className={`flex popular-highlight-games${hasFreebet ? " has-freebet" : " no-freebet"}`}
        >
            <div className="highlights-freebet-slot">
                <FreeBet />
            </div>
            {/* Popular games: mobile only — desktop keeps freebet-only highlights */}
            <div className="highlights highlights-popular-mobile-only md:hidden">
                <PopularGames />
            </div>
        </div>
    );
};

export default React.memo(HighlightsBoard);
