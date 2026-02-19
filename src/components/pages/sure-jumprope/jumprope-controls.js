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

const JumpRopeControls = ({
  bettingActive,
  betAmount,
  handleBetChange,
  placeBet,
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
    <div className="jumprope-controls">
      <div className="input-group">
        <CiCircleMinus
          className="icon"
          onClick={() => handleBetIncrement(-5)}
          disabled={!bettingActive}
        />
        <input
          type="number"
          value={betAmount}
          onChange={handleBetChange}
          disabled={!bettingActive}
          placeholder="Enter bet amount"
          className="jumprope-bet-input"
          min="5"
        />
        <CiCirclePlus
          className="icon"
          onClick={() => handleBetIncrement(5)}
          disabled={!bettingActive}
        />
      </div>

      <button
        onClick={placeBet}
        className={`jumprope-btn ${bettingActive ? "" : "disabled"}`}
        disabled={!bettingActive}
      >
        {bettingActive ? "Place Bet" : "Betting Closed"}
      </button>

      <button className="bet-display-btn" disabled>
        Your Bet: ${betAmount || 0}
      </button>

      <button className="custom-instructions-btn" onClick={handleDialogOpen}>
        <CiCircleMore className="icon" />
        How to Play
      </button>

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
          How to Play Jump Rope
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
              <li>Place your bet during the betting period (5 seconds)</li>
              <li>Watch the game round (12 seconds) to see if you win</li>
              <li>Winnings are automatically credited</li>
              <li>The game continues automatically to the next round</li>
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

export default JumpRopeControls;