import { Router } from 'express';
import { aiRateLimiter } from '../middleware/rateLimiter';
import { postChatMessageHandler, getConversationHandler } from '../controllers/chat.controller';

const router = Router();

router.post('/', aiRateLimiter, postChatMessageHandler);
router.get('/:owner/:repo/:issueNumber', getConversationHandler);

export default router;
