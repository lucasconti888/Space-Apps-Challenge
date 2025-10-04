import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../infrastructure/db';
import { env } from '../infrastructure/env';
import { logger } from '../infrastructure/logger';
import { User } from '../domain/User';

type UserRow = {
  id: string;
  email: string;
  password: string;
  verified: boolean;
  verification_code: string | null;
  verification_expires: Date | string | null;
};

function mapRowToUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    password: row.password,
    verified: row.verified,
    verificationCode: row.verification_code,
    verificationExpires: row.verification_expires
      ? new Date(row.verification_expires)
      : null,
  };
}

export class UserService {
  async createUser(
    email: string,
    password: string,
    code: string,
    expires: Date,
  ): Promise<User> {
    logger.info('UserService.createUser:start', { email });

    const hash = await bcrypt.hash(password, env.bcryptSalt);
    const id = uuidv4();

    await db.query(
      `INSERT INTO users (id, email, password, verified, verification_code, verification_expires)
       VALUES ($1, $2, $3, false, $4, $5)`,
      [id, email, hash, code, expires],
    );

    const user: User = {
      id,
      email,
      password: hash,
      verified: false,
      verificationCode: code,
      verificationExpires: expires,
    };

    logger.info('UserService.createUser:ok', { userId: id });
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    logger.debug('UserService.findByEmail', { email });

    const result = await db.query<UserRow>(
      'SELECT * FROM users WHERE email = $1 LIMIT 1',
      [email],
    );

    if (result.rowCount === 0) return null;
    return mapRowToUser(result.rows[0]);
  }

  async verifyUser(email: string, code: string): Promise<boolean> {
    logger.info('UserService.verifyUser:start', { email });

    const user = await this.findByEmail(email);
    if (!user || user.verified) return false;

    if (
      !user.verificationCode ||
      !user.verificationExpires ||
      user.verificationCode !== code ||
      user.verificationExpires.getTime() < Date.now()
    ) {
      return false;
    }

    await db.query(
      `UPDATE users
         SET verified = true,
             verification_code = null,
             verification_expires = null
       WHERE email = $1`,
      [email],
    );

    logger.info('UserService.verifyUser:ok', { email });
    return true;
  }

  async updateVerificationCode(email: string, code: string, expires: Date): Promise<void> {
    await db.query(
      `UPDATE users
     SET verification_code = $1,
         verification_expires = $2
     WHERE email = $3`,
      [code, expires, email],
    );
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return this.findByEmail(email);
  }
}
