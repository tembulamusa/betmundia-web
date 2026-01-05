import React from "react";
import { Link } from "react-router-dom";
import Logo from "../../assets/img/logoFav.png";
import CarouselLoader from "../carousel";
import NoEvents from "./no-events";
const AllMarketsUnavailable = (props) => {
    const { backLink } = props;

    return (
        <>
            <CarouselLoader />
            <div className="m-3">

                <NoEvents message={"Event Not Found"} />
            </div >
        </>
    )
}

export default React.memo(AllMarketsUnavailable);