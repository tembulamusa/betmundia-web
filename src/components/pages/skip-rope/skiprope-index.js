import React, { useState, useEffect, useRef } from "react";
import { getFromLocalStorage, setLocalStorage } from "../../utils/local-storage";
import { BiSolidVolumeMute } from "react-icons/bi";
import { FaVolumeHigh } from "react-icons/fa6";

import SkipRopeControls from "./skiprope-controls";
import OddsGraph from "./odds-graph";
//import NotSkipping from "../../../assets/img/casino/jump-rope.webp";
import NotSkipping from "../../../assets/img/casino/skiprope-start.png";
//import Skipping from "../../../assets/img/casino/jumpropegirl.gif";
import Skipping from "../../../assets/img/casino/jumping1.gif";
import Kaboom from "../../../assets/img/casino/kaboom.gif";

import GamePlaySoundFile from "../../../assets/img/casino/skiprope-guitar.mp3";
import WinSoundFile from "../../../assets/img/casino/surebox-win.mp3";
import LooseSoundFile from "../../../assets/img/casino/surebox-loose.mp3";

const SkipRopeIndex = () => {
  const [userMuted, setUserMuted] = useState(getFromLocalStorage("skipropemuted") || false);
  const [gameActive, setGameActive] = useState(false);
  const [betAmount, setBetAmount] = useState(0);
  const [currentOdds, setCurrentOdds] = useState(0.5);
  const [cashoutAvailable, setCashoutAvailable] = useState(false);
  const [showKaboom, setShowKaboom] = useState(false);
  const [showSkipping, setShowSkipping] = useState(false);
  const [showResting, setShowResting] = useState(true);
  const [resultMessage, setResultMessage] = useState("");
  const [oddsHistory, setOddsHistory] = useState([0.5]);

  const oddsInterval = useRef(null);
  const kaboomTimeout = useRef(null);

  const gamePlaySound = useRef(new Audio(GamePlaySoundFile));
  const winSound = useRef(new Audio(WinSoundFile));
  const looseSound = useRef(new Audio(LooseSoundFile));

  const toggleMute = () => {
    const newMutedState = !userMuted;
    setLocalStorage("skipropemuted", newMutedState, 1000 * 60 * 60 * 24 * 7);
    setUserMuted(newMutedState);
    gamePlaySound.current.muted = newMutedState;
    winSound.current.muted = newMutedState;
    looseSound.current.muted = newMutedState;
  };

  const startGame = () => {
    if (betAmount <= 0) {
      alert("Please enter a valid bet amount.");
      return;
    }

    setGameActive(true);
    setShowResting(false);
    setShowSkipping(true);
    setResultMessage("");
    setCurrentOdds(0.5);
    setOddsHistory([0.5]);

    gamePlaySound.current.loop = true;
    if (!userMuted) gamePlaySound.current.play();

    oddsInterval.current = setInterval(() => {
      setCurrentOdds((prev) => {
        //const change = Math.random() * 2 - 1; // Random change between -1 and 1
        const change = Math.random() * 6 - 3; // Random change between -3 and 3
        const newOdds = Math.max(1, Math.min(prev + change, 10)); // Clamp between 1 and 10
        setOddsHistory((history) => [...history, newOdds]);
        return newOdds;
      });
    }, 500);

    setTimeout(() => setCashoutAvailable(true), 8000);

    kaboomTimeout.current = setTimeout(() => {
      if (Math.random() < 0.5) {
        kaboom();
      }
    }, Math.random() * 12000 + 8000);
  };

  const cashout = () => {
    if (!cashoutAvailable) {
      alert("Cashout not available yet!");
      return;
    }

    clearInterval(oddsInterval.current);
    clearTimeout(kaboomTimeout.current);

    const winnings = (betAmount * currentOdds).toFixed(2);
    setShowSkipping(false);
    setResultMessage(`You cashed out and won $${winnings}!`);

    winSound.current.play();
    resetGame();
  };

  const kaboom = () => {
    clearInterval(oddsInterval.current);
    setShowSkipping(false);
    setShowKaboom(true);
    setResultMessage("Kaboom! You lost your bet.");

    looseSound.current.play();
    resetGame();
  };

  const resetGame = () => {
    setTimeout(() => {
      setGameActive(false);
      setShowKaboom(false);
      setShowResting(true);
      setCashoutAvailable(false);
      setCurrentOdds(0.5);
      setOddsHistory([0.5]); // Clear the history
      gamePlaySound.current.pause();
      gamePlaySound.current.currentTime = 0;
    }, 2000);
  };

  const handleBetChange = (e) => {
    setBetAmount(parseFloat(e.target.value));
  };

  useEffect(() => {
    return () => {
      clearInterval(oddsInterval.current);
      clearTimeout(kaboomTimeout.current);
      gamePlaySound.current.pause();
    };
  }, []);

  return (
    <div className="skiprope-section">
      <div className="skiprope-container">
        <div className="skiprope-title">
          <h1 className="">Skip a Rope</h1>
          <div className="cursor-pointer text-3xl text-[#a71f66 ]" onClick={toggleMute}>
            {userMuted ? <BiSolidVolumeMute /> : <FaVolumeHigh />}
          </div>
        </div>


        <div className="skiprope-stage">
          {showResting && <img src={NotSkipping} alt="Resting" />}
          {showSkipping && <img src={Skipping} alt="Skipping" />}
          {showKaboom && <img src={Kaboom} alt="Kaboom" />}
        </div>
        <div className="odds-graph-controls-container">
          <OddsGraph
            oddsHistory={oddsHistory}
            currentOdds={currentOdds}
            resultMessage={resultMessage}
          />

          <SkipRopeControls
            gameActive={gameActive}
            betAmount={betAmount}
            cashoutAvailable={cashoutAvailable}
            handleBetChange={handleBetChange}
            startGame={startGame}
            cashout={cashout}
          />
        </div>

      </div>
    </div>
  );
};

export default SkipRopeIndex;
