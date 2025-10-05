import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { NextFunction, Request, Response, Router } from 'express';

import { AuthService } from '../application/AuthService';
import { UserService } from '../application/UserService';
import { LoginUserDto } from '../dto/LoginUserDto';
import { RegisterUserDto } from '../dto/RegisterUserDto';
import { ResendVerificationDto } from '../dto/ResendVerificationDto';
import { VerifyUserDto } from '../dto/VerifyUserDto';
import { env } from '../infrastructure/env';
import { logger } from '../infrastructure/logger';
import { sendVerificationEmail } from './Mailer';

const router = Router();
const userService = new UserService();
const authService = new AuthService();

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  logger.info('POST /user - entrada');
  try {
    const dto = plainToInstance(RegisterUserDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }
    const { email, password } = dto;
    const code = Math.random()
      .toString()
      .slice(2, 2 + env.verification.codeLength);
    const expires = new Date(Date.now() + env.verification.expiryMinutes * 60000);

    const user = await userService.createUser(email, password, code, expires);
    await sendVerificationEmail(email, code);

    logger.info(`POST /user - sucesso: userId=${user.id}`);
    res
      .status(201)
      .json({ message: 'User created. Check your email for verification code.', userId: user.id });
  } catch (err: any) {
    logger.error(`POST /user - erro: ${err.message}`, { stack: err.stack });
    res.status(500).json({ error: 'Failed to register user' });
    next(err);
  }
});

router.post('/verify', async (req: Request, res: Response, next: NextFunction) => {
  logger.info('POST /verify - entrada');
  try {
    const dto = plainToInstance(VerifyUserDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }
    const { email, code } = dto;
    const verified = await userService.verifyUser(email, code);
    if (!verified) {
      logger.warn('POST /user/verify - código inválido ou expirado');
      return res.status(400).json({ error: 'Invalid or expired code' });
    }
    logger.info(`POST /user/verify - sucesso: email=${email}`);
    res.json({ message: 'Account verified successfully' });
  } catch (err: any) {
    logger.error(`POST /user/verify - erro: ${err.message}`, { stack: err.stack });
    res.status(500).json({ error: 'Verification failed' });
    next(err);
  }
});

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  logger.info('POST /login - entrada');
  try {
    const dto = plainToInstance(LoginUserDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }
    const { email, password } = dto;
    const token = await authService.login(email, password);
    logger.info(`POST /user/login - sucesso: email=${email}`);
    res.json({ token });
  } catch (err: any) {
    logger.error(`POST /user/login - erro: ${err.message}`, { stack: err.stack });
    res.status(401).json({ error: err.message });
    next(err);
  }
});

router.post('/resend-verification', async (req: Request, res: Response, next: NextFunction) => {
  logger.info('POST /resend-verification - entrada');
  try {
    const dto = plainToInstance(ResendVerificationDto, req.body);
    const errors = await validate(dto);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }
    const { email } = dto;
    const user = await userService.findByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.verified) {
      return res.status(400).json({ error: 'User already verified' });
    }
    const codeLength = env.verification.codeLength || 6;
    const expiryMinutes = env.verification.expiryMinutes || 10;
    const code = Math.random()
      .toString()
      .slice(2, 2 + codeLength);
    const expires = new Date(Date.now() + expiryMinutes * 60000);
    await userService.updateVerificationCode(email, code, expires);
    await sendVerificationEmail(email, code);
    logger.info('POST /resend-verification - novo código enviado', { email });
    return res.status(200).json({
      message: 'Verification code resent successfully',
    });
  } catch (err: any) {
    logger.error('Erro ao reenviar código de verificação', { error: err.message });
    return res.status(500).json({ error: 'Internal server error' });
    next(err);
  }
});

export default router;
