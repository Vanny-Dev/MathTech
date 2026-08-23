import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { isAllowedOrigin } from '../config/cors.js';

/**
 * Live updates for the teacher's Student Monitor.
 *
 * The monitor could already say a student is "In Progress", but only after the
 * teacher hit Refresh — and by then the student may have finished. This pushes
 * two things as they happen:
 *
 *   presence  — who has the activity open right now, and how far through it
 *   status    — a student's row changing to In Progress or Completed
 *
 * Socket.IO rather than a bare WebSocket, deliberately. The backend runs on
 * Render, whose free instances sleep after a quiet spell and drop every
 * connection; Socket.IO reconnects on its own and falls back to long polling
 * where a school network blocks WebSocket upgrades. Hand-rolling that on `ws`
 * is the bulk of what Socket.IO already does.
 *
 * Presence is held in memory. That is correct for a single instance, which is
 * what Render's free and starter plans give you. If this is ever scaled to more
 * than one instance, presence has to move to a shared adapter (Redis) or each
 * instance will only know about its own half of the class.
 */

const TEACHERS_ROOM = 'teachers';

// studentId -> { studentId, fullname, username, moduleId, answered, total, since }
const presence = new Map();

let io = null;

const presenceList = (moduleId) => {
  const rows = [...presence.values()];
  return moduleId ? rows.filter((r) => r.moduleId === moduleId) : rows;
};

/** Push one student's live state to every connected teacher. */
const broadcastPresence = (studentId) => {
  if (!io) return;
  io.to(TEACHERS_ROOM).emit('monitor:presence', {
    studentId,
    live: presence.get(studentId) ?? null,   // null = they left the activity
  });
};

/**
 * Called from the HTTP layer when a student's stored status changes, so the
 * monitor updates without the teacher refreshing. Safe to call before the
 * socket server exists — it simply does nothing.
 */
export const emitStatusChange = (payload) => {
  if (!io) return;
  io.to(TEACHERS_ROOM).emit('monitor:status', payload);
};

export const initRealtime = (server) => {
  io = new Server(server, {
    path: '/socket.io',
    cors: {
      origin(origin, callback) {
        if (isAllowedOrigin(origin)) return callback(null, true);
        return callback(new Error(`Socket origin not allowed: ${origin}`));
      },
      credentials: true,
    },
    // Render's proxy idles a quiet connection out; ping often enough to hold it
    pingInterval: 25000,
    pingTimeout: 20000,
  });

  // Same rules as the REST API: a valid token AND an account that still exists.
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('No token'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('fullname username role');

      // A deleted account must lose its live connection too, not just its API
      // access — otherwise a removed student keeps appearing in the monitor.
      if (!user) return next(new Error('Account no longer exists'));

      socket.data.user = user;
      return next();
    } catch (err) {
      return next(new Error('Not authorized'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user;

    if (user.role === 'teacher') {
      socket.join(TEACHERS_ROOM);
      // Hand the newly connected teacher the whole picture at once
      socket.emit('monitor:presence:all', presenceList());
      return;
    }

    const studentId = user._id.toString();

    // The student opened the graded activity
    socket.on('activity:open', ({ moduleId, total } = {}) => {
      if (!moduleId) return;
      presence.set(studentId, {
        studentId,
        fullname: user.fullname,
        username: user.username,
        moduleId: String(moduleId),
        answered: 0,
        total: Number(total) || 0,
        since: new Date().toISOString(),
      });
      broadcastPresence(studentId);
    });

    // They answered another question — lets the monitor show 3/10 as it happens
    socket.on('activity:answer', ({ answered, total } = {}) => {
      const row = presence.get(studentId);
      if (!row) return;
      row.answered = Number(answered) || 0;
      if (total) row.total = Number(total);
      broadcastPresence(studentId);
    });

    // Left the page, submitted, or closed the tab
    const clear = () => {
      if (!presence.has(studentId)) return;
      presence.delete(studentId);
      broadcastPresence(studentId);
    };

    socket.on('activity:leave', clear);
    socket.on('disconnect', clear);
  });

  console.log('🔌 Realtime ready on /socket.io');
  return io;
};

export const getPresence = presenceList;
