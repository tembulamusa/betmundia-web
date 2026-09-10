const TAWK_SCRIPT_SRC = "https://embed.tawk.to/69aeee647f65b51c3392421d/1jj9l6f39";

export const isTawkNoise = (message, source) => {
  const msg = String(message || "");
  const src = String(source || "");
  return (
    /tawk/i.test(msg) ||
    /tawk\.to/i.test(src) ||
    /embed\.tawk/i.test(src) ||
    /twk-/i.test(msg)
  );
};

export const callTawk = (method, ...args) => {
  if (typeof window === "undefined") return false;
  try {
    const api = window.Tawk_API;
    if (!api || typeof api[method] !== "function") return false;
    api[method](...args);
    return true;
  } catch (_err) {
    return false;
  }
};

/** Ensure embed script exists once; never throws. */
export const ensureTawkScript = () => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  window.Tawk_API = window.Tawk_API || {};
  if (!window.Tawk_LoadStart) {
    window.Tawk_LoadStart = new Date();
  }

  if (document.querySelector(`script[src*="embed.tawk.to"]`)) {
    return;
  }

  try {
    const s1 = document.createElement("script");
    const s0 = document.getElementsByTagName("script")[0];
    s1.async = true;
    s1.src = TAWK_SCRIPT_SRC;
    s1.charset = "UTF-8";
    s1.setAttribute("crossorigin", "*");
    s1.onerror = () => {
      window.__tawkLoadFailed = true;
    };
    if (s0 && s0.parentNode) {
      s0.parentNode.insertBefore(s1, s0);
    } else {
      document.head.appendChild(s1);
    }
  } catch (_err) {
    window.__tawkLoadFailed = true;
  }
};
