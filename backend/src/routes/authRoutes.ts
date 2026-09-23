import { Router } from 'express';
import { firebaseLogin, login, me } from '../controllers/authController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/login', login);
router.post('/firebase', firebaseLogin);
router.get('/me', requireAuth, me);

export default router;
