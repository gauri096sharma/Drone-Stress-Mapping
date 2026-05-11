import { Router } from 'express';
import multer from 'multer';
import { processMultispectralImages } from '../controllers/imageController.js';

const router = Router();

const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

router.post(
  '/process',
  upload.fields([
    { name: 'red', maxCount: 1 },
    { name: 'green', maxCount: 1 },
    { name: 'nir', maxCount: 1 },
    { name: 'redEdge', maxCount: 1 }
  ]),
  processMultispectralImages
);

export default router;