import { Router } from 'express';
import { heavyRateLimiter } from '../middleware/rateLimiter';
import {
  getFirstContributionStateHandler,
  submitFirstContributionProfileHandler,
  selectFirstContributionIssueHandler,
  updateFirstContributionProgressHandler,
} from '../controllers/first-contribution.controller';

const router = Router();

router.get('/repositories/:owner/:repo/first-contribution', getFirstContributionStateHandler);
router.post('/repositories/:owner/:repo/first-contribution/profile', heavyRateLimiter, submitFirstContributionProfileHandler);
router.post('/repositories/:owner/:repo/first-contribution/issue', heavyRateLimiter, selectFirstContributionIssueHandler);
router.patch('/first-contribution/:id/progress', updateFirstContributionProgressHandler);

export default router;
