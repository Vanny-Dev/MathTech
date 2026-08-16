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

const startServer = async () => {
  await connectDB();
  await seedTeacher();
  await seedWeek1();

  const app = express();

  app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
  app.use(express.json());

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

  app.use(errorHandler);

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
};

startServer();
