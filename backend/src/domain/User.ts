export type User = {
  id: string;
  email: string;
  password: string;
  verified: boolean;
  verificationCode: string | null;
  verificationExpires: Date | null;
};
