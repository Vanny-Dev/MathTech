import User from '../models/User.js';
import Submission from '../models/Submission.js';
import Progress from '../models/Progress.js';
import bcrypt from 'bcryptjs';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// @desc    Update user profile (fullname, email)
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { fullname, email } = req.body;

    // Check if new email is already taken by another user
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    user.fullname = fullname || user.fullname;
    user.email    = email    || user.email;

    const updated = await user.save();

    res.json({
      _id:      updated._id,
      fullname: updated.fullname,
      username: updated.username,
      email:    updated.email,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Change password
// @route   PUT /api/users/password
// @access  Private
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both current and new password are required' });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save(); // pre-save hook will hash the new password

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete user account
// @route   DELETE /api/users/profile
// @access  Private
export const deleteUserAccount = async (req, res, next) => {
  try {
    // Remove the user's own records too. Leaving them behind orphans documents
    // whose populated userId resolves to null, which breaks the teacher monitor.
    await Promise.all([
      Submission.deleteMany({ userId: req.user._id }),
      Progress.deleteMany({ userId: req.user._id }),
    ]);
    await User.findByIdAndDelete(req.user._id);

    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    next(err);
  }
};
