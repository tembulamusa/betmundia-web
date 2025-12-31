import React, { useContext, useLayoutEffect, useEffect, useCallback, useState, useRef } from "react";
import { useLocation, useParams } from 'react-router-dom';
import makeRequest from './utils/fetch-request';
import { getJackpotBetslip, getBetslip } from './utils/betslip';

import useInterval from "../hooks/set-interval.hook";
import { Context } from '../context/store';
import socket from "./utils/socket-connect.js";
import MatchList from "./matches/index.js";
import betslip from "./right/betslip.js";
import { getFromLocalStorage } from "./utils/local-storage.js";

const CarouselLoader = React.lazy(() => import('./carousel/index.js'));

const Live = (props) => {
    const [matches, setMatches] = useState([]);
    const [state, dispatch] = useContext(Context);
    const [delay,] = useState(3000);
    const [fetching, setFetching] = useState(false)
    const { sportid, categoryid, competitionid } = useParams();
    const [limit, setLimit] = useState(300);
    const [producers, setProducers] = useState([]);
    const [threeWay, setThreeWay] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const [page,] = useState(1);
    const [betradarSportId, setBetradarSportId] = useState(1);
    const [reload, setReload] = useState(false)
    const { spid, sub_type_id } = useParams();
    const [socketIsConnected, setSockectIsConnected] = useState(socket.connected);
    const socketRef = useRef(socket);
    const isFirstLoad = useRef(true);


    const handleGameSocket = (type) => {
        if (state?.selectedLivesport?.betradar_sport_id || 1) {
            if (type === "listen" && socketRef.current?.connected) {
                socketRef.current.emit('user.live-match-page.listen', betradarSportId);
            } else if (type === "leave") {
                socketRef.current?.emit('user.live-match-page.leave', betradarSportId);
            }
        }
    };

    useInterval(() => {
        if (!socketIsConnected) {
            fetchData();
        }
    }, !socketIsConnected ? 3000 : null);

    useEffect(() => {
        handleGameSocket("listen");
        socket.on(`socket-io#live-match-page#${state?.selectedLivesport?.betradar_sport_id || 1}`, (data) => {
            setMatches((preveMatches) => {
                let odds = {}
                let selectedSport = state?.selectedLivesport ? state?.selectedLivesport?.betradar_sport_id : 1
                let sport_name = state?.selectedLivesport ? state?.selectedLivesport?.sport_name : "soccer"
                if (selectedSport == 1) {
                    odds["1x2"] = { "sub_type_id": 1, "name": "1x2", "special_bet_value": "", "outcomes": [] };
                    odds["Double Chance"] = { "sub_type_id": 10, "name": "Double Chance", "special_bet_value": "", "outcomes": [] };
                    odds["Total"] = { "sub_type_id": 18, "name": "Total", "special_bet_value": "2.5", "outcomes": [] };

                } else {
                    odds[state?.selectedLivesport?.dafault_display_markets] = {
                        "sub_type_id": state?.selectedLivesport?.default_market,
                        "name": state?.selectedLivesport?.dafault_display_markets, "special_bet_value": "", "outcomes": []
                    }

                }

                data.odds = odds;
                data.sport_name = sport_name;

                let startTime = data.start_time[1] || "";
                data.start_time = startTime;
                let index = preveMatches?.findIndex(ev => ev.match_id == data.match_id);

                if (index !== -1) {
                    return preveMatches;
                }
                return [...preveMatches, data].sort((a, b) => ((a.start_time - b.start_time) || (b.match_time - a.match_time)))
            }

            );

        })
        const handleConnect = () => setSockectIsConnected(true);
        const handleDisconnect = () => setSockectIsConnected(false);

        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);
        return () => {

        };

    }, [betradarSportId, socket.connected])


    const fetchData = () => {
        let endpoint = "/sports/matches/live/" + (spid || 79)
            + (`${state?.selectedLivesport && state?.selectedLivesport?.sport_name?.toLowerCase() !== "soccer" ? "/"
                + state?.selectedLivesport?.default_market : ""}`) + "?page=" + (page || 1) + `&size=${limit || 200}`;
        let method = "GET";

        // Only set loading state on first load to avoid flickers
        if (isFirstLoad.current) {
            setFetching(true);
        }

        makeRequest({ url: endpoint, method: method, api_version: 2 }).then(([status, result]) => {
            if (isFirstLoad.current) {
                setFetching(false);
                isFirstLoad.current = false;
            }
            if (status == 200) {
                setMatches(result?.data?.items?.sort((a, b) => ((a.start_time - b.start_time) || (b.match_time - a.match_time))) || result)
                setProducers(result?.producer_statuses);
            } else {
                setMatches([])
            }
        });
    };


    useEffect(() => {
        fetchData();
    }, [spid]);

    useEffect(() => {
        if (state?.selectedLivesport) {
            if (spid) {
                fetchData();
            }
            setBetradarSportId(state?.selectedLivesport?.betradar_sport_id)
        }
        setThreeWay(['competition', 'threeway'].includes(state?.selectedLivesport?.sport_type?.toLowerCase()));

    }, [state?.selectedLivesport]);

    useEffect(() => {
        if (reload == true) {
            fetchData();
        }
        setReload(false);

    }, [reload])



    useEffect(() => {

        let currentLive = getFromLocalStorage("selectedLivesport");
        if (!state?.selectedLivesport && currentLive) {
            dispatch({ type: "SET", key: "selectedLivesport", payload: currentLive });
        }
        socket.connect();

        return () => {
            socket.disconnect();
        }
    }, []);


    return (
        <>
            <CarouselLoader />
            {<MatchList
                fetching={fetching}
                three_way
                live
                setReload={setReload}
                matches={matches}
                producers={producers}
                betslip_key={'betslip'}
                subTypes={state?.selectedLivesport
                    ?
                    state?.selectedLivesport?.sport_name?.toLowerCase() !== "soccer"
                        ?
                        [state?.selectedLivesport?.default_market]
                        :
                        [1, 10, 18]
                    :
                    [1, 10, 18]
                }

            />}
        </>
    )
}

export default Live
