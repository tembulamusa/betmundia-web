import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import makeRequest from "./utils/fetch-request";
import { Context } from "../context/store";
import {
    persistJackpotArchive,
    readStoredJackpotArchive,
    typeParamValue,
} from "./utils/jackpot-data";

const MONTHS = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
];

const formatKes = (value) => {
    const num = Number(value);
    if (!Number.isFinite(num)) {
        return "KSH 0.00";
    }
    return `KSH ${Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(num)}`;
};

const pad2 = (n) => String(n).padStart(2, "0");

const formatDrawDate = (raw, fallbackDate) => {
    if (raw && typeof raw === "string" && raw.includes("/")) {
        return raw;
    }
    const source = raw || fallbackDate;
    if (!source) {
        return "--/--/--";
    }
    const d = new Date(source);
    if (Number.isNaN(d.getTime())) {
        return String(raw || fallbackDate);
    }
    const yy = String(d.getFullYear()).slice(-2);
    return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${yy}`;
};

const normalizePrizes = (payload, totalGames) => {
    const total =
        Number(payload?.total_games ?? payload?.totalGames ?? totalGames) || 17;
    const raw =
        payload?.prizes ||
        payload?.winnings ||
        payload?.bonus ||
        payload?.prize_tiers ||
        payload?.tiers ||
        [];

    if (Array.isArray(raw) && raw.length) {
        return raw.map((tier) => {
            const correct =
                Number(
                    tier?.correct ??
                        tier?.hits ??
                        tier?.score ??
                        tier?.correct_games ??
                        (typeof tier?.label === "string"
                            ? tier.label.split("/")[0]
                            : null)
                ) || 0;
            const amount = Number(
                tier?.amount ?? tier?.prize ?? tier?.value ?? tier?.win ?? 0
            );
            return {
                key: `${correct}/${total}`,
                label: `${correct}/${total}`,
                amount,
            };
        });
    }

    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
        return Object.entries(raw).map(([label, amount]) => ({
            key: label,
            label,
            amount: Number(amount) || 0,
        }));
    }

    return [];
};

const normalizeArchive = (payload) => {
    const data = payload?.data ?? payload ?? null;
    if (!data || typeof data !== "object") {
        return null;
    }

    const id = data?.id ?? data?.jackpot_event_id ?? data?.draw_id ?? null;
    const totalGames = Number(data?.total_games ?? data?.totalGames) || 17;
    const year = Number(data?.year) || null;
    const month = Number(data?.month) || null;

    return {
        id,
        dateLabel: formatDrawDate(
            data?.draw_date || data?.date_label || data?.display_date,
            data?.date || data?.draw_time || data?.created_at || data?.end_time
        ),
        jackpotName: data?.jackpot_name || data?.name || "Jackpot",
        totalGames,
        jackpotAmount: Number(
            data?.jackpot_amount ?? data?.prize_pool ?? data?.total_prize ?? 0
        ),
        prizes: normalizePrizes(data, totalGames),
        year,
        month,
        hasPrev: Boolean(
            data?.has_prev ??
                data?.hasPrev ??
                data?.prev_id ??
                data?.previous_id ??
                data?.prev
        ),
        hasNext: Boolean(
            data?.has_next ?? data?.hasNext ?? data?.next_id ?? data?.next
        ),
        prevId: data?.prev_id ?? data?.previous_id ?? null,
        nextId: data?.next_id ?? null,
        years: Array.isArray(data?.years) ? data.years.map(Number) : null,
        months: Array.isArray(data?.months) ? data.months.map(Number) : null,
    };
};

const buildYearOptions = (fromApi) => {
    const current = new Date().getFullYear();
    if (Array.isArray(fromApi) && fromApi.length) {
        return [...new Set(fromApi.filter(Boolean))].sort((a, b) => b - a);
    }
    return Array.from({ length: 6 }, (_, i) => current - i);
};

const JackpotArchive = ({ active = false, jackpotName, selectedType, typeSlug }) => {
    const [, dispatch] = useContext(Context);
    const now = useMemo(() => new Date(), []);
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [drawId, setDrawId] = useState(null);
    const [archive, setArchive] = useState(null);
    const [yearOptions, setYearOptions] = useState(() => buildYearOptions());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [prizesOpen, setPrizesOpen] = useState(true);
    const requestSeq = useRef(0);
    const selectedTypeRef = useRef(selectedType);
    const typeSlugRef = useRef(typeSlug);
    const hasFetchedForTab = useRef(false);

    selectedTypeRef.current = selectedType;
    typeSlugRef.current =
        typeSlug || typeParamValue(selectedType) || "default";

    const resolvedTypeSlug = typeSlugRef.current;

    const titleName = (
        archive?.jackpotName ||
        jackpotName ||
        selectedType?.jackpot_name ||
        selectedType?.label ||
        "Jackpot"
    ).toUpperCase();

    const storeArchive = useCallback(
        (payload) => {
            const stored = {
                ...payload,
                year,
                month,
                fetchedAt: Date.now(),
            };
            persistJackpotArchive(typeSlugRef.current, stored, dispatch);
            return stored;
        },
        [dispatch, month, year]
    );

    const applyNormalized = useCallback(
        (normalized) => {
            if (!normalized) {
                return;
            }
            setArchive(normalized);
            if (normalized.id != null) {
                setDrawId(normalized.id);
            }
            if (normalized.years?.length) {
                setYearOptions(buildYearOptions(normalized.years));
            }
            storeArchive(normalized);
        },
        [storeArchive]
    );

    const fetchArchive = useCallback(
        async ({ year: y, month: m, id = null, direction = null } = {}) => {
            const seq = ++requestSeq.current;
            setLoading(true);
            setError(null);

            const selected = selectedTypeRef.current;
            const params = new URLSearchParams();
            if (y) params.set("year", String(y));
            if (m) params.set("month", String(m));
            if (id != null && id !== "") params.set("id", String(id));
            if (direction) params.set("direction", direction);

            const eventId = selected?.jackpot_event_id ?? selected?.id;
            const typeParam =
                typeSlugRef.current ||
                selected?.jackpot_type ||
                selected?.type;
            if (eventId) params.set("jackpot_event_id", String(eventId));
            if (typeParam) params.set("type", String(typeParam));

            const url = `/jackpot/archive?${params.toString()}`;
            const [status, result] = await makeRequest({
                url,
                method: "GET",
                api_version: 2,
            });

            if (seq !== requestSeq.current) {
                return;
            }

            setLoading(false);

            if (status === 200) {
                const normalized = normalizeArchive(result);
                if (normalized?.id != null || normalized?.prizes?.length) {
                    applyNormalized(normalized);
                    return;
                }
                setArchive(null);
                setDrawId(null);
                setError("No archive data found for this selection.");
                return;
            }

            setArchive(null);
            setDrawId(null);
            setError(
                status
                    ? `Unable to load archive (status ${status}).`
                    : "Unable to load archive. Please try again."
            );
        },
        [applyNormalized]
    );

    // Request archives only while Archive tab is active; store each result.
    useEffect(() => {
        if (!active) {
            hasFetchedForTab.current = false;
            return;
        }

        if (!hasFetchedForTab.current) {
            const cached = readStoredJackpotArchive(resolvedTypeSlug);
            // Ignore any previously stored demo payloads — API only.
            if (
                cached &&
                !cached._demo &&
                (cached?.prizes || cached?.dateLabel || cached?.id != null)
            ) {
                setArchive(cached);
                if (cached.id != null) setDrawId(cached.id);
                if (cached.year) setYear(Number(cached.year));
                if (cached.month) setMonth(Number(cached.month));
            }
            hasFetchedForTab.current = true;
        }

        void fetchArchive({ year, month, id: null });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        active,
        year,
        month,
        resolvedTypeSlug,
        selectedType?.jackpot_event_id,
        selectedType?.id,
        selectedType?.jackpot_type,
        selectedType?.type,
        typeSlug,
        fetchArchive,
    ]);

    const onPrev = () => {
        if (loading) return;
        if (archive?.prevId != null) {
            void fetchArchive({ year, month, id: archive.prevId });
            return;
        }
        void fetchArchive({ year, month, id: drawId, direction: "prev" });
    };

    const onNext = () => {
        if (loading) return;
        if (archive?.nextId != null) {
            void fetchArchive({ year, month, id: archive.nextId });
            return;
        }
        void fetchArchive({ year, month, id: drawId, direction: "next" });
    };

    const monthOptions = useMemo(() => {
        if (archive?.months?.length) {
            return MONTHS.filter((item) => archive.months.includes(item.value));
        }
        return MONTHS;
    }, [archive?.months]);

    const disablePrev = loading || (archive && archive.hasPrev === false && archive.prevId == null);
    const disableNext = loading || (archive && archive.hasNext === false && archive.nextId == null);

    return (
        <div className="jackpot-archive">
            <div className="jackpot-archive__title-bar">
                <span className="jackpot-archive__ball" aria-hidden="true" />
                <h2 className="jackpot-archive__title">{titleName} ARCHIVE</h2>
            </div>

            <div className="jackpot-archive__filters">
                <label className="jackpot-archive__filter">
                    <span className="jackpot-archive__filter-label">Year</span>
                    <select
                        className="jackpot-archive__select"
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        aria-label="Archive year"
                    >
                        {yearOptions.map((y) => (
                            <option key={y} value={y}>
                                {y}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="jackpot-archive__filter">
                    <span className="jackpot-archive__filter-label">Month</span>
                    <select
                        className="jackpot-archive__select"
                        value={month}
                        onChange={(e) => setMonth(Number(e.target.value))}
                        aria-label="Archive month"
                    >
                        {monthOptions.map((item) => (
                            <option key={item.value} value={item.value}>
                                {item.label}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            <div className="jackpot-archive__nav">
                <button
                    type="button"
                    className="jackpot-archive__nav-btn"
                    onClick={onPrev}
                    disabled={disablePrev}
                    aria-label="Previous archive draw"
                >
                    &lt;
                </button>

                <div className="jackpot-archive__nav-center">
                    <div className="jackpot-archive__date">
                        {loading && !archive ? "Loading..." : archive?.dateLabel || "--/--/--"}
                    </div>
                    <div className="jackpot-archive__id">
                        ID: {archive?.id ?? drawId ?? "—"}
                    </div>
                </div>

                <button
                    type="button"
                    className="jackpot-archive__nav-btn"
                    onClick={onNext}
                    disabled={disableNext}
                    aria-label="Next archive draw"
                >
                    &gt;
                </button>
            </div>

            <div className="jackpot-archive__prizes-heading">Prizes</div>

            {error && !archive ? (
                <div className="jackpot-archive__empty">{error}</div>
            ) : (
                <div className={`jackpot-archive__card${prizesOpen ? " is-open" : ""}`}>
                    <div className="jackpot-archive__card-head">
                        <div>
                            <div className="jackpot-archive__card-name">
                                {archive?.jackpotName || titleName}{" "}
                                {archive?.totalGames
                                    ? `${archive.totalGames}/${archive.totalGames}`
                                    : ""}
                            </div>
                            <div className="jackpot-archive__card-amount">
                                {formatKes(archive?.jackpotAmount)}
                            </div>
                        </div>
                        <button
                            type="button"
                            className="jackpot-archive__collapse"
                            onClick={() => setPrizesOpen((open) => !open)}
                            aria-expanded={prizesOpen}
                            aria-label={prizesOpen ? "Collapse prizes" : "Expand prizes"}
                        >
                            {prizesOpen ? "−" : "+"}
                        </button>
                    </div>

                    {prizesOpen && (
                        <div className="jackpot-archive__tiers">
                            {(archive?.prizes || []).map((tier) => {
                                const hasWin = Number(tier.amount) > 0;
                                return (
                                    <div key={tier.key} className="jackpot-archive__tier">
                                        <div className="jackpot-archive__tier-label">
                                            {tier.label}
                                        </div>
                                        <div
                                            className={`jackpot-archive__tier-amount${
                                                hasWin ? " is-win" : ""
                                            }`}
                                        >
                                            {formatKes(tier.amount)}
                                        </div>
                                    </div>
                                );
                            })}
                            {!archive?.prizes?.length && (
                                <div className="jackpot-archive__empty jackpot-archive__empty--inline">
                                    {loading ? "Loading prizes..." : "No prize data."}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default JackpotArchive;
