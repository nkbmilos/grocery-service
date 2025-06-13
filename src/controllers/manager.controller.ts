import { Request, Response } from 'express';
import UserModel from '../models/user.model';

export const createManager = async (req: Request, res: Response) => {
    try {
        const hashedPassword = await UserModel.hashPassword(req.body.password);
        const manager = await UserModel.create({
            ...req.body,
            password: hashedPassword,
            role: 'manager',
        });
        res.status(201).json(manager);
    } catch (err) {
        res.status(400).json({ error: 'Failed to create manager', details: err });
    }
};

export const getManagerById = async (req: Request, res: Response) => {
    const manager = await UserModel.findOne({ _id: req.params.id, role: 'manager' });
    if (!manager) return res.status(404).json({ error: 'Manager not found' });
    res.json(manager);
};

export const updateManager = async (req: Request, res: Response) => {
    const updateData = { ...req.body };
    if (updateData.password) {
        updateData.password = await UserModel.hashPassword(updateData.password);
    }

    const manager = await UserModel.findOneAndUpdate(
        { _id: req.params.id, role: 'manager' },
        updateData,
        { new: true }
    );

    if (!manager) return res.status(404).json({ error: 'Manager not found' });
    res.json(manager);
};

export const deleteManager = async (req: Request, res: Response) => {
    const manager = await UserModel.findOneAndDelete({ _id: req.params.id, role: 'manager' });
    if (!manager) return res.status(404).json({ error: 'Manager not found' });
    res.status(204).send();
};
