import { Router } from 'express';
import { getSentinelAnalysis } from '../controllers/sentinelController.js';

const router = Router();

router.post('/analyze', getSentinelAnalysis);

export default router;