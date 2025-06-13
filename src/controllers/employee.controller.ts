import { Request, Response } from 'express';
import UserModel from '../models/user.model';
import { AuthRequest } from '../middleware/auth.middleware';


export const createEmployee = async (req: AuthRequest, res: Response) => {
    try {
        const { name, email, password, node } = req.body;

        const hashedPassword = await UserModel.hashPassword(password);

        const employee = await UserModel.create({
            name,
            email,
            password: hashedPassword,
            role: 'employee',
            node,
        });

        res.status(201).json(employee);
    } catch (err) {
        res.status(400).json({ error: 'Failed to create employee', details: err });
    }
};

export const getEmployeeById = async (req: Request, res: Response) => {
    const employee = await UserModel.findOne({ _id: req.params.id, role: 'employee' });
    if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
    }
    res.json(employee);
};

export const updateEmployee = async (req: Request, res: Response) => {
    const employee = await UserModel.findOneAndUpdate(
        { _id: req.params.id, role: 'employee' },
        req.body,
        { new: true }
    );
    if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
    }
    res.json(employee);
};

export const deleteEmployee = async (req: Request, res: Response) => {
    const employee = await UserModel.findOneAndDelete({ _id: req.params.id, role: 'employee' });
    if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
    }
    res.status(204).send();
};
