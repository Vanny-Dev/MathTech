import Module from '../models/Module.js';
import Activity from '../models/Activity.js';

/**
 * Shared, idempotent seeding for one week's module + its activities.
 *
 * Creates initial content only. Existing lesson and question identities are
 * preserved, including older content that already has student submissions.
 */
export const seedModuleWithActivities = async ({
  label,
  moduleData,
  practiceActivities,
  gradedActivities,
}) => {
  const build = (moduleId) => [
    ...practiceActivities.map((a) => ({ ...a, isPractice: true,  points: 1, moduleId })),
    ...gradedActivities.map((a)   => ({ ...a, isPractice: false, points: 1, moduleId })),
  ];

  try {
    const existing = await Module.findOne({ $or: [{ seedKey: label }, { title: moduleData.title }] });

    if (existing) {
      if (!existing.seedKey) await Module.updateOne({ _id: existing._id }, { $set: { seedKey: label } });
      console.log(`✅ ${label} exists — preserving stored lessons and activities`);
      return;
    }

    const module = await Module.create({ ...moduleData, seedKey: label });

    try {
      await Activity.insertMany(build(module._id));
    } catch (err) {
      // Don't leave a topic with no questions behind
      await Module.findByIdAndDelete(module._id);
      throw err;
    }

    console.log(`🌱 ${label} content seeded successfully`);
    console.log(`   Module     : ${module.title}`);
    console.log(`   Practice   : ${practiceActivities.length} items (unscored)`);
    console.log(`   Graded     : ${gradedActivities.length} items (${gradedActivities.length} points)`);
  } catch (err) {
    console.error(`❌ ${label} seeder error:`, err.message);
  }
};
