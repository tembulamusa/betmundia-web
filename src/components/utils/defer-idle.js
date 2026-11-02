/**
 * Run work after first paint / when the browser is idle.
 * Always schedules (never skips) so analytics/chat/boot APIs still run.
 */
export const scheduleIdle = (fn, timeoutMs = 2500) => {
    if (typeof window === 'undefined') {
        fn();
        return () => {};
    }

    let idleId = null;
    let timerId = null;
    let cancelled = false;

    const run = () => {
        if (cancelled) return;
        cancelled = true;
        try {
            fn();
        } catch (_err) {
            // callers are responsible for their own error handling
        }
    };

    if (typeof window.requestIdleCallback === 'function') {
        idleId = window.requestIdleCallback(run, { timeout: timeoutMs });
    } else {
        timerId = window.setTimeout(run, Math.min(timeoutMs, 1800));
    }

    return () => {
        cancelled = true;
        if (idleId != null && typeof window.cancelIdleCallback === 'function') {
            window.cancelIdleCallback(idleId);
        }
        if (timerId != null) {
            window.clearTimeout(timerId);
        }
    };
};

export default scheduleIdle;
