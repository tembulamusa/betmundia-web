import React, { useContext, useEffect, useState } from "react";
import { Context } from '../context/store';
import makeRequest from './utils/fetch-request';
import Accordion from 'react-bootstrap/Accordion';
import { FaCheckCircle, FaCircle } from "react-icons/fa";
import { IoMdCloseCircle } from "react-icons/io";
import { TbForbid2Filled } from "react-icons/tb";
import { Tooltip } from "@mui/material";
import { removeItem } from "./utils/local-storage";
import NoEvents from "./utils/no-events";

const MyBets = () => {
    const [state, dispatch] = useContext(Context);
    const [userBets, setUserBets] = useState([]);
    const [casinoBets, setCasinoBets] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [activeKey, setActiveKey] = useState(null);
    const [betsFilter, setBetsFilter] = useState("sports");

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

    return (
        <div className="my-bets">

            {/* HEADER */}
            <div
                className="flex justify-between items-center mx-3 my-3 px-3 py-2 rounded-md"
                style={{ background: "rgba(255,255,255,0.1)" }}
            >
                <h6 className="text-white m-0">My Bets</h6>

                <select
                    value={betsFilter}
                    onChange={(e) => setBetsFilter(e.target.value)}
                    className="px-4 py-2 rounded-md text-white w-[200px] outline-none"
                    style={{
                        background: "rgba(0,0,0,0.4)",
                        border: "1px solid rgba(255,255,255,0.15)"
                    }}
                >
                    <option value="sports">Sports</option>
                    <option value="casino">Casino</option>
                    <option value="jackpot">Jackpot</option>
                </select>
            </div>

            {/* ALERT */}
            {message && (
                <div className={`alert alert-danger mx-3`}>
                    {message.message}
                </div>
            )}

            {/* EMPTY */}
            {betsFilter === "sports" && userBets.length === 0 && (
                <NoEvents message="No sports bets yet" />
            )}

            {/* ================= SPORTS ================= */}
            {betsFilter === "sports" && (
                <>
                    <div className="mx-3">

                        {/* ✅ HEADER ROW */}
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr 0.7fr 0.7fr 1fr 1fr 1fr",
                                gap: "5px",
                                padding: "10px",
                                background: "rgba(255,255,255,0.1)",
                                color: "#fff",
                                fontWeight: "bold",
                                borderRadius: "0px",
                                marginBottom: "0px"
                            }}
                        >
                            <div>Date</div>
                            <div>Bet ID</div>
                            <div>Games</div>
                            <div>Odds</div>
                            <div>Amount</div> {/* ✅ ADDED */}
                            <div>Payout</div>
                            <div>Status</div>
                        </div>
                    </div>
                    <Accordion activeKey={activeKey} onSelect={(k) => setActiveKey(k)} className="mx-3">

                        {userBets.map((bet) => (
                            <Accordion.Item key={bet.bet_id} eventKey={String(bet.bet_id)}>

                                <Accordion.Header>
                                    <div style={{
                                        width: "100%",
                                        display: "grid",
                                        gridTemplateColumns: "1fr 1fr 0.7fr 0.7fr 1fr 1fr 1fr",
                                        gap: "5px"
                                    }}>
                                        <div>{bet?.created}</div>
                                        <div>{bet?.bet_id}</div>
                                        <div>{bet?.total_games}</div>
                                        <div>{bet?.total_odd}</div>
                                        <div>{bet?.bet_amount}</div>
                                        <div>{bet?.possible_win}</div>
                                        <div style={{ display: "flex", gap: "5px" }}>
                                            {statusIcon(bet?.status)}
                                            <span>
                                                {
                                                    bet?.status?.toLowerCase() == "not approved"
                                                        ?
                                                        "Pending" : bet?.status
                                                }
                                            </span>
                                        </div>
                                    </div>
                                </Accordion.Header>

                                <Accordion.Body>
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
                                            {(bet?.betslip || []).map((slip) => (
                                                <tr key={slip.game_id}>
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
                                </Accordion.Body>

                            </Accordion.Item>
                        ))}
                    </Accordion>
                </>
            )}

            {/* ================= CASINO ================= */}
            {betsFilter === "casino" && (
                <div className="mx-3">
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
                            {casinoBets.map((bet) => (
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
                <div className="mx-3 text-white">
                    Jackpot bets coming soon...
                </div>
            )}

        </div>
    );
};

export default React.memo(MyBets);