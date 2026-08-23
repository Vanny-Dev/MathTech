import { useCallback, useEffect, useRef } from 'react';
import { getSocket } from '../realtime/socket.js';

/**
 * Tells the teacher's monitor that this student has the graded questions open
 * and how far through them they are.
 *
 * Every page that presents the graded set has to do this, and there is more
 * than one — the Independent Activity and the Retry page put the same
 * questions in front of the student and post the same graded submission. The
 * first version of this lived inside the activity page alone, so a student who
 * came in through Retry stayed invisible in the monitor. Keeping it in one hook
 * is what stops the two pages drifting apart again.
 *
 * Nothing here is required for the page to work. If the socket cannot connect,
 * the calls are no-ops and the monitor falls back to the stored status.
 *
 * @param {object}  opts
 * @param {string}  opts.moduleId  topic being answered
 * @param {number}  opts.total     how many questions there are
 * @param {boolean} opts.active    false while loading, or when the topic is
 *                                 closed and the questions are not shown
 */
export default function useActivityPresence({ moduleId, total, active }) {
  const openedFor = useRef(null);

  useEffect(() => {
    if (!active || !moduleId || !total) return;

    // Announce once per topic, not on every re-render
    if (openedFor.current !== moduleId) {
      getSocket()?.emit('activity:open', { moduleId, total });
      openedFor.current = moduleId;
    }

    return () => {
      // Navigating away ends the "answering now" state. Closing the tab is
      // covered by the socket disconnecting on the server side.
      getSocket()?.emit('activity:leave');
      openedFor.current = null;
    };
  }, [moduleId, total, active]);

  /** Call with the number answered so far whenever the student answers one. */
  const reportAnswered = useCallback((answered) => {
    getSocket()?.emit('activity:answer', { answered, total });
  }, [total]);

  /** Call when the set has been submitted — they are no longer mid-attempt. */
  const reportFinished = useCallback(() => {
    getSocket()?.emit('activity:leave');
    openedFor.current = null;
  }, []);

  return { reportAnswered, reportFinished };
}
