import React, { useContext, useState } from "react";
import Offcanvas from "react-bootstrap/Offcanvas";
import { Link } from "react-router-dom";
import { Context } from "../../context/store";

import { IoMdLogOut } from "react-icons/io";
import { BiMoneyWithdraw } from "react-icons/bi";
import { FaGifts, FaRegUser } from "react-icons/fa";
import { FaCheckToSlot } from "react-icons/fa6";
import { GiTwoCoins } from "react-icons/gi";
import { IoListCircleOutline } from "react-icons/io5";
import { MdCancel } from "react-icons/md";

import ComingSoon from "../pages/comingsoon/ComingSoon";
import { formatToFloat } from "../utils/formatters";

function MobileMenu(props) {

  const { user } = props;

  const [show, setShow] = useState(false);
  const [, dispatch] = useContext(Context);
  const [showComingSoon, setShowComingSoon] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleComingSoonClick = () => {
    setShowComingSoon(true);
    setTimeout(() => setShowComingSoon(false), 3000);
  };

  const UserBalance = () => (
    <div className="bx">
      <div className="bx-1">BALANCE</div>

      <div className="bx-2 secondary-text">
        KSh. {formatToFloat(user?.balance || 0)}
      </div>
      <div className="bx-3 uppercase ">
        <div className="bx-3-1">
          Restricted Bal:
          <div className="bx-2 secondary-text">
            KSh. {formatToFloat(user?.restricted_balance || 0.00)}
          </div>
        </div>
      </div>
      <div className="bx-3">
        <div className="bx-3-1">
          Bonus:
          <div className="bx-2">
            KSh. {formatToFloat(user?.bonus || user?.bonus_balance || 0)}
          </div>
        </div>
      </div>

    </div>
  );

  const CanvasBottom = () => {
    return (
      <div className="flex text-center">

        <div className="col-6 offcanvas-big-icon p-5">
          <Link
            to="/logout"
            style={{ color: "#dc3545" }}
            onMouseOver={(e) => (e.currentTarget.style.color = "#c82333")}
            onMouseOut={(e) => (e.currentTarget.style.color = "#dc3545")}
          >
            <IoMdLogOut className="big-offcanvas-icon mx-auto" />
            Logout
          </Link>
        </div>

        <ComingSoon
          show={showComingSoon}
          onClose={() => setShowComingSoon(false)}
        />

      </div>
    );
  };

  return (
    <span className="inline-block" style={{ height: "auto" }}>

      <span
        className="font-[500] cursor-pointer user-profile"
        onClick={handleShow}
      >
        <FaRegUser className="inline-block user-profile-icon" />
        <span className="hidden md:inline-block">My</span> Account
      </span>

      <Offcanvas
        placement="end"
        show={show}
        onHide={handleClose}
        className="header-account"
        style={{ height: "auto" }}
      >

        <Offcanvas.Header closeButton>

          <div className="d-flex align-items-center justify-content-between w-100">

            {/* LEFT CLOSE BUTTON */}
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-sm btn-outline-secondary bg-[red] text-white absoute top-2 left-2"
            >
              Close
            </button>

            <div className="text-center">
              <FaRegUser className="mr-2 inline-block" />
              {user?.msisdn}
            </div>

          </div>

        </Offcanvas.Header>

        <Offcanvas.Body
          className="off-canvas"
          style={{ marginBottom: "20px", overflowY: "auto" }}
        >

          <div className="highlight-box">
            <UserBalance />
          </div>

          <div className="cd" onClick={() => setShow(false)}>

            <Link to="/deposit" className="cd-l">
              <GiTwoCoins className="inline-block mr-3" />
              Deposit
            </Link>

            <Link to="/withdraw" className="cd-l">
              <BiMoneyWithdraw className="mr-3 inline-block" />
              Withdraw
            </Link>

            <Link to="/promo-wins">
              <FaGifts className="mr-3 inline-block" />
              Promo Wins (0)
            </Link>

            <div
              className="cd-l"
              onClick={() =>
                dispatch({
                  type: "SET",
                  key: "showcheckmpesadepositstatus",
                  payload: true,
                })
              }
            >
              <FaCheckToSlot className="mr-3 inline-block" />
              Check MPESA Deposit status
            </div>

            <Link to="/my-bets" className="cd-l">
              <IoListCircleOutline className="mr-3 inline-block" />
              My bets
            </Link>
            <Link to="/promotions" className="cd-l">
              <FaGifts className="mr-3 inline-block" />
              Promotions
            </Link>
            <Link to="/exclude" className="cd-l">
              <MdCancel className="mr-3 inline-block" />
              Exclude myself from betting
            </Link>

            <Link to="/reset-password" className="cd-l">
              <MdCancel className="mr-3 inline-block" />
              Change Password
            </Link>

          </div>

          <CanvasBottom />

        </Offcanvas.Body>

      </Offcanvas>

    </span>
  );
}

export default MobileMenu;
