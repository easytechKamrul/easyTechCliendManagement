import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import Admin from '../models/Admin';
import { signToken } from '../utils/jwt';
import { asyncHandler } from '../middleware/errorHandler';
import { isAllowedAdminEmail, verifyFirebaseIdToken } from '../config/firebaseAdmin';

// POST /api/auth/login  { userId, password }
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { userId, password } = req.body as { userId?: string; password?: string };

  if (!userId || !password) {
    return res.status(400).json({ message: 'User ID and password are required' });
  }

  const admin = await Admin.findOne({ userId: userId.trim() });
  if (!admin) return res.status(401).json({ message: 'Wrong user ID or password' });

  const ok = await bcrypt.compare(password, admin.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Wrong user ID or password' });

  const token = signToken({ id: admin.id, userId: admin.userId });
  res.json({ token, userId: admin.userId });
});

// POST /api/auth/firebase  { idToken }
// Firebase verifies the Google identity; the server then enforces its own email allowlist.
export const firebaseLogin = asyncHandler(async (req: Request, res: Response) => {
  const { idToken } = req.body as { idToken?: string };
  if (!idToken) return res.status(400).json({ message: 'Firebase ID token is required' });

  const decoded = await verifyFirebaseIdToken(idToken);
  const email = decoded.email?.trim().toLowerCase();
  if (!decoded.email_verified || !isAllowedAdminEmail(email)) {
    return res.status(403).json({ message: 'Access denied. This email is not an authorised admin.' });
  }

  const token = signToken({ id: decoded.uid, userId: email });
  res.json({ token, userId: email });
});

// GET /api/auth/me  (requires token) — lets the frontend confirm a stored token is still valid
export const me = asyncHandler(async (req: Request, res: Response) => {
  res.json({ userId: req.admin?.userId });
});
