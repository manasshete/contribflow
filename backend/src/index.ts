import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { generalRateLimiter } from './middleware/rateLimiter';
import repositoryRoutes from './routes/repository.routes';
import recommendationRoutes from './routes/recommendation.routes';
import issueRoutes from './routes/issue.routes';
import chatRoutes from './routes/chat.routes';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(generalRateLimiter);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

app.use('/api/repositories', repositoryRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/chat', chatRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

async function start() {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection failed:', err);
    process.exit(1);
  }

  app.listen(env.PORT, () => {
    console.log(`ContribFlow backend listening on port ${env.PORT}`);
  });
}

start();
