import React, { useContext, useEffect, useState, useMemo } from "react";
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
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [activeKey, setActiveKey] = useState(null);
    const [filter, setFilter] = useState("all");

    // FETCH
    const fetchData = async () => {
        if (isLoading) return;

        setIsLoading(true);
        setMessage(null);

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
            } else {
                setMessage({ status, message: "Unable to process" });
            }
        }

        setIsLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    // FILTER
    const filteredBets = useMemo(() => {
        if (filter === "all") return userBets;

        if (filter === "casino") return userBets.filter(b => b?.is_casino);
        if (filter === "jackpot") return userBets.filter(b => b?.jackpot_bet_id);
        if (filter === "sports") return userBets.filter(b => !b?.is_casino && !b?.jackpot_bet_id);

        return userBets;
    }, [userBets, filter]);

    // STATUS ICON
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

            {/* ✅ STYLED HEADER */}
            <div
                className="flex justify-between items-center mx-3 my-3 px-3 py-2 rounded-md"
                style={{ background: "rgba(255,255,255,0.1)" }}
            >
                <h6 className="text-white m-0">My Bets</h6>

                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="px-4 py-2 rounded-md text-white w-[160px] md:w-[200px] outline-none bg-rgba(0,0,0,0.15)"
                    style={{
                        background: "rgba(0,0,0,0.5)",   // lighter than black
                        border: "1px solid rgba(255,255,255,0.15)", // very thin subtle border
                        backdropFilter: "blur(4px)"
                    }}
                >
                    <option value="sports" className="">Sports</option>
                    <option value="casino">Casino</option>
                    <option value="jackpot">Jackpot</option>
                </select>
            </div>

            {/* DESKTOP HEADER */}
            <div
                className="d-none d-md-grid mb-2 px-3"
                style={{
                    gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 1fr",
                    fontWeight: "600",
                    fontSize: "13px",
                    color: "#ccc"
                }}
            >
                <div>Date</div>
                <div>Bet ID</div>
                <div>Games</div>
                <div>Total Odds</div>
                <div>Stake</div>
                <div>Status</div>
            </div>

            {/* ALERT */}
            {message && (
                <div className={`alert alert-${message.status === 200 ? "success" : "danger"} mx-3`}>
                    {message.message}
                </div>
            )}

            {/* EMPTY */}
            {filteredBets.length === 0 && (
                <div className="px-3">
                    <NoEvents message="No bets found" />
                </div>
            )}

            {/* ACCORDION */}
            <Accordion activeKey={activeKey} onSelect={(k) => setActiveKey(k)} className="mx-3">
                {filteredBets.map((bet) => (
                    <Accordion.Item eventKey={String(bet.bet_id)} key={bet.bet_id}>

                        <Accordion.Header>
                            <div style={{ width: "100%" }}>
                                <div style={{
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr 1fr",
                                    gap: "10px"
                                }}>
                                    <div>{bet?.created}</div>
                                    <div>{bet?.bet_id}</div>
                                    <div>{bet?.total_games}</div>
                                    <div>{bet?.total_odd}</div>
                                    <div>{bet?.bet_amount}</div>
                                    <div style={{ display: "flex", gap: "5px" }}>
                                        {statusIcon(bet?.status)}
                                        <span>{bet?.status}</span>
                                    </div>
                                </div>
                            </div>
                        </Accordion.Header>

                        <Accordion.Body>
                            <div style={{ overflowX: "auto" }}>
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
                                                <td>
                                                    {slip?.bet_pick}
                                                    {slip?.special_bet_value && ` (${slip.special_bet_value})`}
                                                </td>
                                                <td>{slip?.result || "n/a"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Accordion.Body>

                    </Accordion.Item>
                ))}
            </Accordion>

        </div>
    );
};

export default React.memo(MyBets);