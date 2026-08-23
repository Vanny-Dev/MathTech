import { io } from 'socket.io-client';

/**
 * One shared socket for the whole app.
 *
 * The API base is something like https://mathtech.onrender.com/api, but the
 * socket lives at the origin, so the /api suffix is stripped rather than
 * hard-coding a second URL that could drift from the first.
 *
 * Nothing here throws if the socket cannot connect. Live updates are an
 * improvement on the page, never a requirement for it: the monitor still loads
 * its rows over HTTP and still has its Refresh button, so a blocked WebSocket
 * or a sleeping Render instance degrades the page rather than breaking it.
 */

const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const socketUrl = apiBase.replace(/\/api\/?$/, '');

let socket = null;

const tokenFromStorage = () => {
  try {
    const stored = localStorage.getItem('dw_user');
    return stored ? JSON.parse(stored)?.token ?? null : null;
  } catch {
    return null;
  }
};

/**
 * Returns the live socket, connecting on first use. Null when nobody is signed
 * in — there is nothing to authenticate with, and an unauthenticated socket is
 * rejected by the server anyway.
 */
export const getSocket = () => {
  const token = tokenFromStorage();
  if (!token) return null;

  if (socket && socket.auth?.token !== token) {
    // Signed in as someone else since the last connection
    socket.disconnect();
    socket = null;
  }

  if (!socket) {
    socket = io(socketUrl, {
      path: '/socket.io',
      auth: { token },
      // Render's free instances sleep, so reconnecting is the normal case
      // rather than an error. Back off instead of hammering a waking server.
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      // Try polling first so a network that blocks WebSocket upgrades still
      // works; Socket.IO silently upgrades to WebSocket when it can.
      transports: ['polling', 'websocket'],
      withCredentials: true,
    });
  }

  if (!socket.connected) socket.connect();
  return socket;
};

export const closeSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
