import React, { useContext, useEffect, useState } from "react";
import { Context } from '../context/store';
import makeRequest from './utils/fetch-request';
import Accordion from 'react-bootstrap/Accordion';
import Modal from 'react-bootstrap/Modal';
import { FaCheckCircle, FaCircle } from "react-icons/fa";
import { IoMdCloseCircle } from "react-icons/io";
import { TbForbid2Filled } from "react-icons/tb";
import { Tooltip } from "@mui/material";
import { removeItem } from "./utils/local-storage";
import NoEvents from "./utils/no-events";
import ShareExistingbet from "./utils/shareexisting-bet";
import getSportImageIcon from "./utils/get-sport-image-icon";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBan, faShare } from "@fortawesome/free-solid-svg-icons";

/** Status badge colors aligned with existing btn-bet-hist / statusIcon palette. */
const getStatusBadge = (status) => {
    const raw = (status || "").toLowerCase().trim();

    switch (raw) {
        case "won":
            return { label: "WON", background: "#19BC54", color: "#ffffff" };
        case "lost":
        case "not won":
            return { label: "NOT WON", background: "#99999E", color: "#17242F" };
        case "pending":
        case "active":
        case "not approved":
            return { label: "PENDING", background: "#00A8FA", color: "#ffffff" };
        case "cancelled":
        case "canceled":
            return { label: "CANCELLED", background: "#6B7280", color: "#ffffff" };
        case "void":
            return { label: "VOID", background: "#8B7355", color: "#ffffff" };
        default:
            return {
                label: (status || "UNKNOWN").toUpperCase(),
                background: "#99999E",
                color: "#17242F",
            };
    }
};

const getBetTypeLabel = (bet) => {
    const count = Number(bet?.total_games ?? bet?.betslip?.length ?? 0);
    if (bet?.jackpot_bet_id) {
        return `Jackpot (${count})`;
    }
    if (count > 1) {
        return `Multi Bet (${count})`;
    }
    return `Single Bet (${count || 1})`;
};

