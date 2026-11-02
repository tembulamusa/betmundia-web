/**
 * Idempotent script loader for third-party tags that must still initialize.
 */
export const loadExternalScript = (src, { id, async = true, defer = true, attrs = {} } = {}) => {
    if (typeof document === 'undefined') {
        return Promise.resolve(null);
    }

    if (id && document.getElementById(id)) {
        return Promise.resolve(document.getElementById(id));
    }

    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
        return Promise.resolve(existing);
    }

    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        if (id) script.id = id;
        script.src = src;
        script.async = async;
        script.defer = defer;
        Object.keys(attrs).forEach((key) => {
            script.setAttribute(key, attrs[key]);
        });
        script.onload = () => resolve(script);
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
        (document.body || document.head).appendChild(script);
    });
};

/** Ensure npm jquery is available as window.$ for casino DGA helpers. */
export const ensureJquery = async () => {
    if (typeof window === 'undefined') return null;
    if (window.jQuery) return window.jQuery;
    const mod = await import('jquery');
    const $ = mod.default || mod;
    window.jQuery = $;
    window.$ = $;
    return $;
};

const PRAGMATIC_FULLSCREEN =
    'https://client.pragmaticplaylive.net/desktop/assets/api/fullscreenApi.js';

/** Casino-only externals (jquery + pragmatic fullscreen). Still loads when casino mounts. */
export const ensureCasinoExternalScripts = async () => {
    await ensureJquery();
    try {
        await loadExternalScript(PRAGMATIC_FULLSCREEN, {
            id: 'pragmatic-fullscreen-api',
            async: true,
            defer: true,
        });
    } catch (_err) {
        // Fullscreen API is optional; casino launch must still work without it.
    }
};

export default loadExternalScript;
