import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import { connectDB } from './lib/db';
import { generalRateLimiter } from './middleware/rateLimiter';
import repositoryRoutes from './routes/repository.routes';
import recommendationRoutes from './routes/recommendation.routes';
import issueRoutes from './routes/issue.routes';
import firstContributionRoutes from './routes/first-contribution.routes';

const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(generalRateLimiter);

app.use(async (_req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(503).json({ error: 'Database connection failed. Please try again shortly.' });
  }
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

app.use('/api/repositories', repositoryRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api', firstContributionRoutes);

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`ContribFlow backend running on port ${port}`);
  });
}

export default app;
