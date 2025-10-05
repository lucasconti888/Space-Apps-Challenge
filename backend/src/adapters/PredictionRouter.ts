import { Router } from 'express';

import { PredictionController } from './PredictionController';

const router = Router();

router.post('/prediction', PredictionController.predict);

export default router;
