import React, {
    useContext,
    useEffect,
    useState,
    useRef,
    Suspense
} from "react";

import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import { Context } from '../context/store';
import makeRequest from './utils/fetch-request';
import useInterval from "../hooks/set-interval.hook";
import HighlightsBoard from "./highlights-board";
import socket from "./utils/socket-connect";
import MatchList from './matches/index';
import { getFromLocalStorage, removeItem } from "./utils/local-storage";
const CarouselLoader = React.lazy(() => import('./carousel/index'));
const MainTabs = React.lazy(() => import('./header/main-tabs'));
const PopupBanner = React.lazy(() => import('./pop_up_banner'));


const Index = (props) => {
    const location = useLocation();
    const { sportid, categoryid, competitionid } = useParams();
    const [allSportId, setAllSportId] = useState();
    const [three_way, setThreeWay] = useState(true);
    const [matches, setMatches] = useState();
    const [limit, setLimit] = useState(300);
    const [page, setPage] = useState(1);
    const [state, dispatch] = useContext(Context);
    const [fetching, setFetching] = useState(false)
    const [fetchingCount, setFetchingCount] = useState(0)
    const homePageRef = useRef()
    const [searchParams] = useSearchParams();
    const [producers, setProducers] = useState([])


    const fetchData = (controlText) => {
        setFetching(true);
        let fetchcount = fetchingCount + 1;
        let filtersport = state?.filtersport || getFromLocalStorage("filtersport");
        if (location?.pathname == "/") {
            filtersport = null
        }
        let pageNo = 1;
        let limitSize = limit || 300;
        let tab = 'highlights';
        let method = "GET";
        let endpoint = "/sports/matches/pre-match/"
            + ((location.pathname !== "/" && filtersport?.sport_id)
                || filtersport?.sport_id || allSportId || 79)
            + ((filtersport && filtersport?.sport_name?.toLowerCase() !== "soccer") ? "/"
                + filtersport?.default_market : "")
            + "?page=" + pageNo + `&size=${limitSize}`;

        let url = new URL(window.location.href);
        let search_term = state?.searchterm || "";
        if (state?.filtercategory) {
            endpoint += "&category_id =" + state?.filtercategory?.category_id;
        } else if (categoryid && !state?.filtermenuclicked == true) {
            endpoint += "&category_id =" + categoryid;
        }

        if (state?.active_tab) {
            tab = state?.active_tab;
        }

        endpoint += "&tab=" + tab;

        if (state?.filtercompetition && controlText !== "fetchAll") {
            endpoint = (controlText == "filtered") && `/sports/competitions/matches/${state?.filtercompetition?.competition_id}`;

            // if (state?.filtercompetition?.competition_id == 0){
            //     endpoint = "/sports/competitions/matches?page=" + (page || 1) + "&sport_id = " + (state?.filtersport?.sport_id||sportid || 79) + `&limit=${limit || 200}`;
            // }
        }
        if (search_term && search_term.length >= 3) {
            endpoint = `/matches/pre-match?limit=10&search=${search_term}`;
        }
        // else {
        //     if(state?.filtercompetition ) {
        //         endpoint = `/v1/sports/competition/matches?id=${state?.filtercompetition?.competition_id}`;

        //         if (state?.filtercompetition?.competition_id == 0){
        //             endpoint = "/v1/matches?page=" + (page || 1) + "&sport_id = " + (state?.filtersport?.sport_id||sportid || 79) + `&limit=${limit || 200}`;
        //         }
        //     }
        // } 
        endpoint = endpoint.replaceAll(" ", '');
        if (filtersport) {
            setThreeWay((['competition', 'threeway'].includes(filtersport?.sport_type?.toLowerCase())));
        } else {
            setThreeWay(true);
        }


        makeRequest({ url: endpoint, method: method, api_version: 2 }).then(([status, result]) => {
            setFetchingCount(fetchcount);

            if (status == 200) {
                setMatches(result?.data?.items || result) //(matches?.length > 0 && page > 1) ? [...matches, ...result?.data?.items] : result?.data?.items || result)
                setFetching(false);
                setProducers(result?.producer_statuses);
            }
        });

    };

    // useEffect(() => {

    // }, [location])


    const poll = () => {

    }

    useEffect(() => {
        let newSportId = searchParams.get('sportId');
        if (newSportId !== null) {
            fetchData("fetchAll");
        } else {
            fetchData("filtered")
            setFetchingCount(0);
        }
    }, [sportid,
        location,
        state?.filtercategory,
        state?.filtercompetition,
        state?.active_tab,
        state?.searchterm
    ]
    )

    useInterval(async () => {
        if (!socket.connected) {
            fetchData()
        }
    }, 1000 * 60);

    useEffect(() => {
        socket.connect();
        return () => {
            socket.disconnect();
        }
    }, [])
    document.addEventListener('scrollEnd', (event) => {
        if (!fetching) {
            setFetching(true);
            setPage(page + 1);
        }
    })

    return (

        <>
            <div className="homepage" ref={homePageRef}>
                <CarouselLoader />
                <section className="highlights-board">
                    <HighlightsBoard />
                </section>
                {/* End of highlights board */}

                {/* Start tabs */}
                <MainTabs tab={location.pathname.replace("/", "") || 'highlights'} />
                {
                    <MatchList
                        socket={socket}
                        live={false}
                        matches={matches}
                        producers={producers}
                        three_way={three_way}
                        fetching={fetching}
                        subTypes={state?.filtersport
                            ?
                            state?.filtersport?.sport_name.toLowerCase() !== "soccer"
                                ?
                                [state?.filtersport?.default_market]
                                :
                                [1, 10, 18]
                            :
                            [1, 10, 18]
                        }
                        betslip_key={"betslip"}
                        fetchingcount={fetchingCount}
                    />
                }
            </div>
            <Suspense fallback={<div></div>}>
                <PopupBanner />
            </Suspense>

        </>
    )
}

export default React.memo(Index);
