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
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [activeKey, setActiveKey] = useState(null);

    // ✅ FETCH DATA
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

            {/* TITLE */}
            <div className="bg-primary text-white p-3 text-center mb-3">
                <h4>My Bets</h4>
            </div>

            {/* ALERT */}
            {message && (
                <div className={`alert alert-${message.status === 200 ? "success" : "danger"}`}>
                    {message.message}
                </div>
            )}

            {/* EMPTY */}
            {(!userBets || userBets.length === 0) && (
                <NoEvents message="You have not yet placed any bets yet" />
            )}

            {/* ACCORDION */}
            <Accordion activeKey={activeKey} onSelect={(k) => setActiveKey(k)}>

                {userBets.map((bet) => (
                    <Accordion.Item
                        eventKey={String(bet.bet_id)}
                        key={bet.bet_id}
                    >
                        {/* HEADER */}
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
                                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                        {statusIcon(bet?.status)}
                                        <span>{bet?.status}</span>
                                    </div>
                                </div>
                            </div>
                        </Accordion.Header>

                        {/* BODY */}
                        <Accordion.Body
                            style={{
                                background: "transparent",
                                color: "#000",
                                display: "block",
                                visibility: "visible"
                            }}
                        >
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