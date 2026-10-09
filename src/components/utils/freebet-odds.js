/**
 * The freebet match payload keys markets either by name ("1x2") or by
 * sub_type_id ("1"). Return the 1x2 market whichever shape comes back.
 */
export const get1x2Market = (odds) => {
    if (!odds || typeof odds !== "object") return null;
    if (odds["1x2"]) return odds["1x2"];
    if (odds["1"]) return odds["1"];
    return (
        Object.values(odds).find(
            (m) => m && (String(m.sub_type_id) === "1" || String(m.name).toLowerCase() === "1x2")
        ) || null
    );
};

/** Put the 1x2 market (outcomes sorted 1, X, 2) under odds["1x2"]. */
export const normalizeFreebetOdds = (data) => {
    const market = get1x2Market(data?.odds);
    if (!market) return data;
    if (Array.isArray(market.outcomes)) {
        market.outcomes = [...market.outcomes].sort(
            (a, b) => Number(a.outcome_id) - Number(b.outcome_id)
        );
    }
    data.odds = { ...data.odds, "1x2": market };
    return data;
};
