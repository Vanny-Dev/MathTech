import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import seedTeacher from './config/seeder.js';
import seedDeveloper from './config/seedDeveloper.js';
import seedTopic1Week1 from './config/seedTopic1Week1.js';
import seedTopic2Week1 from './config/seedTopic2Week1.js';
import seedTopic3Week2 from './config/seedTopic3Week2.js';
import seedTopic4Week2 from './config/seedTopic4Week2.js';
import authRoutes     from './routes/authRoutes.js';
import userRoutes     from './routes/userRoutes.js';
import moduleRoutes   from './routes/moduleRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import teacherRoutes  from './routes/teacherRoutes.js';
import reflectionRoutes from './routes/reflectionRoutes.js';
import adRoutes from './routes/adRoutes.js';
import developerAdRoutes from './routes/developerAdRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { corsOptions } from './config/cors.js';
import { initRealtime } from './realtime/index.js';

dotenv.config();

const startServer = async () => {
  await connectDB();
  await seedTeacher();
  await seedDeveloper();
  await seedTopic1Week1();
  await seedTopic2Week1();
  await seedTopic3Week2();
  await seedTopic4Week2();

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
  app.use('/api/reflections', reflectionRoutes);
  app.use('/api/ads',           adRoutes);
  app.use('/api/developer/ads', developerAdRoutes);

  // Unknown route -> JSON, not Express's default HTML page
  app.use((req, res) => {
    res.status(404).json({ message: `Not found: ${req.method} ${req.originalUrl}` });
  });

  app.use(errorHandler);

  const PORT = process.env.PORT || 5000;

  // An explicit http server, because Socket.IO needs to share it with Express —
  // Render exposes one port, so the API and the websocket live on the same one.
  const server = http.createServer(app);
  initRealtime(server);

  server.listen(PORT, '0.0.0.0', () =>
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
