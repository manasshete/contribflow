import { Router } from 'express';
import { heavyRateLimiter } from '../middleware/rateLimiter';
import { analyzeRepositoryHandler, getRepositoryHandler } from '../controllers/repository.controller';
import { getRepositoryIssuesHandler } from '../controllers/issue.controller';

const router = Router();

router.post('/analyze', heavyRateLimiter, analyzeRepositoryHandler);
router.get('/:owner/:repo/issues', heavyRateLimiter, getRepositoryIssuesHandler);
router.get('/:owner/:repo', getRepositoryHandler);

export default router;
