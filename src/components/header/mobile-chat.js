import React, { useState, useEffect, useRef } from 'react';
import '../../assets/css/mobile-chat.css';
import { callTawk, ensureTawkScript } from '../utils/tawk-safe';

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
        if (typeof window === 'undefined') return;
        if (scriptLoaded.current) return;
        ensureTawkScript();
        scriptLoaded.current = true;
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const hideTawkOnMobile = () => {
            if (!isMobileViewport()) return;
            callTawk('hideWidget');
        };

        hideTawkOnMobile();

        try {
            const tawkApi = window.Tawk_API || {};
            const previousOnLoad = tawkApi.onLoad;
            window.Tawk_API = tawkApi;
            tawkApi.onLoad = function onTawkLoad() {
                try {
                    if (typeof previousOnLoad === 'function') {
                        previousOnLoad();
                    }
                } catch (_err) {
                    /* ignore prior onLoad failures */
                }
                hideTawkOnMobile();
            };
        } catch (_err) {
            /* ignore Tawk bootstrap races on refresh */
        }
    }, []);

    useEffect(() => {
        if (!open) return;
        callTawk('hideWidget');
    }, [open]);

    // prevent body scroll while modal open and preserve scroll position
    useEffect(() => {
        if (typeof document === 'undefined') return;
        let scrollY = 0;
        if (open) {
            scrollY = window.scrollY || window.pageYOffset;
            document.body.dataset.mobileChatScroll = String(scrollY);
            document.body.classList.add('mobile-chat-open');
            document.body.style.top = `-${scrollY}px`;
            callTawk('hideWidget');
        } else {
            const stored = document.body.dataset.mobileChatScroll;
            document.body.classList.remove('mobile-chat-open');
            document.body.style.top = '';
            if (!isMobileViewport()) {
                callTawk('showWidget');
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
                callTawk('showWidget');
            }
        };
    }, [open]);

    return (
        <>
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
                        <div style={{ width: '100%', height: '100%' }}>
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
                                    onError={() => setIsLoading(false)}
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
