import React, { useState } from "react";
import {
  CiCircleMinus,
  CiCircleMore,
  CiCirclePlus,
  CiCircleRemove,
} from "react-icons/ci";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";

const SkipRopeControls = ({
  gameActive,
  betAmount,
  cashoutAvailable,
  handleBetChange,
  startGame,
  cashout,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [open, setOpen] = useState(false);

  const handleDialogOpen = () => setOpen(true);
  const handleDialogClose = () => setOpen(false);

  const handleBetIncrement = (increment) => {
    const newBet = Math.max(5, (betAmount || 0) + increment);
    handleBetChange({ target: { value: newBet } });
  };

  return (
    <div className="skiprope-controls">
      <div className="input-group">
        <CiCircleMinus
          className="icon"
          onClick={() => handleBetIncrement(-5)}
        />
        <input
          type="number"
          value={betAmount}
          onChange={handleBetChange}
          disabled={gameActive}
          placeholder="Enter bet amount"
          className="skiprope-bet-input"
          min="5"
        />
        <CiCirclePlus className="icon" onClick={() => handleBetIncrement(5)} />
      </div>
      {!gameActive ? (
        <button onClick={startGame} className="skiprope-btn">
          Start Game
        </button>
      ) : (
        <button
          onClick={cashout}
          className={`skiprope-btn ${cashoutAvailable ? "" : "disabled"}`}
          disabled={!cashoutAvailable}
        >
          Cashout
        </button>
      )}
      <button className="bet-display-btn" disabled>
        Your Bet: KES {betAmount || 0}
      </button>
      <button className="custom-instructions-btn" onClick={handleDialogOpen}>
        <CiCircleMore className="icon" />
        More
      </button>


      {/* Game Instructions Dialog */}
      <Dialog
        fullScreen={fullScreen}
        maxWidth="sm"
        open={open}
        onClose={handleDialogClose}
        aria-labelledby="game-instructions-title"
        PaperProps={{
          sx: {
            backgroundColor: "#1e1e38",
            color: "#fff",
          },
        }}
      >
        <DialogTitle id="game-instructions-title">
          Game Instructions
          <IconButton
            aria-label="close"
            onClick={handleDialogClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: theme.palette.grey[500],
            }}
          >
            <CiCircleRemove className="icon" />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "#fff" }}>
            <ul style={{ paddingLeft: "1rem", listStyleType: "disc", color: "#fff" }}>
              <li>Crash! This is a crash game where the multiplier will continuously rise.</li>
              <li>It could possibly reach x600 times the money!</li>
              <li>Make sure to cash out before the game round crashes to collect your winnings.</li>
              <li>The longer you wait, the greater the multiplier but also the risk of a crash.</li>
              <li>Good luck!</li>
            </ul>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} sx={{ color: "#a71f66 " }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default SkipRopeControls;
