import { Router } from 'express';
import { aiRateLimiter } from '../middleware/rateLimiter';
import { createRecommendationsHandler } from '../controllers/recommendation.controller';

const router = Router();

router.post('/', aiRateLimiter, createRecommendationsHandler);

export default router;
