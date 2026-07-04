import type { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        role: 'Employee' | 'HR';
        employeeId: string;
    };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access denied. Token missing.' });
    }

    try {
        const secretKey = process.env.JWT_SECRET || 'fallback_secret_key';
        const verified = jwt.verify(token, secretKey) as { userId: string; role: 'Employee' | 'HR'; employeeId: string; };
        req.user = verified;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Invalid or expired token.' });
    }
};

export const requireHR = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== 'HR') {
        return res.status(403).json({ error: 'Access denied. HR privileges required.' });
    }
    next();
};