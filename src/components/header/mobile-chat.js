import React, { useState, useEffect, useRef } from 'react';
import '../../assets/css/mobile-chat.css';

const MOBILE_MAX_WIDTH = 768;
const isMobileViewport = () =>
    typeof window !== 'undefined' &&
    window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH}px)`).matches;

const MobileChat = () => {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const iframeSrc = 'https://tawk.to/chat/69aeee647f65b51c3392421d/1jj9l6f39?layout=modern';
    const scriptLoaded = useRef(false);

    useEffect(() => {
        // inject Tawk embed script once
        if (typeof window === 'undefined') return;
        if (scriptLoaded.current) return;
        if (window && window.Tawk_API) {
            scriptLoaded.current = true;
            return;
        }

        const s1 = document.createElement('script');
        s1.async = true;
        s1.src = 'https://embed.tawk.to/69aeee647f65b51c3392421d/1jj9l6f39';
        s1.charset = 'UTF-8';
        s1.setAttribute('crossorigin', '*');
        s1.onload = () => {
            scriptLoaded.current = true;
        };
        const s0 = document.getElementsByTagName('script')[0];
        if (s0 && s0.parentNode) s0.parentNode.insertBefore(s1, s0);
    }, []);

    useEffect(() => {
        const hideTawkOnMobile = () => {
            if (!isMobileViewport()) return;
            try {
                if (window?.Tawk_API?.hideWidget) {
                    window.Tawk_API.hideWidget();
                }
            } catch (err) {
                console.warn('Tawk API hideWidget failed', err);
            }
        };

        hideTawkOnMobile();

        const tawkApi = window.Tawk_API || {};
        const previousOnLoad = tawkApi.onLoad;
        window.Tawk_API = tawkApi;
        tawkApi.onLoad = function onTawkLoad() {
            if (typeof previousOnLoad === 'function') {
                previousOnLoad();
            }
            hideTawkOnMobile();
        };
    }, []);

    useEffect(() => {
        // When modal opens we prefer the contained iframe, so hide the global Tawk widget
        if (!open) return;
        try {
            if (window && window.Tawk_API && typeof window.Tawk_API.hideWidget === 'function') {
                window.Tawk_API.hideWidget();
            }
        } catch (err) {
            console.warn('Tawk API hideWidget failed', err);
        }
    }, [open]);

    // prevent body scroll while modal open and preserve scroll position
    useEffect(() => {
        if (typeof document === 'undefined') return;
        let scrollY = 0;
        if (open) {
            scrollY = window.scrollY || window.pageYOffset;
            document.body.dataset.mobileChatScroll = String(scrollY);
            document.body.classList.add('mobile-chat-open');
            // lock body in place
            document.body.style.top = `-${scrollY}px`;
            // also hide global widget if present (defensive)
            try {
                if (window && window.Tawk_API && typeof window.Tawk_API.hideWidget === 'function') {
                    window.Tawk_API.hideWidget();
                }
            } catch (err) {
                console.warn('Tawk API hideWidget failed', err);
            }
        } else {
            const stored = document.body.dataset.mobileChatScroll;
            document.body.classList.remove('mobile-chat-open');
            document.body.style.top = '';
            // restore global widget when closing (desktop only; mobile uses header chat)
            if (!isMobileViewport()) {
                try {
                    if (window && window.Tawk_API && typeof window.Tawk_API.showWidget === 'function') {
                        window.Tawk_API.showWidget();
                    }
                } catch (err) {
                    console.warn('Tawk API showWidget failed', err);
                }
            }
            if (stored) {
                const y = parseInt(stored, 10) || 0;
                window.scrollTo(0, y);
                delete document.body.dataset.mobileChatScroll;
            }
        }
        return () => {
            document.body.classList.remove('mobile-chat-open');
            document.body.style.top = '';
            if (!isMobileViewport()) {
                try {
                    if (window && window.Tawk_API && typeof window.Tawk_API.showWidget === 'function') {
                        window.Tawk_API.showWidget();
                    }
                } catch (err) {
                    console.warn('Tawk API showWidget failed', err);
                }
            }
        };
    }, [open]);

    return (
        <>
            {/* inline header button (appears next to search in header on mobile) */}
            <button className="mobile-chat-button mobile-chat-button--inline" aria-label="Open chat" onClick={() => { setIsLoading(true); setOpen(true); }}>
                Chat
            </button>

            {open && (
                <div className="mobile-chat-modal" role="dialog" aria-modal="true">
                    <div className="mobile-chat-modal__inner">
                        <button
                            className="mobile-chat-modal__close"
                            aria-label="Close chat"
                            onClick={() => setOpen(false)}
                        >
                            ×
                        </button>
                        {/* If Tawk script is loaded, open the widget; otherwise show a fallback iframe link */}
                        <div style={{ width: '100%', height: '100%' }}>
                            {/* Render the Tawk chat inside an iframe so it stays contained in the modal */}
                            <div id="tawk-fallback" style={{ width: '100%', height: '100%', position: 'relative' }}>
                                {isLoading && (
                                    <div className="mobile-chat-loader" role="status" aria-live="polite">
                                        <div className="mobile-chat-spinner" aria-hidden="true" />
                                        <div className="mobile-chat-loader-text">Loading chat...</div>
                                    </div>
                                )}
                                <iframe
                                    title="Support Chat"
                                    src={iframeSrc}
                                    frameBorder="0"
                                    className="mobile-chat-iframe"
                                    allow="microphone;camera;geolocation;autoplay;encrypted-media"
                                    allowFullScreen
                                    onLoad={() => setIsLoading(false)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default MobileChat;
