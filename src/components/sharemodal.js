import React, { useState, useCallback, useEffect, useContext } from "react";
import { Modal } from "react-bootstrap";
import ClipboardCopy from "./utils/copy-to-clipboard"
import {
    getBetslip, getJackpotBetslip
} from './utils/betslip';
import makeRequest from './utils/fetch-request';
import { getFromLocalStorage } from './utils/local-storage';
import { publicIp } from 'public-ip';
import { Context } from "../context/store"
import { ShimmerTitle, ShimmerTable } from "react-shimmer-effects";

import "../App.css";
import Alert from "./utils/alert";

const ShareModal = (props) => {
    const user = getFromLocalStorage("user");
    const app_name = "desktop-web";
    const [ipv4, setIpv4] = useState(null);
    const [shareId, setShareId] = useState();
    const [shareMessage, setShareMessage] = useState({});
    const [state, dispatch] = useContext(Context);
    const [doneShare, setDoneShare] = useState(false);
    const [showAlert, setShowAlert] = useState(false);

    const Float = (equation, precision = 4) => {
        return Math.round(equation * (10 ** precision)) / (10 ** precision);
    }
    const createSharableBet = useCallback(async () => {
        let endpoint = "/bet/share";
        setDoneShare(false);
        let betslip = getBetslip();
        let sharedSlip = state?.betsharetype == "placedbet" ? state?.sharedbet?.betslip : Object.values(betslip || []);
        sharedSlip = sharedSlip.map(({ start_time, ...rest }) => rest);

        let payload = {
            bet_string: 'web',
            app_name: 'desktop',
            possible_win: state?.possiblewin || 100.00,
            stake_amount: 100,
            amount: 100,
            bet_total_odds: 10.20,
            // endCustomerIP: getIp(),
            channel_id: 'web',
            slip: sharedSlip,
            profile_id: state?.user?.profile_id,
            account: 1,
            msisdn: state?.user?.msisdn,
            accept_all_odds_change: 1,
            bet_type: state?.islive ? "1" : "3", // update for live,

        }
        if (state?.betsharetype == "placedbet") {
            payload.bet_id = state?.sharedbet?.bet_id;
        }
        makeRequest({ url: endpoint, method: "POST", data: payload, api_version: 2 }).then(([status, result]) => {
            if (status == 200) {
                setShareId(result?.data?.message);
            } else {
                setShareMessage({ status: status, message: "unable to process share" });
                setShowAlert(true);
            }
            setDoneShare(true);
        });
    }, []);

    const ipAddress = useCallback(async () => {
        let ip;
        try {
            ip = await publicIp.v4({
                fallbackUrls: ['https://ifconfig.co/ip']
            }).then((result) => {
                return result
            });
        } catch (err) {
            ip = "";
        }


        setIpv4(ip);
    }, [ipv4]);

    useEffect(() => {
        ipAddress();
    }, [ipAddress])

    useEffect(() => {
        if (state?.showsharemodal == true) {
            createSharableBet();
        }
    }, [state?.showsharemodal])

    const destroyShareModal = () => {
        dispatch({ type: "DEL", key: "betsharetype" })
        dispatch({ type: "DEL", key: "sharedbet" })
        dispatch({ type: "SET", key: "showsharemodal", payload: false });
    }

    return (
        <>
            <Modal
                show={state?.showsharemodal == true}
                onHide={() => destroyShareModal()}
                dialogClassName="modal-90w world-cup-ad"
                aria-labelledby="contained-modal-title-vcenter">
                <Modal.Header closeButton className="primary-bg">
                    <Modal.Title className="text-2xl uppercase">Share bet</Modal.Title>
                </Modal.Header>

                <Modal.Body className="px-4 py-4" style={{ backgroundColor: '#0f0f1f', color: '#ffffff' }}>
                    {doneShare == false ? (
                        <div>
                            <ShimmerTitle line={2} gap={10} variant="secondary" />
                            <ShimmerTable row={2} col={3} />
                        </div>) : (
                        <><div className="my-4 mb-4">
                            <div className="col-12"> Share the love, tell your friend to bet on this bet</div>
                        </div>

                            {showAlert && <Alert message={shareMessage} />}
                            <div className="row col-12">
                                <div className="col-3">
                                    <a rel="noreferrer" className="resp-sharing-button__link" href={`https://api.whatsapp.com/send?text=I%20placed%20this%20bet%20on%20betmundial.com%20Check%20my%20bet%20and%20bet.%20https://betmundial.com/betslip/share/${shareId}`} target="_blank" title="Share via Whatsapp">
                                        <div className="resp-sharing-button resp-sharing-button--whatsapp resp-sharing-button--large"><div aria-hidden="true" className="resp-sharing-button__icon resp-sharing-button__icon--solid">
                                            <svg width="30px" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" xmlSpace="preserve">
                                                <path d="M0,512l35.31-128C12.359,344.276,0,300.138,0,254.234C0,114.759,114.759,0,255.117,0 S512,114.759,512,254.234S395.476,512,255.117,512c-44.138,0-86.51-14.124-124.469-35.31L0,512z" style={{ fill: "rgb(237, 237, 237)" }}></path> <path d="M137.71,430.786l7.945,4.414c32.662,20.303,70.621,32.662,110.345,32.662 c115.641,0,211.862-96.221,211.862-213.628S371.641,44.138,255.117,44.138S44.138,137.71,44.138,254.234 c0,40.607,11.476,80.331,32.662,113.876l5.297,7.945l-20.303,74.152L137.71,430.786z" style={{ fill: "rgb(85, 205, 108)" }}></path> <path d="M187.145,135.945l-16.772-0.883c-5.297,0-10.593,1.766-14.124,5.297 c-7.945,7.062-21.186,20.303-24.717,37.959c-6.179,26.483,3.531,58.262,26.483,90.041s67.09,82.979,144.772,105.048 c24.717,7.062,44.138,2.648,60.028-7.062c12.359-7.945,20.303-20.303,22.952-33.545l2.648-12.359 c0.883-3.531-0.883-7.945-4.414-9.71l-55.614-25.6c-3.531-1.766-7.945-0.883-10.593,2.648l-22.069,28.248 c-1.766,1.766-4.414,2.648-7.062,1.766c-15.007-5.297-65.324-26.483-92.69-79.448c-0.883-2.648-0.883-5.297,0.883-7.062 l21.186-23.834c1.766-2.648,2.648-6.179,1.766-8.828l-25.6-57.379C193.324,138.593,190.676,135.945,187.145,135.945" style={{ fill: "rgb(254, 254, 254)" }}>
                                                </path>
                                            </svg>
                                        </div> Share </div>
                                    </a>
                                </div>

                                <div className="col-3">
                                    <a className="resp-sharing-button__link" href={`https://facebook.com/sharer/sharer.php?u=https://betmundial.com/betslip/share/${shareId}`} target="_blank" rel="noopener" aria-label="Share on Facebook">
                                        <div className="resp-sharing-button resp-sharing-button--facebook resp-sharing-button--large"><div aria-hidden="true" className="resp-sharing-button__icon resp-sharing-button__icon--solid">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"><path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z" /></svg>
                                        </div>Share</div>
                                    </a>
                                </div>

                                <div className="col-3">
                                    <a className="resp-sharing-button__link" href={`https://twitter.com/intent/tweet/?text=I%20placed%20this%20bet%20on%20https://betmundial.com%20Cheki%20mkeka%20wangu%20na%20ubeti&amp;url=https://betmundial.com/betslip/share/${shareId}`} target="_blank" rel="noopener" aria-label="Share on Twitter">
                                        <div className="resp-sharing-button resp-sharing-button--twitter resp-sharing-button--large"><div aria-hidden="true" className="resp-sharing-button__icon resp-sharing-button__icon--solid">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24"><path d="M23.44 4.83c-.8.37-1.5.38-2.22.02.93-.56.98-.96 1.32-2.02-.88.52-1.86.9-2.9 1.1-.82-.88-2-1.43-3.3-1.43-2.5 0-4.55 2.04-4.55 4.54 0 .36.03.7.1 1.04-3.77-.2-7.12-2-9.36-4.75-.4.67-.6 1.45-.6 2.3 0 1.56.8 2.95 2 3.77-.74-.03-1.44-.23-2.05-.57v.06c0 2.2 1.56 4.03 3.64 4.44-.67.2-1.37.2-2.06.08.58 1.8 2.26 3.12 4.25 3.16C5.78 18.1 3.37 18.74 1 18.46c2 1.3 4.4 2.04 6.97 2.04 8.35 0 12.92-6.92 12.92-12.93 0-.2 0-.4-.02-.6.9-.63 1.96-1.22 2.56-2.14z" /></svg>
                                        </div>Share</div>
                                    </a>
                                </div>
                            </div>

                            <hr className="mt-3" />

                            <h5 className="my-3"> Copy Link </h5>
                            <ClipboardCopy copyText={`https://betmundial.com/betslip/share/${shareId}`} />
                            <h5 className="mt-3"> Copy Code </h5>
                            <ClipboardCopy copyText={shareId} />
                        </>
                    )}

                    <div className=""><button className="my-3 font-bold btn btn-default capitalize border border-gray-200 text-white bg-red-400 px-4 py-3" onClick={() => destroyShareModal()}>cancel</button></div>
                </Modal.Body>

            </Modal>
        </>
    )
}

export default ShareModal;
