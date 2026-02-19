import React, { useState, useEffect, useRef } from "react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { getFromLocalStorage, setLocalStorage } from "../../utils/local-storage";
import { BiSolidVolumeMute } from "react-icons/bi";
import { FaVolumeHigh } from "react-icons/fa6";
import JumpRopeControls from "./jumprope-controls";
import NotSkipping from "../../../assets/img/casino/skiprope-start.png";
import Skipping from "../../../assets/img/casino/jumping1.gif";
import Kaboom from "../../../assets/img/casino/kaboom.gif";
import GamePlaySoundFile from "../../../assets/img/casino/skiprope-guitar.mp3";
import WinSoundFile from "../../../assets/img/casino/surebox-win.mp3";
import LooseSoundFile from "../../../assets/img/casino/surebox-loose.mp3";

const JumpRopeIndex = () => {
  const [userMuted, setUserMuted] = useState(getFromLocalStorage("jumpropemuted") || false);
  const [gameActive, setGameActive] = useState(false);
  const [bettingActive, setBettingActive] = useState(false);
  const [betAmount, setBetAmount] = useState(0);
  const [currentMultiplier, setCurrentMultiplier] = useState(1.0);
  const [showKaboom, setShowKaboom] = useState(false);
  const [showSkipping, setShowSkipping] = useState(false);
  const [showResting, setShowResting] = useState(true);
  const [resultMessage, setResultMessage] = useState("");
  const [targetMultiplier, setTargetMultiplier] = useState(1.0);
  const [userWins, setUserWins] = useState(false);
  const [multiplierHistory, setMultiplierHistory] = useState([{ time: 0, multiplier: 1 }]);
  const [bettingProgress, setBettingProgress] = useState(0);
  const [currentRound, setCurrentRound] = useState(0);
  const [roundStats, setRoundStats] = useState({
    bets: 0,
    peakMultiplier: 0,
    avgPayout: 0
  });
  const [timeLeft, setTimeLeft] = useState(10); // Increased from 5 to 10 seconds

  const multiplierInterval = useRef(null);
  const bettingInterval = useRef(null);
  const gameRoundTimeout = useRef(null);
  const countdownInterval = useRef(null);

  const gamePlaySound = useRef(new Audio(GamePlaySoundFile));
  const winSound = useRef(new Audio(WinSoundFile));
  const looseSound = useRef(new Audio(LooseSoundFile));

  // Game cycle constants
  const ROUND_DURATION = 13000; // 13 seconds
  const BETTING_DURATION = 8000;

  // Update history when multiplier changes
  useEffect(() => {
    if (gameActive) {
      setMultiplierHistory(prev => {
        const newHistory = [...prev, {
          time: prev.length,
          multiplier: Math.max(1.0, currentMultiplier) // Ensure never below 1.0
        }];
        return newHistory.slice(-100);
      });
    }
  }, [currentMultiplier, gameActive]);

  // Safety check for multiplier
  useEffect(() => {
    if (currentMultiplier < 1.0) {
      setCurrentMultiplier(1.0);
    }
  }, [currentMultiplier]);

  const toggleMute = () => {
    const newMutedState = !userMuted;
    setLocalStorage("jumpropemuted", newMutedState, 1000 * 60 * 60 * 24 * 7);
    setUserMuted(newMutedState);
    gamePlaySound.current.muted = newMutedState;
    winSound.current.muted = newMutedState;
    looseSound.current.muted = newMutedState;
  };

  const updateRoundStats = () => {
    const bets = Math.floor(Math.random() * 5000) + 1000;
    const peakMultiplier = Math.max(1.0, (Math.random() * 9 + 1)).toFixed(1); // 1.0-10.0x
    const avgPayout = Math.max(1.0, (Math.random() * 3 + 1)).toFixed(1); // 1.0-4.0x average

    setRoundStats({
      bets,
      peakMultiplier,
      avgPayout
    });
  };

  const startBettingPeriod = () => {
    setBettingActive(true);
    setBettingProgress(0);
    setTimeLeft(8); // Updated to match new duration
    updateRoundStats();

    // Clear any existing bets
    setBetAmount(0);
    setResultMessage("");

    // Start countdown
    countdownInterval.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Start betting progress bar
    const startTime = Date.now();
    const endTime = startTime + BETTING_DURATION;

    bettingInterval.current = setInterval(() => {
      const now = Date.now();
      const progress = Math.min(1, (now - startTime) / BETTING_DURATION);
      setBettingProgress(progress * 100);

      if (Math.random() > 0.7) {
        updateRoundStats();
      }

      if (now >= endTime) {
        clearInterval(bettingInterval.current);
        setBettingActive(false);
        startGameRound();
      }
    }, 50);
  };

  const startGameRound = () => {
    setCurrentRound(prev => prev + 1);
    setGameActive(true);
    setShowResting(false);
    setShowSkipping(true);
    setCurrentMultiplier(1.0);

    if (betAmount > 0) {
      const willUserWin = Math.random() > 0.45;
      setUserWins(willUserWin);
      // Ensure target is at least 1.0 and has minimum 0.2x increment
      setTargetMultiplier(willUserWin ? Math.max(1.2, Math.random() * 10) : 1.0);
    }

    gamePlaySound.current.loop = true;
    if (!userMuted) gamePlaySound.current.play();

    const startTime = Date.now();
    const endTime = startTime + ROUND_DURATION;

    multiplierInterval.current = setInterval(() => {
      const now = Date.now();
      const progress = Math.min(1, (now - startTime) / ROUND_DURATION);

      const easedProgress = easeInOutQuad(progress);

      if (betAmount > 0 && userWins) {
        // Smooth growth with minimum 1.0
        const current = Math.max(1.0, 1 + (targetMultiplier - 1) * easedProgress);
        setCurrentMultiplier(current);
      } else {
        // Small fluctuations but never below 1.0
        // const fluctuation = Math.max(1.0, 1 + Math.sin(progress * Math.PI * 4) * 0.1);
        // setCurrentMultiplier(fluctuation);
        // more fluctuations
        const randomPeak = 1 + Math.random() * 9; // Up to 10x
        const current = 1 + (randomPeak - 1) * easeInOutQuad(progress);
        setCurrentMultiplier(current);
      }

      if (now >= endTime) {
        endGameRound();
      }
    }, 50);
  };

  const endGameRound = () => {
    clearInterval(multiplierInterval.current);

    if (betAmount > 0) {
      if (userWins) {
        const winnings = (betAmount * targetMultiplier).toFixed(2);
        setResultMessage(`Round won at ${targetMultiplier.toFixed(2)}x! You won $${winnings}`);
        winSound.current.play();
      } else {
        setResultMessage(`Round lost! Better luck next time.`);
        looseSound.current.play();
      }
    }

    setShowSkipping(false);
    setShowKaboom(true);

    setTimeout(() => {
      setShowKaboom(false);
      setShowResting(true);
      setGameActive(false);
      gamePlaySound.current.pause();
      gamePlaySound.current.currentTime = 0;

      // Increased delay before next round starts
      gameRoundTimeout.current = setTimeout(startBettingPeriod, 1500);
    }, 2000);
  };

  const easeInOutQuad = (t) => {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  };

  const placeBet = () => {
    if (betAmount <= 0) {
      alert("Please enter a valid bet amount.");
      return;
    }
    setResultMessage(`Bet placed: $${betAmount}`);
  };

  const handleBetChange = (e) => {
    setBetAmount(parseFloat(e.target.value));
  };

  useEffect(() => {
    startBettingPeriod();
    return () => {
      clearInterval(multiplierInterval.current);
      clearInterval(bettingInterval.current);
      clearInterval(countdownInterval.current);
      clearTimeout(gameRoundTimeout.current);
      gamePlaySound.current.pause();
    };
  }, []);

  const StatsInfo = () => {
    return (
      <div className="jumprope-quick-stats">
        <div className="stats-header">Round: {currentRound}</div>
        <hr className="stats-divider" />
        <div className="stats-row">
          <span className="stats-label">Bets:</span>
          <span className="stats-value">{roundStats.bets}</span>
        </div>
        <div className="stats-row">
          <span className="stats-label">Peak:</span>
          <span className="stats-value">{roundStats.peakMultiplier}x</span>
        </div>
        <div className="stats-row">
          <span className="stats-label">Avg:</span>
          <span className="stats-value">{roundStats.avgPayout}x</span>
        </div>
      </div>
    );
  };

  return (
    <div className="jumprope-section">
      <div className="jumprope-container">
        <div className="jumprope-title">
          <h1 className="">Jump Rope</h1>
          <div className="cursor-pointer text-3xl text-[#a71f66 ]" onClick={toggleMute}>
            {userMuted ? <BiSolidVolumeMute /> : <FaVolumeHigh />}
          </div>
        </div>

        <div className="gameplay-section">
          <div className="jumprope-stage">
            <StatsInfo />
            {showResting && <img src={NotSkipping} alt="Resting" />}
            {showSkipping && (
              <>
                <img src={Skipping} alt="Skipping" />
                <div className="multiplier-overlay">
                  <div className="current-multiplier">
                    <h2>{currentMultiplier.toFixed(2)}x</h2>
                    {betAmount > 0 && userWins && (
                      <p className="target-multiplier">Target: {targetMultiplier.toFixed(2)}x</p>
                    )}
                  </div>
                </div>
              </>
            )}
            {showKaboom && <img src={Kaboom} alt="Kaboom" />}
          </div>

          <div className="multiplier-graph">
            {bettingActive ? (
              <div className="betting-countdown">
                <div className="time-left">
                  <span className="text">starts in </span>
                  <span className="counter">{timeLeft}</span>
                </div>
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{ width: `${bettingProgress}%` }}></div>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={100}>
                <LineChart data={multiplierHistory} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                  <Line
                    type="monotone"
                    dataKey="multiplier"
                    stroke="#a71f66 "
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                  {betAmount > 0 && userWins && (
                    <ReferenceLine
                      y={targetMultiplier}
                      stroke="#4bc0c0"
                      strokeDasharray="5 5"
                      strokeWidth={1.5}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="result-message">
          {resultMessage}
        </div>

        <JumpRopeControls
          gameActive={gameActive}
          bettingActive={bettingActive}
          betAmount={betAmount}
          handleBetChange={handleBetChange}
          placeBet={placeBet}
        />
      </div>
    </div>
  );
};

export default JumpRopeIndex;