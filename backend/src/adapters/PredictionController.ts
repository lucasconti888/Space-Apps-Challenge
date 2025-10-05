import { Request, Response } from 'express';

import { PredictionService } from '../application/PredictionService';
import { PredictionRequestDto } from '../dto/PredictionRequestDto';

export class PredictionController {
    static async predict(req: Request, res: Response) {
        try {
            const { lat, long, date } = req.body;
            if (typeof lat !== 'number' || typeof long !== 'number' || !date) {
                return res.status(400).json({ error: 'Invalid request body' });
            }
            const dto: PredictionRequestDto = { lat, long, date };
            const result = await PredictionService.predict(dto);
            return res.json(result);
        } catch (err) {
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
}
