import React, { useContext, useEffect, useMemo } from "react";
import { FaCoins } from "react-icons/fa";
import { useSearchParams } from "react-router-dom";
import { Context } from "../../context/store";
import {
    TYPE_QUERY_PARAM,
    getJackpotTypes,
    matchesTypeParam,
    persistJackpotTypes,
    refreshJackpotTypes,
    typeKey,
    typeLabel,
    typeParamValue,
} from "../utils/jackpot-data";

/**
 * Left sidebar for /jackpots — lists available jackpots (Sportpesa-style).
 * Data comes from context / localStorage (populated via /jackpot/list).
 */
const JackpotSidebar = () => {
    const [state, dispatch] = useContext(Context);
    const [searchParams, setSearchParams] = useSearchParams();
    const urlTypeParam = searchParams.get(TYPE_QUERY_PARAM);

    const jackpotTypes = useMemo(
        () => getJackpotTypes(state),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [state]
    );

    useEffect(() => {
        const cached = getJackpotTypes(state);
        if (cached.length) {
            persistJackpotTypes(cached, dispatch);
        }
        void refreshJackpotTypes(dispatch);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const selectType = (type) => {
        const value = String(typeParamValue(type));
        if (value === String(urlTypeParam ?? "")) {
            return;
        }
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.set(TYPE_QUERY_PARAM, value);
            return next;
        });
    };

    return (
        <div
            style={{
                display: "flex",
                overflow: "scroll initial",
                zIndex: 10,
                top: "100px",
            }}
            className="vh-100 sticky-top d-none d-md-block up col-md-2 pr-[6px] jackpot-sidebar-wrap"
        >
            <div className="jackpot-sidebar">
                <h1 className="jackpot-sidebar__title">Jackpots</h1>
                <ul className="jackpot-sidebar__list" aria-label="Jackpot types">
                    {jackpotTypes.length === 0 && (
                        <li className="jackpot-sidebar__empty">Loading jackpots…</li>
                    )}
                    {jackpotTypes.map((type) => {
                        const key = String(type.key || typeKey(type));
                        const isActive = matchesTypeParam(type, urlTypeParam);
                        return (
                            <li key={key}>
                                <button
                                    type="button"
                                    className={`jackpot-sidebar__item${isActive ? " active" : ""}`}
                                    onClick={() => selectType(type)}
                                    aria-current={isActive ? "page" : undefined}
                                >
                                    <span className="jackpot-sidebar__icon" aria-hidden="true">
                                        <FaCoins />
                                    </span>
                                    <span className="jackpot-sidebar__label">
                                        {type.label || typeLabel(type)}
                                    </span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
};

export default React.memo(JackpotSidebar);
