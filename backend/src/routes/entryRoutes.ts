import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { getEntries, createEntry, updateEntry, deleteEntry, addPayment } from '../controllers/entryController';

const router = Router();

// Every entry route requires a valid admin token.
router.use(requireAuth);

router.get('/', getEntries);
router.post('/', createEntry);
router.put('/:id', updateEntry);
router.delete('/:id', deleteEntry);
router.post('/:id/payments', addPayment);

export default router;
