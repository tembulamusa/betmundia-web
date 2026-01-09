import React, { useContext, useEffect, useState } from 'react';
import Header from "../../header/header";
import Footer from "../../footer/footer";
import makeRequest from "../../utils/fetch-request";
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { Link, useLocation, useParams, useSearchParams } from "react-router-dom";
import SideBar from "../../sidebar/awesome/Sidebar";
import { getFromLocalStorage, setLocalStorage } from "../../utils/local-storage";
import Notify from "../../utils/Notify";
import { Button, ButtonGroup } from "react-bootstrap";
import CasinoCarousel from '../../carousel/casino-carousel';
import { Context } from '../../../context/store';
import { ShimmerTable } from "react-shimmer-effects";
import NoEvents from '../../utils/no-events';
import CategoryListing from './category-listing';
import CasinoJackpots from './casino-jackpots';

const Casino = (props) => {
    const {filterType, filterName} = useParams();
    const [user] = useState(getFromLocalStorage("user"));
    const [state, dispatch] = useContext(Context);
    const [games, setGames] = useState(null);
    const [fetching, setFetching] = useState(false);
    const loc = useLocation();

    const fetchCasinoGames = async () => {
        setFetching(true);
        let endpoint = "games-list";
        if (filterType === "categories") {
            if(state?.state?.casinogamesfilter?.category) {
                endpoint = `game-type/games-list/${state?.casinogamesfilter?.category?.id}`;
            } else {
                endpoint = `game-type/games-list/${state?.casinogamesfilter?.category?.id}`;
            }
            
        } else if (filterType === "providers") {
            if (state?.casinogamesfilter?.provider) {
                endpoint = `provider/games-list/${state?.casinogamesfilter?.provider?.id}`;
            } else {
                endpoint = `provider/games-list/n/${filterName}`;

            }
        } else if (filterType == "combinedprovidercategory") {
            endpoint = `provider/games-list/${state?.casinogamesfilter?.provider?.id}/`
                        + `${state?.casinogamesfilter?.category?.id}/`
                        +`${state?.casinogamesfilter?.page}/100`
        } else if (filterType === "providercategory") {
            const providerId = state?.casinofilters?.providers?.id || "defaultProviderId"; 
            const categoryId = state?.casinofilters?.gameTypes?.id || "defaultCategoryId"; 
            const page = state?.casinogamesfilter?.page || 1; 
            const limit = 100;         
            endpoint = `provider/games-list/${providerId}/${categoryId}?page=${page}&limit=${limit}`;
        }

        const [status, result] = await makeRequest({ url: endpoint, method: "GET", api_version: "casinoGames" });
        if (status === 200) {
            let fetchedGames;
            if (endpoint.includes("game-type")) {
                
                let res = result;
                let games = [{gameList: result?.content}]
                delete res?.content
                res = {...res, games:games, isCategory: true}
                fetchedGames = games
                dispatch({type:"SET", key:"category-filters", payload:res});

            } else {
                fetchedGames = result?.games
            }
            setGames(fetchedGames);
            if(result?.games) {
                dispatch({type:"SET", key:"casinofilters", payload: result})
                setLocalStorage("casinofilters", result, 1000 * 60 * 60 * 5 )

            }
            
        }
        setFetching(false);
    };
    useEffect(() => {
        fetchCasinoGames();
    }, [state?.casinogamesfilter]);

    useEffect(() => {
        dispatch({type: "SET", key: "nosports", payload: true});

        let gamesFilter = getFromLocalStorage("casinogamesfilter");
        if(gamesFilter) {
            dispatch({type: "SET", key: "casinogamesfilter", payload: gamesFilter})
        }


        return () => {
            dispatch({type: "DEL", key: "nosports"});
        }
    }, [])
useEffect(() => {
    // Check if script already exists or if dga/xlg is already loaded
    const existingScript = document.querySelector('script[src="/dgAPI.js"]');
    if (existingScript || (typeof window !== 'undefined' && window.dga)) {
      return;
    }

    // Dynamically add Pragmatic DGA script
    const script = document.createElement("script");
    script.src = "/dgAPI.js";
    script.async = true;
    script.defer = true;
    script.id = "dgAPI-script"; // Add ID for easier identification
    document.body.appendChild(script);

    return () => {
      // Only cleanup if script was added by this component
      const scriptToRemove = document.getElementById("dgAPI-script");
      if (scriptToRemove && scriptToRemove === script) {
        document.body.removeChild(scriptToRemove);
      }
    };
  }, []);

    return (
        <>
            <CasinoCarousel />

            <CasinoJackpots />
            
            <div className="casino-games-list">
                {fetching && <ShimmerTable row={3} />}
                {!fetching && (!games || games?.length < 1) && (
                    <NoEvents message="Casino Games not found" />
                )}
                {games?.map((category, idx) => (
                    category?.gameList?.length > 0 && 
                    <CategoryListing 
                        key={idx} 
                        games={category?.gameList} 
                        gamestype={category?.game_type}
                        gamesCategory={state?.casinofilters?.gameTypes}
                        gamesprovider={state?.casinogamesfilter?.provider} 
                    />
                ))}
            </div>
        </>
    );
};

