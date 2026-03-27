import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ReactTicker } from "@guna81/react-ticker";
import { MdCancel } from "react-icons/md";
import { BsBookmarkPlusFill } from "react-icons/bs";
import { Context } from "../../context/store";

const MobileDownloadBanner = () => {
  const [showTop, setShowTop] = useState(true);
  const data = ["To bet via SMS send 'games' to 29280", "Install Our app for Easy access"];
  const [, dispatch] = useContext(Context);
  const SMSTicker = () => (
    <ReactTicker
      data={data}
      speed={40}
      keyName="_id"
      tickerStyle={{
        position: "relative",
        bottom: 0,
        left: "0",
        width: "100%",
        height: "20px",
        //   backgroundColor: "#fff",
        //   zIndex: 99,
        //   borderTop: "1px solid #e0e0e0",
      }}
      tickerClassName="news-ticker"
    />
  )

  const changeShowTop = () => {
    setShowTop(!showTop);
    dispatch({ type: "SET", key: "showmobiletop", payload: !showTop });
  }
  useEffect(() => {
    dispatch({ type: "SET", key: "showmobiletop", payload: true });
  }, [])
  return (

    <section className="mobile-download-banner md:hidden w-full mx-auto">
      <div onClick={() => changeShowTop()} className={`toggle-show-top-nav ${showTop ? 'can-hide' : 'can-show'}`}>{showTop ? <MdCancel className="text-red-500" style={{ fontSize: "20px" }} /> : ""}</div>
      {showTop && <div className="row px-2 flex py-2">
        <div className="col flex-col col-6 col-sm-6 px-2 text-gray-100 py-1"><SMSTicker /></div>
        <div className="col flex-col col-6 col-sm-6 px-2"><Link to={"/app"} className="float-end"><button className="mx-auto mobile-app-download-btn btn font-bold">Download App</button></Link></div>
      </div>}
    </section>
  )
}

export default React.memo(MobileDownloadBanner);
