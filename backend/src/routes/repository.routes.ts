import { Router } from 'express';
import { aiRateLimiter } from '../middleware/rateLimiter';
import { analyzeRepositoryHandler, getRepositoryHandler } from '../controllers/repository.controller';
import { getRepositoryIssuesHandler } from '../controllers/issue.controller';

const router = Router();

router.post('/analyze', aiRateLimiter, analyzeRepositoryHandler);
router.get('/:owner/:repo/issues', aiRateLimiter, getRepositoryIssuesHandler);
router.get('/:owner/:repo', getRepositoryHandler);

export default router;
