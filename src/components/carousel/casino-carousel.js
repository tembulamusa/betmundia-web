import React from "react";
import { useNavigate } from "react-router-dom";
import { getFromLocalStorage } from "../utils/local-storage";
import CasinoBannerMain from "../../assets/img/backgrounds/casino_banner_main.jpeg";

const fallbackLeadingBets = [
    { id: "lb-1", player: "Nairobi Ace", game: "Aviator", stake: "KES 1,200", potential: "KES 14,400", link: "/casino/providers/spribe", requiresAuth: false },
    { id: "lb-2", player: "Coast Queen", game: "JetX", stake: "KES 850", potential: "KES 8,925", link: "/casino-game/smartsoft/jetx", requiresAuth: false },
    { id: "lb-3", player: "Turbo Ken", game: "Aviatrix", stake: "KES 1,500", potential: "KES 12,750", link: "/casino-game/aviatrix/aviatrix", requiresAuth: false },
    { id: "lb-4", player: "Lucky Vee", game: "Spaceman", stake: "KES 600", potential: "KES 6,300", link: "/casino/providers/pragmatic", requiresAuth: false },
    { id: "lb-5", player: "High Roller", game: "Mundial League", stake: "KES 2,000", potential: "KES 18,000", link: "/casino-game/unicraft/mundial-league", requiresAuth: true },
    { id: "lb-6", player: "Night Owl", game: "Live Casino", stake: "KES 900", potential: "KES 7,650", link: "/casino/categories/livegames", requiresAuth: false },
];

const CasinoCarousel = () => {
    const navigate = useNavigate();
    const user = getFromLocalStorage("user");
    const storedGames = getFromLocalStorage("casinogames");

    const leadingBets = Array.isArray(storedGames)
        ? storedGames
            .flatMap((category) => Array.isArray(category?.gameList) ? category.gameList : [])
            .filter((game) => game?.game_name && game?.provider_name)
            .slice(0, 8)
            .map((game, index) => {
                const stakes = [1200, 850, 1500, 600, 2000, 900, 700, 1750];
                const multipliers = [12, 10.5, 8.5, 9.25, 9, 8.5, 11, 7.8];
                const playerNames = ["Nairobi Ace", "Coast Queen", "Turbo Ken", "Lucky Vee", "High Roller", "Night Owl", "Bet Boss", "Swift Punter"];
                const providerSlug = game.provider_name.split(" ").join("-").toLowerCase();
                const gameSlug = game.game_name.split(" ").join("-").toLowerCase();
                const stakeValue = stakes[index % stakes.length];
                const potentialValue = Math.round(stakeValue * multipliers[index % multipliers.length]);

                return {
                    id: `game-${game.game_id || index}`,
                    player: playerNames[index % playerNames.length],
                    game: game.game_name,
                    stake: `KES ${stakeValue.toLocaleString()}`,
                    potential: `KES ${potentialValue.toLocaleString()}`,
                    link: `/casino-game/${providerSlug}/${gameSlug}`,
                    requiresAuth: false,
                };
            })
        : fallbackLeadingBets;

    const handleNavigation = (item) => {
        if (!item?.link) return;

        if (item.requiresAuth && !user) {
            navigate(`/login?next=${encodeURIComponent(item.link)}`);
        } else {
            navigate(item.link);
        }
    };

    return (
        <section
            className="casino-leading-bets-banner"
            style={{ backgroundImage: `linear-gradient(90deg, rgba(7, 13, 37, 0.92), rgba(18, 21, 48, 0.72)), url(${CasinoBannerMain})` }}
        >
            <div className="casino-leading-bets-inner">
                <div className="casino-leading-bets-label">
                    <span className="casino-leading-bets-kicker">Casino</span>
                    <span className="casino-leading-bets-title">Leading Bets</span>
                </div>

                <div className="casino-leading-bets-marquee" aria-label="Leading bets ticker">
                    <div className="casino-leading-bets-track">
                        {[...leadingBets, ...leadingBets].map((item, index) => (
                            <button
                                key={`${item.id}-${index}`}
                                type="button"
                                className="casino-leading-bet-item"
                                onClick={() => handleNavigation(item)}
                            >
                                <span className="casino-leading-bet-player">{item.player}</span>
                                <span className="casino-leading-bet-separator">•</span>
                                <span className="casino-leading-bet-game">{item.game}</span>
                                <span className="casino-leading-bet-separator">•</span>
                                <span className="casino-leading-bet-meta">Stake {item.stake}</span>
                                <span className="casino-leading-bet-separator">•</span>
                                <span className="casino-leading-bet-win">Potential {item.potential}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </section>
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