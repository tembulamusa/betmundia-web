import React, { useContext, useEffect, useState, useCallback } from "react";
import { Context } from '../context/store';
import makeRequest from './utils/fetch-request';

import Accordion from 'react-bootstrap/Accordion';

import '../assets/css/accordion.react.css';
import { FaCheckCircle, FaCircle, FaShare, FaTrash, FaTrashAlt } from "react-icons/fa";
import { MdCancel, MdOutlineWarning, MdPending } from "react-icons/md";
import { IoMdCloseCircle, IoMdRemoveCircleOutline } from "react-icons/io";
import { GrAddCircle } from "react-icons/gr";
import NoEvents from "./utils/no-events";
import ShareExistingbet from "./utils/shareexisting-bet";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { TbForbid2, TbForbid2Filled } from "react-icons/tb";
import { Modal } from "react-bootstrap";
import { Tooltip } from "@mui/material";
import { IoLogoVimeo } from "react-icons/io";


const Styles = {
    container: {
    },
    headers: {
        //    background:'#613354',
        //    color:'#ffffff',
        //    padding: '10px 40px 10px',
        //    fontSize: '12px'
    },
    bet: {
        //    background:'#947389',
        //    color:'#fff',
        //    padding: '5px',
    }
};

const MyBets = (props) => {
    const [state, dispatch] = useContext(Context);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({});
    const [sharableBet, setSharableBet] = useState(null);
    const [showSharableBet, setShowSharableBet] = useState(false);
    const [userBets, setUserBets] = useState([])

    const Alert = (props) => {
        let c = message?.status == (200 || 201) ? 'success' : 'danger';
        let x_style = {
            float: "right",
            display: "block",
            fontSize: "22px",
            color: "orangered",
            cursor: "pointer",
            padding: "3px"
        }
        return (<>{message?.status &&
            <div role="alert"
                className={`fade alert alert-${c} show alert-dismissible`}>
                {message.message}
                <span aria-hidden="true" style={x_style} onClick={() => setMessage(null)}>&times;</span>
            </div>}
        </>);

    };

    const fetchData2 = () => {
        if (isLoading) return;
        const abortController = new AbortController();
        setIsLoading(true);
        setMessage(null);
        let endpoint = "/user/bets?size=20&page=1";
        makeRequest({ url: endpoint, method: "GET", api_version: 2 }).then(([status, result]) => {
            if ([200, 201].includes(status)) {
                setUserBets(result?.data || result)
            } else {
                if (result?.status == 403) {
                    setMessage({ status: 400, message: "Unauthorized. Please login again." })
                } else {
                    dispatch({ type: "SET", key: "showloginmodal", payload: true });
                }
                setMessage({ status: status, message: "Unable to process" })
            }
            setIsLoading(false);
        });

        return () => abortController.abort();
    };

    useEffect(() => {
        fetchData2();
    }, []);


    const BetItemHeader = (props) => {
        return (
            <div className={`my-bets-header`} style={Styles.headers}>
                <div className="row uppercase">
                    <div className="col">CREATED</div>
                    <div className="col hidden md:flex">Bet ID</div>
                    <div className="col hidden md:flex">Bet Type</div>
                    <div className="col hidden md:flex">GAMES</div>
                    <div className="col">Total ODDS</div>
                    <div className="col">Stake</div>
                    <div className="col">Payout</div>
                    <div className="col">Status</div>
                </div>
            </div>
        );
    }
    const BetItem = (props) => {
        const { bet } = props;
        const [betStatus, setBetStatus] = useState(bet.status_desc);
        const [canCancel, setCanCancel] = useState(bet.cancellable == 1);
        const [isOpen, setIsOpen] = useState(false);
        const [currentBetDetail, setCurrentBetDetail] = useState(null)
        const [isLoadingBetItems, setIsLoadingBetItems] = useState(false);
        const [betType, setBetType] = useState();
        const [showMarkup, setShowMarkup] = useState(true);
        const [alertCancel, setAlertCancel] = useState(null);
        const [showConfirmCancel, setShowConfirmCancel] = useState(false);

        useEffect(() => {
            if (bet?.jackpot_bet_id) {
                setBetType("Jackpot");
            } else if (bet?.total_games > 1) {
                setBetType("Multibet");
            } else {
                setBetType("Single Bet")
            }
        }, [bet])



        const CancelBetMarkup = (props) => {

            const cancelBet = () => {
                let endpoint = '/user/bet/cancel?bet-id=' + bet?.bet_id;
                makeRequest({ url: endpoint, method: "POST", api_version: 2 }).then(([status, result]) => {
                    if (result?.status == '200') {
                        setShowMarkup(false);
                        setAlertCancel({ message: "Bet Cancel Request Submitted", status: 200 });
                        setTimeout(() => {
                            window.location.reload()
                        }, 2000)
                    } else {
                        setAlertCancel({ message: "unable to cancel", status: 400 })
                    }
                });
            };

            useEffect(() => {
                if (alertCancel) {
                    setTimeout(function name() {
                        setAlertCancel(null)
                    }, 3000)
                }
            }, [alertCancel])
            const { txt } = props;

            const confirmCancel = (confirm) => {
                if (confirm == "yes") {
                    cancelBet();
                }
                setShowConfirmCancel(false);
            }
            return (
                <>
                    {alertCancel &&
                        <div className={`show-betcancel-response alert alert-${alertCancel?.status !== 200 ? "danger" : "success"}`}>
                            {alertCancel?.message}</div>
                    }
                    {showMarkup
                        &&
                        <FaTrash color="rgb(255 66 131 / 96%)" size={20} onClick={() => setShowConfirmCancel(true)} className="inline-block mr-3" />}
                    <Modal
                        animation={true}
                        show={showConfirmCancel}
                        onHide={() => setShowConfirmCancel(false)}
                        dialog className="popover-login-modal"
                        aria-labelledby="contained-modal-title-vcenter">
                        <Modal.Body className=" text-center">
                            <div className="alert alert-warning font-[500] flex">
                                <MdOutlineWarning size={30} className="mr-3" />
                                <div className="flex-column">
                                    <p>Canceling this bet is not reversible.</p>
                                    <p>Are you sure you want to cancel this Bet?</p>
                                </div>
                            </div>
                            <div className="mt-3">
                                <button className="btn btn-default btn-lg mr-3 px-5" onClick={() => confirmCancel("no")}>No</button>
                                <button className="btn btn-danger btn-lg px-5" onClick={() => confirmCancel("yes")}>Yes</button>
                            </div>
                        </Modal.Body>
                    </Modal>
                    {/* confirm bet cancel */}
                </>
            )
        }



        const statusMarkup = (bet) => {
            let Icon;
            let color;
            let statusText;
            let rounded;
            let bg;
            let size = 20;
            let pd;
            switch (bet?.status?.toLowerCase()) {
                case "pending":
                    Icon = FaCircle;
                    color = "#00A8FA";
                    break;
                case "won":
                    Icon = FaCheckCircle;
                    color = "green";
                    break;
                case "lost":
                    Icon = IoMdCloseCircle;
                    color = "#f86d6d"
                    break;
                case "lost":
                    Icon = IoMdCloseCircle;
                    color = "#f86d6d"
                    break;
                case "cancelled":
                    Icon = TbForbid2Filled
                    color = "gray"
                    break;
                default:
                    Icon = IoLogoVimeo
                    color = "white"
                    bg = "bg-green-500 "
                    rounded = "rounded-full "
                    pd = "p-1"
            }
            return (
                <>
                    {
                        <Tooltip title={bet?.status} arrow placement="top">
                            <Icon
                                color={color}
                                size={size}
                                className={`${rounded + bg + pd} inline-block mr-3`} />
                        </Tooltip>
                    }
                </>
            )
        }

        const shareMarkup = (bet) => {
            const shareBet = () => {
            }
            return (
                <>
                    <FaShare className="inline-block" size={20} color="#FFB200" />
                </>
            )
        }


        return (
            <Accordion.Item eventKey={"mybets-" + bet?.bet_id} onClick={() => setCurrentBetDetail({ betId: bet?.bet_id, games: bet?.betslip })}>
                <Accordion.Header>
                    <div className="row w-full">
                        <div className="col">{bet?.created}</div>
                        <div className="col hidden md:flex font-ligt">{bet?.bet_id}</div>
                        <div className="col hidden md:flex">{betType}</div>
                        <div className="col hidden md:flex">{bet?.total_games}</div>
                        <div className="col text-cente">{bet?.total_odd}</div>
                        <div className="col text-cente">{bet?.bet_amount}</div>
                        <div className="col">{bet?.possible_win}</div>
                        {/* <div className="col">{ statusMarkup(bet) }</div> */}
                        <div className="col">
                            {statusMarkup(bet)}
                            {bet?.cancelable ? <span><CancelBetMarkup txt="Cancel Bet" /></span> : ""}
                            {bet?.sharable == 1 && <span>{shareMarkup(bet)}</span>}
                        </div>
                    </div>
                </Accordion.Header>
                <Accordion.Body>
                    <div className="overflow-x-auto">
                        {/* mobile */}
                        <MobileDetail bet={bet} key={`mobile-item-${bet?.bet_id}`} />

                        <table className="table w-full mt-3 mb-0">
                            <thead>
                                <BetslipHeader betslip={bet?.betslip} />
                            </thead>
                            <tbody>
                                {currentBetDetail?.betId === bet?.bet_id &&
                                    currentBetDetail?.games?.map((slip, index) => (
                                        <BetslipItem
                                            slip={slip}
                                            key={slip.game_id}
                                            index={index}
                                        />
                                    ))}
                                {isLoadingBetItems && (
                                    <tr><td>fetching ...</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Accordion.Body>
            </Accordion.Item>
        );
    }

    const BetslipHeader = (props) => {
        const { betslip } = props;
        const winsCount = betslip?.filter(item => item?.status?.toLowerCase() == "won")?.length;
        return (
            <tr className={`betslip-header`} >
                {/* <td className="hidden md:table-cell">No.</td> */}
                {/* <td className="">ID</td> */}
                <td className="">Start Time</td>
                <td className="">Game</td>
                <td className="hidden md:table-cell">Odds</td>
                <td className="hidden md:table-cell">Market</td>
                <td className="">Pick</td>
                <td className="">Results</td>
                <td className="hidden md:table-cell">{`${winsCount}/${betslip?.length}`}</td>

            </tr>
        )
    }

    const gameBetStatus = (status) => {

        let icon;
        let colorClass;
        let textDisp = status;
        let bg;
        let rounded;
        let pd;

        switch (status.toLowerCase()) {
            case "won":
                icon = <FaCheckCircle />
                // textDisp = "";
                colorClass = "won"
                break;

            case "lost":
                icon = <MdCancel />
                // textDisp = "";
                colorClass = "lost"
                break;

            case "pending":
                textDisp = "n/a";
                colorClass = "pending";
                break;
            case "cancelled":
                icon = <TbForbid2Filled />
                // textDisp = "";
                colorClass = "lost"
                break;
            case "void":
                icon = <IoLogoVimeo />
                colorClass = "white"
                bg = "bg-green-500 "
                rounded = "rounded-full "
                pd = "p-1"
                break;

            default:
                icon = <IoLogoVimeo size={8} />
                colorClass = "white"
                bg = "bg-green-500 "
                rounded = "rounded-full "
                pd = "p-1"
                break;

        }

        return (
            <>

                <Tooltip title={textDisp} arrow placement="top">
                    {icon && <span className={`results-icon ${colorClass} ` + pd + " " + bg + " " + rounded}>{icon}</span>}
                </Tooltip>
            </>
        )

    }
    const BetslipItem = ({ slip, index }) => {
        return (
            <tr className={`my-bets`} key={`slip-game-${slip.game_id}`}>
                {/* <td className="hidden md:table-cell">{index + 1}</td>  */}
                {/* <td className="">{ slip?.match_id}</td> */}
                <td className="">{slip?.start_time}</td>
                <td className="">{slip?.home_team} - {slip.away_team}</td>
                <td className="hidden md:table-cell">{slip?.odd_value}</td>
                <td className="hidden md:table-cell">{slip?.market_name}</td>
                <td className="">{slip?.bet_pick}{slip?.special_bet_value && `(${slip?.special_bet_value})`}</td>
                <td className="">{slip?.result !== null ? slip.result : "n/a"}
                    <span className="md:hidden">{gameBetStatus(slip.status)}</span>
                </td>
                {/* <td className="">{ slip.ft_result}</td> */}
                <td className="hidden md:table-cell">{gameBetStatus(slip.status)}</td>
            </tr>
        )
    }

    const MobileDetail = ({ bet, key }) => {

        return (
            <div key={key}>
                <div>Bet ID: {bet?.bet_id}</div>
            </div>
        )
    }

    const MyBetsList = (props) => {
        return (
            <>
                <BetItemHeader />
                {
                    (userBets || []).length > 0 ?
                        <Accordion
                            className="accordion"
                            id="mybets-accordion"
                            defaultActiveKey={null}
                            allowMultipleExpanded={false}
                            uuid={63213}
                        >
                            {(userBets || []).map((bet, idx) => (
                                <>
                                    <div className="mybet-list"
                                        key={`mybet-list-22-${bet?.bet_id}`}
                                        uuid={`my-bet-list-2134-${bet?.bet_id}`}
                                    >
                                        <BetItem bet={bet} key={`bet-item654-${bet?.bet_id}`} />

                                    </div>
                                </>
                            ))}
                        </Accordion> :
                        <div className="px-3"><NoEvents message="You have not yet placed any bets yet" /></div>
                }

            </>
        );

    }



    const PageTitle = () => {
        return (
            <div className='col-md-12 bg-primary p-4 text-center'>
                <h4 className="capitalize">
                    My Bets
                </h4>
            </div>
        )
    }



    return (
        <>
            <div className="homepage">
                {/* <CarouselLoader/> */}

                <PageTitle />
                <Alert />
                <MyBetsList />

            </div>
        </>
    )
}

export default React.memo(MyBets)
