import React, { useContext, useEffect, useState } from "react";
import { faUser, faLock, faCoins } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { formatNumber } from "../utils/betslip";
import { Link } from "react-router-dom";
import { Navbar } from "react-bootstrap";
import MobileMenu from "./mobile-menu";
import SearchInput from './search-component';
import { Context } from "../../context/store";
import { FaHome } from "react-icons/fa";
import { formatToFloat } from "../utils/formatters";


const ProfileMenu = (props) => {
  const { user } = props;
  const [state,] = useContext(Context);
  const LogoutFix = (props) => {

    return (
      <Link to={"/logout"} className="font-bold capitalize">logout</Link>
    )
  }
  return (
    <>
      {user && (
        <>
          <div className="ale ss profile float-end flex">

            {/* <SearchInput onSearch={handleSearch} /> */}

            <div className="user-menu-col {'mt-1'} col-md-2 d-flex flex-column justify-content-start space-deposit">
              <Link
                to={{ pathname: "/deposit" }}
                className={"btn hidden md:inline-block sportpesa-deposit-btn"}
                style={{ fontSize: "16px", fontWeight: "bold !important", padding: "5px 26px", width: "max-content" }}
              >
                <span className="uppercase overflow-hidden justify-content-center  rescale">
                  <span className="space-icons"> <FontAwesomeIcon className="deposit-coins-icon" icon={faCoins} /></span> Deposit
                </span>
              </Link>
              {/* <Link to={"/"}><FaHome className="mr-3 inline-block"/>Play Now</Link> */}

            </div>

            <div className=" user-menu-col col-md-3 d-flex flex-column right justify-content-end w-change2">
              <div className="mr-3">
                <span className="font-tbt py-2 flex-wrap text-gray-200 font-[500]">BAL. KES <span className="font-bold ml-1 secondary-text"> {formatToFloat(user?.balance) || 0} </span></span>
              </div>
            </div>



            <div className="user-menu-col col-md-3 d-flex flex-column w-change2">
              <div className="header-account">
                <span className="font-tbt py-1">
                  <span className="space-icons">
                    <MobileMenu user={user} />
                  </span>
                </span>
              </div>

            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ProfileMenu;
