import React, { useState, useEffect, useRef, useCallback } from "react";
import { Modal, Button } from "react-bootstrap";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { useNavigate } from "react-router-dom";
import { getFromLocalStorage } from "./utils/local-storage";
import { Link } from "react-router-dom";

import AviatorImg from "../assets/img/popups/aviator.jpeg";
import AviatrixImg from "../assets/img/popups/aviatrix.jpeg";
import JetXImg from "../assets/img/popups/jetx.jpeg";
import DepositBonus from "../assets/img/popups/deposit_bonus.jpg";
import DailyJackpot from "../assets/img/popups/daily_jackpot.jpeg";

const images = [
    { src: AviatorImg, link: "/casino-game/aviator/aviator" },
    { src: AviatrixImg, link: "/casino-game/aviatrix/aviatrix/sure-popular" },
    { src: JetXImg, link: "/casino-game/smartsoft/jetx/sure-popular" },
    { src: DepositBonus, link: "/deposit" },
    { src: DailyJackpot, link: "/jackpots" },
];

const DISMISS_KEY = "popupBannerDismissed";
const IDLE_MS = 10_000;
const TAB_RETURN_STAY_MS = 800;

const ACTIVITY_EVENTS = [
    "mousemove",
    "mousedown",
    "keydown",
    "scroll",
    "touchstart",
    "wheel",
    "pointerdown",
];

const PopupBanner = () => {
    const navigate = useNavigate();
    const [show, setShow] = useState(false);
    const [randomImage, setRandomImage] = useState(null);

    const user = getFromLocalStorage("user");

    const idleTimerRef = useRef(null);
    const tabStayTimerRef = useRef(null);
    const shownAtRef = useRef(null);
    const hasShownRef = useRef(false);
    const wasHiddenRef = useRef(false);
    const showRef = useRef(false);

    const isDismissed = useCallback(
        () => sessionStorage.getItem(DISMISS_KEY) === "true",
        []
    );

    const clearIdleTimer = useCallback(() => {
        if (idleTimerRef.current) {
            clearTimeout(idleTimerRef.current);
            idleTimerRef.current = null;
        }
    }, []);

    const clearTabStayTimer = useCallback(() => {
        if (tabStayTimerRef.current) {
            clearTimeout(tabStayTimerRef.current);
            tabStayTimerRef.current = null;
        }
    }, []);

    const dismissPopup = useCallback(() => {
        sessionStorage.setItem(DISMISS_KEY, "true");
        setShow(false);
        showRef.current = false;
        clearIdleTimer();
        clearTabStayTimer();
    }, [clearIdleTimer, clearTabStayTimer]);

    const tryShowPopup = useCallback(() => {
        if (isDismissed() || hasShownRef.current || showRef.current) return;
        if (typeof document !== "undefined" && document.visibilityState !== "visible") {
            return;
        }

        const selectedImage = images[Math.floor(Math.random() * images.length)];
        setRandomImage(selectedImage);
        hasShownRef.current = true;
        shownAtRef.current = Date.now();
        showRef.current = true;
        setShow(true);
        clearIdleTimer();
        clearTabStayTimer();
    }, [clearIdleTimer, clearTabStayTimer, isDismissed]);

    const scheduleIdlePopup = useCallback(() => {
        if (isDismissed() || hasShownRef.current || showRef.current) return;
        clearIdleTimer();
        idleTimerRef.current = setTimeout(() => {
            tryShowPopup();
        }, IDLE_MS);
    }, [clearIdleTimer, isDismissed, tryShowPopup]);

    const handleClose = useCallback(() => {
        // Close (including a quick dismiss under ~2s) suppresses for this session.
        dismissPopup();
    }, [dismissPopup]);

    useEffect(() => {
        showRef.current = show;
    }, [show]);

    useEffect(() => {
        if (isDismissed()) return undefined;

        const onActivity = () => {
            if (hasShownRef.current || showRef.current || isDismissed()) return;
            scheduleIdlePopup();
        };

        const onVisibility = () => {
            if (isDismissed() || hasShownRef.current || showRef.current) {
                clearTabStayTimer();
                return;
            }

            if (document.visibilityState === "hidden") {
                wasHiddenRef.current = true;
                clearIdleTimer();
                clearTabStayTimer();
                return;
            }

            // Returned to this tab after having left it — show only if they stay.
            if (wasHiddenRef.current && document.visibilityState === "visible") {
                clearTabStayTimer();
                tabStayTimerRef.current = setTimeout(() => {
                    if (
                        document.visibilityState === "visible" &&
                        !isDismissed() &&
                        !hasShownRef.current
                    ) {
                        tryShowPopup();
                    }
                }, TAB_RETURN_STAY_MS);
            }
        };

        scheduleIdlePopup();

        ACTIVITY_EVENTS.forEach((evt) => {
            window.addEventListener(evt, onActivity, { passive: true });
        });
        document.addEventListener("visibilitychange", onVisibility);

        return () => {
            clearIdleTimer();
            clearTabStayTimer();
            ACTIVITY_EVENTS.forEach((evt) => {
                window.removeEventListener(evt, onActivity);
            });
            document.removeEventListener("visibilitychange", onVisibility);
        };
    }, [
        clearIdleTimer,
        clearTabStayTimer,
        isDismissed,
        scheduleIdlePopup,
        tryShowPopup,
    ]);

    const handlePlayNow = () => {
        dismissPopup();

        if (!randomImage) return;

        if (!user) {
            navigate(`/login?next=${encodeURIComponent(randomImage.link)}`);
        } else {
            navigate(randomImage.link, { state: { game: randomImage } });
        }
    };

    return (
        <>
            {randomImage && (
                <Modal
                    show={show}
                    onHide={handleClose}
                    dialogClassName="popup-banner-modal"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                    backdropClassName="transparent-backdrop"
                >
                    <button
                        className="floating-x-button"
                        onClick={handleClose}
                        type="button"
                        aria-label="Close promotion"
                    >
                        &#10005;
                    </button>

                    <Modal.Body className="p-0 d-flex flex-column align-items-center">
                        <Link to={randomImage.link} onClick={dismissPopup}>
                            <LazyLoadImage
                                className="popup-responsive-image"
                                src={randomImage.src}
                                alt="Popup Promotion"
                            />
                        </Link>

                        <div className="buttons-container">
                            <Button
                                onClick={handleClose}
                                className="no-thanks-button text-xl btn-default !bg-transparent border-1 border-white"
                            >
                                Close
                            </Button>
                            <Button
                                onClick={handlePlayNow}
                                className="play-now-button text-xl"
                            >
                                Play
                            </Button>
                        </div>
                    </Modal.Body>
                </Modal>
            )}
        </>
    );
};

export default PopupBanner;
