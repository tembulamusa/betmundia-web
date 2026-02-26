import React, { useContext, useEffect, useState } from "react";
import { Context } from "../../../context/store";
import { getFromLocalStorage, removeItem, setLocalStorage } from "../../utils/local-storage";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
// import FontAwesomeIcon from "react-fontawesome";
// import { faFire } from "@fortawesome/free-solid-svg-icons";

const CasinoSidebar = (props) => {
    const [state, dispatch] = useContext(Context);
    const [categories, setCategories] = useState([]);
    const [providers, setProviders] = useState([]);
    const navigate = useNavigate();
    const [searchParams,] = useSearchParams();
    const loc = useLocation();

    const getSportImageIcon = (sport_name) => {

        let sport_image;
        try {
            sport_image = require(`../../../assets/img/casino/icons/${sport_name}.svg`);
        } catch (error) {
            sport_image = require(`../../../assets/img/casino/icons/${"SetDefault"}.svg`);
        }
        return sport_image;
    }
    // load categories and providers


    useEffect(() => {
        setCategories(state?.casinofilters?.gameTypes);
        setProviders(state?.casinofilters?.providers);
    }, [state?.casinofilters, loc]);

    useEffect(() => {
        let availableFilters = getFromLocalStorage("casinofilters");
        if (availableFilters) {
            dispatch({ type: "SET", key: "casinofilters", payload: availableFilters });
        }
    }, [])

    const filterGames = (filterName, filterItem) => {
        let payload = { filterType: "category", category: filterItem }
        if (filterName == "category") {
            if (filterItem?.name.toLowerCase() == "surecoin") {
                navigate("/surecoin")
            } else {
                setLocalStorage("casinogamesfilter", payload);
                dispatch({ type: "SET", key: "casinogamesfilter", payload: payload });
                navigate(`/casino/categories/${filterItem?.name?.split(" ")?.join("")}`);
            }
        } else {
            removeItem("casinogamesfilter");
            dispatch({ type: "DEL", key: "casinogamesfilter" });
            navigate(`/casino/${filterItem}`);
        }
    }



    const CasinoCategories = (props) => {
        return (
            <>
                <div className="casino-list-block menu-card rounded-lg  capitalize">
                    {/* <h1 className="my-2 mt-2 text-2xl font-[400] casino-class-header">Categories</h1> */}
                    <ul className="casino-sidebar-items">
                        <li key={"all-" + 24}
                            className={`cursor-pointer menu-item capitalize`}
                            onClick={() => filterGames("all", "")}>
                            <img src={getSportImageIcon('home')} className="casino-icon inline-block" alt="" />{"All games"}
                        </li>
                        <li key={"popular-" + 53}
                            className={`cursor-pointer menu-item capitalize`}
                            onClick={() => filterGames("popular", "popular")}>
                            <img src={getSportImageIcon('hot')} className="casino-icon inline-block" alt="" />{"Hot"}
                        </li>

                        {categories?.map((category, idx) => (
                            <>
                                <li to={`/casino?category=${category?.name?.toLowerCase()}&&id=${category?.id}`} key={"categories-" + idx}
                                    onClick={() => filterGames('category', category)}
                                    className={`${state?.casinogamesfilter?.category?.id == category?.id && 'active'} cursor-pointer menu-item block py-2 boder-b border-gray-100`}>
                                    <img src={getSportImageIcon(category.name)} className="casino-icon  inline-block" alt="" />{category?.name}
                                </li>
                            </>
                        ))}
                    </ul>
                </div>
            </>
        )
    }

    const CasinoProviders = (props) => {
        return (
            <>
                <div className="casino-list-block menu-card rounded-lg">
                    <h1 className="mb-2 text-2xl font-[400] casino-class-header">Providers</h1>
                    <ul className="casino-sidebar-items">
                        {providers?.map((provider, idx) => (
                            <Link to={provider?.name?.toLowerCase() == "surecoin" ? "/surecoin" : `/casino?provider=${provider?.name?.split(" ").join("-")}&&id=${provider?.id}`}
                                className={`${loc?.pathname?.includes(provider?.name) && 'active'} cursor-pointer menu-item block py-2`}>
                                <img src={getSportImageIcon(provider.name)} className="casino-icon inline-block" alt="" />{provider?.name}
                            </Link>))
                        }
                    </ul>
                </div>
            </>
        )
    }
    return (
        <div className="casino-sidebar ml-2">
            <h1 className="mb-2 bg-dark-bg-secondary pt-2 pb-3  text-4xl px-3 text-white font-[600] border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.15)' }}>Casino</h1>
            <CasinoCategories />
        </div>
    )
}


export default React.memo(CasinoSidebar);