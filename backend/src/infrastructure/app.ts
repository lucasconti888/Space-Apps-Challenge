import express, { NextFunction, Request, Response } from 'express';

import predictionRouter from '../adapters/PredictionRouter';
import userController from '../adapters/UserController';
import { authMiddleware } from '../middleware/authMiddleware';
import { logger } from './logger';

const app = express();
app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`Incoming request: ${req.method} ${req.url}`);
  next();
});

app.use((req: Request, res: Response, next: NextFunction) => {
  const oldSend = res.send;
  res.send = function (body: any) {
    logger.info(`Response: ${req.method} ${req.url} - Status: ${res.statusCode}`);
    return oldSend.call(this, body);
  };
  next();
});

app.use('/api', predictionRouter);
app.use('/user', userController);

app.get('/profile', authMiddleware, (req: Request, res: Response) => {
  logger.info(`Profile requested for userId: ${(req as any).userId}`);
  res.json({ message: `User profile for ${(req as any).userId}` });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(`Error on request: ${req.method} ${req.url} - ${err.message}`);
  next(err);
});

export default app;
