import React, { useContext, useEffect, useState } from "react";
import { FaGift, FaTimes } from "react-icons/fa";
import { faShare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Context } from "../../context/store";
import { getFromLocalStorage } from "../utils/local-storage";

const BongeBonusCard = ({ advice, slipCount = 0 }) => {
  const [, dispatch] = useContext(Context);
  const [dismissed, setDismissed] = useState(false);
  const adviceSignature = `${advice?.status || ""}|${advice?.nudgeTitle || ""}|${advice?.statusBoost || ""}`;

  useEffect(() => {
    setDismissed(false);
  }, [adviceSignature]);

  const showShareModalDialog = () => {
    const loggedInUser = getFromLocalStorage("user") ?? null;
    if (!loggedInUser) {
      dispatch({ type: "SET", key: "showloginmodal", payload: true });
    } else {
      dispatch({ type: "SET", key: "showsharemodal", payload: true });
    }
  };

  const hasAdvice = Boolean(advice?.status || advice?.nudgeTitle);
  if (!hasAdvice && slipCount <= 0) {
    return null;
  }

  const statusNode =
    advice?.statusBoost && typeof advice.status === "string"
      ? advice.status.split(advice.statusBoost).reduce((nodes, part, index, parts) => {
          nodes.push(part);
          if (index < parts.length - 1) {
            nodes.push(<strong key={`boost-${index}`}>{advice.statusBoost}</strong>);
          }
          return nodes;
        }, [])
      : advice?.status;

  const showAlert = hasAdvice && !dismissed;

  return (
    <div className="bonge-bonus-block">
      {showAlert ? (
        <div className="bonge-bonus-wrap">
          <div className="bonge-bonus" role="status">
            <button
              type="button"
              className="bonge-bonus__dismiss"
              aria-label="Dismiss bonus alert"
              onClick={() => setDismissed(true)}
            >
              <FaTimes aria-hidden="true" />
            </button>
            {advice?.status ? (
              <div className="bonge-bonus__body">
                {!advice?.nudgeTitle && (
                  <FaGift className="bonge-bonus__icon" aria-hidden="true" />
                )}
                <div id="bonus-centage-advice" className="bonge-bonus__text">
                  {statusNode}
                </div>
              </div>
            ) : null}
            {advice?.nudgeTitle ? (
              <div className="bonge-bonus__nudge">
                <FaGift className="bonge-bonus__icon" aria-hidden="true" />
                <div className="bonge-bonus__nudge-copy">
                  <span className="bonge-bonus__nudge-title">{advice.nudgeTitle}</span>
                  {advice?.nudgeSub ? (
                    <span className="bonge-bonus__nudge-sub">{advice.nudgeSub}</span>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="bonge-bonus-titlebar">
        <span className="bonge-bonus-titlebar__label">Multibet ({slipCount})</span>
        {slipCount > 0 ? (
          <button
            type="button"
            className="bonge-bonus-titlebar__share"
            onClick={showShareModalDialog}
          >
            <FontAwesomeIcon icon={faShare} aria-hidden="true" />
            <span>SHARE</span>
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default BongeBonusCard;
