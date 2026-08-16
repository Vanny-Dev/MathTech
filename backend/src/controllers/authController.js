import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// @desc    Register a new student (role always = student)
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { fullname, username, email, password } = req.body;

    if (!fullname || !username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = await User.create({
      fullname,
      username,
      email,
      password,
      role: 'student', // always student, no exceptions
    });

    res.status(201).json({
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

// @desc    Login user (student or teacher)
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id:      user._id,
        fullname: user.fullname,
        username: user.username,
        email:    user.email,
        role:     user.role,
        token:    generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
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
