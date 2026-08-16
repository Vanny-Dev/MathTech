import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error('MONGO_URI is not set');

    const conn = await mongoose.connect(uri, {
      // Fail fast on a bad URI or blocked IP instead of hanging the boot
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`❌ MongoDB error: ${err.message}`);
    // Exit non-zero so Render marks the deploy failed and restarts,
    // rather than serving an API with no database behind it.
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('❌ MongoDB disconnected');
});

export default connectDB;
