import { Router } from 'express';
import { startGithubAuth, githubAuthCallback, getCurrentUser, logout } from '../controllers/auth.controller';

const router = Router();

router.get('/github', startGithubAuth);
router.get('/github/callback', githubAuthCallback);
router.get('/me', getCurrentUser);
router.post('/logout', logout);

export default router;
