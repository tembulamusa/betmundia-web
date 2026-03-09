import React, { useState } from "react";
import Carousel from "react-bootstrap/Carousel";
import { useNavigate } from "react-router-dom";
import { getFromLocalStorage } from "../utils/local-storage";

import Two from "../../assets/img/casino/carousel/2.jpg";
import Nine from "../../assets/img/casino/carousel/9.jpg";
import Ten from "../../assets/img/casino/carousel/10.jpg";
import Fifteen from "../../assets/img/casino/carousel/15.png";
import Sixteen from "../../assets/img/casino/carousel/16.jpg";
import MundiaLeague from "../../assets/img/casino/carousel/mundial-league.jpg";
import LiveCasino from "../../assets/img/casino/carousel/casino-live.jpeg";
import CasinoOffers from "../../assets/img/casino/carousel/casino-offers.jpeg";
import CasinoLive from "../../assets/img/casino/carousel/live-casino.jpeg";

const banners = [
    // { src: MundiaLeague, link: "/casino-game/unicraft/mundial-league", requiresAuth: true },
    { src: LiveCasino, link: "/casino-game/unicraft/mundial-league", requiresAuth: false },
    { src: CasinoOffers, link: null, requiresAuth: false },
    { src: CasinoLive, link: null, requiresAuth: false },
    // { src: Sixteen, link: null, requiresAuth: false }, 
];

const CasinoCarousel = () => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const navigate = useNavigate();
    const user = getFromLocalStorage("user");

    const handleNavigation = (banner) => {
        if (!banner.link) return; // Skip if there is no link
        
        if (banner.requiresAuth && !user) {
            navigate(`/login?next=${encodeURIComponent(banner.link)}`);
        } else {
            navigate(banner.link);
        }
    };

    return (
        <Carousel indicators={false} className="casino banner-imgs">
            {banners.map((banner, index) => (
                <Carousel.Item key={index}>
                    <img
                        className="d-block w-100"
                        style={{ display: imageLoaded ? "block" : "none" }}
                        src={banner.src}
                        onLoad={() => setImageLoaded(true)}
                        alt="betmundial"
                        effects="blur"
                        onClick={() => handleNavigation(banner)}
                    />
                </Carousel.Item>
            ))}
        </Carousel>
    );
};

export default React.memo(CasinoCarousel);



// import React, { useState } from "react";
// import Carousel from 'react-bootstrap/Carousel';

// import Breakfast from '../../assets/img/banner/App.png';
// import Sharebet from '../../assets/img/banner/Sharebet.png';
// // import Tick from '../../assets/img/banner/carousel/Tick.png';
// import Epl from '../../assets/img/banner/EPL.png';

// import One from '../../assets/img/casino/carousel/1.jpg';
// import Two from '../../assets/img/casino/carousel/2.png';
// import Three from '../../assets/img/casino/carousel/3.png';
// import Four from '../../assets/img/casino/carousel/4.png';
// // import Five from  '../../assets/img/casino/carousel/5.jpg';
// import Six from '../../assets/img/casino/carousel/6.png';
// import Seven from '../../assets/img/casino/carousel/7.jpg';
// import Eight from '../../assets/img/casino/carousel/8.jpg';
// import Nine from '../../assets/img/casino/carousel/9.png';
// import Ten from '../../assets/img/casino/carousel/10.png';
// import Eleven from '../../assets/img/casino/carousel/11.png';
// import Twelve from '../../assets/img/casino/carousel/12.jpg';
// import Thirteen from '../../assets/img/casino/carousel/13.jpg';
// import Fourteen from '../../assets/img/casino/carousel/14.png';
// import Fifteen from '../../assets/img/casino/carousel/15.png';
// import Sixteen from '../../assets/img/casino/carousel/16.jpg';
// import { Link } from "react-router-dom";
// // import Intro from  '../../assets/img/casino/carousel/intro.png';
// // import Tick from  '../../assets/img/casino/carousel/Tick.png';


// const CasinoCarousel = (props) => {
//     const [imageLoaded, setImageLoaded] = useState(false);
//     const onImageLoaded = () => {
//         setImageLoaded(true);
//     }

//     return (
//         <Carousel
//             // controls={false}
//             indicators={false}
//             className='casino banner-imgs'>

//             <Carousel.Item >
//                 <Link to={"/casino-game/aviator/aviator/sure-popular"}>
//                     <img
//                         className="d-block w-100"
//                         style={{ display: imageLoaded ? 'block' : 'none' }}
//                         src={Fifteen}
//                         onLoad={onImageLoaded}
//                         alt="betmundial"
//                         effects="blur"
//                     />
//                 </Link>
//             </Carousel.Item>

//             {/* <Carousel.Item >
//                 <img
//                     className="d-block w-100"
//                     style={{display: imageLoaded ? 'block' : 'none'}}
//                     src={AviatorBanner}
//                     onLoad={onImageLoaded}
//                     alt="betmundial"
//                     effects="blur"
//                 />
//             </Carousel.Item>
//             */}

