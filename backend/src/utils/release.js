/**
 * Release-window helpers.
 *
 * A module is readable by a student when it is published AND its release date
 * has passed. Teachers bypass the release gate entirely so they can prepare
 * and preview upcoming topics.
 */

export const isReleased = (module) => {
  if (!module) return false;
  if (!module.releaseDate) return true;      // no date set -> open immediately
  return new Date(module.releaseDate).getTime() <= Date.now();
};

export const isTeacher = (user) => user?.role === 'teacher';

/**
 * Can this user read the module's learning content?
 * Teachers: always. Students: only published + released.
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

  // 423 Locked — the client uses this to show the countdown instead of an error
  res.status(423).json({
    message: 'This topic has not been released yet',
    releaseDate: module.releaseDate,
    title: module.title,
  });
  return true;
};
