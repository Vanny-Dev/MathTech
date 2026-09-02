import User from '../models/User.js';

/**
 * Seeds the single developer account on first start, mirroring seedTeacher.js.
 *
 * The developer role is what gates the advertisement control panel
 * (/api/developer/ads/*), so there has to be at least one account with it —
 * registration always creates students (see authController.register).
 */
const seedDeveloper = async () => {
  try {
    const username = process.env.DEVELOPER_USERNAME || 'devadmin';
    const password = process.env.DEVELOPER_PASSWORD || 'devadmin123';
    const fullname = process.env.DEVELOPER_FULLNAME || 'App Developer';
    const email    = process.env.DEVELOPER_EMAIL    || 'devadmin@example.com';

    const existing = await User.findOne({ username });

    if (existing) {
      console.log(`✅ Developer account "${username}" already exists — skipping seed`);
      return;
    }

    if (process.env.NODE_ENV === 'production' && !process.env.DEVELOPER_PASSWORD) {
      console.error(
        '❌ Refusing to seed the developer account with the default password in production.\n' +
        '   Set DEVELOPER_PASSWORD (and optionally DEVELOPER_USERNAME, DEVELOPER_EMAIL,\n' +
        '   DEVELOPER_FULLNAME) in the environment, then restart.'
      );
      return;
    }

    await User.create({ fullname, username, email, password, role: 'developer' });

    console.log('🌱 Developer account seeded successfully');
    console.log(`   Username : ${username}`);
    console.log(
      process.env.DEVELOPER_PASSWORD
        ? '   Password : (from DEVELOPER_PASSWORD)'
        : '   Password : (development default — set DEVELOPER_PASSWORD before deploying)'
    );
  } catch (err) {
    console.error('❌ Seeder error:', err.message);
  }
};

export default seedDeveloper;
