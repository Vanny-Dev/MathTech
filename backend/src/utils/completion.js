/**
 * One definition of what finishing a topic means.
 *
 * Completion used to require all seven entries in `completedSections`, which
 * included `review` and `progress`. Both are dead ends for a student who has
 * done the work:
 *
 *   - `review` lists the questions you got wrong. A student who answered
 *     everything correctly has nothing to review, and the page is only
 *     reachable straight after a submission, so a refresh made it unreachable
 *     for good.
 *   - `progress` is a read-only report of past attempts.
 *
 * So a student could answer every question, submit, and still sit at 6/7
 * "In Progress" permanently. Required now means the sections a student
 * actually works through; the other two stay tracked and visible to the
 * teacher, but no longer block completion.
 */

export const REQUIRED_SECTIONS = [
  'home',
  'learningCompetencies',
  'lesson',
  'activities',
  'feedback',
];

export const OPTIONAL_SECTIONS = ['review', 'progress'];

export const ALL_SECTIONS = [...REQUIRED_SECTIONS, ...OPTIONAL_SECTIONS];

/**
 * Mongoose hands back a nested-path object rather than a plain one, so read it
 * through toObject() where that exists. Reading the named keys instead of
 * Object.values() also means an extra key can never inflate the count.
 */
const sectionsOf = (progress) => {
  const s = progress?.completedSections;
  if (!s) return {};
  return typeof s.toObject === 'function' ? s.toObject() : s;
};

export const countRequired = (progress) => {
  const s = sectionsOf(progress);
  return REQUIRED_SECTIONS.filter((k) => s[k] === true).length;
};

export const countAll = (progress) => {
  const s = sectionsOf(progress);
  return ALL_SECTIONS.filter((k) => s[k] === true).length;
};

export const isComplete = (progress) =>
  countRequired(progress) === REQUIRED_SECTIONS.length;

/**
 * A student's standing on a topic, taken from the Independent Activity alone.
 *
 * Status used to be counted from the sections a student had opened, which
 * measured the wrong thing: someone could ace the activity and still read as
 * unfinished because they had not opened one more page.
 *
 * What the status answers is simply "how far into the activity are they":
 *
 *   never opened it        -> not started
 *   opened, not submitted  -> in progress   (they are taking it now)
 *   submitted              -> completed     (they are done taking it)
 *
 * Note that completed is about finishing the activity, not about scoring
 * perfectly. Whether the topic is CLOSED is a separate question — only a 100%
 * score does that — so a student can be completed and still choose to retry.
 *
 * The section counts are still reported, because they are useful detail for a
 * teacher, but they do not set the status.
 */
export const activityStatusOf = ({ attempts = 0, startedAt = null } = {}) => {
  if (attempts > 0) return 'completed';
  return startedAt ? 'in_progress' : 'not_started';
};