export default React.memo(Casino);


// import React, {useContext, useEffect, useState} from 'react';
// import Header from "../../header/header";
// import Footer from "../../footer/footer";
// import makeRequest from "../../utils/fetch-request";
// import {LazyLoadImage} from 'react-lazy-load-image-component';
// import {Link} from "react-router-dom";
// import SideBar from "../../sidebar/awesome/Sidebar";
// import {getFromLocalStorage, setLocalStorage} from "../../utils/local-storage";
// import Notify from "../../utils/Notify";
// import {Button, ButtonGroup} from "react-bootstrap";
// import CasinoCarousel from '../../carousel/casino-carousel';
// import { Context } from '../../../context/store';
// import { ShimmerTable } from "react-shimmer-effects";
// import NoEvents from '../../utils/no-events';
// import CategoryListing from './category-listing';

// const Casino = (props) => {

//     const [user] = useState(getFromLocalStorage("user"));
//     const [categories, setCategories] = useState([])
//     const [state, dispatch] = useContext(Context);
//     const [games, setGames] = useState(null);
//     const [filteredGames, setFilteredGames] = useState([]);
//     const [fetching, setFetching] = useState(false);
//     const [searchTerm, setSearchTerm] = useState("");

//     const fetchCasinoGames = async () => {
//         setFetching(true);
//         let endpoint = "games-list";

//         // change fetch if there's a filter
//         if (state?.casinogamesfilter?.filterType == "category") {
//             endpoint = `game-type/games-list/${state?.casinogamesfilter?.category?.id}`
//         } else if (state?.casinogamesfilter?.filterType == "provider"){
//             endpoint = `provider/games-list/${state?.casinogamesfilter?.provider?.id}`

//         }

//         await makeRequest({url: endpoint, method: "GET", api_version:"faziCasino"}).then(([status, result]) => {
//             if (status == 200) {
//             if (state?.casinogamesfilter) {
//                 let newGames = {...games, games: result}
//                 setGames(newGames);
//                 //    dispatch({type:"SET", key:"casinogames", payload: result});
//             } else {
//                 setGames(result);
//                 dispatch({type:"SET", key:"casinogames", payload: result});
//                 setLocalStorage('casinogames', result)
//             }
//         }
//         });

//         setTimeout(() => {setFetching(false)}, 3000)
//     }

    

//     useEffect(() => {
//         // Get Fazi Games from local storage else fetch them
//         let localGames = getFromLocalStorage("casinogames");
//         dispatch({type:"SET", key:"bodyheaderspacing", payload:"no-body-header-spacing"});
    
//         if (localGames ) {
//             if (Object.keys(localGames).length > 0) {
//                 setGames(localGames);
//                 dispatch({type:"SET", key:"casinogames", payload: localGames});
//                 dispatch({type:"SET", key:"casinoactiveitem", payload: {type:'category', id:1}});
//             } else {
//                 fetchCasinoGames();
//             }
//         } else {
//             fetchCasinoGames();
//         }
//         return () => {dispatch({type:"DEL", key:"bodyheaderspacing"})}
//     }, []);

//     useEffect(() => {
//         fetchCasinoGames();
//     }, [state?.casinogamesfilter])

//     useEffect(() => {
//         if (games?.games) {
//             const newFilteredGames = games.games.map(category => ({
//                 ...category,
//                 gameList: category.gameList.filter(game =>
//                     game.game_name.toLowerCase().includes(searchTerm.toLowerCase())
//                 )
//             }));
//             setFilteredGames(newFilteredGames);
//         }
//     }, [games, searchTerm]);

//     const handleSearchChange = (e) => {
//         setSearchTerm(e.target.value);
//     };

//     return (
//         <>
//         <CasinoCarousel />
//         {/* <section className='casino-filter md:hidden'>
//             <div className='filter-nav'>
//                 <ul className="filter-nav-list">
//                     <li className='filter-item'>All games</li>
//                     <li className='filter-item'>Popular</li>
//                     <li className='filter-item'>New</li>
//                     <li className='filter-item'>Tables</li>
//                 </ul>
//             </div>
//         </section> */}
//         <div className="casino-search-container flex items-center justify-center">
//                 <input
//                     type="text"
//                     placeholder="Search games..."
//                     value={searchTerm}
//                     onChange={handleSearchChange}
//                     className="w-1/2 p-2 my-4 border border-gray-300 rounded-md mx-auto"
//                 />
//             </div>
//         <div className={'casino-games-list'}>
//             {games?.games?.length < 1 && <div>{fetching ? <ShimmerTable row={3}/> : ""}</div>}
//             {!games && <div className='mt-4'><NoEvents message="Casino Games not found" /></div>}
//             {games?.games?.map((category, idx) => (                 
//                 <>                        
//                     <CategoryListing games={category?.gameList} gamestype={category?.game_type}/>
//                 </> 
//                )                                   
//             )}                                    

//         </div>
//         </>
//     )

// }


// export default Casino;

