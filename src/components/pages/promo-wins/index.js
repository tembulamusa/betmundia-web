import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import {
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
} from "recharts";
import {
    FaArrowLeft,
    FaCalendarAlt,
    FaChevronDown,
    FaChevronLeft,
    FaChevronRight,
    FaCoins,
    FaCopy,
    FaFacebook,
    FaGift,
    FaHeadset,
    FaInstagram,
    FaPencilAlt,
    FaSearch,
    FaShareAlt,
    FaShieldAlt,
    FaTrophy,
    FaUser,
    FaUserCheck,
    FaUserSlash,
    FaUsers,
    FaWallet,
    FaWhatsapp,
    FaChartLine,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import PromoCode from "./promo-code";
import makeRequest from "../../utils/fetch-request";
import { formatToFloat } from "../../utils/formatters";
import { getFromLocalStorage } from "../../utils/local-storage";

const SUPPORT_EMAIL = "mailto:customercare@betmundial.com";

const HOW_IT_WORKS = [
    {
        id: "create",
        title: "Create",
        description: "Create your unique affiliate code.",
        Icon: FaPencilAlt,
    },
    {
        id: "share",
        title: "Share",
        description: "Share with friends and your network.",
        Icon: FaShareAlt,
    },
    {
        id: "earn",
        title: "Earn",
        description: "Your friends play, you earn rewards.",
        Icon: FaGift,
    },
];

const PERIOD_OPTIONS = [
    { value: "this_month", label: "This Month" },
    { value: "last_month", label: "Last Month" },
    { value: "all_time", label: "All Time" },
];

const STATUS_OPTIONS = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "pending", label: "Pending" },
    { value: "inactive", label: "Inactive" },
];

const TAB_DETAIL = 0;
const TAB_EARNINGS = 1;
const TAB_MEMBERS = 2;

const ROWS_PER_PAGE_OPTIONS = [5, 10, 25];

function a11yProps(index) {
    return {
        id: `affiliate-tab-${index}`,
        "aria-controls": `affiliate-tabpanel-${index}`,
    };
}

function pickList(source, keys) {
    if (!source) return [];
    for (const key of keys) {
        const value = source[key];
        if (Array.isArray(value)) return value;
        if (Array.isArray(value?.data)) return value.data;
        if (Array.isArray(value?.items)) return value.items;
    }
    return [];
}

function pickNumber(...candidates) {
    for (const value of candidates) {
        if (value == null || value === "") continue;
        const n = Number(value);
        if (Number.isFinite(n)) return n;
    }
    return 0;
}

function formatKes(value) {
    return `KES ${formatToFloat(value ?? 0)}`;
}

const MONTH_SHORT = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
];

function formatDisplayDate(value) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    const day = String(date.getDate()).padStart(2, "0");
    const month = MONTH_SHORT[date.getMonth()];
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    const hourStr = String(hours).padStart(2, "0");
    return `${day} ${month}, ${year} ${hourStr}:${minutes} ${ampm}`;
}

