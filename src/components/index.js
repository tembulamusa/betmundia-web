import React, {
    useContext,
    useEffect,
    useState,
    useRef,
    useCallback,
    Suspense
} from "react";

import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import { Context } from '../context/store';
import makeRequest from './utils/fetch-request';
import useInterval from "../hooks/set-interval.hook";
import HighlightsBoard from "./highlights-board";
import socket, { ensureSocketConnected } from "./utils/socket-connect";
import MatchList from './matches/index';
import { getFromLocalStorage } from "./utils/local-storage";
const CarouselLoader = React.lazy(() => import('./carousel/index'));
const MainTabs = React.lazy(() => import('./header/main-tabs'));
const PopupBanner = React.lazy(() => import('./pop_up_banner'));

/** Initial page size — more matches load on scrollEnd via pagination. */
const MATCH_PAGE_SIZE = 50;

const Index = (props) => {
    const location = useLocation();
    const { sportid, categoryid, competitionid } = useParams();
    const [allSportId, setAllSportId] = useState();
    const [three_way, setThreeWay] = useState(true);
    const [matches, setMatches] = useState();
    const [limit] = useState(MATCH_PAGE_SIZE);
    const [, setPage] = useState(1);
    const [, setHasMore] = useState(true);
    const [state, dispatch] = useContext(Context);
    const [fetching, setFetching] = useState(false)
    const [fetchingCount, setFetchingCount] = useState(0)
    const homePageRef = useRef()
    const [searchParams] = useSearchParams();
    const [producers, setProducers] = useState([])
    const pageRef = useRef(1);
    const hasMoreRef = useRef(true);
    const fetchingRef = useRef(false);
    const controlTextRef = useRef("filtered");

    useEffect(() => {
        ensureSocketConnected();
    }, []);

    const fetchData = useCallback((controlText, options = {}) => {
        const { pageNo = 1, append = false } = options;
        const nextControl = controlText || controlTextRef.current || "filtered";
        controlTextRef.current = nextControl;

        setFetching(true);
        fetchingRef.current = true;
        let fetchcount = fetchingCount + 1;
        let filtersport = state?.filtersport || getFromLocalStorage("filtersport");
        if (location?.pathname == "/") {
            filtersport = null
        }
        let limitSize = limit || MATCH_PAGE_SIZE;
        let tab = 'highlights';
        let method = "GET";
        let endpoint = "/sports/matches/pre-match/"
            + ((location.pathname !== "/" && filtersport?.sport_id)
                || filtersport?.sport_id || allSportId || 79)
            + ((filtersport && filtersport?.sport_name?.toLowerCase() !== "soccer") ? "/"
                + filtersport?.default_market : "")
            + "?page=" + pageNo + `&size=${limitSize}`;

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

        if (state?.filtercompetition && nextControl !== "fetchAll") {
            endpoint = (nextControl == "filtered") &&
                `/sports/matches/pre-match-sport/${filtersport?.sport_id || allSportId || 79}/${state?.filtercompetition?.competition_id}/${filtersport?.default_market}`
                + "?page=" + pageNo + `&size=${limitSize}`;


            if (filtersport?.sport_name?.toLowerCase() === "soccer" || !filtersport) {
                endpoint = (nextControl == "filtered") && `/sports/competitions/matches/${state?.filtercompetition?.competition_id}`;
            }
        }
        let data = null;
        if (search_term && search_term.length >= 3) {
            method = "POST";
            data = { search: search_term, sport_id: filtersport?.sport_id || allSportId || 79 };
            endpoint = `/ sports / matches / search`;
        }
        endpoint = endpoint.replaceAll(" ", '');
        if (filtersport) {
            setThreeWay((['competition', 'threeway'].includes(filtersport?.sport_type?.toLowerCase())));
        } else {
            setThreeWay(true);
        }

        makeRequest({ url: endpoint, method: method, data: data, api_version: 2, }).then(([status, result]) => {
            setFetchingCount(fetchcount);
            if ([200, 201].includes(status)) {
                const raw = result?.data?.items || result;
                const list = Array.isArray(raw) ? raw : (raw ? [raw] : []);
                setMatches((prev) => (append && Array.isArray(prev) ? [...prev, ...list] : list));
                const more = list.length >= limitSize;
                setHasMore(more);
                hasMoreRef.current = more;
                setProducers(result?.producer_statuses);
            } else if (!append) {
                setHasMore(false);
                hasMoreRef.current = false;
            }
            setFetching(false);
            fetchingRef.current = false;
        }).catch(() => {
            setFetching(false);
            fetchingRef.current = false;
        });

    }, [
        fetchingCount,
        limit,
        location?.pathname,
        allSportId,
        categoryid,
        state?.filtersport,
        state?.filtercategory,
        state?.filtercompetition,
        state?.filtermenuclicked,
        state?.active_tab,
        state?.searchterm,
    ]);

    useEffect(() => {
        pageRef.current = 1;
        setPage(1);
        setHasMore(true);
        hasMoreRef.current = true;
        let newSportId = searchParams.get('sportId');
        if (newSportId !== null) {
            controlTextRef.current = "fetchAll";
            fetchData("fetchAll", { pageNo: 1, append: false });
        } else {
            controlTextRef.current = "filtered";
            fetchData("filtered", { pageNo: 1, append: false })
            setFetchingCount(0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
            fetchData(controlTextRef.current, { pageNo: 1, append: false })
        }
    }, 1000 * 60);

    // scrollEnd → next page (preserves full match list via append)
    useEffect(() => {
        const onScrollEnd = () => {
            if (fetchingRef.current || !hasMoreRef.current) {
                return;
            }
            const nextPage = pageRef.current + 1;
            pageRef.current = nextPage;
            setPage(nextPage);
            fetchData(controlTextRef.current, { pageNo: nextPage, append: true });
        };
        document.addEventListener('scrollEnd', onScrollEnd);
        return () => document.removeEventListener('scrollEnd', onScrollEnd);
    }, [fetchData]);

    return (

        <>
            <div className="homepage" ref={homePageRef}>
                <Suspense fallback={<div className="banner-imgs" aria-hidden="true" style={{ minHeight: 120 }} />}>
                    <CarouselLoader />
                </Suspense>
                <section className="highlights-board">
                    <HighlightsBoard />
                </section>
                {/* End of highlights board */}

                {/* Start tabs */}
                <Suspense fallback={null}>
                    <MainTabs tab={location.pathname.replace("/", "") || 'highlights'} />
                </Suspense>
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
