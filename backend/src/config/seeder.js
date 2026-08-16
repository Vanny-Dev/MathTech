import User from '../models/User.js';

const seedTeacher = async () => {
  try {
    const existing = await User.findOne({ username: 'doriejean' });

    if (existing) {
      console.log('✅ Teacher account already exists — skipping seed');
      return;
    }

    await User.create({
      fullname: 'Dorie Jean L. Justiniana',
      username: 'doriejean',
      email:    'doriejean@gmail.com',
      password: 'jeandorie123',
      role:     'teacher',
    });

    console.log('🌱 Teacher account seeded successfully');
    console.log('   Username : doriejean');
    console.log('   Password : jeandorie123');
  } catch (err) {
    console.error('❌ Seeder error:', err.message);
  }
};

export default seedTeacher;
