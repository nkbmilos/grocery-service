import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';

export type AuthRequest = Request & {
    user?: {
        userId: string;
        role: 'manager' | 'employee';
        nodeId: string;
    };
};

export const authenticate: RequestHandler = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ message: 'No token provided' });
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret') as AuthRequest['user'];
        (req as unknown as AuthRequest).user = decoded;

        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
};
