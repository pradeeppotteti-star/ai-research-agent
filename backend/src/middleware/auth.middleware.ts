import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { localDb } from '../services/storage/localDb.service';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    name?: string;
    role?: string;
    institution?: string;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Authentication token missing.',
      code: 'AUTH_TOKEN_MISSING',
    });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as {
      userId: string;
      email: string;
      name?: string;
      role?: string;
      institution?: string;
    };
    req.user = decoded;

    // Resilient serverless re-hydration: if this container cold-started, ensure user exists in memory/tmp
    if (decoded.userId && decoded.email && !localDb.getUserById(decoded.userId)) {
      localDb.restoreUserFromToken({
        id: decoded.userId,
        email: decoded.email,
        name: decoded.name || decoded.email.split('@')[0],
        role: decoded.role || 'Researcher',
        institution: decoded.institution || 'Academic Institution',
      });
    }

    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired authentication token.',
      code: 'AUTH_TOKEN_INVALID',
    });
  }
};
