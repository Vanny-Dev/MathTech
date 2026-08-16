import User from '../models/User.js';

const seedTeacher = async () => {
  try {
    const existing = await User.findOne({ username: 'teacher01' });

    if (existing) {
      console.log('✅ Teacher account already exists — skipping seed');
      return;
    }

    await User.create({
      fullname: 'Juan dela Cruz',
      username: 'teacher01',
      email:    'teacher01@mathtech.com',
      password: 'Teacher@123',
      role:     'teacher',
    });

    console.log('🌱 Teacher account seeded successfully');
    console.log('   Username : teacher01');
    console.log('   Password : Teacher@123');
  } catch (err) {
    console.error('❌ Seeder error:', err.message);
  }
};

export default seedTeacher;
