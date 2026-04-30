import { Router } from 'express';
import {
  createNewRecord,
  deleteExistingRecord,
  getRecords,
  updateExistingRecord
} from '../controllers/recordController.js';

const router = Router();

router.get('/', getRecords);
router.post('/', createNewRecord);
router.put('/:id', updateExistingRecord);
router.delete('/:id', deleteExistingRecord);

export default router;
