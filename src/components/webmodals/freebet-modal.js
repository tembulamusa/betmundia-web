import React, { useContext, useEffect, useRef } from "react";
import { Modal } from "react-bootstrap";
import { FaGift } from "react-icons/fa";
import { Context } from "../../context/store";
import FreeBet from "../highlights/free-bet";
import "../../assets/css/freebet-modal.css";

const SEEN_FLAG = "freebetModalSeenFor";

const readFlag = () => {
    try {
        return window.sessionStorage.getItem(SEEN_FLAG);
    } catch (e) {
        return null;
    }
};

const writeFlag = (value) => {
    try {
        if (value === null) {
            window.sessionStorage.removeItem(SEEN_FLAG);
        } else {
            window.sessionStorage.setItem(SEEN_FLAG, String(value));
        }
    } catch (e) {
        // storage unavailable: the modal simply may re-open on next load
    }
};

/**
 * Free bet popup. Opens automatically once per login when the user has a
 * free bet, and on demand through the header notice (context key
 * `showfreebetmodal`).
 */
const FreeBetModal = ({ user }) => {
    const [state, dispatch] = useContext(Context);
    const closeTimer = useRef(null);
    const show = state?.showfreebetmodal === true;
    const hasFreebet = Boolean(user?.token) && Number(user?.has_freebet) === 1;
    const profileId = user?.profile_id;

    const close = () => dispatch({ type: "SET", key: "showfreebetmodal", payload: false });

    // Pop once per login session when a free bet is available.
    useEffect(() => {
        if (!user) {
            writeFlag(null);
            return;
        }
        if (hasFreebet && readFlag() !== String(profileId)) {
            writeFlag(profileId);
            dispatch({ type: "SET", key: "showfreebetmodal", payload: true });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [Boolean(user), hasFreebet, profileId]);

    // Close shortly after the free bet is placed.
    useEffect(() => {
        const onPlaced = () => {
            clearTimeout(closeTimer.current);
            closeTimer.current = setTimeout(close, 2500);
        };
        window.addEventListener("freebet:placed", onPlaced);
        return () => {
            window.removeEventListener("freebet:placed", onPlaced);
            clearTimeout(closeTimer.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!user) {
        return null;
    }

    return (
        <Modal
            show={show}
            onHide={close}
            centered
            dialogClassName="freebet-modal"
            contentClassName="freebet-modal__content"
        >
            <Modal.Header closeButton closeVariant="white">
                <Modal.Title>
                    <span className="freebet-modal__title-icon" aria-hidden="true"><FaGift /></span>
                    Your Free Bet
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p className="freebet-modal__intro">
                    Pick an outcome below and place your free bet.
                </p>
                <FreeBet inModal />
            </Modal.Body>
        </Modal>
    );
};

export default React.memo(FreeBetModal);
