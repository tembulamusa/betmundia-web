import React from 'react';
import Carousel from 'react-bootstrap/Carousel';
import { useNavigate } from "react-router-dom";
import MundialLeague from '../../assets/img/banner/carousel/mundial-league.jpeg';
import DepositBonus from '../../assets/img/banner/carousel/Deposit-Bonus.jpeg';
import Aviator from '../../assets/img/banner/carousel/aviator.jpeg';
import Aviatrix from '../../assets/img/banner/carousel/aviatrix.jpeg';
import Jetx from '../../assets/img/banner/carousel/jetx.jpeg';
import AviatorRains from '../../assets/img/banner/carousel/AviatorRains.png';

/**
 * Homepage / live banners.
 * Carousel.Item must be direct children of Carousel — wrapping them in another
 * component breaks react-bootstrap's active-slide cloning (all slides stay
 * display:none). Keep static imports here; the parent still React.lazy()s this
 * module so banners stay off the critical boot path.
 */
const CarouselLoader = () => {
    const navigate = useNavigate();

    const linkBanner = (link) => {
        if (link) navigate(link);
    };

    return (
        <Carousel
            indicators={false}
            className="banner-imgs cursor-pointer"
            interval={5000}
        >
            <Carousel.Item>
                <img
                    className="d-block w-100"
                    src={AviatorRains}
                    alt="aviator-rains"
                    loading="eager"
                    decoding="async"
                    fetchpriority="high"
                    onClick={() => linkBanner("/casino-game/spribe/aviator")}
                />
            </Carousel.Item>
            <Carousel.Item>
                <img
                    className="d-block w-100"
                    src={MundialLeague}
                    alt="mundial-league"
                    loading="lazy"
                    decoding="async"
                    onClick={() => linkBanner("/casino-game/unicraft/mundial-league")}
                />
            </Carousel.Item>
            <Carousel.Item>
                <img
                    className="d-block w-100"
                    src={DepositBonus}
                    alt="deposit-bonus"
                    loading="lazy"
                    decoding="async"
                    onClick={() => linkBanner("/promotions#deposit-bonus")}
                />
            </Carousel.Item>
            <Carousel.Item>
                <img
                    className="d-block w-100"
                    src={Aviatrix}
                    alt="aviatrix"
                    loading="lazy"
                    decoding="async"
                    onClick={() => linkBanner("/casino-game/aviatrix/aviatrix")}
                />
            </Carousel.Item>
            <Carousel.Item>
                <img
                    className="d-block w-100"
                    src={Aviator}
                    alt="aviator"
                    loading="lazy"
                    decoding="async"
                    onClick={() => linkBanner("/casino-game/spribe/aviator")}
                />
            </Carousel.Item>
            <Carousel.Item>
                <img
                    className="d-block w-100"
                    src={Jetx}
                    alt="jetx"
                    loading="lazy"
                    decoding="async"
                    onClick={() => linkBanner("/casino-game/smartsoft/jetx")}
                />
            </Carousel.Item>
        </Carousel>
    );
};

export default CarouselLoader;
