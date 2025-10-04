import jwt, { SignOptions } from 'jsonwebtoken';
import { logger } from '../infrastructure/logger';
import bcrypt from 'bcryptjs';
import { env } from '../infrastructure/env';
import { UserService } from './UserService';

export class AuthService {
    private userService = new UserService();

    async login(email: string, password: string): Promise<string> {
        logger.info(`AuthService.login - entrada: ${email}`);
        const user = await this.userService.findByEmail(email);
        if (!user) {
            logger.warn(`AuthService.login - usuário não encontrado: ${email}`);
            throw new Error('Invalid credentials');
        }
        if (!user.verified) {
            logger.warn(`AuthService.login - conta não verificada: ${email}`);
            throw new Error('Account not verified');
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            logger.warn(`AuthService.login - senha inválida: ${email}`);
            throw new Error('Invalid credentials');
        }

        const payload = { userId: user.id };
        const options: SignOptions = { expiresIn: env.jwtExpiry as jwt.SignOptions['expiresIn'] };

        const token = jwt.sign(payload, env.jwtSecret as string, options);
        logger.info(`AuthService.login - sucesso: ${email}`);
        return token;
    }

    verifyToken(token: string): string | null {
        logger.info('AuthService.verifyToken - entrada');
        try {
            const decoded = jwt.verify(token, env.jwtSecret as string) as { userId: string };
            logger.info('AuthService.verifyToken - sucesso');
            return decoded.userId;
        } catch (err: any) {
            logger.error(`AuthService.verifyToken - erro: ${err.message}`, { stack: err.stack });
            return null;
        }
    }
}
