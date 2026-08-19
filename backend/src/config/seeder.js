import User from '../models/User.js';

/**
 * Seeds the single teacher account on first start.
 *
 * The credentials come from the environment so the real password never sits in
 * the repository. The defaults below only exist so a fresh local checkout runs
 * without setup — in production TEACHER_PASSWORD must be set, and the seeder
 * refuses to create the account with the default password there.
 */
const seedTeacher = async () => {
  try {
    const username = process.env.TEACHER_USERNAME || 'vanny';
    const password = process.env.TEACHER_PASSWORD || 'vannynabila';
    const fullname = process.env.TEACHER_FULLNAME || 'Jovanny De Leon';
    const email    = process.env.TEACHER_EMAIL    || 'vannydev@gmail.com';

    // Look for the same username we are about to create, so the guard and the
    // account can never drift apart.
    const existing = await User.findOne({ username });

    if (existing) {
      console.log(`✅ Teacher account "${username}" already exists — skipping seed`);
      return;
    }

    if (process.env.NODE_ENV === 'production' && !process.env.TEACHER_PASSWORD) {
      console.error(
        '❌ Refusing to seed the teacher account with the default password in production.\n' +
        '   Set TEACHER_PASSWORD (and optionally TEACHER_USERNAME, TEACHER_EMAIL,\n' +
        '   TEACHER_FULLNAME) in the environment, then restart.'
      );
      return;
    }

    await User.create({ fullname, username, email, password, role: 'teacher' });

    console.log('🌱 Teacher account seeded successfully');
    console.log(`   Username : ${username}`);
    console.log(
      process.env.TEACHER_PASSWORD
        ? '   Password : (from TEACHER_PASSWORD)'
        : '   Password : (development default — set TEACHER_PASSWORD before deploying)'
    );
  } catch (err) {
    console.error('❌ Seeder error:', err.message);
  }
};

export default seedTeacher;
