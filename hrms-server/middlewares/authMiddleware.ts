import type { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_hackathon_key';

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
        const verified = jwt.verify(token, JWT_SECRET) as { userId: string; role: 'Employee' | 'HR'; employeeId: string; };
        req.user = verified;
        next();
    } catch (error) {
        res.status(403).json({ error: 'Invalid or expired token.' });
    };
}

export const requireHR = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== 'HR') {
        return res.status(403).json({ error: 'Access denied. HR privilages required.' });

    }
    next();
}
