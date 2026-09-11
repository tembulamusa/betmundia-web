import React, { useContext, useEffect, useState } from "react";
import { ReactTicker } from "@guna81/react-ticker";
import { MdCancel } from "react-icons/md";
import { Context } from "../../context/store";
import { ANDROID_PLAY_STORE_URL, getAppDownloadTarget } from "../utils/app-download";

const MobileDownloadBanner = () => {
  const [showTop, setShowTop] = useState(true);
  const [appDownloadHref, setAppDownloadHref] = useState(ANDROID_PLAY_STORE_URL);
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
    setAppDownloadHref(getAppDownloadTarget().href);
  }, [])
  return (

    <section className="mobile-download-banner md:hidden w-full mx-auto">
      <div onClick={() => changeShowTop()} className={`toggle-show-top-nav ${showTop ? 'can-hide' : 'can-show'}`}>{showTop ? <MdCancel className="text-red-500" style={{ fontSize: "20px" }} /> : ""}</div>
      {showTop && <div className="row px-2 flex py-2">
        <div className="col flex-col col-6 col-sm-6 px-2 text-gray-100 py-1"><SMSTicker /></div>
        <div className="col flex-col col-6 col-sm-6 px-2">
          <a href={appDownloadHref} target="_blank" rel="noopener noreferrer" className="float-end">
            <button type="button" className="mx-auto mobile-app-download-btn btn font-bold">Download App</button>
          </a>
        </div>
      </div>}
    </section>
  )
}

export default React.memo(MobileDownloadBanner);
