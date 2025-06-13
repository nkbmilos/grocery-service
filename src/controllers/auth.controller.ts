import {NextFunction, Request, Response} from 'express';
import UserModel, {IUserDocument} from '../models/user.model';
import jwt from 'jsonwebtoken';

export const login = async (req: Request, res: Response,  next: NextFunction): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        const user: IUserDocument | null = await UserModel.findOne({ email }) as IUserDocument | null;

        if (!user || !(await user.comparePassword(password))) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role,
                nodeId: user.node,
            },
            process.env.JWT_SECRET || 'default_secret',
            { expiresIn: '1h' }
        );

        res.json({ token });
    } catch (err) {
        next(err);
    }
};
