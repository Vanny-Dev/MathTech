import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import seedTeacher from './config/seeder.js';
import seedWeek1 from './config/seedWeek1.js';
import authRoutes     from './routes/authRoutes.js';
import userRoutes     from './routes/userRoutes.js';
import moduleRoutes   from './routes/moduleRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import teacherRoutes  from './routes/teacherRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

// Origins allowed to call this API. CLIENT_URL may hold a comma-separated list
// so a staging site can be added without a code change.
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''))   // tolerate a trailing slash
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    // No origin = same-origin, curl, or a health check — always allow
    if (!origin) return callback(null, true);

    const clean = origin.replace(/\/$/, '');
    if (allowedOrigins.includes(clean)) return callback(null, true);

    // Vercel preview deployments for this project, e.g.
    // https://mathtech-git-somebranch-user.vercel.app
    if (process.env.ALLOW_VERCEL_PREVIEWS === 'true' &&
        /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(clean)) {
      return callback(null, true);
    }

    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
};

const startServer = async () => {
  await connectDB();
  await seedTeacher();
  await seedWeek1();

  const app = express();

  // Render/Railway sit behind a proxy; this makes req.ip and req.protocol honest
  app.set('trust proxy', 1);

  app.use(cors(corsOptions));
  app.use(express.json());

  // Root — so hitting the bare backend URL is not a confusing "Cannot GET /"
  app.get('/', (req, res) => {
    res.json({ name: 'MathTech API', status: 'ok', docs: '/health' });
  });

  // Health check
  app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', uptime: process.uptime() });
  });


  app.use('/api/auth',       authRoutes);
  app.use('/api/users',      userRoutes);
  app.use('/api/modules',    moduleRoutes);
  app.use('/api/activities', activityRoutes);
  app.use('/api/progress',   progressRoutes);
  app.use('/api/feedback',   feedbackRoutes);
  app.use('/api/teacher',    teacherRoutes);

  // Unknown route -> JSON, not Express's default HTML page
  app.use((req, res) => {
    res.status(404).json({ message: `Not found: ${req.method} ${req.originalUrl}` });
  });

  app.use(errorHandler);

  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, '0.0.0.0', () =>
    console.log(`🚀 Server running on port ${PORT} (${process.env.NODE_ENV || 'development'})`)
  );

  // Render sends SIGTERM on redeploy. Finish in-flight requests instead of
  // dropping them, then close the Mongo connection cleanly.
  const shutdown = (signal) => () => {
    console.log(`${signal} received — shutting down`);
    server.close(async () => {
      const mongoose = (await import('mongoose')).default;
      await mongoose.connection.close();
      process.exit(0);
    });
    // Don't hang forever if a connection refuses to close
    setTimeout(() => process.exit(1), 10000).unref();
  };

  process.on('SIGTERM', shutdown('SIGTERM'));
  process.on('SIGINT',  shutdown('SIGINT'));
};

startServer();
