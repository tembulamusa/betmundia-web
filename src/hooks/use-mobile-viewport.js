import { useEffect, useState } from 'react';

export const MOBILE_MAX_WIDTH = 1199.98;

export const isMobileViewport = () =>
    typeof window !== 'undefined' &&
    window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH}px)`).matches;

const useMobileViewport = () => {
    const [isMobile, setIsMobile] = useState(isMobileViewport);

    useEffect(() => {
        const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH}px)`);
        const handleChange = () => setIsMobile(mediaQuery.matches);

        handleChange();
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    return isMobile;
};

export default useMobileViewport;
