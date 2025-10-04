import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../application/AuthService';

const authService = new AuthService();

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Missing token' });

    const token = authHeader.split(' ')[1];
    const userId = authService.verifyToken(token);

    if (!userId) return res.status(401).json({ error: 'Invalid token' });

    req.userId = userId;
    next();
}
