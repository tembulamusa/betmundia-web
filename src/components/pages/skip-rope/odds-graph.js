import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from "recharts";
import { PiPlanetBold } from "react-icons/pi";

const OddsGraph = ({ oddsHistory, currentOdds, resultMessage }) => {
  const limitedData = oddsHistory.slice(-15).map((odds, index) => ({
    time: index,
    odds
  }));

  const [playerCount, setPlayerCount] = useState(Math.floor(Math.random() * 400) + 100);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setPlayerCount(Math.floor(Math.random() * 400) + 100);
    }, 10000); // Update every 10 seconds

    return () => clearInterval(intervalId);
  }, []);

  // Get the last data point position
  const lastPoint = limitedData[limitedData.length - 1] || { time: 0, odds: 0.5 };

  return (
    <div className="relative">
      {/* Graph */}
      <ResponsiveContainer width="100%" height={200}>
        <LineChart
          data={limitedData}
          margin={{ top: 20, right: 20, bottom: 0, left: 0 }}
          key={resultMessage}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" hide />
          <YAxis domain={[1, 10]} hide={true} />
          <Tooltip
            formatter={(value) => [`${value.toFixed(2)}x`, "Multiplier"]}
            labelFormatter={() => ""}
          />
          <Line
            type="monotone"
            dataKey="odds"
            stroke="#4bc0c0"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
          {/* Custom pointer at the end of the line */}
          <ReferenceDot
            x={lastPoint.time}
            y={lastPoint.odds}
            r={0} // Hide the default dot
            shape={({ cx, cy }) => (
              <foreignObject
                x={cx - 12}
                y={cy - 12}
                width={24}
                height={24}
              >
                <div className="flex items-center justify-center">
                  <PiPlanetBold className="text-[#a71f66 ] text-xl transform -rotate-45" />
                </div>
              </foreignObject>
            )}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Below the graph */}
      <div className="odds-info-container mt-4 px-2">
        <div className="skiprope-info flex justify-between items-center text-sm text-[#456185]">
          <div>
            <p className="font-semibold">Current Odds: <span className="text-[#4bc0c0]">{currentOdds.toFixed(2)}x</span></p>
            <p className="text-xs">{resultMessage}</p>
          </div>
          <div className="random-players text-right">
            <p>{playerCount} players currently.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OddsGraph;
