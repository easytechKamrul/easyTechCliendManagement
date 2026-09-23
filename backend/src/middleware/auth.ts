import { Request, Response, NextFunction } from 'express';
import { isAllowedAdminEmail, verifyFirebaseIdToken } from '../config/firebaseAdmin';

/**
 * Protects a route: expects "Authorization: Bearer <token>".
 * The token must be a Firebase ID token from an authorised, verified admin.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = header.slice('Bearer '.length);
  void verifyFirebaseIdToken(token)
    .then((decoded) => {
      const email = decoded.email?.trim().toLowerCase();
      if (!decoded.email_verified || !isAllowedAdminEmail(email)) {
        res.status(403).json({ message: 'Access denied. This email is not an authorised admin.' });
        return;
      }

      req.admin = { id: decoded.uid, userId: email };
    next();
    })
    .catch(() => res.status(401).json({ message: 'Invalid or expired Firebase token' }));
}
