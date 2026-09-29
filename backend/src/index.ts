import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import { connectDB } from './lib/db';
import { isAllowedOrigin } from './config/env';
import { generalRateLimiter } from './middleware/rateLimiter';
import { attachGithubUser } from './middleware/auth';
import repositoryRoutes from './routes/repository.routes';
import recommendationRoutes from './routes/recommendation.routes';
import issueRoutes from './routes/issue.routes';
import firstContributionRoutes from './routes/first-contribution.routes';
import authRoutes from './routes/auth.routes';
import githubActionsRoutes from './routes/github-actions.routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

const app = express();

app.set('trust proxy', 1);
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(generalRateLimiter);

app.get('/', (_req, res) => {
  res.json({ name: 'ContribFlow API', status: 'online' });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', mongo: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

app.use(async (_req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(503).json({ error: 'Database connection failed. Please check MongoDB Atlas IP whitelist or try again shortly.' });
  }
});

app.use(attachGithubUser);

app.use('/api/repositories', repositoryRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api', firstContributionRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/github', githubActionsRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

if (!process.env.VERCEL) {
  const port = process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`ContribFlow backend running on port ${port}`);
  });
}

export default app;
module.exports = app;
