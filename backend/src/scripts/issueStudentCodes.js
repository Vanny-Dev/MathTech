import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import { generateUniqueCode } from '../utils/accessCode.js';

dotenv.config();

/**
 * One-off migration: give every existing student an access code.
 *
 * Students used to sign in with a password of their own choosing, stored as a
 * bcrypt hash. Hashes cannot be read back, so those passwords could not become
 * the codes the teacher hands out — every student who predates the change needs
 * a code issued to them instead. Their old password stops working once they
 * have one.
 *
 * Prints the full list at the end. Copy it out and give each student their
 * code; nothing else shows them all together.
 *
 * Safe to run more than once — a student who already holds a code is skipped,
 * so nobody's code changes underneath them. Pass --reset to issue a fresh code
 * to every student regardless, which invalidates all the codes already given.
 *
 *   node src/scripts/issueStudentCodes.js
 *   node src/scripts/issueStudentCodes.js --reset
 */
const run = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI is not set. Point it at the database you want to update.');
    process.exit(1);
  }

  const resetAll = process.argv.includes('--reset');

  await mongoose.connect(uri);
  console.log(`Connected to ${mongoose.connection.name}`);

  const students = await User.find({ role: 'student' }).sort({ fullname: 1 });

  if (students.length === 0) {
    console.log('No student accounts found — nothing to do.');
    await mongoose.disconnect();
    return;
  }

  let issued = 0;
  let kept = 0;

  for (const student of students) {
    if (student.accessCode && !resetAll) {
      kept += 1;
      continue;
    }
    student.accessCode = await generateUniqueCode(User);
    await student.save();
    issued += 1;
  }

  const finished = await User.find({ role: 'student' })
    .sort({ fullname: 1 })
    .select('fullname username accessCode');

  const width = Math.max(...finished.map((s) => s.fullname.length), 9);

  console.log('');
  console.log(`${'Full name'.padEnd(width)}  ${'Username'.padEnd(18)}  Code`);
  console.log(`${'-'.repeat(width)}  ${'-'.repeat(18)}  ------`);
  finished.forEach((s) => {
    console.log(
      `${s.fullname.padEnd(width)}  ${('@' + s.username).padEnd(18)}  ${s.accessCode || '(none)'}`
    );
  });

  console.log('');
  console.log(`Issued ${issued} new code${issued === 1 ? '' : 's'}; left ${kept} unchanged.`);
  if (issued > 0) {
    console.log('Those students can no longer sign in with their old password.');
  }

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
