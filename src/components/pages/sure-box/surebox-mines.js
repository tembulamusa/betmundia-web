import '../../../assets/css/surebox.css';
import React, { useState } from "react";
import { FaBolt, FaQuestion, FaMinus, FaPlus, FaMusic, FaCompass } from "react-icons/fa";
import { IoIosFlash } from "react-icons/io";

const SureboxMines = () => {
  const [gridState, setGridState] = useState(Array(25).fill(false));
  const [betAmount, setBetAmount] = useState(10);

  // Toggle grid box state
  const toggleBox = (index) => {
    const newGridState = [...gridState];
    newGridState[index] = !newGridState[index];
    setGridState(newGridState);
  };

  return (
    <div className="mines-wrapper bg-black min-h-screen text-white flex flex-col items-center justify-center">
      {/* Header Section */}
      <div className="top-section fixed top-0 left-0 w-full flex items-center justify-between px-4 py-2 bg-gray-900 z-50">
        <h1 className="font-bold text-lg">Surebox Mines</h1>
        <div className="icons flex items-center space-x-4">
          <FaMusic className="cursor-pointer text-xl" />
          <IoIosFlash className="cursor-pointer text-xl" />
          <FaCompass className="cursor-pointer text-xl" />
        </div>
      </div>

      {/* Game Section */}
      <div className="game-area flex flex-col lg:flex-row items-center gap-8 mt-16">
        {/* Grid */}
        <div className="grid-wrapper grid grid-cols-5 gap-4">
          {gridState.map((isOpened, index) => (
            <div
              key={index}
              onClick={() => toggleBox(index)}
              className={`game-item w-16 h-16 rounded-md flex items-center justify-center border ${
                isOpened ? "bg-green-600 border-green-800" : "bg-gray-700 border-gray-800"
              }`}
            >
              {isOpened ? (
                <FaBolt className="text-white text-2xl" />
              ) : (
                <FaQuestion className="text-gray-400 text-2xl" />
              )}
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="controls bg-gray-800 p-4 rounded-lg w-full max-w-sm">
          <div className="control-header flex justify-between items-center mb-4">
            <p className="text-lg font-semibold">Multiplier: <span className="text-yellow-400">x1.81</span></p>
            <p>Possible Payout: <span className="text-green-400">$12.67</span></p>
          </div>

          {/* Bet Input and Controls */}
          <div className="bet-controls flex items-center justify-between">
            <FaMinus
              onClick={() => setBetAmount(Math.max(betAmount - 1, 1))}
              className="cursor-pointer text-2xl text-white"
            />
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(Math.max(parseInt(e.target.value) || 1, 1))}
              className="bg-gray-700 text-white text-center rounded-md w-20 p-2"
            />
            <FaPlus
              onClick={() => setBetAmount(betAmount + 1)}
              className="cursor-pointer text-2xl text-white"
            />
          </div>

          {/* Place Bet Button */}
          <button className="mt-4 w-full bg-green-600 text-white font-bold py-2 rounded-md">
            Place Bet
          </button>
        </div>
      </div>
    </div>
  );
};

export default SureboxMines;
