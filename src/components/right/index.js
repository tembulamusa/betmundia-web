import React, { useState, useContext, useEffect, useMemo } from 'react';
import BetSlip from './betslip';
import { FiX } from 'react-icons/fi';
import { Context } from '../../context/store';
import Mpesa from "../../assets/img/mpesa-1.png";
import MiniGames from './mini-games';
import { Modal } from 'react-bootstrap';
import makeRequest from '../utils/fetch-request';
import { removeItem, setLocalStorage, getFromLocalStorage } from '../utils/local-storage';
import { useLocation } from 'react-router-dom';
import { emptyBonusAdvice, buildBongeBonusAdvice } from './bonge-bonus-utils';

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

  const MobileSlipHeader = () => {
    return (
      <>
        {state?.isjackpot ? 'jackpot' : 'Betslip'}
        {state?.isjackpot && (
          <span className="col-sm-2 slip-counter">
            ({Object.keys(state?.jackpotbetslip || {}).length} / {(state?.jackpotdata?.matches || [])?.length})
          </span>
        )}

        <div className='float-end'>
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


        <Modal.Body className="bg-dark-bg-secondary px-0 py-0" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#ffffff' }}>
          <div id="betslip" className="betslip">
            <BetSlip
              jackpot={Boolean(state?.isjackpot)}
              betslipValidationData={betslipValidationData}
              jackpotData={jackpotData}
              dbWinMatrix={dbWinMatrix}
            />
          </div>
        </Modal.Body>

      </Modal>


      {/* Mobile sticky slip bar removed — use MobileBottomNav betslip control */}
    </>
  );
};


const Right = (props) => {
  const { betslipValidationData, jackpotData } = props;
  const location = useLocation();
  const [state, dispatch] = useContext(Context);
  const [bongeBonusAdvice, setBongeBonusAdvice] = useState(emptyBonusAdvice);
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
      dispatch({ type: "SET", key: "bonusCentages", payload: dbWinMatrix });
    }
  }, [dbWinMatrix])

  const updateBongeBonusMessage = () => {
    const advice = buildBongeBonusAdvice(state?.betslip, dbWinMatrix);
    const totalGames = Object.values(state?.betslip || {}).filter(
      (slip) => slip.odd_value > (dbWinMatrix?.sgr_bonus_min_odds || 1.3)
    ).length;
    const maxGames = dbWinMatrix?.sgr_bonus_max_games;
    const capped = maxGames && totalGames > maxGames ? maxGames : totalGames;
    const percentKey = `sgr_bonus_percent_${capped}`;

    if (capped > 3 && dbWinMatrix && percentKey in dbWinMatrix) {
      setBonusCentage(dbWinMatrix[percentKey]);
    } else if (maxGames && totalGames > maxGames) {
      setBonusCentage('100');
    }

    dispatch({ type: "DEL", key: "centageBonus" });
    setBongeBonusAdvice(advice);
    dispatch({ type: "SET", key: "bongeBonusAdvice", payload: advice });
  }

  useEffect(() => {
    updateBongeBonusMessage()
  }, [state?.betslip, dbWinMatrix])




  return (
    <>
      {!state?.nosports && <>
        <div className="col-md-3 betslip-container">
          <>
            <section id="betslip" className="betslip-v2">
              <div className="bg-[rgba(255,255,255,0.1)]">
                <div className="betslip-header bg-secondary uppercase">
                  {state?.isjackpot ? 'jackpot' : 'Betslip'} {state?.isjackpot && (<span>{Object.keys(state?.jackpotbetslip || {}).length} / {(state?.jackpotdata?.matches || [])?.length}</span>)}
                </div>
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