const formatMoney = (value) => {
    const num = parseFloat(value);
    if (Number.isNaN(num)) {
        return `KSH ${value ?? "0.00"}`;
    }
    return `KSH ${num.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
};

const formatPossibleWin = formatMoney;

const canCancelBet = (bet) =>
    bet?.cancelable == 1 ||
    bet?.can_cancel == 1 ||
    bet?.cancelable === true ||
    bet?.can_cancel === true;

const canShareBet = (bet) => bet?.sharable == 1 || bet?.sharable === true;

const getSlipResult = (slip) => {
    const result = slip?.result ?? slip?.results;
    if (result == null) return null;
    if (typeof result === "string" && result.trim() === "") return null;
    if (Array.isArray(result) && result.length === 0) return null;
    return result;
};

/** Normalize bet.created to YYYY-MM-DD for range compares. */
const getBetDateKey = (created) => {
    if (!created) return null;
    const raw = String(created).trim();
    const isoDay = raw.match(/^(\d{4}-\d{2}-\d{2})/);
    if (isoDay) return isoDay[1];
    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) return null;
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, "0");
    const d = String(parsed.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
};

const isBetInDateRange = (bet, fromDate, toDate) => {
    if (!fromDate && !toDate) return true;
    const key = getBetDateKey(bet?.created);
    if (!key) return true;
    if (fromDate && key < fromDate) return false;
    if (toDate && key > toDate) return false;
    return true;
};

const MyBets = () => {
    const [state, dispatch] = useContext(Context);
    const [userBets, setUserBets] = useState([]);
    const [casinoBets, setCasinoBets] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [activeKey, setActiveKey] = useState(null);
    const [betsFilter, setBetsFilter] = useState("sports");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [sharableBet, setSharableBet] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [betIdToCancel, setBetIdToCancel] = useState(null);

    const filteredSportsBets = (userBets || []).filter((bet) =>
        isBetInDateRange(bet, fromDate, toDate)
    );
    const filteredCasinoBets = (casinoBets || []).filter((bet) =>
        isBetInDateRange(bet, fromDate, toDate)
    );

    // ✅ CANCEL BET
    const cancelBet = async (betId) => {
        try {
            setIsLoading(true);

            let [status, result] = await makeRequest({
                url: `/user/bet/cancel?bet-id=${betId}`,
                method: "POST",
                api_version: 2
            });
            if ([200, 201].includes(status)) {
                // Hide cancel button for this bet, then give the success alert time to display before reloading.
                setUserBets((prev) =>
                    (prev || []).map((bet) =>
                        bet?.bet_id === betId
                            ? { ...bet, cancelable: 0, can_cancel: 0 }
                            : bet
                    )
                );
                setShowConfirmModal(false);
                setBetIdToCancel(null);
                setMessage({ status: 200, message: "Cancel Request sent" });
                setTimeout(() => {
                    window.location.reload();
                }, 3000);
            } else {
                setMessage({ status: 400, message: result?.message || result?.result || "Failed to cancel bet" });
            }
        } catch (err) {
            setMessage({ status: 400, message: "Something went wrong" });
        } finally {
            setIsLoading(false);
        }
    };

    // ✅ FETCH SPORTS
    const fetchSports = async () => {
        setIsLoading(true);

        const [status, result] = await makeRequest({
            url: "/user/bets?size=20&page=1",
            method: "GET",
            api_version: 2
        });

        if ([200, 201].includes(status)) {
            setUserBets(result?.data || result);
        } else {
            if (result?.status === 403) {
                dispatch({ type: "DEL", key: "user" });
                removeItem("user");
                dispatch({ type: "SET", key: "showloginmodal", payload: true });
                setMessage({ status: 400, message: "Unauthorized. Please login again." });
            }
        }

        setIsLoading(false);
    };

    // ✅ FETCH CASINO
    const fetchCasino = async () => {
        setIsLoading(true);

        const [status, result] = await makeRequest({
            url: "bets",
            method: "GET",
            api_version: 'casinoGames'
        });

        if ([200, 201].includes(status)) {
            setCasinoBets(result?.data || result);
        }

        setIsLoading(false);
    };

    // ✅ HANDLE FILTER CHANGE
    useEffect(() => {
        if (betsFilter === "casino") {
            fetchCasino();
        } else {
            fetchSports();
        }
    }, [betsFilter]);

    // ✅ STATUS ICON
    const statusIcon = (status) => {
        let Icon = FaCircle;
        let color = "#00A8FA";

        switch (status?.toLowerCase()) {
            case "won":
                Icon = FaCheckCircle;
                color = "green";
                break;
            case "lost":
                Icon = IoMdCloseCircle;
                color = "#f86d6d";
                break;
            case "cancelled":
                Icon = TbForbid2Filled;
                color = "gray";
                break;
            default:
                Icon = FaCircle;
        }

        return (
            <Tooltip title={status}>
                <span><Icon color={color} size={18} /></span>
            </Tooltip>
        );
    };

    const hasActiveFilters = Boolean(fromDate || toDate || betsFilter !== "sports");

    const clearFilters = () => {
        setFromDate("");
        setToDate("");
        setBetsFilter("sports");
    };

    return (
        <div className="my-bets">

            {/* HEADER */}
            <div className="my-bets-page-header">
                <div className="my-bets-page-header-row">
                    <h1 className="my-bets-page-title m-0">Bet History</h1>
                </div>
            </div>

            {/* Nested panel: filters + list */}
            <div className="my-bets-panel">
                <div className="my-bets-filters">
                    <select
                        value={betsFilter}
                        onChange={(e) => setBetsFilter(e.target.value)}
                        className="my-bets-filter-select"
                        aria-label="Bet category"
                    >
                        <option value="sports">Sports</option>
                        <option value="casino">Casino</option>
                        <option value="jackpot">Jackpot</option>
                    </select>

                    <div className="my-bets-date-filters">
                        <input
                            type="date"
                            className="my-bets-date-input"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            placeholder="From"
                            aria-label="From"
                            max={toDate || undefined}
                        />
                        <input
                            type="date"
                            className="my-bets-date-input"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            placeholder="To"
                            aria-label="To"
                            min={fromDate || undefined}
                        />
                    </div>

                    {hasActiveFilters && (
                        <button
                            type="button"
                            className="my-bets-clear-filters"
                            onClick={clearFilters}
                        >
                            <span>Clear filters</span>
                            <span className="my-bets-clear-filters-x" aria-hidden="true">
                                ×
                            </span>
                        </button>
                    )}
                </div>

                <div className="my-bets-list">
                    {/* ALERT */}
                    {message && (
                        <div className="alert alert-danger">
                            {message.message}
                        </div>
                    )}

                    {/* EMPTY */}
                    {betsFilter === "sports" && filteredSportsBets.length === 0 && (
                        <NoEvents
                            message={
                                userBets.length === 0
                                    ? "No sports bets yet"
                                    : "No sports bets in this date range"
                            }
                        />
                    )}

                    {/* ================= SPORTS ================= */}
                    {betsFilter === "sports" && filteredSportsBets.length > 0 && (
                        <>
                            <div className="my-bets-column-headers d-none d-md-block">
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "1fr 1fr 0.7fr 0.7fr 1fr 1fr 1fr",
                                        gap: "5px",
                                        padding: "10px",
                                        background: "rgba(255,255,255,0.1)",
                                        color: "#fff",
                                        fontWeight: "bold"
                                    }}
                                >
                                    <div>Date</div>
                                    <div>Bet ID</div>
                                    <div>Games</div>
                                    <div>Odds</div>
                                    <div>Amount</div>
                                    <div>Payout</div>
                                    <div>Status</div>
                                </div>
                            </div>

                            <Accordion activeKey={activeKey} onSelect={(k) => setActiveKey(k)} className="mt-1 my-bets-accordion">
                                {filteredSportsBets.map((bet) => {
                                    const badge = getStatusBadge(bet?.status);
                                    return (
                                    <Accordion.Item key={bet.bet_id} eventKey={String(bet.bet_id)}>

                                        <Accordion.Header>
                                            {/* Desktop: column grid (unchanged) */}
                                            <div
                                                className="d-none d-md-grid w-100"
                                                style={{
                                                    gridTemplateColumns: "1fr 1fr 0.7fr 0.7fr 1fr 1fr 1fr",
                                                    gap: "5px"
                                                }}
                                            >
                                                <div>{bet?.created}</div>
                                                <div>{bet?.bet_id}</div>
                                                <div>{bet?.total_games}</div>
                                                <div>{bet?.total_odd}</div>
                                                <div>{bet?.bet_amount}</div>
                                                <div>{bet?.possible_win}</div>

                                                {/* STATUS */}
                                                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                                    {statusIcon(bet?.status)}

                                                    <span>
                                                        {bet?.status?.toLowerCase() === "not approved"
                                                            ? "Pending"
                                                            : bet?.status}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Mobile: stacked card header */}
                                            <div className="d-md-none my-bets-mobile-card w-100">
                                                <span
                                                    className="my-bets-status-badge"
                                                    style={{
                                                        background: badge.background,
                                                        color: badge.color,
                                                    }}
                                                >
                                                    {badge.label}
                                                </span>
                                                <div className="my-bets-mobile-type">
                                                    {getBetTypeLabel(bet)}
                                                </div>
                                                <div className="my-bets-mobile-win">
                                                    <span className="my-bets-mobile-win-label">Possible Win: </span>
                                                    <span className="my-bets-mobile-win-amount">
                                                        {formatPossibleWin(bet?.possible_win)}
                                                    </span>
                                                </div>
                                                <div className="my-bets-mobile-meta">
                                                    <span>{bet?.created}</span>
                                                    <span>Bet ID: {bet?.bet_id}</span>
                                                </div>
                                            </div>
                                        </Accordion.Header>

                                        <Accordion.Body className="my-bets-accordion-body">
                                            {/* Mobile: expanded detail matching reference layout */}
                                            <div className="d-md-none my-bets-mobile-detail">
                                                <div className="my-bets-mobile-bet-amount">
                                                    <span className="my-bets-mobile-bet-amount-label">Bet Amount: </span>
                                                    <span className="my-bets-mobile-bet-amount-value">
                                                        {formatMoney(bet?.bet_amount)}
                                                    </span>
                                                </div>

                                                {(canShareBet(bet) || canCancelBet(bet)) && (
                                                    <div className="my-bets-mobile-actions">
                                                        {canShareBet(bet) && (
                                                            <button
                                                                type="button"
                                                                className="my-bets-mobile-action-btn"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSharableBet(bet);
                                                                }}
                                                            >
                                                                <FontAwesomeIcon icon={faShare} />
                                                                Share
                                                            </button>
                                                        )}
                                                        {canCancelBet(bet) && (
                                                            <button
                                                                type="button"
                                                                className="my-bets-mobile-action-btn"
                                                                disabled={isLoading}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setBetIdToCancel(bet.bet_id);
                                                                    setShowConfirmModal(true);
                                                                }}
                                                            >
                                                                <FontAwesomeIcon icon={faBan} />
                                                                Cancel
                                                            </button>
                                                        )}
                                                    </div>
                                                )}

                                                <div className="my-bets-mobile-picks-heading">YOUR PICKS</div>

                                                <div className="my-bets-mobile-picks">
                                                    {(bet?.betslip || []).map((slip, index) => {
                                                        const slipResult = getSlipResult(slip);
                                                        return (
                                                            <div
                                                                className="my-bets-mobile-pick"
                                                                key={slip?.game_id ?? index}
                                                            >
                                                                <div className="my-bets-mobile-pick-meta">
                                                                    <span>{slip?.start_time}</span>
                                                                    <span>
                                                                        Game ID: {slip?.game_id ?? "—"}
                                                                    </span>
                                                                </div>
                                                                <div className="my-bets-mobile-pick-match">
                                                                    <img
                                                                        src={getSportImageIcon(
                                                                            slip?.sport_name || "Soccer"
                                                                        )}
                                                                        alt=""
                                                                        className="my-bets-mobile-pick-sport-icon"
                                                                    />
                                                                    <span>
                                                                        {slip?.home_team} – {slip?.away_team}
                                                                    </span>
                                                                </div>
                                                                {slipResult != null && (
                                                                    <div className="my-bets-mobile-pick-line">
                                                                        <span className="my-bets-mobile-pick-label">
                                                                            Results:{" "}
                                                                        </span>
                                                                        <span className="my-bets-mobile-pick-value">
                                                                            {slipResult}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                {slip?.market_name && (
                                                                    <div className="my-bets-mobile-pick-line">
                                                                        <span className="my-bets-mobile-pick-label">
                                                                            Market :{" "}
                                                                        </span>
                                                                        <span className="my-bets-mobile-pick-value">
                                                                            {slip.market_name}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                <div className="my-bets-mobile-pick-footer">
                                                                    <div className="my-bets-mobile-pick-selection">
                                                                        {statusIcon(slip?.status)}
                                                                        <span>
                                                                            <span className="my-bets-mobile-pick-label">
                                                                                Your Pick:{" "}
                                                                            </span>
                                                                            <span className="my-bets-mobile-pick-bold">
                                                                                {slip?.bet_pick}
                                                                            </span>
                                                                        </span>
                                                                    </div>
                                                                    <div className="my-bets-mobile-pick-odds">
                                                                        <span className="my-bets-mobile-pick-label">
                                                                            Odds{" "}
                                                                        </span>
                                                                        <span className="my-bets-mobile-pick-bold">
                                                                            {slip?.odd_value}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Desktop: existing table + controls */}
                                            <div className="d-none d-md-block my-bets-desktop-detail">
                                                <div className="flex gap-3 mb-3">
                                                    {canCancelBet(bet) && (
                                                        <button
                                                            disabled={isLoading}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setBetIdToCancel(bet.bet_id);
                                                                setShowConfirmModal(true);
                                                            }}
                                                            style={{
                                                                background: "#ff4d4f",
                                                                color: "#fff",
                                                                border: "none",
                                                                padding: "6px 14px",
                                                                borderRadius: "6px",
                                                                cursor: "pointer",
                                                                fontSize: "12px",
                                                                fontWeight: "500"
                                                            }}
                                                        >
                                                            Cancel Bet
                                                        </button>
                                                    )}

                                                    {canShareBet(bet) && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSharableBet(bet);
                                                            }}
                                                            style={{
                                                                background: "#1890ff",
                                                                color: "#fff",
                                                                border: "none",
                                                                padding: "6px 14px",
                                                                borderRadius: "6px",
                                                                cursor: "pointer",
                                                                fontSize: "12px",
                                                                fontWeight: "500",
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: "6px"
                                                            }}
                                                        >
                                                            <FontAwesomeIcon icon={faShare} />
                                                            Share Bet
                                                        </button>
                                                    )}
                                                </div>

                                                <table className="table table-bordered mb-0">
                                                    <thead>
                                                        <tr>
                                                            <th>Start Time</th>
                                                            <th>Game</th>
                                                            <th>Odds</th>
                                                            <th>Market</th>
                                                            <th>Pick</th>
                                                            <th>Result</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {(bet?.betslip || []).map((slip, index) => (
                                                            <tr key={index}>
                                                                <td>{slip?.start_time}</td>
                                                                <td>{slip?.home_team} - {slip?.away_team}</td>
                                                                <td>{slip?.odd_value}</td>
                                                                <td>{slip?.market_name}</td>
                                                                <td>{slip?.bet_pick}</td>
                                                                <td>{slip?.result || "n/a"}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {sharableBet?.bet_id === bet?.bet_id && (
                                                <ShareExistingbet
                                                    bet={bet}
                                                    showshare={true}
                                                    onClose={() => setSharableBet(null)}
                                                />
                                            )}
                                        </Accordion.Body>

                                    </Accordion.Item>
                                    );
                                })}
                            </Accordion>
                        </>
                    )}

                    {/* ================= CASINO ================= */}
                    {betsFilter === "casino" && filteredCasinoBets.length === 0 && (
                        <NoEvents
                            message={
                                casinoBets.length === 0
                                    ? "No casino bets yet"
                                    : "No casino bets in this date range"
                            }
                        />
                    )}

                    {betsFilter === "casino" && filteredCasinoBets.length > 0 && (
                        <div>
                            <table className="table table-bordered">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Game</th>
                                        <th>Stake</th>
                                        <th>Winning</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCasinoBets.map((bet) => (
                                        <tr key={bet.id}>
                                            <td>{bet?.created}</td>
                                            <td>{bet?.game_name}</td>
                                            <td>{bet?.bet_amount}</td>
                                            <td>{bet?.winning_amount || "n/a"}</td>
                                            <td style={{ display: "flex", gap: "5px" }}>
                                                {statusIcon(bet?.status)}
                                                <span>{bet?.status}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* ================= JACKPOT ================= */}
                    {betsFilter === "jackpot" && (
                        <NoEvents message="No jackpot bets yet" />
                    )}
                </div>
            </div>

            {/* ================= CANCEL CONFIRMATION MODAL ================= */}
            <Modal
                show={showConfirmModal}
                onHide={() => setShowConfirmModal(false)}
                centered
            >
                <Modal.Header closeButton style={{ backgroundColor: "#151525", color: "#fff", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                    <Modal.Title style={{ fontSize: "18px", fontWeight: "bold" }}>Cancel Bet</Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ backgroundColor: "#0f0f1f", color: "#fff", padding: "20px" }}>
                    <p style={{ fontSize: "15px", marginBottom: "20px" }}>
                        Are you sure you want to cancel this bet (ID: {betIdToCancel})?
                    </p>
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            className="btn btn-secondary px-4 py-2"
                            style={{
                                background: "rgba(255, 255, 255, 0.15)",
                                border: "none",
                                color: "#fff",
                                borderRadius: "6px"
                            }}
                            onClick={() => setShowConfirmModal(false)}
                        >
                            No, keep bet
                        </button>
                        <button
                            type="button"
                            className="btn px-4 py-2"
                            style={{
                                background: "#ff4d4f",
                                border: "none",
                                color: "#fff",
                                borderRadius: "6px",
                                fontWeight: "bold"
                            }}
                            onClick={() => {
                                setShowConfirmModal(false);
                                if (betIdToCancel) {
                                    cancelBet(betIdToCancel);
                                }
                            }}
                        >
                            Yes, cancel bet
                        </button>
                    </div>
                </Modal.Body>
            </Modal>

        </div>
    );

};

export default React.memo(MyBets);
