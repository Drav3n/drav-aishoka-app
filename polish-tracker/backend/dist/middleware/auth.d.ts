import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
export declare const authMiddleware: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const optionalAuth: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const generateToken: (userId: string, email: string) => string;
//# sourceMappingURL=auth.d.ts.map