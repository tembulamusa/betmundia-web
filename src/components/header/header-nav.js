import React, { useContext, useEffect, useState, useRef } from 'react';
import ListGroup from 'react-bootstrap/ListGroup';
import Container from 'react-bootstrap/Container';
import { Context } from '../../context/store';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faHome as HomeIcon,
    faSearch,
    faPrint,
    faQuestionCircle,
    faTimes,
    faLaptop,
    faClock,
    faMagnet,
    faVideo,
    faMagic, faInfo, faChessBoard, faDice,
    faVolumeUp
} from '@fortawesome/free-solid-svg-icons';
import makeRequest from "../utils/fetch-request";
import { faMobile, faCoins } from "@fortawesome/free-solid-svg-icons";
// import { MdHome as HomeIcon} from "react-icons/md";
import LiveIcon from "../../assets/svg/Live.svg";
import JackpotIcon from "../../assets/svg/JP.svg";
import PromotionIcon from "../../assets/svg/Promotions.svg";
import { Link, useNavigate } from 'react-router-dom';

const HeaderNav = (props) => {
    const [, dispatch] = useContext(Context);
    const pathname = window.location.pathname;
    const [searching, setSearching] = useState(false)
    const [matches, setMatches] = useState([])
    const searchInputRef = useRef(null)
    const [time, setTime] = useState();
    const navigate = useNavigate();

    useEffect(() => {
        if (searching == true) {
            // navigate("/home");
        }
    }, [searching]);

    const updateSearchTerm = (event) => {
        if (event.target.value.length >= 3) {
            dispatch({ type: "SET", key: "searchterm", payload: event.target.value });
        } else {
            dispatch({ type: "DEL", key: "searchterm" });
        }
    }
    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date().toLocaleString().slice(10, 22));
        }, 1000);

        return () => {
            clearInterval(timer);
        };
    }, []);

    const showSearchBar = () => {
        setSearching(true)
    }

    const dismissSearch = () => {
        setSearching(false)
        dispatch({ type: "DEL", key: "searchterm" });
    }
    return (
        <>
            <Container id="navbar-collapse-main"
                className={`d-sm-flex d-flex flex-row  header-menu ${searching ? 'hidden' : 'd-block'}`}>

                <ListGroup as="ul" xs="12" horizontal className={`font-bold nav navbar-nav og d-flex ale ss  col-lg-12 col-md-12 col-sm-12 change-display ${searching && "!hidden"}`}>

                    {/* <li className={pathname == '/' ? "active" : ''}>
                        <Link className="cg fm ox anl url-link not-selectable " to={"/"} title="Home"><span className=" space-icons"><FontAwesomeIcon icon={HomeIcon} /> </span> Home</Link>
                    </li>
                    <li className={pathname == '/live' ? "active" : ''}>
                        <Link className={`cg fm ox anl url-link`} to={"/live"}
                           title="Live"><span className=" space-icons"><FontAwesomeIcon icon={faVideo} /> </span>Live</Link>
                    </li>

                    <li className={pathname == '/jackpot' ? 'active' : ''}>
                        <Link className="cg fm ox anl url-link" to={"/jackpot"}>
                            <span className=" space-icons"><FontAwesomeIcon icon={faCoins} /> </span> Jackpot
                        </Link>
                    </li>
                    <li className={pathname == '/app' ? 'active' : ''}>
                        <Link className="g url-link" to={"/app"}>
                            <span>
                                <FontAwesomeIcon icon={faMobile} className="hide1"/> APP
                            </span>
                        </Link>
                    </li>

                   
                    <li className={pathname == '/promotions' || pathname.includes("promotions") ? 'active' : ''}>
                        <Link className="g url-link" to={"/promotions"}>
                            <span className=" space-icons"><FontAwesomeIcon icon={faVolumeUp} /> </span> Promotions
                        </Link>
                    </li>

                    <li className={pathname == '/print-matches' ? 'active py-3' : 'py-md-0 py-lg-3 py-sm-0 d-flex align-items-center'}>
                        <Link className="g url-link fix-print" to={"/print-matches"}>
                            <span className=" space-icons hide1"><FontAwesomeIcon icon={faPrint}/> </span>Print  Matches
                        </Link>
                    </li> */}

                    <li className={pathname == '/print-matches' ? 'spacing-end' : 'spacing-end'}>
                        <Link className="g url-link fix-display" to="#" title="Search"
                            onClick={() => showSearchBar()}>
                            <span className=" space-icons"><FontAwesomeIcon icon={faSearch} /> </span><span className={'hide2'}>Search</span>
                        </Link>
                    </li>
                    {/* <li className={pathname == '/how-to-play' ? 'active' : ''}>
                        <Link className="g url-link fix-display" to={"/how-to-play"}>
                            <span className=" space-icons"><FontAwesomeIcon icon={faQuestionCircle} /> </span> <span className={'hide2'}>Help</span>
                        </Link>
                    </li>
                    <li className={""}>
                        <Link className="g url-link fix-display" to="#" title="Current Time">
                            <span className=" space-icons"><FontAwesomeIcon icon={faClock} /> </span> <span className={'hide2'}>{time}</span>
                        </Link>
                    </li> */}
                </ListGroup>

            </Container>
            <Container id="navbar-collapse-main"
                className={`fadeIn header-menu d-flex justify-content-center px-4 ${searching ? 'd-block search-form' : 'd-none'}`}>
                <ListGroup as="ul" xs="9" horizontal className="nav navbar-nav og ale ss col-md-6 text-center">
                    <div className="d-flex">
                        <div className="col-md-10">
                            <input type="text"
                                onChange={(ev) => updateSearchTerm(ev)}
                                placeholder={'Start typing to search for team ...'}
                                className={'form-control input-field border-0  no-border-radius'}
                            />
                        </div>

                        <button className={'btn text-white -align-right'} onClick={() => dismissSearch()}>
                            <FontAwesomeIcon icon={faTimes} /> Close
                        </button>
                    </div>
                </ListGroup>
            </Container>
        </>
    )

}
export default React.memo(HeaderNav);
