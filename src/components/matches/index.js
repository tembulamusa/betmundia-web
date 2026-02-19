import React, { useState, useEffect, useContext, useCallback, useRef, useLayoutEffect, useMemo } from 'react';
import { Context } from '../../context/store';
import {
    addToSlip,
    removeFromSlip,
    removeFromJackpotSlip,
    addToJackpotSlip,
    getBetslip
} from '../utils/betslip';
import { isDeepEqual } from '../utils/deep-equal';
import { Col, Container, Dropdown, Spinner, Row } from 'react-bootstrap';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import padlock from '../../assets/img/padlock.png';
import { getFromLocalStorage } from "../utils/local-storage";
import { Link } from 'react-router-dom';
import NoEvents from '../utils/no-events';
import usePrevious from "../../hooks/previous.hook"
import { match } from 'assert';
import socket from '../utils/socket-connect';
import { ShimmerTable } from "react-shimmer-effects";
import MatchDetailBetrandder from "../../assets/img/betrader/test-game-details.png"
import LockedButton, { EmptyButton } from '../utils/locked-button';
import betslip from '../right/betslip';
import useInterval from '../../hooks/set-interval.hook';
import MatchWidget from './match-widget';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useNavigate } from "react-router-dom";
import { IoIosArrowBack, IoIosStats } from 'react-icons/io';
import { TfiStatsUp } from "react-icons/tfi";

const clean = (_str) => {
    _str = _str.replace(/[^A-Za-z0-9\-]/g, '');
    return _str.replace(/-+/g, '-');
}

const TimeCounter = (props) => {
    const { minutes, seconds } = props;
    const [timer, setTimer] = useState({ mins: props?.minutes, secs: props?.seconds });
    useEffect(() => {

        if (props) {
            setTimer({ mins: minutes, secs: seconds });
        }

    }, [props])

    const incrementTimer = () => {
        setTimer((prevTimer) => {
            let mins = prevTimer.mins
            let secs = prevTimer.secs + 1;

            if (secs == 60) {
                mins += 1
                secs = 0
            }
            return { mins: mins, secs: secs }
        })
    }

    useInterval(incrementTimer, timer.mins && 1000);

    return (
        timer.mins && <span className=''>{timer.mins < 89 ? String(timer.mins).padStart(2, "0") : "90:00+"} {timer.mins < 89 && " : " + String(timer.secs).padStart(2, "0")}</span>
    )

}

const EmptyTextRow = (props) => {
    const { odd_key, classname } = props;

    return (
        <button className={`${classname} inactive-odds-btn btn btn-disabled match-detail col c-btn cursor-not-allowed`}
            style={{
                //  width: "100%",
                //  height: "30px",
                //  padding: "2px",
                //  color: "#fff",
                //  background: "#d7d7d7",
                //  opacity: 1
            }} disabled>
            {odd_key && <span className="et label btn-disabled ">{odd_key}</span>}
            <span className="label label-inverse">
                <LazyLoadImage
                    style={{ width: "15px" }}
                    src={padlock}
                    effect="blur"
                    alt="--" />
            </span>
        </button>
    );
};

const MatchHeaderRow = (props) => {
    const {
        live,
        first_match,
        jackpot,
        fetching,
        three_way,
    } = props;

    //const [state, ]  = useContext(Context);f
    const categories = getFromLocalStorage('categories');
    const sport_id = new URL(window.location).searchParams.get('sport_id') || 79
    let sport = categories?.all_sports?.filter((category) => category.sport_id == sport_id)

    const [sportName, setSportName] = useState(sport?.[0]?.sport_name || 'Soccer');
    const [showX, setShowX] = useState(true);
    const [market, setMarket] = useState('1x2');
    const [marketCols, setMarketCols] = useState(3)


    const extraMarketDisplays = [
        {
            id: "10",
            name: "Double Chance",
            extra_market_cols: 3,
            extra_markets_display: [
                "1X", "12", "X2"
            ]
        },
        {
            id: "18",
            name: "Over/Under 2.5",
            extra_market_cols: 2,
            extra_markets_display: [
                "Under", "Over"
            ]
        }
    ];




    useEffect(() => {
        if (first_match) {
            setSportName(first_match.sport_name);
            setMarket(first_match.market_name);
        }
    }, [first_match])


    return (
        first_match && <Container className={`${live && 'live'} full-mobile sticky-top`} style={{ position: "sticky", paddingLeft: "0", paddingRight: "0" }}>
            <div className={`${jackpot && 'jackpot-zero-top'} top-matches d-flex position-sticky sticky-top `}
                style={{ opacity: "1", top: "100px", height: "" }}>

                <div className={'col-2 col-xs-12 match-detail-container'} key="d4">
                    <span className='text-gray-500 font-bold'>
                        {sportName}
                    </span>
                </div>
                <div className="hidden md:flex col-sm-2 col-xs-12 pad left-text" key="d5">
                    <div className="align-self-center col">

                        {fetching && <div className="filter-group-icon " >
                            {/* Uncomment this just to illustrate to the user... */}
                            {/* <Spinner animation="border" size="sm" variant="secondary" /> */}
                        </div>
                        }
                        {/* <h3 className="main-heading-1 ">
                            {live && <span className="live-header">LIVE </span> }
                            {!live && <span className="">PREMATCH </span> }
                        </h3> */}
                    </div>
                </div>
                <div className={`${jackpot ? "is-jackpot-buttons" : ""} col ${sportName?.toLowerCase() == "soccer" ? 'd-flex flex-row justify-content-between' : "single-market-container"}`}>
                    {
                        // <div className={``} key="d3">
                        <div className={`${sportName?.toLowerCase() == "soccer" ? 'd-flex flex-row' : "single-market-content"} d-flex flex-column text-center ${sportName?.toLowerCase() == "soccer" ? 'd-flex flex-row' : "!pr-0"}`}>
                            <div className={'bold hidden md:block'}>
                                <span>{three_way ? "3 WAY" : "Winner"}</span>
                            </div>
                            <div className={'mt-3 c-btn-group align-self-end'}>
                                <a className="c-btn-header" href='#/'>1</a>
                                {three_way && <a className="c-btn-header" href='#/'>X</a>}
                                <a className="c-btn-header" href='#/'>2</a>
                            </div>
                        </div>
                        // </div>
                    }
                    {(!jackpot && sportName?.toLowerCase() == "soccer" && first_match) && (
                        extraMarketDisplays?.map((extra_market) => (
                            <div className={`d-flex flex-column ${extra_market?.id == 18 ? "pr-0" : ""}`} key={extra_market.name}>
                                <span className={'small text-center text-uppercase bold'}>
                                    {extra_market?.name}
                                </span>
                                <div className={'mt-3 c-btn-group'}>
                                    <a className="c-btn-header" href='#/'>
                                        {(extra_market?.extra_markets_display[0])}
                                    </a>
                                    <a className="c-btn-header" href='#/'>
                                        {(extra_market?.extra_markets_display[1])}
                                    </a>
                                    {extra_market?.extra_market_cols > 2 &&
                                        <a className={`c-btn-header`} href='#/'>
                                            {(extra_market?.extra_markets_display[2])}
                                        </a>}
                                </div>
                            </div>
                        ))
                    )}
                    <div
                        className="bet-fix events-odd pad undefined align-self-center more-markets-container m-lg-2 col-3">
                        &nbsp;
                    </div>
                </div>
            </div>
        </Container>
    )
}

