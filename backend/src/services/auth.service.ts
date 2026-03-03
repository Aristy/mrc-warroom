import crypto from 'crypto';
import type { User } from '../db/queries/users.js';

export function verifyPassword(user: User, password: string): boolean {
  if (!user.passwordHash || !user.passwordSalt) return false;
  const expected = Buffer.from(user.passwordHash, 'hex');
  const candidate = crypto.scryptSync(String(password || ''), user.passwordSalt, 64);
  if (expected.length !== candidate.length) return false;
  return crypto.timingSafeEqual(expected, candidate);
}
