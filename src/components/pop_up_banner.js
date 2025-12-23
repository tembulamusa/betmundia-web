import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { useNavigate } from "react-router-dom";
import { getFromLocalStorage } from "./utils/local-storage";
import { Link } from 'react-router-dom';

import AviatorImg from '../assets/img/popups/aviator.jpg';
import AviatrixImg from '../assets/img/popups/aviatrix.jpg';
import JetXImg from '../assets/img/popups/jetx.jpg';
import VirtualLeagueImg from '../assets/img/popups/mundial-league.jpg';
import SpacemanImg from '../assets/img/popups/spaceman.jpg';

const images = [
    // { src: AviatorImg, link: "/casino-game/aviator/aviator" },
    // { src: AviatrixImg, link: "/casino-game/aviatrix/aviatrix/sure-popular" },
    { src: JetXImg, link: "/casino-game/smartsoft/jetx/sure-popular" },
    { src: VirtualLeagueImg, link: "/casino-game/eurovirtuals/virtual-league" },
    { src: SpacemanImg, link: "/casino-game/pragmatic/spaceman/sure-popular" },
];



const PopupBanner = () => {
    const navigate = useNavigate();
    const [show, setShow] = useState(false);
    const [randomImage, setRandomImage] = useState(null);

    const user = getFromLocalStorage("user");

    useEffect(() => {
        const hasSeenPopup = sessionStorage.getItem("hasSeenPopup");

        if (!hasSeenPopup) {
            const selectedImage = images[Math.floor(Math.random() * images.length)];
            setRandomImage(selectedImage);
            setShow(true);
            sessionStorage.setItem("hasSeenPopup", "true");
        }
    }, []);

    const handlePlayNow = () => {
        setShow(false);

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
                    onHide={() => setShow(false)}
                    dialogClassName="popup-banner-modal"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                    backdropClassName="transparent-backdrop"
                >
                    {/* Floating X Button */}
                    <button
                        className="floating-x-button"
                        onClick={() => setShow(false)}
                    >
                        &#10005; {/* Unicode for X symbol */}
                    </button>

                    <Modal.Body className="p-0 d-flex flex-column align-items-center">
                        {/* Image */}
                        <Link to={randomImage.link}>
                            <LazyLoadImage
                                className="popup-responsive-image"
                                src={randomImage.src}
                                alt="Popup Promotion"
                            />
                        </Link>

                        <div className="buttons-container">
                            <Button
                                onClick={() => setShow(false)}
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
