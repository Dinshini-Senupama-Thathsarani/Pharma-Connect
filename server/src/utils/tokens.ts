import crypto from 'crypto';
import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

export interface TokenPayload {
  id: string;
  role: string;
}

export const signAccessToken = (payload: TokenPayload): string =>
  jwt.sign(payload, env.jwtSecret, { expiresIn: env.accessExpires as SignOptions['expiresIn'] });

export const signRefreshToken = (payload: TokenPayload): string =>
  jwt.sign(payload, env.jwtRefreshSecret, { expiresIn: env.refreshExpires as SignOptions['expiresIn'] });

export const verifyAccessToken = (token: string): TokenPayload =>
  jwt.verify(token, env.jwtSecret) as TokenPayload;

export const verifyRefreshToken = (token: string): TokenPayload =>
  jwt.verify(token, env.jwtRefreshSecret) as TokenPayload;

// Refresh tokens are stored hashed so a DB leak does not expose usable tokens
export const hashToken = (token: string): string => crypto.createHash('sha256').update(token).digest('hex');
