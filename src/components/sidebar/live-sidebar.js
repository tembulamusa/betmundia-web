import React, { useState, useEffect, useCallback, useContext } from 'react';
import PerfectScrollbar from 'react-perfect-scrollbar';
import makeRequest from "../utils/fetch-request";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import 'react-perfect-scrollbar/dist/css/styles.css';
import { Menu, MenuItem, Sidebar, SubMenu } from "react-pro-sidebar";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import gameCategories from '../utils/static-data';
import useInterval from '../../hooks/set-interval.hook';
import { removeItem, setLocalStorage } from '../utils/local-storage';
import { Context } from '../../context/store';

const LiveSideBar = (props) => {
    const { spid } = useParams();
    const [liveSports, setLiveSports] = useState([
        {
            sport_name: "Soccer",
            betradder_sport_id: 1,
            sport_id: 79,
            default_market: 1,
            sport_type: "threeway"
        },
        {
            sport_name: "MMA",
            betradder_sport_id: 117,
            sport_id: 173,
            default_market: 1,
            sport_type: "competition"
        },
        {
            sport_name: "Cricket",
            betradder_sport_id: 21,
            sport_id: 83,
            default_market: 340,
            sport_type: "competition"
        }
    ])
    const [, dispatch] = useContext(Context);
    const navigate = useNavigate();
    const [currentSportId, setCurrentSportId] = useState(79);
    const location = useLocation();

    const fetchData = () => {
        const abortController = new AbortController();
        let endpoint = "/sports/live";
        makeRequest({ url: endpoint, method: "GET", api_version: 2 })
            .then(([c_status, c_result]) => {
                if (
                    c_status == 200
                    &&
                    c_result?.data?.length > 0
                ) {
                    setLiveSports(c_result?.data)
                }
            });

        return () => abortController.abort();
    };

    // useInterval(async () => {
    //     fetchData();
    // }, 15000);

    useEffect(() => {
        setCurrentSportId(spid)
    }, [location])
    useEffect(() => {
        fetchData();
        const abortController = new AbortController();
        return () => {
            abortController.abort();
        };
    }, []);

    const getSportImageIcon = (sport_name, folder = 'svg', topLeagues = false) => {

        let default_img = 'sure'
        let sport_image;
        try {
            sport_image = topLeagues ? require(`../../assets/img/flags-1-1/${sport_name}.svg`) : require(`../../assets/${folder}/${sport_name}.svg`);
        } catch (error) {
            sport_image = require(`../../assets/${folder}/${default_img}.png`);
        }
        return sport_image
    }


    const handleLiveSportsNavigation = (livesport) => {

        dispatch({ type: "SET", key: "selectedLivesport", payload: livesport })
        setLocalStorage("selectedLivesport", livesport, 1000 * 60 * 60);
        navigate(`/live/${livesport.sport_id}`)
    }
    useEffect(() => {
        return () => {
            removeItem("selectedLivesport");
            dispatch({ type: "DEL", key: "selectedLivesport" });
        }
    }, [])
    return (
        <div style={{
            display: 'flex',
            overflow: 'scroll initial',
            zIndex: 10,
            top: "100px"
        }}
            className={`px-2 vh-100 text-white sticky-top d-none d-md-block up col-md-2 live-sidebar`}>
            <Sidebar
                id='live-sidebar-left'
                style={{ backgroundColor: 'rgba(0, 12, 36, 1)!important' }}
                image={false}>
                <div>
                    <div
                        style={{
                            padding: '5px',
                            textTransform: 'uppercase',
                            fontWeight: 'bold',
                            fontSize: 14,
                            letterSpacing: '1px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}>
                    </div>
                </div>
                <div>
                    <div
                        style={{
                            padding: '5px',
                            textTransform: 'uppercase',
                            fontWeight: 'bold',
                            fontSize: 14,
                            letterSpacing: '1px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}>
                        <div className="d-flex">
                            LIVE SPORTS
                        </div>
                    </div>
                </div>
                <Menu iconShape="circle">

                    {liveSports && Object.entries(liveSports)?.map(([index, livesport]) => (
                        <Menu iconShape="circle" className="">
                            <MenuItem
                                icon={<img
                                    src={getSportImageIcon(livesport?.sport_name)}
                                    alt='' className='inline-block mr-2' />}
                                key={`live-sidebar-item-${index}`}
                                className={`${(location?.pathname?.includes(livesport?.sport_id)) ? "active" : ""}`}>
                                <div className="col-12 font-[500]"
                                    onClick={() => handleLiveSportsNavigation(livesport)}>
                                    <Row>
                                        <Col lg="11" md="11" sm="11" xs="11" className="topl">
                                            <Row>
                                                <Col className={''}>{livesport?.sport_name} </Col>
                                                <Col>
                                                    <span className={'badge rounded-pill bg-dark'} style={{
                                                        float: "right",
                                                        color: ""
                                                    }}>
                                                        {livesport?.count}
                                                    </span>
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                </div>
                            </MenuItem>
                        </Menu>
                    )
                    )
                    }
                </Menu>
            </Sidebar>
        </div>
    );

}
export default React.memo(LiveSideBar);
