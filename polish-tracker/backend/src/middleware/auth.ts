import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../utils/database';
import { User, JwtPayload, AuthRequest } from '../types';
import { createError } from './errorHandler';

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check if dev mode is enabled and skip auth
    if (process.env.DEV_MODE === 'true') {
      // Create a dev user if it doesn't exist
      const devUserResult = await query(
        'SELECT * FROM users WHERE provider = $1 AND email = $2',
        ['dev', 'dev@localhost']
      );

      let devUser: User;
      if (devUserResult.rows.length === 0) {
        const newDevUser = await query(
          `INSERT INTO users (email, name, provider, provider_id) 
           VALUES ($1, $2, $3, $4) RETURNING *`,
          ['dev@localhost', 'Dev User', 'dev', 'dev-user-id']
        );
        devUser = newDevUser.rows[0];
      } else {
        devUser = devUserResult.rows[0];
      }

      req.user = devUser;
      return next();
    }

    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError('No token provided', 401);
    }

    const token = authHeader.substring(7);

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    // Get user from database
    const userResult = await query(
      'SELECT * FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      throw createError('User not found', 401);
    }

    req.user = userResult.rows[0];
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(createError('Invalid token', 401));
    }
    if (error instanceof jwt.TokenExpiredError) {
      return next(createError('Token expired', 401));
    }
    next(error);
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    const userResult = await query(
      'SELECT * FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length > 0) {
      req.user = userResult.rows[0];
    }

    next();
  } catch (error) {
    // Ignore auth errors for optional auth
    next();
  }
};

export const generateToken = (userId: string, email: string): string => {
  return jwt.sign(
    { userId, email },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};