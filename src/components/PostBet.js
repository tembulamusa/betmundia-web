import React, {useState, useContext} from 'react';
import {
    removeFromSlip,
    getBetslip,
    clearSlip,
    clearJackpotSlip, formatNumber
} from './utils/betslip';
import { 
    getFromLocalStorage, 
    setLocalStorage,
    removeItem
} from './utils/local-storage';
import { Context } from "../context/store";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faEnvelope} from "@fortawesome/free-solid-svg-icons";
import {faFacebook, faInstagram, faTwitter, faYoutube, faWhatsapp} from "@fortawesome/free-brands-svg-icons"
import ShareModal from "./sharemodal";
import makeRequest from './utils/fetch-request';
import { getStoredIpAddress } from './utils/ip-address';


const PostBet = (props) => {
    const [state, dispatch] = useContext(Context);
	const oldBetslip = getFromLocalStorage('old_betslip');
    const [sharebleCode, setSharebleCode] = useState();
    const app_name = "desktop-web";
    const [doneShare, setDoneShare] = useState(false);
    const user = getFromLocalStorage("user");

	const placeNewBet = () => {

		removeItem("old_betslip");
		window.location = "/";
	}
	const reBet = () => {
		const oldBetslip = getFromLocalStorage('old_betslip');
	    setLocalStorage('betslip', oldBetslip, 1*60*60*1000);
	    removeItem("old_betslip");
		window.location.reload();
	}


    const loadSocialPage = (code) => {
       if(sharebleCode){
           let waUrl = "https://api.whatsapp.com/send?text=I%20placed%20this%20bet%20on%20bikosports.co.tz/.%20Cheki%20mkeka%20wangu%20na%20ubeti.%20https://bikosports.co.tz/betslip/share/"+sharebleCode;
           let  fbUrl = "https://facebook.com/sharer/sharer.php?u=https://bikosports.co.tz/betslip/share/"+sharebleCode;
           let ttUrl = "https://twitter.com/intent/tweet/?text=I%20placed%20this%20bet%20on%20https://bikosports.co.tz/.%20Cheki%20mkeka%20wangu%20na%20ubeti&amp;url=https://bikosports.co.tz/betslip/share/"+sharebleCode;
           if(code == 'fb'){
		       window.open(fbUrl,   '_blank', 'noreferrer');
           } else if (code == 'wa') {
		       window.open(waUrl,   '_blank', 'noreferrer');
           } else if(code == 'tt'){
		       window.open(ttUrl,   '_blank', 'noreferrer');
           }
       }
    }

    const createSharableBet = async (social) => {
        let endpoint = "/v1/share";
        setDoneShare(false);
        let betslip =  getFromLocalStorage('old_betslip');
        let sharedSlip = betslip || state?.betslip;
        let payload = {
            betslip: sharedSlip ,
            ip_address: String(getStoredIpAddress() || ''),
            app:app_name,
            msisdn:user?.msisdn,
            profile_id:user?.profile_id
        }
        makeRequest({url: endpoint, method: "POST", data: payload}).then(([status, result]) => {
            if(status == 200) {
                setSharebleCode(result.code);
                if(social) {
                    loadSocialPage(social)
                }
            } else {
                setSharebleCode("N/A");
            }
            setDoneShare(true);
        });
    }

	const showShareModalDialog = () => {
		const oldBetslip = getFromLocalStorage('old_betslip');
	    setLocalStorage('betslip', oldBetslip, 1*60*60*1000);

        dispatch({type:"SET", key:"showsharemodal", payload:true})
    }

	return (
		<div className="post-bet-details">
			<div className="unpaid-bet">
			</div>

			<div className="more-bet-options">
				<div className="post-bet-more-action">

                    <div className="row post-bet-option">
					    <div onClick={createSharableBet} className="col-12 ">CREATE CODE<span className="biko-pink-color" style={{float:"right"}}>{sharebleCode}</span></div>
                    </div>
					<div className="row post-bet-option">
					<div className="col-6 ">SHARE BET</div>
					 <div className="share-links col-6 center-text text-center">
				      <div className="social-icons center-text text-center">
							<FontAwesomeIcon onClick={() => createSharableBet('fb')}  icon={faFacebook} className="slip-share-icon col-4"/>
							<FontAwesomeIcon onClick={() => createSharableBet('wa')} icon={faWhatsapp} className="slip-share-icon col-4"/>
							<FontAwesomeIcon onClick={() => createSharableBet('tt')} icon={faTwitter} className="slip-share-icon  col-4"/>
							
                       </div>
					 </div>
					</div>
					<div onClick={reBet} className="row post-bet-option">
                       <div className="col-9">Rebet</div>

					   <div className="col-3 text-right right-text"><span className="rebet rebet-btn" style={{marginLeft:"10px"}}>
                        <svg width="20px" style={{marginLeft:"2px"}} height="20px" xmlns="http://www.w3.org/2000/svg" fill="#ffffff">
                        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                        <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                        <g id="SVGRepo_iconCarrier">
                        <path fill="#ffffff" d="M14.9547098,7.98576084 L15.0711,7.99552 C15.6179,8.07328 15.9981,8.57957 15.9204,9.12636 C15.6826,10.7983 14.9218,12.3522 13.747,13.5654 C12.5721,14.7785 11.0435,15.5888 9.37999,15.8801 C7.7165,16.1714 6.00349,15.9288 4.48631,15.187 C3.77335,14.8385 3.12082,14.3881 2.5472,13.8537 L1.70711,14.6938 C1.07714,15.3238 3.55271368e-15,14.8776 3.55271368e-15,13.9867 L3.55271368e-15,9.99998 L3.98673,9.99998 C4.87763,9.99998 5.3238,11.0771 4.69383,11.7071 L3.9626,12.4383 C4.38006,12.8181 4.85153,13.1394 5.36475,13.3903 C6.50264,13.9466 7.78739,14.1285 9.03501,13.9101 C10.2826,13.6916 11.4291,13.0839 12.3102,12.174 C13.1914,11.2641 13.762,10.0988 13.9403,8.84476 C14.0181,8.29798 14.5244,7.91776 15.0711,7.99552 L14.9547098,7.98576084 Z M11.5137,0.812976 C12.2279,1.16215 12.8814,1.61349 13.4558,2.14905 L14.2929,1.31193 C14.9229,0.681961 16,1.12813 16,2.01904 L16,6.00001 L12.019,6.00001 C11.1281,6.00001 10.6819,4.92287 11.3119,4.29291 L12.0404,3.56441 C11.6222,3.18346 11.1497,2.86125 10.6353,2.60973 C9.49736,2.05342 8.21261,1.87146 6.96499,2.08994 C5.71737,2.30841 4.57089,2.91611 3.68976,3.82599 C2.80862,4.73586 2.23802,5.90125 2.05969,7.15524 C1.98193,7.70202 1.47564,8.08224 0.928858,8.00448 C0.382075,7.92672 0.00185585,7.42043 0.0796146,6.87364 C0.31739,5.20166 1.07818,3.64782 2.25303,2.43465 C3.42788,1.22148 4.95652,0.411217 6.62001,0.119916 C8.2835,-0.171384 9.99651,0.0712178 11.5137,0.812976 Z"></path> </g></svg></span>
					</div>
					</div>
                    <div className="row post-bet-option">
					    <div onClick={placeNewBet} className="col-12 ">Place New Bet</div>
                    </div>
				</div>

			</div>
		</div>
		)
}





export default PostBet;