function getInitials(name) {
    if (!name) return "?";
    const parts = String(name).trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "?";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function avatarTone(index) {
    return index % 2 === 0 ? "pink" : "yellow";
}

function resolveMemberName(item, index) {
    return (
        item?.full_name ||
        item?.username ||
        item?.user_name ||
        item?.name ||
        item?.msisdn ||
        item?.phone ||
        item?.mobile ||
        `Member #${index + 1}`
    );
}

function resolveMemberPhone(item) {
    return item?.msisdn || item?.phone || item?.mobile || item?.phone_number || null;
}

function resolveMemberStatus(item) {
    const raw = String(
        item?.status || item?.member_status || item?.state || ""
    ).toLowerCase();
    if (raw.includes("active")) return "active";
    if (raw.includes("pending") || raw.includes("await")) return "pending";
    if (raw.includes("inactive") || raw.includes("dormant")) return "inactive";
    if (item?.first_activity || item?.first_bet_at || item?.last_activity) {
        return "active";
    }
    return "pending";
}

function resolveJoinedAt(item) {
    return (
        item?.joined_at ||
        item?.created_at ||
        item?.registered_at ||
        item?.date ||
        null
    );
}

function resolveFirstActivity(item) {
    return (
        item?.first_activity ||
        item?.first_bet_at ||
        item?.last_activity ||
        item?.updated_at ||
        null
    );
}

function resolveEarningDate(item) {
    return (
        item?.created_at ||
        item?.date ||
        item?.earned_at ||
        item?.paid_at ||
        item?.updated_at ||
        null
    );
}

function resolveEarningName(item, index) {
    return (
        item?.referred_by ||
        item?.username ||
        item?.user_name ||
        item?.name ||
        item?.member_name ||
        item?.msisdn ||
        `Referral #${index + 1}`
    );
}

function resolveLeaderboardEarnings(item) {
    return pickNumber(
        item?.last_month_earnings,
        item?.last_month_amount,
        item?.earnings,
        item?.amount,
        item?.total_earnings,
        item?.commission,
        item?.commission_amount,
        item?.balance
    );
}

function resolveLeaderboardMembers(item) {
    return pickNumber(
        item?.members,
        item?.member_count,
        item?.members_count,
        item?.total_members,
        item?.subscriber_count,
        item?.subscribers,
        item?.referrals,
        item?.referral_count,
        item?.total_referrals
    );
}

/**
 * Resolve affiliate code for leaderboard display.
 * Prefer explicit code fields; fall back to username-like identifiers.
 */
function resolveLeaderboardCode(item) {
    const raw =
        item?.redacted_code ||
        item?.display_code ||
        item?.masked_code ||
        item?.promo_code ||
        item?.affiliate_code ||
        item?.code ||
        item?.username ||
        item?.user_name ||
        null;
    if (raw == null || raw === "") return null;
    return String(raw);
}

/**
 * Light middle redaction for privacy (e.g. mosesula → mos***ula).
 * If the API already redacted (contains *), show as-is.
 * Pass showFull=true when the API intends full codes.
 */
function formatLeaderboardCode(code, { showFull = false } = {}) {
    if (!code) return "—";
    const s = String(code).trim();
    if (!s) return "—";
    if (showFull || s.includes("*")) return s;
    if (s.length <= 3) return `${s[0]}***`;
    if (s.length <= 5) {
        return `${s.slice(0, 1)}***${s.slice(-1)}`;
    }
    const start = Math.min(3, Math.max(2, Math.floor(s.length / 3)));
    const end = Math.min(3, Math.max(2, Math.floor(s.length / 3)));
    return `${s.slice(0, start)}***${s.slice(-end)}`;
}

/**
 * Normalize leaderboard rows from commissions payload or a dedicated API.
 * Preferred endpoint (confirm with backend):
 *   GET /user/affiliate/leaderboard?period=last_month  (api_version 2)
 */
function pickLeaderboardList(source) {
    return pickList(source, [
        "leaderboard",
        "top_earners",
        "top_affiliates",
        "affiliate_leaderboard",
        "last_month_earners",
        "last_month_leaderboard",
        "rankings",
    ]);
}

const CHART_COLORS = [
    "#e91e8c",
    "#ffc428",
    "#a71f66",
    "#3dd68c",
    "#ff52d4",
    "#5b8def",
    "#ff8fab",
    "#7dffb3",
];

/**
 * Turn gender/county payloads into [{ name, value }] slices.
 * Supports arrays of objects, or plain { Male: 10, Female: 5 } maps.
 */
function normalizeBreakdown(source, keys) {
    if (!source) return [];

    for (const key of keys) {
        const value = source[key];
        if (!value) continue;

        if (Array.isArray(value)) {
            return value
                .map((item) => {
                    if (item == null || typeof item !== "object") return null;
                    const name =
                        item.name ||
                        item.label ||
                        item.gender ||
                        item.county ||
                        item.key ||
                        item.category ||
                        null;
                    const amount = pickNumber(
                        item.value,
                        item.count,
                        item.total,
                        item.members,
                        item.amount,
                        item.percentage
                    );
                    if (!name || amount <= 0) return null;
                    return { name: String(name), value: amount };
                })
                .filter(Boolean);
        }

        if (typeof value === "object") {
            return Object.entries(value)
                .map(([name, raw]) => {
                    const amount =
                        typeof raw === "object" && raw != null
                            ? pickNumber(
                                  raw.value,
                                  raw.count,
                                  raw.total,
                                  raw.members,
                                  raw.amount
                              )
                            : pickNumber(raw);
                    if (!name || amount <= 0) return null;
                    return { name: String(name), value: amount };
                })
                .filter(Boolean);
        }
    }

    return [];
}

function pickGenderBreakdown(source) {
    return normalizeBreakdown(source, [
        "gender",
        "gender_breakdown",
        "gender_comparison",
        "gender_stats",
        "genders",
        "by_gender",
    ]);
}

function pickCountyBreakdown(source) {
    return normalizeBreakdown(source, [
        "county",
        "county_breakdown",
        "county_comparison",
        "county_stats",
        "counties",
        "by_county",
        "region_breakdown",
        "regions",
    ]);
}

function resolveEarningStatus(item) {
    const raw = String(item?.status || item?.payment_status || "").toLowerCase();
    if (raw.includes("paid") || raw.includes("withdrawn") || raw.includes("complete")) {
        return "paid";
    }
    if (raw.includes("pending") || raw.includes("process")) {
        return "pending";
    }
    return item?.paid_at ? "paid" : "pending";
}

function resolveEarningAmount(item) {
    return pickNumber(
        item?.amount,
        item?.commission,
        item?.earned,
        item?.earnings,
        item?.win_amount,
        item?.payout
    );
}

function resolveEarningType(item) {
    return (
        item?.type ||
        item?.commission_type ||
        item?.earning_type ||
        "Referral Commission"
    );
}

function isInPeriod(dateValue, period) {
    if (period === "all_time" || !dateValue) return true;
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return true;

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    if (period === "this_month") {
        return date.getFullYear() === year && date.getMonth() === month;
    }
    if (period === "last_month") {
        const last = new Date(year, month - 1, 1);
        return (
            date.getFullYear() === last.getFullYear() &&
            date.getMonth() === last.getMonth()
        );
    }
    return true;
}

function StatusBadge({ status, kind = "earning" }) {
    const label = status
        ? status.charAt(0).toUpperCase() + status.slice(1)
        : "—";
    return (
        <span className={`promo-wins-badge promo-wins-badge--${status || "neutral"}`}>
            {kind === "member" && !status ? "—" : label}
        </span>
    );
}

const LoadingPanel = ({ label }) => (
    <section className="promo-wins-empty" aria-busy="true" aria-label={label}>
        <p className="promo-wins-empty-title">Loading…</p>
    </section>
);

const OverviewCard = ({ label, value, sub, Icon, tone = "pink" }) => (
    <article className={`promo-wins-overview-card promo-wins-overview-card--${tone}`}>
        <span className="promo-wins-overview-icon" aria-hidden="true">
            <Icon />
        </span>
        <div className="promo-wins-overview-copy">
            <p className="promo-wins-overview-label">{label}</p>
            <p className="promo-wins-overview-value">{value}</p>
            {sub ? <p className="promo-wins-overview-sub">{sub}</p> : null}
        </div>
    </article>
);

const HowItWorks = () => (
    <section className="promo-wins-how" aria-label="How it works">
        {HOW_IT_WORKS.map(({ id, title, description, Icon }) => (
            <div className="promo-wins-how-item" key={id}>
                <span className="promo-wins-how-icon" aria-hidden="true">
                    <Icon />
                </span>
                <h3 className="promo-wins-how-title">{title}</h3>
                <p className="promo-wins-how-desc">{description}</p>
            </div>
        ))}
    </section>
);

const HowItWorksBrief = () => (
    <section className="promo-wins-how-brief" aria-label="How it works">
        <h2 className="promo-wins-how-brief-title">How it works</h2>
        <p className="promo-wins-how-brief-lead promo-wins-how-brief-lead--yellow">
            As simple as abc
        </p>
        <ol className="promo-wins-how-brief-list">
            {HOW_IT_WORKS.map(({ id, title, description }) => (
                <li key={id}>
                    <strong>{title}</strong> — {description}
                </li>
            ))}
        </ol>
        <p className="promo-wins-how-brief-cta">
            Thousands are earning, so should you.
        </p>
    </section>
);

const TrustBar = () => (
    <a
        className="promo-wins-trust"
        href={SUPPORT_EMAIL}
        aria-label="Trusted and Secure"
    >
        <span className="promo-wins-trust-icon" aria-hidden="true">
            <FaShieldAlt />
        </span>
        <span className="promo-wins-trust-copy">
            <strong>Trusted &amp; Secure</strong>
            <span className="promo-wins-trust-sep" aria-hidden="true">
                |
            </span>
            <span>Our platform is 100% secure and fair.</span>
        </span>
        <FaChevronRight className="promo-wins-trust-chevron" aria-hidden="true" />
    </a>
);

const LEADERBOARD_ENDPOINT =
    "/user/affiliate/leaderboard?period=last_month";
/** Confirm with backend — optional dedicated stats for gender/county pies. */
const AFFILIATE_STATS_ENDPOINT = "/user/affiliate/stats";

/** Shown when leaderboard/stats APIs (and commissions) return empty. */
const DUMMY_LEADERBOARD = [
    {
        code: "moses-tembula",
        members: 842,
        last_month_earnings: 186450,
    },
    {
        code: "BETKAREN",
        members: 619,
        last_month_earnings: 142800,
    },
    {
        code: "wanjiku-ke",
        members: 504,
        last_month_earnings: 98750,
    },
    {
        code: "BETOTIENO",
        members: 387,
        last_month_earnings: 76420,
    },
    {
        code: "njeri-mombasa",
        members: 298,
        last_month_earnings: 54100,
    },
    {
        code: "BETKAMAU",
        members: 215,
        last_month_earnings: 38950,
    },
];

const DUMMY_GENDER_BREAKDOWN = [
    { name: "Male", value: 58 },
    { name: "Female", value: 42 },
];

const DUMMY_COUNTY_BREAKDOWN = [
    { name: "Nairobi", value: 34 },
    { name: "Mombasa", value: 18 },
    { name: "Kisumu", value: 14 },
    { name: "Nakuru", value: 12 },
    { name: "Kiambu", value: 10 },
];

const DonutChart = ({ title, data, emptyLabel }) => {
    const total = data.reduce((sum, slice) => sum + slice.value, 0);
    const hasData = data.length > 0 && total > 0;

    return (
        <div className="promo-wins-donut" aria-label={title}>
            <h3 className="promo-wins-donut-title">{title}</h3>
            {hasData ? (
                <div className="promo-wins-donut-chart">
                    <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                            <Pie
                                data={data}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={48}
                                outerRadius={72}
                                paddingAngle={2}
                                stroke="rgba(7, 18, 37, 0.85)"
                                strokeWidth={2}
                            >
                                {data.map((entry, index) => (
                                    <Cell
                                        key={`${entry.name}-${index}`}
                                        fill={
                                            CHART_COLORS[
                                                index % CHART_COLORS.length
                                            ]
                                        }
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value, name) => [value, name]}
                                contentStyle={{
                                    background: "#0f1a2e",
                                    border: "1px solid rgba(255,255,255,0.12)",
                                    borderRadius: 5,
                                    fontSize: 12,
                                }}
                                itemStyle={{ color: "#fff" }}
                            />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                iconType="circle"
                                wrapperStyle={{
                                    fontSize: 11,
                                    color: "rgba(255,255,255,0.7)",
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <p className="promo-wins-donut-empty">{emptyLabel}</p>
            )}
        </div>
    );
};

const LeaderboardPanel = ({ commissions, promoCode, onRequestGetCode }) => {
    const [rows, setRows] = useState([]);
    const [genderData, setGenderData] = useState([]);
    const [countyData, setCountyData] = useState([]);
    const [showFullCodes, setShowFullCodes] = useState(false);
    const [loading, setLoading] = useState(true);
    const [fetched, setFetched] = useState(false);

    const applyStatsPayload = useCallback((payload) => {
        if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
            return { gender: [], county: [] };
        }

        const gender = pickGenderBreakdown(payload);
        const county = pickCountyBreakdown(payload);
        if (gender.length) setGenderData(gender);
        if (county.length) setCountyData(county);

        if (
            payload.show_full_codes === true ||
            payload.full_codes === true ||
            payload.redact_codes === false
        ) {
            setShowFullCodes(true);
        }

        return { gender, county };
    }, []);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);

        const leaderboardReq = makeRequest({
            url: LEADERBOARD_ENDPOINT,
            method: "GET",
            api_version: 2,
        }).catch(() => [0, null]);

        const statsReq = makeRequest({
            url: AFFILIATE_STATS_ENDPOINT,
            method: "GET",
            api_version: 2,
        }).catch(() => [0, null]);

        Promise.all([leaderboardReq, statsReq]).then(
            ([[lbStatus, lbResponse], [statsStatus, statsResponse]]) => {
                if (cancelled) return;

                const lbPayload = lbResponse?.data ?? lbResponse ?? null;
                let list = pickLeaderboardList(lbPayload);
                if (!list.length && Array.isArray(lbPayload)) {
                    list = lbPayload;
                }

                if ((lbStatus === 200 || lbStatus === 201) && list.length) {
                    setRows(list);
                } else {
                    const fromCommissions = pickLeaderboardList(commissions);
                    setRows(
                        fromCommissions.length
                            ? fromCommissions
                            : DUMMY_LEADERBOARD
                    );
                }

                let hasGender = false;
                let hasCounty = false;

                const mergeStats = (payload) => {
                    const { gender, county } = applyStatsPayload(payload);
                    if (gender.length) hasGender = true;
                    if (county.length) hasCounty = true;
                };

                mergeStats(lbPayload);
                if (statsStatus === 200 || statsStatus === 201) {
                    mergeStats(statsResponse?.data ?? statsResponse ?? null);
                }
                mergeStats(commissions);

                if (!hasGender) setGenderData(DUMMY_GENDER_BREAKDOWN);
                if (!hasCounty) setCountyData(DUMMY_COUNTY_BREAKDOWN);

                setFetched(true);
                setLoading(false);
            }
        );

        return () => {
            cancelled = true;
        };
    }, [commissions, applyStatsPayload]);

    useEffect(() => {
        if (fetched) return;
        const nested = pickLeaderboardList(commissions);
        if (nested.length) {
            setRows(nested);
            setLoading(false);
        }
        applyStatsPayload(commissions);
    }, [commissions, fetched, applyStatsPayload]);

    const ranked = useMemo(() => {
        return [...rows]
            .map((item, index) => {
                const rawCode = resolveLeaderboardCode(item);
                return {
                    item,
                    index,
                    amount: resolveLeaderboardEarnings(item),
                    members: resolveLeaderboardMembers(item),
                    code: formatLeaderboardCode(rawCode, {
                        showFull: showFullCodes,
                    }),
                    codeKey: rawCode || `row-${index}`,
                };
            })
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 6);
    }, [rows, showFullCodes]);

    return (
        <section
            className="promo-wins-stats"
            aria-label="Affiliate leaders and comparison"
        >
            <div className="promo-wins-stats-head">
                <span className="promo-wins-stats-icon" aria-hidden="true">
                    <FaTrophy />
                </span>
                <div>
                    <h2 className="promo-wins-stats-title">
                        Last month&apos;s leaders
                    </h2>
                    <p className="promo-wins-stats-sub">
                        Top affiliate codes by earnings — plus member gender and
                        county mix.
                    </p>
                </div>
            </div>

            <div className="promo-wins-stats-grid">
                <div className="promo-wins-stats-col promo-wins-stats-col--leaders">
                    <h3 className="promo-wins-stats-col-title">Leaders</h3>
                    <div className="promo-wins-table-wrap promo-wins-table-wrap--leaders">
                        <table className="promo-wins-table promo-wins-table--leaders">
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Members</th>
                                    <th>Amount (KES)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan={3}
                                            className="promo-wins-table-empty"
                                            aria-busy="true"
                                        >
                                            Loading leaders…
                                        </td>
                                    </tr>
                                ) : ranked.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={3}
                                            className="promo-wins-table-empty"
                                        >
                                            No leaderboard data yet
                                        </td>
                                    </tr>
                                ) : (
                                    ranked.map(
                                        ({
                                            item,
                                            amount,
                                            members,
                                            code,
                                            codeKey,
                                        }) => (
                                            <tr
                                                key={
                                                    item?.id ??
                                                    item?.user_id ??
                                                    codeKey
                                                }
                                            >
                                                <td>
                                                    <code className="promo-wins-leader-code">
                                                        {code}
                                                    </code>
                                                </td>
                                                <td>{members}</td>
                                                <td className="promo-wins-table-amount promo-wins-leader-amount">
                                                    {formatToFloat(amount ?? 0)}
                                                </td>
                                            </tr>
                                        )
                                    )
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="promo-wins-stats-col promo-wins-stats-col--charts">
                    <div className="promo-wins-stats-charts-row">
                        <DonutChart
                            title="Gender comparison"
                            data={genderData}
                            emptyLabel="No gender data yet"
                        />
                        <DonutChart
                            title="County comparison"
                            data={countyData}
                            emptyLabel="No county data yet"
                        />
                    </div>
                    <MarketYourselfCTA
                        promoCode={promoCode}
                        onRequestGetCode={onRequestGetCode}
                    />
                </div>
            </div>
        </section>
    );
};

