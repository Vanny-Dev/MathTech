/**
 * Release-date formatting helpers.
 *
 * Dates travel as ISO strings (UTC) and are always shown in the viewer's local
 * time, so a teacher in Manila sets "8:00 AM" and students in Manila see 8:00 AM.
 */

export const isReleased = (releaseDate) =>
  !releaseDate || new Date(releaseDate).getTime() <= Date.now();

/** Human date for display, e.g. "Aug 22, 2026 · 8:00 AM" */
export const formatRelease = (releaseDate) => {
  if (!releaseDate) return 'Open now';
  return new Date(releaseDate).toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
};

/** "in 6 days 14 hours" / "in 12 minutes" / null once released */
export const timeUntil = (releaseDate) => {
  if (!releaseDate) return null;
  const ms = new Date(releaseDate).getTime() - Date.now();
  if (ms <= 0) return null;

  const mins  = Math.floor(ms / 60000);
  const hours = Math.floor(mins / 60);
  const days  = Math.floor(hours / 24);

  if (days > 0)  return `in ${days} day${days === 1 ? '' : 's'} ${hours % 24} hr`;
  if (hours > 0) return `in ${hours} hr ${mins % 60} min`;
  if (mins > 0)  return `in ${mins} minute${mins === 1 ? '' : 's'}`;
  return 'in under a minute';
};

/** Date -> value for <input type="datetime-local"> (local time, no timezone suffix) */
export const toInputValue = (releaseDate) => {
  if (!releaseDate) return '';
  const d = new Date(releaseDate);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
         `T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/** <input type="datetime-local"> value -> ISO string, or null when cleared */
export const fromInputValue = (value) => {
  if (!value) return null;
  const d = new Date(value);          // parsed as local time
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
};
