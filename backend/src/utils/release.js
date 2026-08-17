/**
 * Release-window helpers.
 *
 * A topic is CLOSED BY DEFAULT. A newly seeded or newly created module has no
 * releaseDate, and stays locked until a teacher schedules it or opens it. That
 * is deliberate: a fresh deploy, a server restart, or adding a topic must never
 * expose content to students before the teacher intends it.
 *
 *   releaseDate = null            -> locked, not scheduled yet
 *   releaseDate in the future     -> locked, students see a countdown
 *   releaseDate now or in the past-> open
 *
 * "Open now" is stored as the current timestamp rather than null, so the topic
 * stays open across restarts. Clearing the date puts the topic back to locked.
 *
 * Teachers bypass the gate entirely so they can prepare and preview.
 */

export const isReleased = (module) => {
  if (!module) return false;
  if (!module.releaseDate) return false;      // no schedule -> locked
  return new Date(module.releaseDate).getTime() <= Date.now();
};

export const isTeacher = (user) => user?.role === 'teacher';

/**
 * Can this user read the module's learning content?
 * Teachers: always. Students: only published AND released.
 */
export const canAccessModule = (user, module) => {
  if (!module) return false;
  if (isTeacher(user)) return true;
  return module.isPublished === true && isReleased(module);
};

/**
 * Express guard body shared by every student-facing module/activity read.
 * Returns true when the request was rejected, so callers can `if (deny(...)) return;`
 */
export const denyIfLocked = (res, user, module) => {
  if (!module) {
    res.status(404).json({ message: 'Module not found' });
    return true;
  }
  if (canAccessModule(user, module)) return false;

  if (!module.isPublished) {
    res.status(403).json({ message: 'This topic is not available yet' });
    return true;
  }

  // 423 Locked — the client uses this to show the countdown or a
  // "not scheduled yet" notice instead of an error
  res.status(423).json({
    message: module.releaseDate
      ? 'This topic has not been released yet'
      : 'This topic has not been scheduled yet',
    releaseDate: module.releaseDate ?? null,
    title: module.title,
  });
  return true;
};