const AFFILIATE_SHARE_MESSAGE = (code) =>
    `Use my betmundial affiliate code ${code} and start winning! https://betmundial.com`;

const MarketYourselfCTA = ({ promoCode, onRequestGetCode }) => {
    const [shareOpen, setShareOpen] = useState(false);
    const [shareHint, setShareHint] = useState(null);
    const sharePanelRef = useRef(null);
    const ctaLabel = promoCode ? "Market yourself" : "Get started";

    const handleMarketYourself = () => {
        setShareHint(null);
        if (!promoCode) {
            setShareOpen(false);
            if (typeof onRequestGetCode === "function") {
                onRequestGetCode();
            }
            return;
        }
        setShareOpen((open) => !open);
    };

    useEffect(() => {
        if (!shareOpen || !sharePanelRef.current) return;
        sharePanelRef.current.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
        });
    }, [shareOpen]);

    const handleSocialShare = async (platform) => {
        if (!promoCode) return;
        const text = AFFILIATE_SHARE_MESSAGE(promoCode);
        const encoded = encodeURIComponent(text);
        const urlEncoded = encodeURIComponent("https://betmundial.com");
        const urls = {
            whatsapp: `https://wa.me/?text=${encoded}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${urlEncoded}&quote=${encoded}`,
            x: `https://twitter.com/intent/tweet?text=${encoded}`,
            instagram: null,
        };

        if (platform === "instagram" || platform === "copy") {
            try {
                await navigator.clipboard.writeText(text);
                setShareHint(
                    platform === "instagram"
                        ? "Message copied — paste it in Instagram."
                        : "Share message copied."
                );
            } catch (_) {
                setShareHint("Unable to copy. Please share your code manually.");
            }
            return;
        }

        const shareUrl = urls[platform];
        if (shareUrl) {
            window.open(shareUrl, "_blank", "noopener,noreferrer");
        }
    };

    return (
        <section
            className="promo-wins-market"
            aria-label={ctaLabel}
        >
            <div className="promo-wins-market-copy">
                <p className="promo-wins-market-text">
                    There are many opportunities in your area.
                </p>
                <button
                    type="button"
                    className="promo-wins-market-cta"
                    onClick={handleMarketYourself}
                    aria-expanded={promoCode ? shareOpen : undefined}
                >
                    {ctaLabel}
                </button>
                <p className="promo-wins-market-hint">
                    {promoCode
                        ? "Share your affiliate code on WhatsApp, Facebook, X, or Instagram."
                        : "Get your affiliate code first, then share it with your network."}
                </p>
            </div>

            {promoCode && shareOpen ? (
                <div
                    className="promo-wins-market-share"
                    ref={sharePanelRef}
                    aria-label="Share your affiliate code"
                >
                    <div className="promo-wins-social-row">
                        <button
                            type="button"
                            className="promo-wins-social-btn"
                            onClick={() => handleSocialShare("whatsapp")}
                        >
                            <FaWhatsapp
                                className="promo-wins-social-icon promo-wins-social-icon--wa"
                                aria-hidden="true"
                            />
                            <span>WhatsApp</span>
                        </button>
                        <button
                            type="button"
                            className="promo-wins-social-btn"
                            onClick={() => handleSocialShare("facebook")}
                        >
                            <FaFacebook
                                className="promo-wins-social-icon promo-wins-social-icon--fb"
                                aria-hidden="true"
                            />
                            <span>Facebook</span>
                        </button>
                        <button
                            type="button"
                            className="promo-wins-social-btn"
                            onClick={() => handleSocialShare("x")}
                        >
                            <FaXTwitter
                                className="promo-wins-social-icon promo-wins-social-icon--x"
                                aria-hidden="true"
                            />
                            <span>X</span>
                        </button>
                        <button
                            type="button"
                            className="promo-wins-social-btn"
                            onClick={() => handleSocialShare("instagram")}
                        >
                            <FaInstagram
                                className="promo-wins-social-icon promo-wins-social-icon--ig"
                                aria-hidden="true"
                            />
                            <span>Instagram</span>
                        </button>
                        <button
                            type="button"
                            className="promo-wins-social-btn"
                            onClick={() => handleSocialShare("copy")}
                        >
                            <FaCopy
                                className="promo-wins-social-icon"
                                aria-hidden="true"
                            />
                            <span>Copy link</span>
                        </button>
                    </div>
                    {shareHint ? (
                        <p className="promo-wins-market-share-status" role="status">
                            {shareHint}
                        </p>
                    ) : null}
                </div>
            ) : null}
        </section>
    );
};

