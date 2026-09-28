import { Router } from 'express';
import { heavyRateLimiter } from '../middleware/rateLimiter';
import { createRecommendationsHandler } from '../controllers/recommendation.controller';

const router = Router();

router.post('/', heavyRateLimiter, createRecommendationsHandler);

export default router;
