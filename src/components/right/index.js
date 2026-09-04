import React, { useState, useContext, useEffect, useMemo } from 'react';
import BetSlip from './betslip';
import { FiX } from 'react-icons/fi';
import { Context } from '../../context/store';
import { faShare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Mpesa from "../../assets/img/mpesa-1.png";
import Float from "../utils/mathematical-formulas";
import MiniGames from './mini-games';
import { Modal } from 'react-bootstrap';
import makeRequest from '../utils/fetch-request';
import { removeItem, setLocalStorage, getFromLocalStorage } from '../utils/local-storage';
import { type } from '@testing-library/user-event/dist/cjs/utility/index.js';
import { useLocation } from 'react-router-dom';

const AlertMessage = (props) => {
  return (
    <div className={`alert alert-dismissible ${props.classname}`} role="alert">
      <button type="button" className="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">×</span>
      </button>
      {props.message}
    </div>
  );
};

const SlipCounter = (props) => {
  const { sliptype } = props;
  const [state] = useContext(Context);

  return <span className="">{state?.sliptype?.count || 0}</span>;
};

const PaybillNumbersSection = () => (
  <section className='betslip-paybill bg-secondary'>
    <div className="paybillnumbers">
      <h2 style={{ marginBottom: "3px" }}>Paybill Numbers</h2>
      <p style={{ marginTop: "0" }}>Your account/reference number should be your registered number.</p>
      <ul>
        <li className="mpesa">
          <span className="lazy lazy-loaded">
            <img src={Mpesa} style={{ maxWidth: "110px" }} alt='paybill' />
          </span>
          <span style={{ paddingRight: "10px" }}>444142</span>
        </li>
      </ul>
    </div>
  </section>
);

const CustomerCareSection = () => (
  <section className='betslip-paybill bg-secondary'>
    <div className="paybillnumbers pt-3">
      <h2>Customer Care</h2>
      <p>Betmundial is the place to be all day long for 24/7 customer support.</p>
      <div className='text-3xl py-3'>0143444142</div>
      <p>support@betmundial.com</p>
    </div>
  </section>
);


const LoadedBetslip = ({ betslipValidationData, jackpotData, dbWinMatrix }) => {
  const [state, dispatch] = useContext(Context);
  const [footerMobileValue, setFooterMobileValue] = useState(state?.isjackpot ? jackpotData?.bet_amount : 100);
  const [bongeBonusMessage, setBongeBonusMessage] = useState('Select 3 or more games to win big bonus');

  const showShareModalDialog = () => {
    const loggedInUser = getFromLocalStorage("user") ?? null;
    if (!loggedInUser) {
      dispatch({ type: 'SET', key: 'showloginmodal', payload: true });
    } else {
      dispatch({ type: 'SET', key: 'showsharemodal', payload: true });
    }
  };


  const BongeBetMarkupMessage = () => {
    return !state?.isjackpot && Object.keys(state?.betslip || {}).length > 0 && (
      <div className="bonge-bonus" style={{ padding: '5px', background: '#fbd702', marginTop: '10px' }}>
        <div id="bonus-centage-advice" style={{ fontWeight: '100' }}>{bongeBonusMessage}</div>
      </div>
    );
  };

  const MobileSlipHeader = () => {

    return (
      <>
        {state?.isjackpot ? 'jackpot' : 'Betslip'}
        {!state?.isjackpot && (
          <span className="col-sm-2 slip-counter">({Object.keys(state?.betslip || {}).length})</span>
        )}

        <div className='float-end'>
          {Object.keys(state?.betslip || {}).length > 0 && (

            <span className="col-sm-2 yellow-btn font-bold share-btn btn btn-light mr-2"
              style={{ width: 'fit-content' }}
              onClick={showShareModalDialog}
            >
              <span><FontAwesomeIcon icon={faShare} /></span>
              <span>Share</span>

            </span>
          )}
          <button className='btn btn-default' onClick={() => dispatch({ type: "SET", key: "showmobileslip", payload: false })}><span className='text-red-700 font-bold mr-3'>X</span>Close</button>
        </div>
      </>
    )
  }
  return (
    <>
      {/* Lets use a modal over here */}
      <Modal
        show={state?.showmobileslip}
        onHide={() => dispatch({ type: "SET", key: "showmobileslip", payload: false })}
        dialogClassName="mobile-betslip-modal"

        aria-labelledby="contained-modal-title-vcenter">

        <Modal.Header
          closeVariant="black"
          closeLabel="close"
          // closeButton
          className="block text-white" style={{ background: "rgba(231,6,84, 1)" }}>
          <Modal.Title><MobileSlipHeader /> </Modal.Title>
        </Modal.Header>


        <Modal.Body className="bg-dark-bg-secondary px-0 py-0" style={{ backgroundColor: '#0f0f1f', color: '#ffffff' }}>
          <div id="betslip" className="betslip">
            {Object.keys(state?.betslip || {}).length == 0 && <BongeBetMarkupMessage />}
            <BetSlip
              jackpot={state?.isjackpot}
              betslipValidationData={betslipValidationData}
              jackpotData={jackpotData}
              dbWinMatrix={dbWinMatrix}
            />
          </div>
        </Modal.Body>

      </Modal>


      {/* Mobile Toggle Button */}
      {(state?.matchlisttype == "normal" || state?.isjackpot) &&
        <section
          className={`${(state?.showmobileslip == false || !state?.showmobileslip) ? 'd-block' : "d-none"}  d-md-none fixed-bottom text-center text-white bg-tertiary bet-slip-footer-toggle capitalize`}
          style={{ position: 'fixed', zIndex: 9999999, left: 0, right: 0 }}
        >
          <div className="flex mobile-sticky-footer-slip">
            <div className="col-3 text-left" style={{ paddingLeft: '' }}>
              <div className="yellow-bg text-white mobile-footer-slip" onClick={() => dispatch({ type: "SET", key: "showmobileslip", payload: true })}>
                slip <span className="mobile-footer-slip-counter rounded-full red-bg">{Object.entries(state?.betslip || state?.jackpotbetslip || {}).length}</span>
              </div>
            </div>
            <div className="col-3 text-left">
              {state?.isjackpot ? <div className=''>Stake: {state?.jackpotdata?.bet_amount}</div> : <input
                className="capture-input"
                type="number"
                onChange={(ev) => dispatch({ type: 'SET', key: 'mobilefooteramount', payload: ev.target.value })}
                value={state?.mobilefooteramount ?? 100}
              />}
            </div>
            <div className="col-3 text-left">
              {!state?.isjackpot && (
                <div>
                  Odds: <span className="font-[500]">{Float(state?.totalodds, 2) || 1}</span>
                </div>
              )}
              <div>
                Win: <span className="font-[500]">{state?.isjackpot ? state?.jackpotdata?.jackpot_amount : state?.slipnetwin}</span>
              </div>
            </div>
            <div className="col-3 pr-0">
              <button className="bet-button btn red-bg uppercase btn" onClick={() => dispatch({ type: "SET", key: "showmobileslip", payload: true })}>Bet Now</button>
            </div>
          </div>
        </section>
      }
    </>
  );
};


const Right = (props) => {
  const { betslipValidationData, jackpotData } = props;
  const location = useLocation();
  const [state, dispatch] = useContext(Context);
  const [bongeBonusMessage, setBongeBonusMessage] = useState('Select 3 or more games to win big bonus');
  const [bonusCentage, setBonusCentage] = useState(3);
  const [dbWinMatrix, setDbWinMatrix] = useState({
  });
  const sharedSlipCode = useMemo(() => {
    const match = location?.pathname?.match(/^\/betslip\/share\/([^/]+)\/?$/);
    return match ? decodeURIComponent(match[1]) : '';
  }, [location?.pathname]);

  // useEffect(() => {
  //   if (state?.sgrBonusMatrix) {
  //     setDbWinMatrix(state?.sgrBonusMatrix);
  //   }
  // }, [state?.sgrBonusMatrix]);
  const showShareModalDialog = () => {
    const loggedInUser = getFromLocalStorage("user") ?? null;
    if (!loggedInUser) {
      dispatch({ type: 'SET', key: 'showloginmodal', payload: true });
    } else {
      dispatch({ type: 'SET', key: 'showsharemodal', payload: true });
    }
  };

  const getDbWinMatrix = () => {
    let endpoint = "/sports/config/sgr";

    makeRequest({ url: endpoint, method: "GET", api_version: 2 }).then(([status, result]) => {
      if (status == 200) {
        if (result.status == 200) {
          setDbWinMatrix(result?.data);
        }
      }
    });

  }
  useEffect(() => {
    getDbWinMatrix();
  }, []);
  useEffect(() => {
    if (dbWinMatrix) {
      dispatch({ type: "SET", key: "bonusCentages", dbWinMatrix });
    }
  }, [dbWinMatrix])

  const updateBongeBonusMessage = () => {

    let str_configs = state?.bgconfigs?.multibet_bonus_event_award_ratio?.split(",");
    let odd_limit = dbWinMatrix?.sgr_bonus_min_odds || 1.30;



    let max_games = dbWinMatrix?.sgr_bonus_max_games;
    let total_games = Object.values(state?.betslip || {})?.filter(
      (slip) => slip.odd_value > (dbWinMatrix?.sgr_bonus_min_odds || 1.30)).length;

    if (total_games > max_games) {
      total_games = max_games;
    }
    let strConstruct = `sgr_bonus_percent_${total_games}`
    // let centage = total_games == max_games ? "100" : (dbWinMatrix[strConstruct] || "0")

    if (!(strConstruct in dbWinMatrix)) {
      setBongeBonusMessage("Select 4 games or more above 1.30 to get a bonus")
    }

    let bonusAdvice = "";
    if (total_games == 1) {
      bonusAdvice = "Add 3 more games " + odd_limit + " to win a bonus of " + dbWinMatrix["sgr_bonus_percent_4"] + "% from 4 games";
      dispatch({ type: "DEL", key: "centageBonus" });

    } else if (total_games == 2) {
      bonusAdvice = "Add 2 more game of odds " + odd_limit + " to win a bonus of " + dbWinMatrix["sgr_bonus_percent_4"] + "% on 4 games";
      dispatch({ type: "DEL", key: "centageBonus" });

    }
    else if (total_games == 3) {
      bonusAdvice = "Add  more game of odds " + odd_limit + " to win a bonus of " + dbWinMatrix["sgr_bonus_percent_4"] + "% on 4 games";
      dispatch({ type: "DEL", key: "centageBonus" });

    }
    else {
      if (total_games > 3 && total_games <= max_games) {
        var next_centage = dbWinMatrix[`sgr_bonus_percent_${total_games + 1}`]
        bonusAdvice = "Congratulations, You have won a bonus of "
          + dbWinMatrix[strConstruct] + "% on " + total_games + " games of " + odd_limit + " odds"
          + ". add 1 more game of " + odd_limit + " odds to win a bonus of " + next_centage + "%";
        setBonusCentage(dbWinMatrix[strConstruct]);
      } else if (total_games > max_games) {
        bonusAdvice = "Congratulations: you have won a bonus of "
          + 100 + "% on " + total_games + " games of more than " + odd_limit + " odds";
        setBonusCentage('100');
      }
    }
    dispatch({ type: "DEL", key: "centageBonus" });
    setBongeBonusMessage(bonusAdvice);
  }

  const BongeBetMarkupMessage = () => {
    return !state?.isjackpot && Object.keys(state?.betslip || {}).length > 0 && (
      <div className="bonge-bonus" style={{ padding: '5px', marginTop: '10px' }}>
        <div id="bonus-centage-advice">{bongeBonusMessage}</div>
      </div>
    );
  };

  useEffect(() => {
    updateBongeBonusMessage()
  }, [state?.betslip])




  return (
    <>
      {!state?.nosports && <>
        <div className="col-md-3 betslip-container sticky-top">
          <>
            <section id="betslip" className="betslip-v2">
              <div className="bg-[rgba(255,255,255,0.1)]">
                <div className="betslip-header bg-secondary uppercase">
                  {state?.isjackpot ? 'jackpot' : 'Betslip'} {state?.isjackpot && (<span>{Object.keys(state?.jackpotbetslip || {}).length} / {(state?.jackpotdata?.matches || [])?.length}</span>)}
                  {!state?.isjackpot && (
                    <span className="col-sm-2 slip-counter">({Object.keys(state?.betslip || {}).length})</span>
                  )}
                  {Object.keys(state?.betslip || {}).length > 0 && (
                    <span className="col-sm-2 yellow-btn font-bold !float-end share-btn btn btn-light"
                      style={{ width: 'fit-content' }}
                      onClick={() => showShareModalDialog()}
                    >
                      <span><FontAwesomeIcon icon={faShare} /></span>
                      <span>Share</span>
                    </span>
                  )}
                </div>
                {Object.keys(state?.betslip || {}).length > 0 && <BongeBetMarkupMessage />}
                <BetSlip jackpot={state?.isjackpot} betslipValidationData={betslipValidationData} jackpotData={jackpotData} dbWinMatrix={dbWinMatrix} sharedCode={sharedSlipCode} />
              </div>
            </section>
            <PaybillNumbersSection />

          </>
          <MiniGames />
          <CustomerCareSection />


        </div>

        <LoadedBetslip
          dbWinMatrix={dbWinMatrix}
          betslipValidationData={betslipValidationData}
          jackpotData={jackpotData} />
      </>
      }
    </>
  );
};

export default Right;
