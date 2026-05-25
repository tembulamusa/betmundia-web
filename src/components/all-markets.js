import React, {
    useLayoutEffect,
    useState,
    useCallback,
    useEffect,
    useContext,
} from "react";
import { useNavigate, useParams } from 'react-router-dom';


import makeRequest from "./utils/fetch-request";
import useInterval from "../hooks/set-interval.hook";
import { getBetslip } from './utils/betslip';

import { MarketList } from './matches/index';
import { Context } from "../context/store";
import socket from "./utils/socket-connect";
import AllMarketsUnavailable from "./utils/all-markets-unavailable";
import { data } from "jquery";

const Header = React.lazy(() => import('./header/header'));
const Footer = React.lazy(() => import('./footer/footer'));
const SideBar = React.lazy(() => import('./sidebar/awesome/Sidebar'));
const Right = React.lazy(() => import('./right/index'));

const MatchAllMarkets = (props) => {
    const [page, setPage] = useState(1);
    const [producers, setProducers] = useState([]);
    const { live } = props;
    const [matchwithmarkets, setMatchWithMarkets] = useState();
    const [userSlipsValidation, setUserSlipsValidation] = useState();
    const params = useParams();
    const [isLoading, setIsLoading] = useState(false);
    const [, dispatch] = useContext(Context);
    const navigate = useNavigate();
    const [betstopMessage, setBetstopMessage] = useState();
    const [socketIsConnected, setSockectIsConnected] = useState(socket.connected);


    const findPostableSlip = () => {
        let betslips = getBetslip() || {};
        var values = Object.keys(betslips).map(function (key) {
            return betslips[key];
        });
        return values;
    };


    useEffect(() => {
        fetchPagedData()
    }, []);



    const fetchPagedData = () => {
        if (!isLoading && !isNaN(+params.id)) {
            setIsLoading(true);
            let betslip = findPostableSlip();
            let endpoint = live ? "/sports/match/live/" + params.id :
                "/sports/match/" + params.id
            makeRequest({ url: endpoint, method: "GET", api_version: 2 }).then(([status, result]) => {
                setMatchWithMarkets(result?.data);
                setProducers(result?.producer_statuses);
                setIsLoading(false);
            });
        }
    };

    const handleGameSocket = (type) => {
        socket.emit('user.match.listen', matchwithmarkets?.parent_match_id);

    };


    useInterval(() => {
        if (!socketIsConnected) {
            fetchPagedData();
        }
    }, !socketIsConnected ? 10000 : null);

    useEffect(() => {

        const handleConnect = () => setSockectIsConnected(true);
        const handleDisconnect = () => setSockectIsConnected(false);
        if (matchwithmarkets) {
            handleGameSocket("listen")
        }
        socket.on(`socket-io#${matchwithmarkets?.parent_match_id}`, (data) => {
            if (data.message_type == "betstop") {
                setBetstopMessage(data);
            } else {
                if (["ended"].includes(data.match_status.toLowerCase())) {
                    window.location.reload();
                }
            }

        });



        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);

    }, [matchwithmarkets, socket.connected])

    return (
        <>

            <div className="homepage">
                {matchwithmarkets && <MarketList live={live}
                    initialMatchwithmarkets={matchwithmarkets}
                    producers={producers}
                    betstopMessage={betstopMessage}
                    setBetstopMessage={setBetstopMessage}
                />}
            </div>


            {(!matchwithmarkets && !isLoading) &&
                <AllMarketsUnavailable backLink={live ? "/live" : "/"} isLoading={isLoading} />
            }

        </>
    )
}

export default MatchAllMarkets;
