import React, { useState } from 'react';
import Carousel from 'react-bootstrap/Carousel';
import 'react-lazy-load-image-component/src/effects/blur.css';

// import banner5 from '../../assets/img/banner/products/Daily-JackPot.png'
import Breakfast from '../../assets/img/banner/carousel/breakfast.jpg';
import App from '../../assets/img/banner/carousel/app.jpeg';
import Sharebet from '../../assets/img/banner/carousel/Sharebet.jpeg';
import MultiBet from '../../assets/img/banner/carousel/multibet.jpeg';
import Epl from '../../assets/img/banner/carousel/vuna.jpeg';
import Live from '../../assets/img/banner/carousel/live.png';
import Casino from '../../assets/img/banner/carousel/casino.png';
import Jackpot from '../../assets/img/banner/carousel/jackpot.jpg';
import MundialLeague from '../../assets/img/banner/carousel/mundial-league.jpeg';
import { Link } from 'react-router-dom';


const CarouselLoader = (props) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const onImageLoaded = () => {
        setImageLoaded(true);
    }

    return (
        <Carousel
            // controls={false}
            indicators={false}
            className='banner-imgs'>

            {/* <Carousel.Item >
                <img
                    className="d-block w-100"
                    style={{ display: imageLoaded ? 'block' : 'none' }}
                    src={Breakfast}
                    onLoad={onImageLoaded}
                    alt="breakfast"
                    effects="blur"
                />
            </Carousel.Item> */}
            <Carousel.Item >
                <img
                    className="d-block w-100"
                    style={{ display: imageLoaded ? 'block' : 'none' }}
                    src={MundialLeague}
                    onLoad={onImageLoaded}
                    alt="betmundial"
                    effects="blur"
                />
            </Carousel.Item>
            <Carousel.Item >
                <img
                    className="d-block w-100"
                    style={{ display: imageLoaded ? 'block' : 'none' }}
                    src={MultiBet}
                    onLoad={onImageLoaded}
                    alt="multibet"
                    effects="blur"
                />
            </Carousel.Item>
            <Carousel.Item >
                <img
                    className="d-block w-100"
                    style={{ display: imageLoaded ? 'block' : 'none' }}
                    src={Sharebet}
                    onLoad={onImageLoaded}
                    alt="betmundial"
                    effects="blur"
                />
            </Carousel.Item>

            <Carousel.Item >
                <img
                    className="d-block w-100"
                    style={{ display: imageLoaded ? 'block' : 'none' }}
                    src={Epl}
                    onLoad={onImageLoaded}
                    alt="betmundial"
                    effects="blur"
                />
            </Carousel.Item>

            <Carousel.Item >
                <Link to={"/live"}>
                    <img
                        className="d-block w-100"
                        style={{ display: imageLoaded ? 'block' : 'none' }}
                        src={Live}
                        onLoad={onImageLoaded}
                        alt="betmundial"
                        effects="blur"
                    />
                </Link>
            </Carousel.Item>

            <Carousel.Item >
                <Link to={"/casino"}>
                    <img
                        className="d-block w-100"
                        style={{ display: imageLoaded ? 'block' : 'none' }}
                        src={Casino}
                        onLoad={onImageLoaded}
                        alt="casino"
                        effects="blur"
                    />
                </Link>
            </Carousel.Item>

            {/* <Carousel.Item >
                <Link to={"/jackpot"}>
                    <img
                        className="d-block w-100"
                        style={{ display: imageLoaded ? 'block' : 'none' }}
                        src={Jackpot}
                        onLoad={onImageLoaded}
                        alt="betmundial"
                        effects="blur"
                    />
                </Link>
            </Carousel.Item> */}

            <Carousel.Item >
                <Link to={"/app"}>
                    <img
                        className="d-block w-100"
                        style={{ display: imageLoaded ? 'block' : 'none' }}
                        src={App}
                        onLoad={onImageLoaded}
                        alt="betmundial"
                        effects="blur"
                    />
                </Link>
            </Carousel.Item>

        </Carousel>



    )
}
export default CarouselLoader;