const SupportFooter = () => (
    <div className="promo-wins-footer">
        <a className="promo-wins-footer-link" href={SUPPORT_EMAIL}>
            <FaHeadset aria-hidden="true" />
            <span>
                Need help? <strong>Contact Support &gt;</strong>
            </span>
        </a>
    </div>
);

const EarningsPanel = ({ commissions, isLoading }) => {
    const [period, setPeriod] = useState("this_month");

    const earnings = useMemo(() => {
        const list = pickList(commissions, [
            "latest_earnings",
            "earnings_list",
            "commissions",
            "transactions",
            "latest_wins",
            "wins",
            "recent_wins",
            "promo_wins",
            "affiliate_wins",
        ]);
        return list.filter((item) =>
            isInPeriod(resolveEarningDate(item), period)
        );
    }, [commissions, period]);

    const overview = useMemo(() => {
        const totalEarnings = pickNumber(
            commissions?.total_earnings,
            commissions?.affiliate_balance,
            commissions?.commission_balance,
            commissions?.commissions_balance,
            commissions?.total_commission,
            commissions?.earnings,
            commissions?.balance
        );
        const pendingEarnings = pickNumber(
            commissions?.pending_earnings,
            commissions?.pending,
            commissions?.pending_commission,
            commissions?.unpaid
        );
        const paidEarnings = pickNumber(
            commissions?.paid_earnings,
            commissions?.paid,
            commissions?.withdrawn,
            commissions?.paid_commission
        );
        const totalReferrals = pickNumber(
            commissions?.total_referrals,
            commissions?.subscriber_count,
            typeof commissions?.subscribers === "number"
                ? commissions.subscribers
                : null,
            Array.isArray(commissions?.subscribers)
                ? commissions.subscribers.length
                : null,
            Array.isArray(commissions?.referrals)
                ? commissions.referrals.length
                : null,
            Array.isArray(commissions?.members)
                ? commissions.members.length
                : null
        );

        return {
            totalEarnings,
            pendingEarnings,
            paidEarnings,
            totalReferrals,
        };
    }, [commissions]);

    if (isLoading && !commissions) {
        return <LoadingPanel label="Loading earnings" />;
    }

    return (
        <div className="promo-wins-panel">
            <div className="promo-wins-section-head">
                <h2 className="promo-wins-section-title">Earnings Overview</h2>
                <label className="promo-wins-filter promo-wins-filter--period">
                    <FaCalendarAlt aria-hidden="true" />
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        aria-label="Earnings period"
                    >
                        {PERIOD_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <FaChevronDown
                        className="promo-wins-filter-chevron"
                        aria-hidden="true"
                    />
                </label>
            </div>

            <div className="promo-wins-overview-grid" aria-label="Earnings overview">
                <OverviewCard
                    label="Total Earnings"
                    value={formatKes(overview.totalEarnings)}
                    sub="All time"
                    Icon={FaWallet}
                    tone="pink"
                />
                <OverviewCard
                    label="Pending Earnings"
                    value={formatKes(overview.pendingEarnings)}
                    sub="Not yet paid"
                    Icon={FaChartLine}
                    tone="yellow"
                />
                <OverviewCard
                    label="Paid Earnings"
                    value={formatKes(overview.paidEarnings)}
                    sub="Withdrawn"
                    Icon={FaCoins}
                    tone="pink"
                />
                <OverviewCard
                    label="Total Referrals"
                    value={String(overview.totalReferrals)}
                    sub="All time"
                    Icon={FaUsers}
                    tone="yellow"
                />
            </div>

            <section className="promo-wins-table-card" aria-label="Latest earnings">
                <h2 className="promo-wins-section-title">Latest Earnings</h2>

                <div className="promo-wins-table-wrap">
                    <table className="promo-wins-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Referred By</th>
                                <th>Status</th>
                                <th>Amount</th>
                                <th>Type</th>
                                <th>Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {earnings.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="promo-wins-table-empty">
                                        No earnings yet. Share your affiliate code to start
                                        earning.
                                    </td>
                                </tr>
                            ) : (
                                earnings.map((item, index) => {
                                    const name = resolveEarningName(item, index);
                                    const status = resolveEarningStatus(item);
                                    return (
                                        <tr
                                            key={
                                                item?.id ??
                                                `${name}-${resolveEarningDate(item)}-${index}`
                                            }
                                        >
                                            <td>{formatDisplayDate(resolveEarningDate(item))}</td>
                                            <td>
                                                <div className="promo-wins-person">
                                                    <span
                                                        className={`promo-wins-avatar promo-wins-avatar--${avatarTone(index)}`}
                                                        aria-hidden="true"
                                                    >
                                                        {getInitials(name)}
                                                    </span>
                                                    <span>{name}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <StatusBadge status={status} />
                                            </td>
                                            <td className="promo-wins-table-amount">
                                                {formatKes(resolveEarningAmount(item))}
                                            </td>
                                            <td className="promo-wins-table-type">
                                                {resolveEarningType(item)}
                                            </td>
                                            <td>
                                                <span className="promo-wins-table-link">
                                                    View &gt;
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            <div className="promo-wins-payout" role="note">
                <span className="promo-wins-payout-icon" aria-hidden="true">
                    <FaWallet />
                </span>
                <p className="promo-wins-payout-copy">
                    Payouts are processed every Monday. Minimum payout is KES 500.
                </p>
                <a className="promo-wins-payout-link" href={SUPPORT_EMAIL}>
                    Learn more about payouts &gt;
                </a>
            </div>
        </div>
    );
};

const MembersPanel = ({ commissions, isLoading }) => {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [period, setPeriod] = useState("this_month");
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    const members = useMemo(() => {
        const list = pickList(commissions, [
            "members",
            "referrals",
            "affiliate_members",
            "users",
        ]);
        if (list.length) return list;
        if (Array.isArray(commissions?.subscribers)) {
            return commissions.subscribers;
        }
        return [];
    }, [commissions]);

    const overview = useMemo(() => {
        const total = pickNumber(
            commissions?.total_members,
            commissions?.total_referrals,
            commissions?.subscriber_count,
            typeof commissions?.subscribers === "number"
                ? commissions.subscribers
                : null,
            members.length
        );

        let active = pickNumber(commissions?.active_members, commissions?.active);
        let inactive = pickNumber(
            commissions?.inactive_members,
            commissions?.inactive
        );

        if (!active && !inactive && members.length) {
            active = members.filter((m) => resolveMemberStatus(m) === "active").length;
            inactive = members.filter((m) => resolveMemberStatus(m) === "inactive").length;
        }

        return {
            total: total || members.length,
            active,
            inactive,
        };
    }, [commissions, members]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return members.filter((item, index) => {
            const status = resolveMemberStatus(item);
            if (statusFilter !== "all" && status !== statusFilter) return false;
            if (!isInPeriod(resolveJoinedAt(item), period)) return false;
            if (!q) return true;
            const name = resolveMemberName(item, index).toLowerCase();
            const phone = String(resolveMemberPhone(item) || "").toLowerCase();
            return name.includes(q) || phone.includes(q);
        });
    }, [members, search, statusFilter, period]);

    useEffect(() => {
        setPage(1);
    }, [search, statusFilter, period, rowsPerPage]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage) || 1);
    const currentPage = Math.min(page, totalPages);
    const start = filtered.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
    const end = Math.min(currentPage * rowsPerPage, filtered.length);
    const pageItems = filtered.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const pageNumbers = useMemo(() => {
        if (totalPages <= 5) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }
        const pages = new Set([1, totalPages, currentPage, currentPage - 1, currentPage + 1]);
        return Array.from(pages)
            .filter((n) => n >= 1 && n <= totalPages)
            .sort((a, b) => a - b);
    }, [totalPages, currentPage]);

    if (isLoading && !commissions) {
        return <LoadingPanel label="Loading members" />;
    }

    return (
        <div className="promo-wins-panel">
            <h2 className="promo-wins-section-title">Members Overview</h2>
            <div
                className="promo-wins-overview-grid promo-wins-overview-grid--3"
                aria-label="Members overview"
            >
                <OverviewCard
                    label="Total Members"
                    value={String(overview.total)}
                    sub="All time"
                    Icon={FaUsers}
                    tone="pink"
                />
                <OverviewCard
                    label="Active Members"
                    value={String(overview.active)}
                    sub="Currently active"
                    Icon={FaUserCheck}
                    tone="yellow"
                />
                <OverviewCard
                    label="Inactive Members"
                    value={String(overview.inactive)}
                    sub="No activity yet"
                    Icon={FaUserSlash}
                    tone="yellow"
                />
            </div>

            <section className="promo-wins-table-card" aria-label="My members">
                <h2 className="promo-wins-section-title">My Members</h2>
                <div className="promo-wins-toolbar">
                    <label className="promo-wins-search">
                        <FaSearch aria-hidden="true" />
                        <input
                            type="search"
                            placeholder="Search members..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            aria-label="Search members"
                        />
                    </label>
                    <div className="promo-wins-toolbar-filters">
                        <label className="promo-wins-filter">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                aria-label="Member status filter"
                            >
                                {STATUS_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                            <FaChevronDown
                                className="promo-wins-filter-chevron"
                                aria-hidden="true"
                            />
                        </label>
                        <label className="promo-wins-filter">
                            <FaCalendarAlt aria-hidden="true" />
                            <select
                                value={period}
                                onChange={(e) => setPeriod(e.target.value)}
                                aria-label="Member date filter"
                            >
                                {PERIOD_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                            <FaChevronDown
                                className="promo-wins-filter-chevron"
                                aria-hidden="true"
                            />
                        </label>
                    </div>
                </div>

                <div className="promo-wins-table-wrap">
                    <table className="promo-wins-table promo-wins-table--members">
                        <thead>
                            <tr>
                                <th>Member</th>
                                <th>Joined On</th>
                                <th>Status</th>
                                <th>First Activity</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pageItems.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="promo-wins-table-empty">
                                        {members.length === 0
                                            ? "No members yet. Members who join with your affiliate code will appear here."
                                            : "No members match your filters."}
                                    </td>
                                </tr>
                            ) : (
                                pageItems.map((item, index) => {
                                    const absoluteIndex =
                                        (currentPage - 1) * rowsPerPage + index;
                                    const name = resolveMemberName(item, absoluteIndex);
                                    const phone = resolveMemberPhone(item);
                                    const status = resolveMemberStatus(item);
                                    return (
                                        <tr
                                            key={
                                                item?.id ??
                                                `${name}-${resolveJoinedAt(item)}-${absoluteIndex}`
                                            }
                                        >
                                            <td>
                                                <div className="promo-wins-person">
                                                    <span
                                                        className={`promo-wins-avatar promo-wins-avatar--${avatarTone(absoluteIndex)}`}
                                                        aria-hidden="true"
                                                    >
                                                        {getInitials(name)}
                                                    </span>
                                                    <div className="promo-wins-person-copy">
                                                        <span className="promo-wins-person-name">
                                                            {name}
                                                        </span>
                                                        {phone ? (
                                                            <span className="promo-wins-person-meta">
                                                                {phone}
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{formatDisplayDate(resolveJoinedAt(item))}</td>
                                            <td>
                                                <StatusBadge status={status} kind="member" />
                                            </td>
                                            <td>
                                                {formatDisplayDate(resolveFirstActivity(item))}
                                            </td>
                                            <td>
                                                <span className="promo-wins-table-link">
                                                    View &gt;
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="promo-wins-pagination" aria-label="Members pagination">
                    <p className="promo-wins-pagination-info">
                        {filtered.length === 0
                            ? "Showing 0 members"
                            : `Showing ${start} to ${end} of ${filtered.length} members`}
                    </p>
                    <div className="promo-wins-pagination-pages">
                        <button
                            type="button"
                            className="promo-wins-page-btn"
                            disabled={currentPage <= 1}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            aria-label="Previous page"
                        >
                            <FaChevronLeft />
                        </button>
                        {pageNumbers.map((n, idx) => {
                            const prev = pageNumbers[idx - 1];
                            const showEllipsis = prev != null && n - prev > 1;
                            return (
                                <React.Fragment key={n}>
                                    {showEllipsis ? (
                                        <span className="promo-wins-page-ellipsis">…</span>
                                    ) : null}
                                    <button
                                        type="button"
                                        className={`promo-wins-page-btn${
                                            n === currentPage
                                                ? " promo-wins-page-btn--active"
                                                : ""
                                        }`}
                                        onClick={() => setPage(n)}
                                        aria-current={n === currentPage ? "page" : undefined}
                                    >
                                        {n}
                                    </button>
                                </React.Fragment>
                            );
                        })}
                        <button
                            type="button"
                            className="promo-wins-page-btn"
                            disabled={currentPage >= totalPages}
                            onClick={() =>
                                setPage((p) => Math.min(totalPages, p + 1))
                            }
                            aria-label="Next page"
                        >
                            <FaChevronRight />
                        </button>
                    </div>
                    <label className="promo-wins-filter promo-wins-rows-filter">
                        <span>Rows per page</span>
                        <select
                            value={rowsPerPage}
                            onChange={(e) => setRowsPerPage(Number(e.target.value))}
                            aria-label="Rows per page"
                        >
                            {ROWS_PER_PAGE_OPTIONS.map((n) => (
                                <option key={n} value={n}>
                                    {n}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>
            </section>
        </div>
    );
};

const PromoWins = () => {
    const navigate = useNavigate();
    const user = getFromLocalStorage("user");
    const [isLoading, setIsLoading] = useState(false);
    const [commissions, setCommissions] = useState(null);
    const [activeTab, setActiveTab] = useState(TAB_DETAIL);
    const [promoCode, setPromoCode] = useState(
        user?.promo_code || null
    );
    const [openCustomizeSignal, setOpenCustomizeSignal] = useState(0);

    const getUserCommision = () => {
        const endpoint = "/user/commissions";
        setIsLoading(true);

        makeRequest({ url: endpoint, method: "GET", api_version: 2 }).then(
            ([status, response]) => {
                setIsLoading(false);
                if (status === 200) {
                    const data = response?.data ?? response ?? null;
                    setCommissions(data);
                    if (data?.promo_code) {
                        setPromoCode(data.promo_code);
                    }
                }
            }
        );
    };

    useEffect(() => {
        getUserCommision();
    }, []);

    // Once per Affiliate page visit: open get-code modal for users without a code.
    useEffect(() => {
        if (promoCode) return;
        setOpenCustomizeSignal((n) => n + 1);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only auto-open
    }, []);

    const handleTabChange = (_event, nextTab) => {
        setActiveTab(nextTab);
    };

    const handlePromoCodeChange = useCallback((code) => {
        setPromoCode(code || null);
    }, []);

    const handleRequestGetCode = useCallback(() => {
        setOpenCustomizeSignal((n) => n + 1);
    }, []);

    const hasCode = Boolean(promoCode);

    return (
        <div className="promo-wins-page">
            <header className="promo-wins-header">
                <button
                    type="button"
                    className="promo-wins-back"
                    aria-label="Go back"
                    onClick={() => navigate(-1)}
                >
                    <FaArrowLeft />
                </button>
                <h1 className="promo-wins-title">Affiliate</h1>
                <span className="promo-wins-header-spacer" aria-hidden="true" />
            </header>

            <div className="promo-wins-inner">
                <div className="promo-wins-tabs-shell">
                    <Box className="promo-wins-tabs-wrap">
                        <Tabs
                            value={activeTab}
                            onChange={handleTabChange}
                            variant="fullWidth"
                            className="promo-wins-tabs"
                            aria-label="Affiliate sections"
                            TabIndicatorProps={{ className: "promo-wins-tab-indicator" }}
                        >
                            <Tab
                                className="promo-wins-tab"
                                icon={<FaUser aria-hidden="true" />}
                                iconPosition="start"
                                label="Detail"
                                {...a11yProps(TAB_DETAIL)}
                            />
                            <Tab
                                className="promo-wins-tab"
                                icon={<FaTrophy aria-hidden="true" />}
                                iconPosition="start"
                                label="My Earnings"
                                {...a11yProps(TAB_EARNINGS)}
                            />
                            <Tab
                                className="promo-wins-tab"
                                icon={<FaUsers aria-hidden="true" />}
                                iconPosition="start"
                                label="My Members"
                                {...a11yProps(TAB_MEMBERS)}
                            />
                        </Tabs>
                    </Box>

                    <div
                        className="promo-wins-tab-body"
                        role="tabpanel"
                        hidden={activeTab !== TAB_DETAIL}
                        id="affiliate-tabpanel-0"
                        aria-labelledby="affiliate-tab-0"
                    >
                        {activeTab === TAB_DETAIL ? (
                            hasCode ? (
                                <>
                                    <PromoCode
                                        commissions={commissions}
                                        isLoading={isLoading}
                                        onPromoCodeChange={handlePromoCodeChange}
                                    />
                                    <HowItWorks />
                                    <TrustBar />
                                </>
                            ) : (
                                <>
                                    <div className="promo-wins-nocode-layout">
                                        <div className="promo-wins-nocode-col promo-wins-nocode-col--cta">
                                            <PromoCode
                                                commissions={commissions}
                                                isLoading={isLoading}
                                                onPromoCodeChange={handlePromoCodeChange}
                                                openCustomizeSignal={openCustomizeSignal}
                                            />
                                        </div>
                                        <div className="promo-wins-nocode-col promo-wins-nocode-col--how">
                                            <HowItWorksBrief />
                                        </div>
                                    </div>
                                    <LeaderboardPanel
                                        commissions={commissions}
                                        promoCode={promoCode}
                                        onRequestGetCode={handleRequestGetCode}
                                    />
                                    <TrustBar />
                                </>
                            )
                        ) : null}
                    </div>

                    <div
                        className="promo-wins-tab-body"
                        role="tabpanel"
                        hidden={activeTab !== TAB_EARNINGS}
                        id="affiliate-tabpanel-1"
                        aria-labelledby="affiliate-tab-1"
                    >
                        {activeTab === TAB_EARNINGS ? (
                            <EarningsPanel
                                commissions={commissions}
                                isLoading={isLoading}
                            />
                        ) : null}
                    </div>

                    <div
                        className="promo-wins-tab-body"
                        role="tabpanel"
                        hidden={activeTab !== TAB_MEMBERS}
                        id="affiliate-tabpanel-2"
                        aria-labelledby="affiliate-tab-2"
                    >
                        {activeTab === TAB_MEMBERS ? (
                            <MembersPanel
                                commissions={commissions}
                                isLoading={isLoading}
                            />
                        ) : null}
                    </div>
                </div>

                <SupportFooter />
            </div>
        </div>
    );
};

export default React.memo(PromoWins);
