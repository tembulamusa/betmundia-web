import { io } from "socket.io-client";

/**
 * autoConnect: false — connect only when sports/live/markets/betslip/auth
 * surfaces need odds or profile updates. Call ensureSocketConnected() there.
 */
const socket = io("https://wss.betmundial.com/socket-io", {
  transports: ["websocket"],
  reconnection: true,
  upgrade: true,
  reconnectionAttempts: 8,
  reconnectionDelay: 800,
  reconnectionDelayMax: 5000,
  timeout: 10000,
  autoConnect: false,
});

socket.on('connect', () => {
  console.log('[socket] connected', socket.id);
});
socket.on('disconnect', (reason) => {
  console.log('[socket] disconnected', reason);
});

socket.on('connect_error', (err) => {
  console.error('[socket] connect_error', {
    message: err?.message,
    name: err?.name,
    type: err?.type,
    description: err?.description,
    context: err?.context,
    transport: err?.transport,
    cause: err?.cause,
    raw: err,
  });
});

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

/** Connect (or reconnect) when live odds / profile sockets are needed. */
export const ensureSocketConnected = () => {
  if (!socket.connected) {
    console.log('[socket] ensureSocketConnected: connecting');
    socket.connect();
  }
  return socket;
};

export default socket;
