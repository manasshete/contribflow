import { Router } from 'express';
import { requireGithubAuth } from '../middleware/auth';
import { heavyRateLimiter } from '../middleware/rateLimiter';
import { forkRepositoryHandler, createBranchHandler, createDraftPrHandler } from '../controllers/github-actions.controller';

const router = Router();

router.use(requireGithubAuth);
router.post('/fork', heavyRateLimiter, forkRepositoryHandler);
router.post('/branch', heavyRateLimiter, createBranchHandler);
router.post('/pull-request', heavyRateLimiter, createDraftPrHandler);

export default router;
