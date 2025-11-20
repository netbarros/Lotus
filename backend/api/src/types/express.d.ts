/**
 * Type augmentation for Express Request
 */
import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        tenant_id?: string;
        [key: string]: any;
      };
    }
  }
}

export {};
