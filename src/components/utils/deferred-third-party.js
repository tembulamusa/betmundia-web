import { scheduleIdle } from './defer-idle';
import { ensureTawkScript } from './tawk-safe';
import { loadExternalScript } from './load-external-script';

let started = false;

const loadGtm = () => {
  if (typeof window === 'undefined' || window.__bmGtmLoaded) return;
  window.__bmGtmLoaded = true;
  const w = window;
  const d = document;
  const l = 'dataLayer';
  const i = 'GTM-MQXFR5QP';
  w[l] = w[l] || [];
  w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
  const f = d.getElementsByTagName('script')[0];
  const j = d.createElement('script');
  const dl = l !== 'dataLayer' ? `&l=${l}` : '';
  j.async = true;
  j.src = `https://www.googletagmanager.com/gtm.js?id=${i}${dl}`;
  if (f && f.parentNode) {
    f.parentNode.insertBefore(j, f);
  } else {
    d.head.appendChild(j);
  }
};

const loadFacebookPixel = () => {
  if (typeof window === 'undefined' || window.fbq) return;
  /* eslint-disable */
  !(function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = true;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */
  window.fbq('init', '643603111457269');
  window.fbq('track', 'PageView');
};

const loadGtag = async () => {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== 'function') {
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
  }
  try {
    await loadExternalScript('https://www.googletagmanager.com/gtag/js?id=G-VPXC9NS5G9', {
      id: 'gtag-js-vp',
      async: true,
    });
  } catch (_err) {
    // still configure so queued events can flush later if script arrives another way
  }
  window.gtag('js', new Date());
  window.gtag('config', 'G-VPXC9NS5G9');
};

/**
 * Defer Tawk / GTM / Pixel / gtag until idle / after first paint.
 * All still initialize — timing only.
 */
export const startDeferredThirdParty = () => {
  if (started || typeof window === 'undefined') return () => {};
  started = true;

  return scheduleIdle(() => {
    ensureTawkScript();
    loadGtm();
    loadFacebookPixel();
    void loadGtag();
  }, 3000);
};

export default startDeferredThirdParty;
