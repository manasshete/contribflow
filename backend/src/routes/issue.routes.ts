import { Router } from 'express';
import { heavyRateLimiter } from '../middleware/rateLimiter';
import { getIssueDetailHandler, analyzeIssueHandler, getIssueToolkitHandler } from '../controllers/issue.controller';

const router = Router();

router.get('/:owner/:repo/:issueNumber', getIssueDetailHandler);
router.post('/:owner/:repo/:issueNumber/analyze', heavyRateLimiter, analyzeIssueHandler);
router.get('/:owner/:repo/:issueNumber/toolkit', getIssueToolkitHandler);

export default router;
