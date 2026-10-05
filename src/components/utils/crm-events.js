import makeRequest from "./fetch-request";
import { getFromLocalStorage } from "./local-storage";

const QUEUE_KEY = "crm_event_queue";
const FLUSH_INTERVAL_MS = 5000;
const MAX_BATCH = 20;

let flushTimer = null;

function defaultSource() {
  return {
    platform: "web",
    channel: window.location.pathname.split("/")[1] || "home",
    app_version: process.env.REACT_APP_VERSION || null,
    user_agent: navigator.userAgent,
  };
}

function readQueue() {
  try {
    const raw = sessionStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeQueue(events) {
  sessionStorage.setItem(QUEUE_KEY, JSON.stringify(events.slice(-500)));
}

function trackUrl() {
  const base = process.env.REACT_APP_BASE2_URL || "";
  return `${base}/v2/user/crm/events`;
}

function authHeaders() {
  const user = getFromLocalStorage("user");
  const token = user?.token;
  if (!token) {
    return null;
  }
  return {
    accept: "application/json",
    "content-type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export function trackCrmEvent(eventType, properties = {}, options = {}) {
  const sample = options.sample ?? 1;
  if (sample < 1 && Math.random() > sample) {
    return;
  }

  const queue = readQueue();
  queue.push({
    eventType,
    properties,
    source: { ...defaultSource(), ...(options.source || {}) },
  });
  writeQueue(queue);

  if (queue.length >= MAX_BATCH) {
    flushCrmEvents(false);
  } else {
    scheduleFlush();
  }
}

function scheduleFlush() {
  if (flushTimer) {
    return;
  }
  flushTimer = window.setTimeout(() => {
    flushTimer = null;
    flushCrmEvents(false);
  }, FLUSH_INTERVAL_MS);
}

function requeueEvents(events) {
  writeQueue(events.concat(readQueue()));
}

async function postEvents(events, keepalive) {
  const headers = authHeaders();
  if (!headers) {
    requeueEvents(events);
    return;
  }
  try {
    const response = await fetch(trackUrl(), {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      headers,
      body: JSON.stringify({ events }),
      keepalive: Boolean(keepalive),
    });
    if (!response.ok) {
      requeueEvents(events);
    }
  } catch {
    requeueEvents(events);
  }
}

export async function flushCrmEvents(useKeepalive = false) {
  const queue = readQueue();
  if (!queue.length) {
    return;
  }
  writeQueue([]);
  await postEvents(queue, useKeepalive);
}

if (typeof window !== "undefined") {
  window.addEventListener("pagehide", () => {
    const queue = readQueue();
    if (!queue.length) {
      return;
    }
    writeQueue([]);
    void postEvents(queue, true);
  });
  window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      void flushCrmEvents(true);
    }
  });
}

export function trackPageView(extra = {}) {
  trackCrmEvent(
    "page_viewed",
    { path: window.location.pathname, ...extra },
    { sample: 0.1 }
  );
}

export function trackPromotionViewed(promotionId, extra = {}) {
  trackCrmEvent("promotion_viewed", { promotion_id: promotionId, ...extra });
}
