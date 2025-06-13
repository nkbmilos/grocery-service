import { Request, Response } from 'express';
import UserModel from '../models/user.model';
import { getDescendantNodeIds } from '../utils/node.utils';

export const getUsers = async (req: Request, res: Response) => {
    try {
        const { role, node, includeDescendants } = req.query;

        if (!role || !node) {
            return res.status(400).json({ message: 'Missing required query parameters: role and node' });
        }

        const roles = ['employee', 'manager'];
        if (!roles.includes(role as string)) {
            return res.status(400).json({ message: 'Invalid role parameter' });
        }

        let nodeIds = [node as string];

        if (includeDescendants === 'true') {
            const descendants = await getDescendantNodeIds(node as string);
            nodeIds = nodeIds.concat(descendants);
        }

        const users = await UserModel.find({
            role: role,
            node: { $in: nodeIds },
        }).select('-password').lean();

        return res.json(users);
    } catch (err) {
        console.error('Error getting users:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};
