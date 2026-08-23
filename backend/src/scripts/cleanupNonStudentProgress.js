import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Progress from '../models/Progress.js';
import User from '../models/User.js';

dotenv.config();

/**
 * One-off cleanup: remove progress rows that do not belong to a student.
 *
 * Marking a section complete used to record a row for whoever called it, so a
 * teacher who opened the student pages to preview them was given progress of
 * their own. The class summary counted every progress row for a module as a
 * student who had started, which pushed "Not Started" below zero on the
 * dashboard. The controllers no longer create these rows; this clears the ones
 * already saved.
 *
 * Safe to run more than once — it only ever deletes rows whose owner is not a
 * student, and reports what it found.
 *
 *   node src/scripts/cleanupNonStudentProgress.js
 */
const run = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI is not set. Point it at the database you want to clean.');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log(`Connected to ${mongoose.connection.name}`);

  const studentIds = await User.find({ role: 'student' }).distinct('_id');
  const strays = await Progress.find({ userId: { $nin: studentIds } }).populate('userId', 'fullname role');

  if (strays.length === 0) {
    console.log('No non-student progress rows found — nothing to clean.');
  } else {
    console.log(`Found ${strays.length} progress row${strays.length === 1 ? '' : 's'} not owned by a student:`);
    strays.forEach((p) => {
      const who = p.userId ? `${p.userId.fullname} (${p.userId.role})` : 'deleted user';
      console.log(`  - ${who} on module ${p.moduleId}`);
    });

    const { deletedCount } = await Progress.deleteMany({ userId: { $nin: studentIds } });
    console.log(`Removed ${deletedCount}.`);
  }

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
