import { Router } from 'express';
import { heavyRateLimiter } from '../middleware/rateLimiter';
import { getIssueDetailHandler, analyzeIssueHandler } from '../controllers/issue.controller';

const router = Router();

router.get('/:owner/:repo/:issueNumber', getIssueDetailHandler);
router.post('/:owner/:repo/:issueNumber/analyze', heavyRateLimiter, analyzeIssueHandler);

export default router;