const convertDateToLocalString = (date) => {
    let monthMapper = { 0: "jan", 1: "feb", 2: "mar", 3: "apr", 4: "may", 5: "jun", 6: 'jul', 7: "aug", 8: "sep", 9: "oct", 10: "nov", 11: "dec" }
    var theDate = new Date(date);
    let options = { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
    theDate.toLocaleString("en-us", options);
    let reconvert = new Date(theDate);
    let formattedString = " " + reconvert.getDate() + " " + monthMapper[reconvert.getMonth()] + " / " + reconvert.getHours() + ":" + reconvert.getMinutes()
    return formattedString
}
const MoreMarketsHeaderRow = (props) => {
    const {
        match,
        live
    } = props;
    const [score, setScore] = useState("");
    const [matchTime, setMatchTime] = useState({});
    const [matchStatus, setMatchStatus] = useState("");
    // repeated functions should be refactored
    const socketRef = useRef(socket);
    const socketEvent = useMemo(() => `socket-io#${match?.parent_match_id}`, [match]);
    const navigate = useNavigate();

    const updateMatchTimeMinutesAndSeconds = (match_time) => {
        setMatchTime((prevTime) => {
            if (match_time) {
                let [minutes, seconds] = match_time.split(":").map(Number);
                return { minutes: minutes, seconds: seconds };
            }
            return null;
        });
    }
    const handleGameSocket = useCallback((type, gameId) => {
        if (type === "listen" && socketRef.current?.connected) {
            socketRef.current.emit('user.match.listen', gameId);
        } else if (type === "leave" && matchStatus?.toLowerCase()?.trim() == "ended") {
            // socketRef.current?.emit('user.match.leave', gameId);
        }
    }, []);


    useEffect(() => {
        handleGameSocket("listen", match?.parent_match_id);
        updateMatchTimeMinutesAndSeconds(match?.match_time);
        const handleSocketData = (data) => {

            setScore((prevScore) => {
                return data?.score
            });

            setMatchStatus((prevStatus) => {
                return data?.match_status
            })

            updateMatchTimeMinutesAndSeconds(data?.match_time);

        };

        socketRef.current?.on(socketEvent, handleSocketData);

        return () => {
        };
    }, [handleGameSocket, match, socketEvent]);


    const LivescoreFooter = () => {

        return (

            <div className="livescore-footer-links flex capitalize px-3">
                <div className="footer-item">Match</div>
                <div className="footer-item">Head to head</div>
                <div className="footer-item">standings</div>
                <div className="footer-item">lineups</div>
            </div>
        )
    }
    return (
        <>

            <div className="match-detail-header panel-header primary-bg pt-3">
                <span> <a href={"#"} className="opacity-60 hover:opacity-100" onClick={(e) => { e.preventDefault(); navigate(-1); }}> <IoIosArrowBack className="inline-block" /> <span className='' style={{ fontSize: "13px" }}>Back</span></a> {match?.home_team} - {match?.away_team} </span>
            </div>
            <MatchWidget parentMatchId={match?.parent_match_id} />
        </>
    )
}

const SideBets = (props) => {
    const { match, live } = props;
    const [picked,] = useState();

    const openLiveStats = (parent_match_id) => {

        window.open(`https://s5dev.sir.sportradar.com/betmundialmts/en/match/${match?.parent_match_id}`, 'sportradderwindow', 'width=648,height=700');
    }
    return (
        <div
            className={` ${picked} align-self-center more-markets-container m-lg-2`}>
            <div
                onClick={() => openLiveStats(match?.parent_match_id)}
                className='side !pl-2 !ml-3 text-white font-bold opacity-70 hover:opacity-100 cursor-pointer'>
                <IoIosStats size={20} />
            </div>
        </div>
    )

}

const OddButton = (props) => {
    const { match, mkt, detail, live, jackpot, subType, marketKey } = props
    const [ucn, setUcn] = useState('');
    const [picked, setPicked] = useState('');
    const [oddValue, setOddValue] = useState(null);
    let reference = match.match_id + "_selected";
    const [state, dispatch] = useContext(Context);
    const ref = useRef();
    const [betslip_key, setBetslipKey] = useState('betslip');

    const updateBeslipKey = useCallback(() => {
        if (jackpot) {
            setBetslipKey("jackpotbetslip");
        }
    }, [jackpot]);

    useEffect(() => {
        updateBeslipKey();
    }, [updateBeslipKey])


    const OddButtonChange = () => {


    }

    const updateOddValue = useCallback(() => {
        if (match) {
            let uc = clean(
                match.match_id
                + "" + (match?.odds?.sub_type_id || match?.sub_type_id)
                + (match?.[mkt] || match?.odd_key || mkt || "draw")
            );
            setUcn(uc);
            setOddValue(match?.odd_value);

        }
    }, [match, mkt]);

    useLayoutEffect(() => {
        updateOddValue();
    }, [updateOddValue]);

    const updatePickedChoices = () => {
        let betslip = getFromLocalStorage("betslip") || state?.[betslip_key]
        let uc = clean(
            match.match_id
            + "" + (match?.odds?.sub_type_id || match?.sub_type_id)
            + (match?.[mkt] || match?.odd_key || mkt)
        );
        if ((betslip?.[match.match_id]?.match_id == match.match_id)
            && uc == betslip?.[match.match_id]?.ucn &&
            betslip?.[match.match_id]?.special_bet_value == match?.special_bet_value) {
            setPicked('picked');
        } else {
            setPicked('');
        }

    }
    useEffect(() => {

        updatePickedChoices();

    }, [state?.[betslip_key]?.[match?.match_id], state?.betslip?.[match?.match_id]])

    useEffect(() => {
        updatePickedChoices();
    }, [])


    const updateMatchPicked = useCallback(() => {
        if (state?.[reference]) {
            if (state?.[reference].startsWith('remove.')) {
                setPicked('');
            } else {
                let uc = clean(
                    match.match_id
                    + "" + (match?.odds?.sub_type_id || match?.sub_type_id)
                    + (match?.[mkt] || match?.odd_key || mkt)
                );
                if (state?.[reference] == uc + match?.special_bet_value) {
                    setPicked('picked')
                } else {
                    setPicked('');
                }
            }
        }
    }, [state?.[betslip_key]?.[match.match_id]])


    useEffect(() => {
        updateMatchPicked();
    }, [updateMatchPicked])

    const handleButtonOnClick = (event) => {
        let pmid = event.currentTarget.getAttribute("parent_match_id");
        let mid = event.currentTarget.getAttribute("match_id");
        let stid = event.currentTarget.getAttribute("sub_type_id");
        let sbv = event.currentTarget.getAttribute("special_bet_value");
        let oddk = event.currentTarget.getAttribute("odd_key");
        let odd_value = event.currentTarget.getAttribute("odd_value");
        let pick_key = event.currentTarget.getAttribute("pick_key");
        let bet_type = event.currentTarget.getAttribute("bet_type");
        let odd_type = event.currentTarget.getAttribute("odd_type");
        let home_team = event.currentTarget.getAttribute("home_team");
        let away_team = event.currentTarget.getAttribute("away_team");
        let sport_name = event.currentTarget.getAttribute("sport_name");
        let market_active = event.currentTarget.getAttribute("market_active");
        let start_time = event.currentTarget.getAttribute("start_time");
        let producer_id = event.currentTarget.getAttribute("producer_id");
        let cstm = clean(mid + "" + stid + oddk + (marketKey != undefined ? marketKey : ''));

        let slip = {
            "match_id": mid,
            "parent_match_id": pmid,
            "special_bet_value": sbv,
            "sub_type_id": stid,
            "bet_pick": pick_key,
            "odd_value": odd_value,
            "home_team": home_team,
            "away_team": away_team,
            "bet_type": bet_type,
            "odd_type": odd_type,
            "sport_name": sport_name,
            "live": live ? 1 : 0,
            "ucn": cstm,
            "event_status": match?.status,
            "market_active": market_active,
            "start_time": start_time,
            "producer_id": producer_id
        }


        if (cstm == ucn) {
            let betslip;
            if (picked == 'picked') {
                setPicked('');
                betslip = jackpot !== true
                    ? removeFromSlip(mid)
                    : removeFromJackpotSlip(mid);
                dispatch({ type: "SET", key: reference, payload: "remove." + cstm + sbv });
            } else {
                betslip = jackpot !== true
                    ? addToSlip(slip)
                    : addToJackpotSlip(slip);
                dispatch({ type: "SET", key: reference, payload: cstm + sbv });
            }
            dispatch({ type: "SET", key: betslip_key, payload: betslip });
        }
    };
    return (
        <button
            ref={ref}
            className={`secondary-bg-2 home-team ${match.match_id} ${ucn} ${picked} c-btn`}
            home_team={match.home_team}
            odd_type={match?.name || match?.market_name}
            bet_type={live ? 1 : 0}
            away_team={match.away_team}
            market_active={match.market_active}
            odd_value={oddValue}
            odd_key={match?.odd_key}
            pick_key={match?.odd_key}
            parent_match_id={match.parent_match_id}
            match_id={match.match_id}
            custom={ucn}
            producer_id={match?.producer_id}
            sport_name={match.sport_name}
            start_time={match.start_time}
            sub_type_id={match?.sub_type_id}
            special_bet_value={match?.special_bet_value || ''}
            onClick={handleButtonOnClick}
        >
            {!detail &&
                (
                    <span className="theodds odd-fix">
                        {parseFloat(oddValue).toFixed(2)}
                    </span>
                )
            }
            {detail &&
                (<>
                    <span
                        className="label mkt-detail-label label-inverse"
                        style={{ color: "#fff" }}>
                        {match.odd_key} {(!match?.odd_key.includes(match?.special_bet_value.replace(/^[+-]/, '')))
                            && `(${match?.special_bet_value.slice(match?.special_bet_value.lastIndexOf(":") + 1)})`}
                    </span>
                    <span
                        className="label label-inverse odd-value" style={{ fontWeight: "bold" }}>
                        {parseFloat(match?.odd_value).toFixed(2)}
                    </span>
                </>)}
        </button>
    )
}


const teamScore = (allscore, is_home_team) => {
    let allScores = allscore != null ? allscore.split(":") : ["-", "-"];
    let homeScore = allScores[0];
    let awayScore = allScores[1];
    let score = homeScore;
    if (is_home_team == false) {
        score = awayScore
    }
    let convertedScore = function () {
        try {
            let intScore = parseInt(score);
            if (!isNaN(intScore)) {
                return intScore
            } else {
                return "-"
            }
        } catch (err) {
            return "-"
        }

    }
    return convertedScore();
}

const MarketRow = (props) => {
    const { markets, match, market_id, rowItems, live, producers, marketDetail, betstopMessage, setBetstopMessage } = props;
    const [mutableMkts, setMutableMkts] = useState(
        [...markets.sort((a, b) => a?.special_bet_value?.localeCompare(b?.special_bet_value) || a.outcome_id.localeCompare(b.outcome_id) || a.odd_key.localeCompare(b.odd_key))]
    );

    const [marketStatus, setMarketStatus] = useState(marketDetail?.market_status);
    const [producerId, setProducerId] = useState(marketDetail?.producer_id);
    const [state, dispatch] = useContext(Context);
    const [pdown, setPdown] = useState(false);

    useEffect(() => {
        if (markets) {
            setMutableMkts([...markets.sort((a, b) => a?.special_bet_value?.localeCompare(b?.special_bet_value) || a.outcome_id.localeCompare(b.outcome_id) || a.odd_key.localeCompare(b.odd_key))]);
        }

        // computed producer down
        const producer = producers?.find?.(producer => producer.producer_id === marketDetail?.producer_id);
        if (producer) {
            setPdown(producer?.disabled);
        }
    }, [markets]);

    const socketRef = useRef(socket);
    const socketEvent = useMemo(() => `socket-io#${match?.parent_match_id}#${marketDetail.sub_type_id}`, [match, marketDetail]);

    const handleGameSocket = useCallback((type, gameId, sub_type_id) => {
        if (type === "listen" && socketRef.current?.connected) {
            socketRef.current.emit('user.market.listen', { parent_match_id: gameId, sub_type_id: sub_type_id });
        }
    }, []);

    useEffect(() => {
        if (betstopMessage) {
            let affectedMarkets = betstopMessage.markets.split(",");
            if (affectedMarkets.includes('all')
                || affectedMarkets.includes(marketDetail.sub_type_id)) {
                setMutableMkts((prevMarkets) => {
                    const newOdds = [...prevMarkets];
                    newOdds.forEach((odd) => {
                        // if (odd.market_status.toLowerCase() == "active"
                        //     ||
                        //     odd.market_status.toLowerCase() == "suspended") {
                        odd.market_status = betstopMessage.market_status
                        // }
                    }

                    )
                    return newOdds;

                });
                setMarketStatus(betstopMessage?.market_status);
            }
            setBetstopMessage(null);
        }

    }, [betstopMessage]);

    useEffect(() => {
        if (socket.connected) {
            handleGameSocket("listen", match?.parent_match_id, marketDetail?.sub_type_id);
            const handleSocketData = (data) => {

                if (Object.keys(data.event_odds).length > 0) {
                    Object.values(data.event_odds)?.sort((a, b) => a?.outcome_id - b?.outcome_id)?.forEach((evodd, ivg) => {
                        evodd.name = data.match_market.market_name;
                        setMutableMkts((prevMarkets) => {
                            let index = prevMarkets?.findIndex(
                                ev => ev.sub_type_id == evodd.sub_type_id
                                    && ev.outcome_id == evodd.outcome_id
                                    && (!evodd.special_bet_value || (ev.special_bet_value == evodd.special_bet_value)));

                            if ((["active", "handedover"].includes(marketStatus.toLowerCase()) === false)
                                &&
                                ["active", "handedover"].includes(evodd.market_status.toLowerCase())) {
                                setMarketStatus(evodd.market_status);
                            }
                            if (index !== -1) {
                                const newOdds = [...prevMarkets];
                                newOdds[index] = { ...evodd };
                                return newOdds.sort((a, b) =>
                                    a?.special_bet_value - b?.special_bet_value || a?.outcome_id - b?.outcome_id
                                );
                            } else {
                                return [...prevMarkets, evodd].sort((a, b) =>
                                    a?.special_bet_value - b?.special_bet_value || a?.outcome_id - b?.outcome_id
                                );
                            }

                        });

                    });
                } else {
                    setMutableMkts((prevMarkets) => {
                        let indexes = prevMarkets?.map(
                            (item, idx) =>
                                item.sub_type_id == data.match_market.sub_type_id
                                    && item.special_bet_key == data.special_odd_key
                                    && item.special_bet_value == data.match_market.special_bet_value
                                    ?
                                    idx
                                    :
                                    -1).filter(index => index !== -1);
                        const newOdds = [...prevMarkets];
                        indexes.forEach(index => newOdds[index].market_status = data.match_market.status)
                        return newOdds.sort((a, b) =>
                            a?.special_bet_value - b?.special_bet_value || a?.outcome_id - b?.outcome_id
                        );
                    });
                }

                if (producerId !== data.match_market.producer_id && pdown) {
                    setPdown(false);
                }
                if (data.match_market.producer_id) {
                    setProducerId(data.match_market.producer_id);
                }
            };
            socketRef.current?.on(socketEvent, handleSocketData);
            // producer status
            socket.on(`PRODUCER_STATUS_CHANNEL`, (data) => {
                if (data.producer_id == producerId) {
                    setPdown(data.disabled);
                }
            });
        }
    }, [socket.connected, match?.parent_match_id, marketDetail?.sub_type_id, socketEvent]);

    const MktOddsButton = ({ match, mktodds, live, pdown, producerId }) => {
        const fullmatch = { ...match, ...mktodds, producer_id: producerId };

        if (
            !pdown
            // &&
            // marketStatus?.toLowerCase() === "active"
            &&
            fullmatch?.odd_value !== 'NaN' &&
            fullmatch?.odd_active === 1 &&
            ["active", "handedover"].includes(fullmatch?.market_status.toLowerCase())
        ) {
            return <OddButton match={fullmatch} detail mkt={"detail"} live={live} />;
        }
        return <EmptyTextRow odd_key={fullmatch?.odd_key} />;
    };

    return (
        <>
            {(
                ["active", "suspended", "handedover"].includes(marketStatus?.toLowerCase())
                && mutableMkts?.some(odd => ["active", "suspended", "handedover"].includes(odd?.market_status?.toLowerCase()))
            )
                &&
                <div className="top-matches event-row">
                    <Row className="top-matches header">
                        {live &&
                            <div
                                style={{
                                    width: "2px",
                                    marginTop: "-5px",
                                    marginRight: "5px",
                                    opacity: 0.6,
                                    paddingLeft: 0
                                }}>
                                <ColoredCircle color="#cc5500" />
                            </div>
                        }
                        <span className='col-9'>{marketDetail.name}</span>
                    </Row>
                    <div className={`grid grid-cols-${rowItems} gap-x-3`}>
                        {
                            mutableMkts &&
                            mutableMkts?.map((mkt_odds) => {
                                return (<>
                                    {
                                        (["active", "suspended", "handedover"].includes(mkt_odds?.market_status?.toLowerCase()))
                                        &&
                                        <div className="match-detail" style={{}}>
                                            {/* <div>{mkt_odds.market_status}</div> */}
                                            <MktOddsButton
                                                match={match}
                                                mktodds={mkt_odds}
                                                producerId={producerId}
                                                live={live}
                                                pdown={pdown}
                                            />
                                        </div>
                                    }
                                </>)
                            }
                            )
                        }
                    </div>

                </div>
            }
        </>
    )
}

const ColoredCircle = ({ color }) => {
    const styles = { backgroundColor: color };
    return color ? (
        <>
            <span className="colored-circle" style={styles} />
        </>
    ) : null;
};

const getUpdatedMatchFromOdds = (props) => {
    const { match, marketName, odd_key, odd_data } = props;
    let newMatch = { ...match, ...odd_data };
    newMatch.name = marketName;
    newMatch.odd_key = odd_key;
    newMatch.odd_value = odd_data.odd_value;
    newMatch.odd_active = odd_data.odd_active;
    newMatch.special_bet_value = odd_data.special_bet_value;
    delete newMatch['odds']
    delete newMatch['extra_odds']
    return newMatch;

}

const BetNowButton = (props) => {

    return (<>
        Bet Now
    </>);
}

const MatchMarket = (props) => {
    const {
        initialMatch,
        marketName,
        marketId,
        buttonCount,
        special_bet_value,
        jackpot,
        jackpotstatus,
        live,
        transitioned,
        setTransitioned,
        producers,
        availableMarkets } = props
    const [match,] = useState({ ...initialMatch });
    const [pdown, setPdown] = useState(false);
    const [btnCount,] = useState(buttonCount);
    const [outcomes, setOutcomes] = useState(
        initialMatch?.odds?.[marketName]?.outcomes.sort((a, b) =>
            a?.outcome_id - b?.outcome_id) || []);
    const [producerId, setProducerId] = useState(initialMatch?.odds?.[marketName]?.producer_id);

    const [market_status, setMarketStatus] = useState(initialMatch?.odds?.[marketName]?.market_status);

    useEffect(() => {
        // alert(JSON.stringify({ jackpotstatus, jackpot, outcomes }));
        let pId = initialMatch?.odds?.[marketName]?.producer_id
        const producer = producers?.find?.(producer => producer.producer_id === pId);
        if (producer) {
            setPdown(producer.disabled);
        }
        if (jackpot && jackpotstatus == "ACTIVE") {
            setMarketStatus("Active");
        }
    }, [])

    const handleGameSocket = (type, gameId) => {
        availableMarkets?.forEach((subTypeId) => {
            if (type == "listen" && socket?.connected) {
                socket.emit('user.market.listen', { parent_match_id: gameId, sub_type_id: subTypeId });
            } else if (type == "leave") {
                // socket?.emit("user.market.leave", { parent_match_id: gameId, sub_type_id: subTypeId });
            }
        });
    }


    useEffect(() => {
        if (socket.connected) {
            handleGameSocket("listen", match?.parent_match_id);
            socket?.on(`socket-io#${match?.parent_match_id}#${marketId}`, (data) => {
                if (data.match_market.special_bet_value == special_bet_value) {
                    if (Object.keys(data.event_odds).length > 0) {
                        setOutcomes((prev) => {
                            let newOdds = Object.values(data.event_odds).sort(
                                (a, b) => a.outcome_id - b.outcome_id
                            )
                            newOdds.forEach(odd => {
                                odd.name = data.match_market.market_name;
                            });
                            return newOdds
                        })

                    }
                    setMarketStatus(data.match_market.status)
                }

                if (producerId !== data.match_market.producer_id && pdown) {
                    setPdown(false);
                }
                if (data.match_market.producer_id) {
                    setProducerId((prevId) => {
                        if (
                            data.match_market.producer_id == 1
                            && !transitioned
                            && !live
                        ) {

                            setTransitioned(true);
                        }
                        return data?.match_market?.producer_id
                    });
                }
            });
        }



        // for match producer down message
        socket.on(`PRODUCER_STATUS_CHANNEL`, (data) => {
            if (data.producer_id == producerId) {
                setPdown(data.disabled);
            }

        });

        return () => {
        }
    }, [socket.connected]);

    return (
        <>
            {
                ((!jackpot || (jackpot && jackpotstatus == "ACTIVE") || live)
                    &&
                    ["active", "handedover"].includes(market_status?.toLowerCase())) && outcomes?.map((marketOdd, idx) => {


                        let matchWithDetails = {
                            ...match, ...marketOdd,
                            market_status: market_status,
                            producer_id: producerId || match?.odds?.[marketName]?.producer_id
                        };

                        delete matchWithDetails.odds;
                        return (
                            marketOdd.odd_active == 1
                                && matchWithDetails.odd_value
                                && (!pdown && matchWithDetails.odd_value !== 'NaN') || (jackpot && jackpotstatus == "ACTIVE")
                                ?
                                <>
                                    <OddButton
                                        key={`match-with-detail-market-${idx}`}
                                        match={matchWithDetails}
                                        mkt={marketName}
                                        live={live}
                                        jackpot={jackpot} />
                                </>
                                : <><LockedButton /></>
                        )
                    })
            }

            {

                !jackpot && !["active", "handedover"].includes(market_status?.toLowerCase()) &&
                ((btnCount == 2) ? [1, 2].map((btn, idx) => (
                    <><LockedButton btnStatus={market_status} /></>
                )) : [1, 2, 3].map((btn, idx) => (
                    <><LockedButton btnStatus={market_status} /></>
                )))
            }
        </>
    )
}

const MatchRow = (props) => {
    const {
        initialMatch,
        jackpot,
        live,
        producers,
        three_way,
        jackpotstatus,
        setReload,
        subTypes } = props;
    const [match, setMatch] = useState({ ...initialMatch })
    const [availableMarkets,] = useState(subTypes || [1, 10, 18])
    const [updatedMatchStatus, setUpdatedMatchStatus] = useState(initialMatch?.match_status);
    const [updatedMatchTime, setUpdatedMatchTime] = useState({});
    const [updatedMatchScore, setUpdatedMatchScore] = useState();
    const [betStop, setBetStop] = useState({});
    const [updatedLive, setUpdatedLive] = useState(live);
    const [transitioned, setTransitioned] = useState(false);
    const updateMatchTimeMinutesAndSeconds = (match_time) => {
        setUpdatedMatchTime((prevTime) => {
            if (match_time) {
                let [minutes, seconds] = match_time.split(":").map(Number);
                return { minutes: minutes, seconds: seconds };
            }
            return null;
        });
    }

    useEffect(() => {
        // alert(JSON.stringify(initialMatch));

        updateMatchTimeMinutesAndSeconds(match?.match_time);
        if (jackpot) {
            return;
        }
        socket.emit('user.match.listen', match?.parent_match_id);
        socket.on(`socket-io#${match?.parent_match_id}`, (data) => {
            if (data.message_type == "betstop") {
                if (data.markets == "all") {
                    setMatch((prevMatch) => {
                        let newOdds = prevMatch.odds;
                        let newOddsMatch = prevMatch
                        Object.keys(newOdds).forEach(key => {
                            newOdds[key].outcomes.forEach((item, idx) => {
                                newOdds[key].outcomes[idx].market_status = data.market_status
                            })
                        })
                        newOddsMatch.odds = newOdds;
                        return newOddsMatch
                    });
                } else {
                    let marketIds = data.markets.split(",");

                    marketIds.forEach(item => {
                        setMatch((prevMatch) => {
                            let newOdds = prevMatch.odds;
                            let newOddsMatch = prevMatch
                            Object.keys(newOdds).forEach(key => {
                                if (newOdds[key].sub_type_id == item) {
                                    newOdds[key].outcomes.forEach((item, idx) => {
                                        newOdds[key].outcomes[idx].market_status = data?.market_status
                                    })
                                }
                            })
                            newOddsMatch.odds = newOdds;
                            return newOddsMatch
                        })
                    })
                }
            }

            setUpdatedMatchScore((prevScore) => {
                return data.score
            });
            setUpdatedMatchStatus((prevStatus) => {
                return data.match_status
            });
            updateMatchTimeMinutesAndSeconds(data.match_time);
        })

        return () => {
            // socket?.emit("user.market.leave", match?.parent_match_id );
        }

    }, []);

    const TimeToLiveStarting = (props) => {
        const { starttime } = props;

        let startDiff = Date.parse(starttime) - Date.now();
        let diffHrs = Math.floor((startDiff % 86400000) / 3600000);
        let diffMins = Math.round(((startDiff % 86400000) % 3600000) / 60000);
        return (
            <>
                {
                    starttime === '0'
                        ?
                        <span className=''>Not  Started</span>
                        :
                        <span><span className='text-[#f0f0f0]'>{diffHrs > 0 && diffHrs + " Hrs"} {startDiff >= 0 && diffMins + " Mins"}</span> to start</span>

                }

            </>
        )
    }
    return (
        <>
            {(updatedMatchStatus?.toLowerCase()?.trim() !== "ended" && !transitioned) &&
                <div className="top-matches d-flex" key={"match-list-" + match?.match_id}>
                    <div className="hidden md:flex col-sm-2 col-xs-12 pad left-text" key="21">
                        {updatedLive &&
                            <>
                                <small style={{ color: "red" }}> { } </small>
                                <br />
                            </>
                        }
                        <div className="d-flex flex-column" key="20">
                            {(live && (Date.parse(match?.start_time) >= Date.now() && !match?.match_time)) && <div className='w-full float-right font-[500]'><TimeToLiveStarting starttime={match?.start_time} /></div>}

                            <span className={'small'}>
                                {(live && (updatedMatchStatus || match?.match_status))
                                    ?
                                    <span className='font-[500] uppercase'>{updatedMatchStatus || match?.match_status}</span>
                                    : match?.start_time == 0 ? "NOT STARTED" : match?.start_time
                                }
                            </span>
                            {
                                !live
                                    ?
                                    <>ID: {match?.game_id} </>
                                    :
                                    <span className='text-[#f0f0f0] ml-2'>
                                        {updatedMatchTime?.minutes == 90
                                            ?
                                            "90:00+"
                                            :
                                            <TimeCounter minutes={updatedMatchTime?.minutes} seconds={updatedMatchTime?.seconds} />
                                        }

                                    </span>
                            }
                        </div>
                    </div>

                    <div className="col-md-2 col-sm-4 col-xs-12 match-detail-container" key="23">
                        <Link to={(jackpot) ? '#' : `/match/${live ? 'live/' : ""}` + match?.match_id}>
                            <div className="d-flex flex-column primary-text">
                                <div className="compt-detail overflow-ellipsis" key="0034">
                                    <small>{match?.category} | {match?.competition_name}</small>
                                </div>
                                <div className="compt-teams d-flex flex-column" key="0035">
                                    <div className={'bold'}>
                                        {match?.home_team}

                                    </div>
                                    <div className={'bold'}>
                                        {match?.away_team}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>

                    {(live) &&
                        <div className="text-[#FFB200] font-bold">
                            <br />
                            {teamScore((updatedMatchScore || match?.score), true)}
                            <br />
                            {teamScore((updatedMatchScore || match?.score), false)}
                        </div>
                    }

                    <div className={`${jackpot && "is-jackpot"} ${live && 'live-game'} col block ${match?.sport_name?.toLowerCase() == "soccer" ? "md:flex" : "single-market-container"} justify-content-between`} key="24">
                        {/* Mobile only datetime */}

                        <div className="md:hidden block">
                            {(live && Date.parse(match?.start_time) > Date.now()) && <div className='w-full float-right font-[500]'><TimeToLiveStarting starttime={match?.start_time} /></div>}
                            {(live && match?.status) &&
                                <div className=''>
                                    <small style={{ color: "red" }}> {match?.match_status} </small>
                                </div>
                            }
                            <div className="">
                                <span className={'mr-2 small'}>
                                    {(live && match?.match_time) ?
                                        <>{`${match.match_time}'`}</> : match?.start_time}
                                </span>
                                <span className=''>ID: {match?.game_id}</span>
                            </div>
                        </div>


                        {
                            // Only soccer has 3 markets
                            // hence a control for the soccer
                            initialMatch?.sport_name?.toLowerCase() == "soccer" &&
                            <>
                                <div className={`${match?.sport_name?.toLowerCase() == "soccer" ? "" : "single-market-content"} ${(live && (match?.score == "-" || match?.score == null))} ${live && 'live-group-buttons'} c-btn-group align-self-center ${jackpot && "is-jackpot-bet-group-btns"} ${match?.outcome && "is-outcome"}`} key="222">
                                    <MatchMarket
                                        initialMatch={match}
                                        marketName={"1x2"}
                                        marketId={1}
                                        buttonCount={3}
                                        special_bet_value=""
                                        jackpot={jackpot}
                                        jackpotstatus={jackpotstatus}
                                        live={updatedLive}
                                        transitioned={transitioned}
                                        setTransitioned={setTransitioned}
                                        betStop={betStop}
                                        producers={producers}
                                        availableMarkets={availableMarkets}
                                    />
                                    {(jackpot && jackpotstatus == "INACTIVE") && <>{match?.outcome || "--"} </>}
                                </div>

                                <div className={`${(live && (match?.score == "-" || !match?.score))} ${live && 'live-group-buttons'} hidden md:flex c-btn-group align-self-center`} key="223">
                                    <MatchMarket
                                        initialMatch={match}
                                        marketName={"Double Chance"}
                                        marketId={10}
                                        buttonCount={3}
                                        betStop={betStop}
                                        special_bet_value=""
                                        jackpot={jackpot}
                                        transitioned={transitioned}
                                        setTransitioned={setTransitioned}
                                        jackpotstatus={jackpotstatus}
                                        live={updatedLive}
                                        producers={producers}
                                        availableMarkets={availableMarkets}

                                    />
                                </div>

                                <div className={`${(live && (match?.score == "-" || !match?.score))} ${live && 'live-group-buttons'} hidden md:flex c-btn-group align-self-center`} key="224">
                                    <MatchMarket
                                        initialMatch={match}
                                        marketName={"Total"}
                                        buttonCount={2}
                                        marketId={18}
                                        transitioned={transitioned}
                                        setTransitioned={setTransitioned}
                                        special_bet_value="2.5"
                                        buttonCount={2}
                                        jackpot={jackpot}
                                        jackpotstatus={jackpotstatus}
                                        live={updatedLive}
                                        betStop={betStop}
                                        producers={producers}
                                        availableMarkets={availableMarkets}

                                    />
                                </div>
                            </>
                        }

                        {

                            initialMatch?.sport_name?.toLowerCase() !== "soccer" &&
                            Object.keys(match?.odds || [])?.map((odd, idx) => {
                                return (
                                    <div className={`${match?.sport_name?.toLowerCase() == "soccer" ? "" : "single-market-content"} ${(live && (match?.score == "-" || match?.score == null))} ${live && 'live-group-buttons'} c-btn-group align-self-center ${jackpot && "is-jackpot-bet-group-btns"} ${match?.outcome && "is-outcome"}`} key="222">
                                        <MatchMarket
                                            initialMatch={match}
                                            marketName={odd}
                                            marketId={1}
                                            buttonCount={three_way ? 3 : 2}
                                            special_bet_value=""
                                            jackpot={jackpot}
                                            jackpotstatus={jackpotstatus}
                                            live={updatedLive}
                                            transitioned={transitioned}
                                            setTransitioned={setTransitioned}
                                            producers={producers}
                                            betStop={betStop}
                                            availableMarkets={availableMarkets}
                                        />
                                        {(jackpot && jackpotstatus == "INACTIVE") && <>{match?.outcome || "--"} </>}
                                    </div>
                                )
                            })

                        }

                    </div>

                    {/* Jackpot buttons */}
                    {((!jackpot && !(updatedLive && !match?.score))) &&
                        <SideBets match={match} live={updatedLive} style={{ d: "inline" }} />}
                </div>
            }
        </>

    )

}


export const MarketList = (props) => {

    const { live, initialMatchwithmarkets, producers, betstopMessage, setBetstopMessage } = props;
    const [marketsFilter, setMarketsFilter] = useState(null);
    const [matchwithmarkets, setMatchWithMarkets] = useState({ ...initialMatchwithmarkets })

    const handleGameSocket = (type, gameId, sub_type_id) => {
        if (type == "listen" && socket?.connected) {
            socket.emit('user.market.listen', { parent_match_id: gameId, sub_type_id: sub_type_id });

        }

        else if (type == "leave") {
            // socket?.emit("user.market.leave", { parent_match_id: gameId, sub_type_id: sub_type_id });
        }

    }

    useEffect(() => {
        setMatchWithMarkets({ ...initialMatchwithmarkets });
        return () => {
        }
    }, [initialMatchwithmarkets]);

    useEffect(() => {
        if (matchwithmarkets) {
            if (socket.connected) {
                handleGameSocket("listen", matchwithmarkets?.parent_match_id);
            }
        }

    }, [socket.connected]);

    // comes from the markets with filter
    const marketFilters = [
        { name: "all", value: null },
        { name: "full time", value: "full time" },
        { name: "inplay", value: "inplay" },
        { name: "handicaps", value: "handicaps" },
        { name: "combo", value: "combo" },
        { name: "teams", value: "teams" },
        { name: "marginals", value: "marginals" }
    ]
    const EventUnavailable = (props) => {
        const { match } = props;
        return (
            <div className="px-3">
                <ShimmerTable />
                {/* <Link className='font-bold hover:underline text-blue-700' to={live ? "/live" : "/matches"}>Back to {live && "live "} Matches</Link> */}
            </div>
        )
    }

    const MatchDetailFilter = () => {
        // const [activeItem]
        return (
            <div className='flex match-markets-filter'>
                {marketFilters?.map((item, idx) => (
                    <div
                        className={`cursor-pointer item capitalize ${marketsFilter == item ? "active" : ""}`}
                        onClick={() => setMarketsFilter(item)}>{item?.name}
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="matches full-width">
            {(!initialMatchwithmarkets || initialMatchwithmarkets == null)
                ? <EventUnavailable match={matchwithmarkets?.match} />
                : <MoreMarketsHeaderRow

                    match={matchwithmarkets}
                    live={live}
                />
            }

            {
                /* filter for match with more markets */
                // matchwithmarkets !== null && <MatchDetailFilter />
            }

            <div className="web-element">
                {/* {(!matchwithmarkets || Object.entries(matchwithmarkets?.odds || {}).length == 0 || matchwithmarkets == null) && <EventUnavailable />} */}

                {/* filter here */}
                {Object.entries(matchwithmarkets?.odds || {}).map(([mkt_id, markets]) => {

                    return (["active", "suspended", "handedover"].includes(markets?.market_status.toLowerCase()) && markets.outcomes.length > 0) &&
                        <MarketRow
                            betstopMessage={betstopMessage}
                            setBetstopMessage={setBetstopMessage}
                            market_id={mkt_id}
                            markets={markets?.outcomes?.sort((a, b) =>
                                a?.special_bet_value - b?.special_bet_value || a?.outcome_id - b?.outcome_id
                            )}
                            rowItems={markets.outcomes.length == 3 ? 3 : 2}
                            match={matchwithmarkets}
                            marketDetail={markets}
                            key={mkt_id}
                            live={live}
                            producers={producers}
                        />
                })
                }
            </div>
        </div>
    )

}

export const JackpotHeader = (props) => {
    const { jackpot } = props
    return (
        <Container>
            <Row className="top-matches">
                <Row className="jp-header-text text-center">
                    <div className="jp-header-top">
                        {jackpot?.jackpot_name} - {jackpot?.total_games} GAMES
                    </div>
                </Row>
                {/* <Row className="jp-header-text mb-2">
                    <div className="jackpot-amount !pl-0">
                        KES  { Intl.NumberFormat('en-US').format(jackpot?.jackpot_amount) }
                    </div>
                </Row> */}

            </Row>
        </Container>
    )

}



export const JackpotMatchList = (props) => {
    const { matches } = props;

    return (
        <div className="matches is-jackpot-matches full-width mt-3">
            <MatchHeaderRow three_way={true} jackpot={true} first_match={matches ? matches?.matches[0] : {}} />
            <Container className="web-element">
                {(matches && Object.entries(matches?.matches) || [])?.map(([key, match]) => (
                    <>
                        <MatchRow initialMatch={match} jackpot key={key} jackpotstatus={matches?.status} />
                    </>
                ))
                }
            </Container>
            {!matches &&
                <div className="top-matches row">
                    No events found.
                </div>
            }
        </div>
    )
}

const JackpotResultsHeader = (props) => {
    const { metadata } = props;

    return (
        <div className='px-3'>
            <div className='row my-3 pb-1 font-bold border-b border-gray-200'>
                <div className='col-sm-3 !pl-0 col-md-2'>Date</div>
                <div className='col-sm-6 !pl-0 col-md-7'>Game</div>
                <div className='col-md-3 col-sm-3 text-right'>
                    Results
                </div>
            </div>
        </div>
    )
}

export const JackpotResultsList = (props) => {
    const { results } = props;

    return (
        <div className="results full-width mt-3">
            <JackpotResultsHeader />
            <Container className="web-element">
                {(results && results?.matches?.length > 0) ? (
                    results?.matches?.map((match, key) => (
                        <MatchRow initialMatch={match} key={key} jackpot jackpotstatus={results?.status} />
                    ))
                ) : (
                    <div className="top-matches row px-4 text-center py-3">
                        No results found.
                    </div>
                )}
            </Container>
        </div>
    );
};

const MatchList = (props) => {
    const {
        live,
        matches,
        producers,
        three_way,
        fetching,
        setReload,
        subTypes,
        fetchingcount
    } = props;
    const [state, dispatch] = useContext(Context);

    useEffect(() => {
        dispatch({ type: "SET", key: "matchlisttype", payload: "normal" });
        return () => {

            dispatch({ type: "DEL", key: "matchlisttype" });
        }
    }, [matches]);


    return (
        <div className="matches full-width">
            <MatchHeaderRow
                live={live}
                first_match={matches ? matches[0] : {}}
                fetching={fetching}
                three_way={three_way}
                sub_types={subTypes}
                subTypes={subTypes}
            />

            <Container className="web-element" style={{ paddingLeft: "0", paddingRight: "0" }}>
                {matches &&
                    Object.entries(matches).map(([key, match]) => (
                        match?.match_status?.toLowerCase() !== "ended" &&

                        <MatchRow
                            initialMatch={match}
                            key={match?.parent_match_id}
                            live={live}
                            producers={producers}
                            setReload={setReload}
                            three_way={three_way}
                            subTypes={subTypes}
                            sub_types={subTypes} />

                    ))
                }

                {(((matches || []).length) == 0 && fetching) &&
                    <ShimmerTable row={3} />
                }


            </Container>
            {(((matches || []).length) == 0 && !fetching) &&
                <NoEvents message={"Matches Not Found"} />
            }
        </div>
    )
}
export default React.memo(MatchList);