//             {/* <Carousel.Item >
//                 <img
//                     className="d-block w-100"
//                     style={{display: imageLoaded ? 'block' : 'none'}}
//                     src={One}
//                     onLoad={onImageLoaded}
//                     alt="betmundial"
//                     effects="blur"
//                 />
//             </Carousel.Item> */}
//             <Carousel.Item >
//                 <Link to={"/casino-game/pragmatic/spaceman/sure-popular"}>
//                     <img
//                         className="d-block w-100"
//                         style={{display: imageLoaded ? 'block' : 'none'}}
//                         src={Two}
//                         onLoad={onImageLoaded}
//                         alt="betmundial"
//                         effects="blur"
//                     />
//                 </Link>
//             </Carousel.Item>
//             {/* <Carousel.Item >
//                 <img
//                     className="d-block w-100"
//                     style={{display: imageLoaded ? 'block' : 'none'}}
//                     src={Three}
//                     onLoad={onImageLoaded}
//                     alt="betmundial"
//                     effects="blur"
//                 />
//             </Carousel.Item> 
//             <Carousel.Item >
//                 <Link to={"/casino-game/stp/comet"}>
//                     <img
//                         className="d-block w-100"
//                         style={{ display: imageLoaded ? 'block' : 'none' }}
//                         src={Four}
//                         onLoad={onImageLoaded}
//                         alt="betmundial"
//                         effects="blur"
//                     />
//                 </Link>
//             </Carousel.Item>*/}

//             {/* <Carousel.Item >
//                 <img
//                     className="d-block w-100"
//                     style={{display: imageLoaded ? 'block' : 'none'}}
//                     src={Five}
//                     onLoad={onImageLoaded}
//                     alt="betmundial"
//                     effects="blur"
//                 />
//             </Carousel.Item> */}

//             {/* <Carousel.Item >
//                 <img
//                     className="d-block w-100"
//                     style={{display: imageLoaded ? 'block' : 'none'}}
//                     src={Six}
//                     onLoad={onImageLoaded}
//                     alt="betmundial"
//                     effects="blur"
//                 />
//             </Carousel.Item>
            
//             <Carousel.Item >
//                 <img
//                     className="d-block w-100"
//                     style={{display: imageLoaded ? 'block' : 'none'}}
//                     src={Seven}
//                     onLoad={onImageLoaded}
//                     alt="betmundial"
//                     effects="blur"
//                 />
//             </Carousel.Item> */}

//             {/* <Carousel.Item >
//                 <img
//                     className="d-block w-100"
//                     style={{display: imageLoaded ? 'block' : 'none'}}
//                     src={Eight}
//                     onLoad={onImageLoaded}
//                     alt="betmundial"
//                     effects="blur"
//                 />
//             </Carousel.Item> */}

//             <Carousel.Item >
//                 <Link to={"/casino-game/smartsoft/jetx/sure-popular"}>
//                     <img
//                         className="d-block w-100"
//                         style={{ display: imageLoaded ? 'block' : 'none' }}
//                         src={Nine}
//                         onLoad={onImageLoaded}
//                         alt="betmundial"
//                         effects="blur"
//                     />
//                 </Link>
//             </Carousel.Item>

//             <Carousel.Item >
//                 <Link to={"/casino-game/aviatrix/aviatrix/sure-popular"}>
//                     <img
//                         className="d-block w-100"
//                         style={{ display: imageLoaded ? 'block' : 'none' }}
//                         src={Ten}
//                         onLoad={onImageLoaded}
//                         alt="betmundial"
//                         effects="blur"
//                     />
//                 </Link>
//             </Carousel.Item>

//             <Carousel.Item >
//                 <Link to={"/surecoin"}>
//                     <img
//                         className="d-block w-100"
//                         style={{ display: imageLoaded ? 'block' : 'none' }}
//                         src={Eleven}
//                         onLoad={onImageLoaded}
//                         alt="betmundial"
//                         effects="blur"
//                     />
//                 </Link>
//             </Carousel.Item>

//             {/* <Carousel.Item >
//                 <img
//                     className="d-block w-100"
//                     style={{display: imageLoaded ? 'block' : 'none'}}
//                     src={Twelve}
//                     onLoad={onImageLoaded}
//                     alt="betmundial"
//                     effects="blur"
//                 />
//             </Carousel.Item> */}

//             <Carousel.Item >
//                 <Link to={"/casino"}>
//                     <img
//                         className="d-block w-100"
//                         style={{ display: imageLoaded ? 'block' : 'none' }}
//                         src={Thirteen}
//                         onLoad={onImageLoaded}
//                         alt="betmundial"
//                         effects="blur"
//                     />
//                 </Link>
//             </Carousel.Item>

//             <Carousel.Item >
//                 <Link to={"/casino-game/eurovirtuals/virtual-league"}>
//                     <img
//                         className="d-block w-100"
//                         style={{ display: imageLoaded ? 'block' : 'none' }}
//                         src={Fourteen}
//                         onLoad={onImageLoaded}
//                         alt="betmundial"
//                         effects="blur"
//                     />
//                 </Link>
//             </Carousel.Item>


//             <Carousel.Item >
//                 <img
//                     className="d-block w-100"
//                     style={{ display: imageLoaded ? 'block' : 'none' }}
//                     src={Sixteen}
//                     onLoad={onImageLoaded}
//                     alt="betmundial"
//                     effects="blur"
//                 />
//             </Carousel.Item>
//         </Carousel>



//     )
// }

// export default React.memo(CasinoCarousel)