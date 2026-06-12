import io from 'socket.io-client';

// Prefer an explicit env var so it matches the pattern used for all other backend URLs.
// Set in .env (and your build envs):
//   REACT_APP_SOCKET_URL=https://api.betmundial.com/socket-io
// or
//   REACT_APP_SOCKET_URL=wss://wss.betmundial.com/socket-io
//
// If the Socket.IO server is mounted under a non-default path (e.g. /socket-io instead of /socket.io),
// also set the `path` option below to the full engine.io path, e.g. path: '/socket-io/socket.io'
const RAW_SOCKET_URL =
  process.env.REACT_APP_SOCKET_URL ||
  // Fallback only for local/dev experimentation. Remove or make it fail loudly in production.
  (process.env.NODE_ENV === 'development' ? 'wss://wss.betmundial.com/socket-io' : null);

let socket;

if (!RAW_SOCKET_URL) {
  // No-op stub so every eager import (index.js, header, matches, betslip, live, all-markets, etc.)
  // doesn't throw and doesn't spam connect errors while the realtime backend is being stood up.
  console.warn(
    '[socket] REACT_APP_SOCKET_URL is not set — realtime features disabled. ' +
      'Add REACT_APP_SOCKET_URL to your .env (e.g. https://api.betmundial.com/socket-io or wss://...).'
  );
  socket = {
    connected: false,
    id: null,
    on() { return this; },
    once() { return this; },
    off() { return this; },
    emit() { return this; },
    connect() { return this; },
    disconnect() { return this; },
  };
} else {
  // IMPORTANT:
  // - Do NOT force transports: ['websocket'] only. The initial handshake often requires polling
  //   (or the server/proxy may not support a direct WS upgrade). Let socket.io-client negotiate.
  // - Remove server-only options (pingInterval/pingTimeout) and non-existent options (EIO, upgradeTimeout).
  // - If your server uses a custom path like /socket-io, set `path: '/socket-io/socket.io'`
  //   and point the URL at the origin (without duplicating the socket.io segment).
  const socketUrl = RAW_SOCKET_URL;

  socket = io(socketUrl, {
    // path: '/socket-io/socket.io', // uncomment & adjust only if your server mounts Socket.IO at a custom path
    transports: ['polling', 'websocket'], // polling first for reliable handshake, then upgrade to WS
    reconnection: true,
    reconnectionAttempts: 8,   // be less noisy while debugging; increase later if desired
    reconnectionDelay: 800,
    reconnectionDelayMax: 5000,
    timeout: 10000,            // initial connection timeout
    // withCredentials: true,  // enable if you need cookies / auth headers for the socket handshake
    // forceNew: false,
  });

  // Default connect() is automatic; no need for the manual "if (!connected) connect()".

  socket.on('connect', () => {
    console.log('[socket] connected', socket.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('[socket] disconnected', reason);
  });

  // This is the key log you are seeing. We now dump everything useful from the error.
  socket.on('connect_error', (err) => {
    // socket.io-client v4 connect_error is usually an Error with extra fields.
    // Common messages: "xhr poll error", "websocket error", "timeout", "Invalid namespace", etc.
    // The real cause is often in description / context / transport / cause.
    console.error('[socket] connect_error', {
      message: err?.message,
      name: err?.name,
      type: err?.type,
      description: err?.description,
      context: err?.context,
      transport: err?.transport,
      cause: err?.cause,
      stack: err?.stack,
      // Dump the whole thing in case there are non-enumerable props
      raw: err,
    });

    // If the server returned non-Engine.IO content (e.g. your SPA HTML), the error will usually
    // surface here as an XHR/WS framing error or "Invalid frame" / "xhr poll error".
    // Check your backend: GET <socketUrl>/socket.io/?EIO=4&transport=polling must return
    // something starting with '0{"sid":...' (or the binary equivalent), NOT HTML.
  });

  // More visibility into the manager-level reconnect lifecycle
  if (socket.io && typeof socket.io.on === 'function') {
    socket.io.on('reconnect_attempt', (attempt) => {
      console.log('[socket] reconnect_attempt', attempt);
    });

    socket.io.on('reconnect_error', (error) => {
      console.log('[socket] reconnect_error', error?.message || error);
    });

    socket.io.on('reconnect_failed', () => {
      console.log('[socket] reconnect_failed');
    });

    socket.io.on('error', (error) => {
      console.log('[socket] manager error', error?.message || error);
    });
  }
}

export default socket;
