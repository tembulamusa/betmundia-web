import io from 'socket.io-client';
const socket = io('wss://wss.betmundial.com/socket-io', {
    transports: ['websocket'],
    pingInterval: 1000,
    pingTimeOut: 3000,
    reconnection: true,
    upgradeTimeout: 1000,
    EIO: 4,
    reconnectionAttempts: Infinity, // retry indefinitely
    reconnectionDelay: 1000,        // initial delay between reconnections
    reconnectionDelayMax: 3000     // maximum delay between reconnections
});

if (!socket.connected) {
    socket.connect();
}

socket.on('connect', () => {
    console.log('[socket] connected', socket.id);
});

socket.on('disconnect', (reason) => {
    console.log('[socket] disconnected', reason);
});

socket.on('connect_error', (error) => {
    console.log('[socket] connect_error', {
        message: error?.message,
        description: error?.description,
        context: error?.context,
    });
});

socket.io.on('reconnect_attempt', (attempt) => {
    console.log('[socket] reconnect_attempt', attempt);
});

socket.io.on('reconnect_error', (error) => {
    console.log('[socket] reconnect_error', error?.message || error);
});

socket.io.on('reconnect_failed', () => {
    console.log('[socket] reconnect_failed');
});


export default socket;
