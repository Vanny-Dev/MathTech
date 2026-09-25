import User from '../models/User.js';

/**
 * Brings the users collection's indexes in line with the schema.
 *
 * `email` used to be required and uniquely indexed. Students no longer give
 * one, and MongoDB counts a missing field as null inside a plain unique index
 * — so the first student to register without an email took "null", and every
 * student after them was rejected with a duplicate-key error that surfaced as
 * "That email is already taken" on a form with no email field on it.
 *
 * Mongoose cannot fix this on its own: it never alters an index that already
 * exists with different options, it only logs the conflict. The stale index has
 * to be dropped so the sparse one in the schema can be built in its place.
 *
 * Runs on every boot and does nothing once the collection is already correct.
 */
const fixIndexes = async () => {
  try {
    const collection = User.collection;

    let existing;
    try {
      existing = await collection.indexes();
    } catch (err) {
      // Collection not created yet (fresh database) — the schema indexes will
      // be built correctly the first time a user is saved.
      if (err.codeName === 'NamespaceNotFound' || err.code === 26) return;
      throw err;
    }

    const email = existing.find((i) => i.name === 'email_1');
    const stale = email && email.unique && !email.sparse && !email.partialFilterExpression;

    if (stale) {
      await collection.dropIndex('email_1');
      console.log('🔧 Dropped the old non-sparse unique index on email');
    }

    // A stored null is not the same as a missing field: a sparse index skips
    // the missing one but still indexes the null, which would recreate the
    // exact clash this is meant to end.
    const { modifiedCount } = await collection.updateMany(
      { email: null },
      { $unset: { email: '' } }
    );
    if (modifiedCount > 0) {
      console.log(`🔧 Cleared ${modifiedCount} empty email field${modifiedCount === 1 ? '' : 's'}`);
    }

    // Builds anything the schema declares and is missing — the sparse email
    // index above, and the access code index on an older database.
    await User.syncIndexes();
  } catch (err) {
    // A boot must not fail over index housekeeping; the cause is logged and
    // the API still comes up.
    console.error('❌ Could not reconcile user indexes:', err.message);
  }
};

export default fixIndexes;
