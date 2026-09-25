import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { normalizeCode } from '../utils/accessCode.js';

const UserSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    // Students no longer give an email when they register, so this is optional.
    // `sparse` keeps the unique index from treating several missing emails as
    // duplicates — without it, only one account could exist without one.
    email: {
      type: String,
      unique: true,
      sparse: true,
    },
    // Teachers sign in with a password. Students do not have one at all — they
    // use the access code below — so this is only required for a teacher.
    password: {
      type: String,
      required: function () {
        return this.role === 'teacher';
      },
    },
    // The short code the teacher issues to a student and reads out in class.
    // Stored in plain text on purpose: the teacher must be able to tell a
    // student who has forgotten it, which a hash makes impossible. It is only
    // ever returned by teacher-only endpoints.
    accessCode: {
      type: String,
      unique: true,
      sparse: true,
      set: (v) => (v == null || v === '' ? undefined : normalizeCode(v)),
    },
    role: {
      type: String,
      enum: ['student', 'teacher'],
      default: 'student',
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Codes are compared case-insensitively and ignoring stray spaces: a student
 * copying one off the board should not be locked out over capitalisation.
 */
UserSchema.methods.matchAccessCode = function (enteredCode) {
  if (!this.accessCode) return false;
  return this.accessCode === normalizeCode(enteredCode);
};

const User = mongoose.model('User', UserSchema);

export default User;
