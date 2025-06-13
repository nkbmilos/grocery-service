import { Response, NextFunction, Request } from 'express';
import { AuthRequest } from './auth.middleware';

export const authorizeRoles = (...roles: ('manager' | 'employee')[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const user = (req as unknown as AuthRequest).user;

        if (!user || !roles.includes(user.role)) {
            res.status(403).json({ message: 'Forbidden' });
            return;
        }

        next();
    };
};
