import React, { useEffect, useState, useCallback } from 'react';
import Carousel from 'react-bootstrap/Carousel';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { useNavigate } from "react-router-dom";

/**
 * Carousel loading strategy (B1):
 * - First slide loads eagerly (LCP-friendly).
 * - Remaining slides load on demand (active / adjacent) via dynamic import so
 *   webpack does not force every banner into the critical path at once.
 * - Binary recompress / WebP conversion skipped on Windows (tooling); paths unchanged.
 */
const SLIDES = [
    {
        id: 'aviator-rains',
        alt: 'aviator-rains',
        link: '/casino-game/spribe/aviator',
        load: () => import('../../assets/img/banner/carousel/AviatorRains.png'),
    },
    {
        id: 'mundial-league',
        alt: 'mundial-league',
        link: '/casino-game/unicraft/mundial-league',
        load: () => import('../../assets/img/banner/carousel/mundial-league.jpeg'),
    },
    {
        id: 'deposit-bonus',
        alt: 'deposit-bonus',
        link: '/promotions#deposit-bonus',
        load: () => import('../../assets/img/banner/carousel/Deposit-Bonus.jpeg'),
    },
    {
        id: 'aviatrix',
        alt: 'aviatrix',
        link: '/casino-game/aviatrix/aviatrix',
        load: () => import('../../assets/img/banner/carousel/aviatrix.jpeg'),
    },
    {
        id: 'aviator',
        alt: 'aviator',
        link: '/casino-game/spribe/aviator',
        load: () => import('../../assets/img/banner/carousel/aviator.jpeg'),
    },
    {
        id: 'jetx',
        alt: 'jetx',
        link: '/casino-game/smartsoft/jetx',
        load: () => import('../../assets/img/banner/carousel/jetx.jpeg'),
    },
];

const useSlideSrc = (loader, enabled) => {
    const [src, setSrc] = useState(null);

    useEffect(() => {
        if (!enabled || !loader) return undefined;
        let cancelled = false;
        loader()
            .then((mod) => {
                if (!cancelled) setSrc(mod.default || mod);
            })
            .catch(() => {
                /* keep placeholder */
            });
        return () => {
            cancelled = true;
        };
    }, [loader, enabled]);

    return src;
};

const CarouselSlide = ({ slide, active, priority, onNavigate }) => {
    const enabled = priority || active;
    const src = useSlideSrc(slide.load, enabled);

    return (
        <Carousel.Item>
            {src ? (
                <img
                    className="d-block w-100"
                    src={src}
                    alt={slide.alt}
                    loading={priority ? 'eager' : 'lazy'}
                    decoding={priority ? 'sync' : 'async'}
                    fetchpriority={priority ? 'high' : 'low'}
                    onClick={() => onNavigate(slide.link)}
                />
            ) : (
                <div
                    className="d-block w-100 banner-slide-placeholder"
                    style={{ minHeight: 120, background: 'rgba(0,0,0,0.25)' }}
                    aria-hidden="true"
                />
            )}
        </Carousel.Item>
    );
};

const CarouselLoader = () => {
    const navigate = useNavigate();
    const [activeIndex, setActiveIndex] = useState(0);
    // Preload adjacent slides once the first has been shown
    const [warmed, setWarmed] = useState(false);

    useEffect(() => {
        const t = window.setTimeout(() => setWarmed(true), 1200);
        return () => window.clearTimeout(t);
    }, []);

    const linkBanner = useCallback((link) => {
        if (link) navigate(link);
    }, [navigate]);

    return (
        <Carousel
            indicators={false}
            className="banner-imgs cursor-pointer"
            activeIndex={activeIndex}
            onSelect={(idx) => setActiveIndex(idx)}
            interval={5000}
        >
            {SLIDES.map((slide, idx) => {
                const isActive = idx === activeIndex;
                const isNear = Math.abs(idx - activeIndex) <= 1;
                return (
                    <CarouselSlide
                        key={slide.id}
                        slide={slide}
                        priority={idx === 0}
                        active={isActive || isNear || warmed}
                        onNavigate={linkBanner}
                    />
                );
            })}
        </Carousel>
    );
};

export default CarouselLoader;
