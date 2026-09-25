import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// Students sign in with a short code their teacher hands out instead of a
// free-form password. It is stored in the same hashed `password` field, so
// nothing else in the app has to know the difference.
export const CODE_LENGTH = 6;

// @desc    Register a new student (role always = student)
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { fullname, username } = req.body;
    // `password` is still accepted so an older client keeps working.
    const code = (req.body.code ?? req.body.password ?? '').trim();

    if (!fullname || !username || !code) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (code.length !== CODE_LENGTH) {
      return res
        .status(400)
        .json({ message: `Access code must be exactly ${CODE_LENGTH} characters` });
    }

    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    const user = await User.create({
      fullname,
      username,
      password: code,
      role: 'student', // always student, no exceptions
    });

    res.status(201).json({
      _id:      user._id,
      fullname: user.fullname,
      username: user.username,
      role:     user.role,
      token:    generateToken(user._id),
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login user (student with an access code, teacher with a password)
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { username, role } = req.body;
    const isTeacher = role === 'teacher';

    // Students send `code`, teachers send `password`; either is accepted for
    // both so a client that only knows one field name still works.
    const secret = (
      (isTeacher ? req.body.password ?? req.body.code : req.body.code ?? req.body.password) ?? ''
    ).trim();

    if (!username || !secret) {
      return res.status(400).json({
        message: isTeacher
          ? 'Username and password are required'
          : 'Username and access code are required',
      });
    }

    // Scoped to the chosen role, so a teacher account can never be opened with
    // the student form and the wrong-role case reads as a normal bad login.
    const user = await User.findOne({
      username,
      role: isTeacher ? 'teacher' : 'student',
    });

    if (user && (await user.matchPassword(secret))) {
      res.json({
        _id:      user._id,
        fullname: user.fullname,
        username: user.username,
        email:    user.email,
        role:     user.role,
        token:    generateToken(user._id),
      });
    } else {
      res.status(401).json({
        message: isTeacher
          ? 'Invalid username or password'
          : 'Invalid username or access code',
      });
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (err) {
    next(err);
  }
};
