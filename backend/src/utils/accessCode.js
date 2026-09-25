/**
 * Student access codes.
 *
 * Students do not choose a password: the teacher issues them a short code and
 * reads it out in class. The code is stored as plain text on the student
 * record — the teacher has to be able to tell a student who has forgotten it,
 * and a hash cannot be read back. Only teacher-only endpoints ever return it.
 */

export const CODE_LENGTH = 6;

/**
 * No 0/O, 1/I/L, 5/S or 8/B — a code is read aloud and copied off a board, so
 * characters that look or sound alike cause more support than they are worth.
 */
const ALPHABET = 'ACDEFGHJKMNPQRTUVWXYZ2346789';

export const generateCode = () => {
  let out = '';
  for (let i = 0; i < CODE_LENGTH; i += 1) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return out;
};

/** What the student typed, in the form the code is stored in. */
export const normalizeCode = (value) =>
  String(value ?? '').trim().toUpperCase().replace(/\s+/g, '');

/**
 * A code no other student holds.
 *
 * Codes are unique so the teacher can never hand the same one to two students
 * and wonder which account it opens. Collisions are rare enough that a handful
 * of tries is plenty; if the pool were ever exhausted this throws rather than
 * looping forever.
 */
export const generateUniqueCode = async (User, attempts = 12) => {
  for (let i = 0; i < attempts; i += 1) {
    const code = generateCode();
    const taken = await User.exists({ accessCode: code });
    if (!taken) return code;
  }
  throw new Error('Could not generate an unused access code');
};
