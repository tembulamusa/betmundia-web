export const ANDROID_PLAY_STORE_URL =
    'https://play.google.com/store/apps/details?id=com.betmundial';

export const IOS_APP_STORE_URL =
    'https://api.betmundial.com/v2/sports/app/apk/download?platform=ios';

export const detectMobileOS = () => {
    if (typeof navigator === 'undefined') {
        return null;
    }

    const ua = navigator.userAgent || navigator.vendor || window.opera || '';

    if (/android/i.test(ua)) {
        return 'android';
    }

    if (
        /iPad|iPhone|iPod/i.test(ua) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    ) {
        return 'ios';
    }

    return null;
};

export const getAppDownloadTarget = () => {
    const os = detectMobileOS();

    if (os === 'android') {
        return {
            href: ANDROID_PLAY_STORE_URL,
            external: true,
        };
    }

    if (os === 'ios') {
        return {
            href: IOS_APP_STORE_URL,
            external: true,
        };
    }

    return {
        href: '/app',
        external: false,
    };
};
