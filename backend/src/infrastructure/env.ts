import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT) || 3000,
  jwtSecret: process.env.JWT_SECRET!,
  jwtExpiry: '1h',
  bcryptSalt: Number(process.env.BCRYPT_SALT) || 10,
  pg: {
    user: process.env.POSTGRES_USER!,
    host: process.env.POSTGRES_HOST!,
    database: process.env.POSTGRES_DB!,
    password: process.env.POSTGRES_PASSWORD!,
    port: Number(process.env.POSTGRES_PORT),
  },
  email: {
    service: process.env.EMAIL_SERVICE || 'gmail',
    from: process.env.EMAIL_FROM!,
    pass: process.env.EMAIL_PASS!,
    fromName: process.env.EMAIL_FROM_NAME || 'No Reply',
  },
  verification: {
    codeLength: Number(process.env.VERIFICATION_CODE_LENGTH) || 6,
    expiryMinutes: Number(process.env.VERIFICATION_CODE_EXPIRY_MINUTES) || 10,
  },
};
