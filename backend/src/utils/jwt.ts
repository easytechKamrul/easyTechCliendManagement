import jwt, { SignOptions } from 'jsonwebtoken';

export interface AdminPayload {
  id: string;
  userId: string;
}

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set in the environment');
  return secret;
}

export function signToken(payload: AdminPayload): string {
  const expiresIn = (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'];
  return jwt.sign(payload, getSecret(), { expiresIn });
}

export function verifyToken(token: string): AdminPayload {
  return jwt.verify(token, getSecret()) as AdminPayload;
}
