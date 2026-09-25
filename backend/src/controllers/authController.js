import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { CODE_LENGTH, generateUniqueCode } from '../utils/accessCode.js';

// @desc    Register a new student (role always = student)
// @route   POST /api/auth/register
// @access  Public
//
// The student gives a name and a username only. The access code they sign in
// with is issued by the system, shown to them once here, and visible to their
// teacher from then on — so nobody is locked out waiting for one, and the
// teacher can still read it back or replace it later.
export const register = async (req, res, next) => {
  try {
    const { fullname, username } = req.body;

    if (!fullname || !username) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    const accessCode = await generateUniqueCode(User);

    const user = await User.create({
      fullname,
      username,
      accessCode,
      role: 'student', // always student, no exceptions
    });

    res.status(201).json({
      _id:        user._id,
      fullname:   user.fullname,
      username:   user.username,
      role:       user.role,
      accessCode: user.accessCode,   // shown once so the student can write it down
      token:      generateToken(user._id),
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login (student with an access code, teacher with a password)
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { username, role } = req.body;
    const isTeacher = role === 'teacher';

    // Students send `code`, teachers send `password`; either name is accepted
    // for both so a client that only knows one still works.
    const secret =
      (isTeacher
        ? req.body.password ?? req.body.code
        : req.body.code ?? req.body.password) ?? '';

    if (!username || !String(secret).trim()) {
      return res.status(400).json({
        message: isTeacher
          ? 'Username and password are required'
          : 'Username and access code are required',
      });
    }

    // Scoped to the chosen role, so a teacher account can never be opened from
    // the student form and a wrong-role attempt reads as a normal bad login.
    const user = await User.findOne({
      username,
      role: isTeacher ? 'teacher' : 'student',
    });

    const ok = user
      ? isTeacher
        ? await user.matchPassword(String(secret))
        : user.matchAccessCode(secret)
      : false;

    if (!ok) {
      return res.status(401).json({
        message: isTeacher
          ? 'Invalid username or password'
          : 'Invalid username or access code',
      });
    }

    res.json({
      _id:      user._id,
      fullname: user.fullname,
      username: user.username,
      email:    user.email,
      role:     user.role,
      token:    generateToken(user._id),
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    // A student must not be able to read their own code back off this endpoint
    // — the teacher is the one who hands it out.
    const user = await User.findById(req.user._id).select('-password -accessCode');
    res.json(user);
  } catch (err) {
    next(err);
  }
};

export { CODE_LENGTH };
