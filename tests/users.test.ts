import request from 'supertest';
import app from '../src/app';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import UserModel from '../src/models/user.model';
import { NodeModel } from '../src/models/node.model';

let mongoServer: MongoMemoryServer;
let serbiaNodeId: string;
let belgradeNodeId: string;
let noviSadNodeId: string;
let managerToken: string;
let employeeToken: string;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    const serbia = await NodeModel.create({ name: 'Serbia' });
    serbiaNodeId = serbia._id.toString();

    const belgrade = await NodeModel.create({ name: 'Belgrade', parent: serbiaNodeId });
    belgradeNodeId = belgrade._id.toString();

    const noviSad = await NodeModel.create({ name: 'Novi Sad', parent: belgradeNodeId });
    noviSadNodeId = noviSad._id.toString();

    await UserModel.create([
        {
            name: 'Manager Serbia',
            email: 'manager_serbia@test.com',
            password: await UserModel.hashPassword('password'),
            role: 'manager',
            node: serbiaNodeId,
        },
        {
            name: 'Employee Serbia',
            email: 'employee_serbia@test.com',
            password: await UserModel.hashPassword('password'),
            role: 'employee',
            node: serbiaNodeId,
        },
        {
            name: 'Manager Belgrade',
            email: 'manager_belgrade@test.com',
            password: await UserModel.hashPassword('password'),
            role: 'manager',
            node: belgradeNodeId,
        },
        {
            name: 'Employee Belgrade',
            email: 'employee_belgrade@test.com',
            password: await UserModel.hashPassword('password'),
            role: 'employee',
            node: belgradeNodeId,
        },
        {
            name: 'Employee Novi Sad',
            email: 'employee_novisad@test.com',
            password: await UserModel.hashPassword('password'),
            role: 'employee',
            node: noviSadNodeId,
        },
    ]);

    const loginRes = await request(app)
        .post('/api/v1/login')
        .send({ email: 'manager_serbia@test.com', password: 'password' });

    managerToken = loginRes.body.token;

    const loginEmpRes = await request(app)
        .post('/api/v1/login')
        .send({ email: 'employee_serbia@test.com', password: 'password' });

    employeeToken = loginEmpRes.body.token;
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('GET /api/v1/users', () => {
    it('should get employees for Serbia node only', async () => {
        const res = await request(app)
            .get('/api/v1/users')
            .set('Authorization', `Bearer ${managerToken}`)
            .query({ role: 'employee', node: serbiaNodeId, includeDescendants: 'false' });

        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].name).toBe('Employee Serbia');
    });

    it('should get employees for Serbia node including descendants', async () => {
        const res = await request(app)
            .get('/api/v1/users')
            .set('Authorization', `Bearer ${managerToken}`)
            .query({ role: 'employee', node: serbiaNodeId, includeDescendants: 'true' });

        expect(res.statusCode).toBe(200);

        expect(res.body.length).toBe(3);
        const names = res.body.map((u: any) => u.name);
        expect(names).toEqual(
            expect.arrayContaining(['Employee Serbia', 'Employee Belgrade', 'Employee Novi Sad'])
        );
    });

    it('should get managers for Belgrade node only', async () => {
        const res = await request(app)
            .get('/api/v1/users')
            .set('Authorization', `Bearer ${managerToken}`)
            .query({ role: 'manager', node: belgradeNodeId, includeDescendants: 'false' });

        expect(res.statusCode).toBe(200);
        expect(res.body.length).toBe(1);
        expect(res.body[0].name).toBe('Manager Belgrade');
    });

    it('should get managers for Belgrade node including descendants', async () => {
        const res = await request(app)
            .get('/api/v1/users')
            .set('Authorization', `Bearer ${managerToken}`)
            .query({ role: 'manager', node: belgradeNodeId, includeDescendants: 'true' });

        expect(res.statusCode).toBe(200);

        expect(res.body.length).toBe(1);
        expect(res.body[0].name).toBe('Manager Belgrade');
    });

    it('should return 400 if role param missing', async () => {
        const res = await request(app)
            .get('/api/v1/users')
            .set('Authorization', `Bearer ${managerToken}`)
            .query({ node: serbiaNodeId });

        expect(res.statusCode).toBe(400);
    });

    it('should return 400 if node param missing', async () => {
        const res = await request(app)
            .get('/api/v1/users')
            .set('Authorization', `Bearer ${managerToken}`)
            .query({ role: 'employee' });

        expect(res.statusCode).toBe(400);
    });

    it('should return 400 if role param invalid', async () => {
        const res = await request(app)
            .get('/api/v1/users')
            .set('Authorization', `Bearer ${managerToken}`)
            .query({ role: 'invalidrole', node: serbiaNodeId });

        expect(res.statusCode).toBe(400);
    });

    it('should forbid access for employee role', async () => {
        const res = await request(app)
            .get('/api/v1/users')
            .set('Authorization', `Bearer ${employeeToken}`)
            .query({ role: 'employee', node: serbiaNodeId });

        expect(res.statusCode).toBe(403);
    });
});
