// Extends Express's Request type so req.admin is available after the auth middleware runs.
import { AdminPayload } from '../../utils/jwt';

declare global {
  namespace Express {
    interface Request {
      admin?: AdminPayload;
    }
  }
}

export {};
