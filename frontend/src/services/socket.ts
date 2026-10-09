import { io } from 'socket.io-client';

let socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Bulletproof the URL: Strip trailing slashes and ensure it DOES NOT end with /api
socketUrl = socketUrl.replace(/\/$/, '');
if (!socketUrl.startsWith('http')) {
  socketUrl = 'https://' + socketUrl;
}
if (socketUrl.endsWith('/api')) {
  socketUrl = socketUrl.replace(/\/api$/, '');
}

export const socket = io(socketUrl, {
  autoConnect: false,
});
