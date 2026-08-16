import Module from '../models/Module.js';
import Activity from '../models/Activity.js';

/**
 * Shared, idempotent seeding for one week's module + its activities.
 *
 * Guarantees a module never ends up published with a partial question set:
 * if the activity insert fails the module is rolled back, and an existing
 * module with the wrong activity count is repaired rather than skipped.
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
  const expected = practiceActivities.length + gradedActivities.length;

  try {
    const existing = await Module.findOne({ title: moduleData.title });

    if (existing) {
      const count = await Activity.countDocuments({ moduleId: existing._id });

      if (count === expected) {
        console.log(`✅ ${label} content already complete — skipping seed`);
        return;
      }

      console.warn(`⚠️  ${label} module exists but has ${count}/${expected} activities — repairing`);
      await Activity.deleteMany({ moduleId: existing._id });
      await Activity.insertMany(build(existing._id));
      console.log(`🌱 ${label} activities repaired (${expected} items)`);
      return;
    }

    const module = await Module.create(moduleData);

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
