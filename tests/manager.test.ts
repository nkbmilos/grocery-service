import request from 'supertest';
import app from '../src/app';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import UserModel from '../src/models/user.model';
import { NodeModel } from '../src/models/node.model';

let mongoServer: MongoMemoryServer;
let nodeId: mongoose.Types.ObjectId;
let authToken: string;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    const node = await NodeModel.create({ name: 'Germany' });
    nodeId = node._id;

    const manager = await UserModel.create({
        name: 'Root Manager',
        email: 'root@test.com',
        password: await UserModel.hashPassword('admin123'),
        role: 'manager',
        node: node._id,
    });

    const loginRes = await request(app)
        .post('/api/v1/login')
        .send({ email: 'root@test.com', password: 'admin123' });

    authToken = loginRes.body.token;
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Manager CRUD', () => {
    let createdManagerId: string;

    it('should create a new manager', async () => {
        const res = await request(app)
            .post('/api/v1/managers')
            .set('Authorization', `Bearer ${authToken}`)
            .send({
                name: 'Manager Test',
                email: 'managertest@test.com',
                password: 'password123',
                role: 'manager',
                node: nodeId,
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.name).toBe('Manager Test');
        createdManagerId = res.body._id;
    });

    it('should fetch the created manager by ID', async () => {
        const res = await request(app)
            .get(`/api/v1/managers/${createdManagerId}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.email).toBe('managertest@test.com');
    });

    it('should update the manager details', async () => {
        const res = await request(app)
            .put(`/api/v1/managers/${createdManagerId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({ name: 'Updated Manager' });

        expect(res.statusCode).toBe(200);
        expect(res.body.name).toBe('Updated Manager');
    });

    it('should delete the manager', async () => {
        const res = await request(app)
            .delete(`/api/v1/managers/${createdManagerId}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.statusCode).toBe(204);
    });

    it('should return 404 for deleted manager', async () => {
        const res = await request(app)
            .get(`/api/v1/managers/${createdManagerId}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.statusCode).toBe(404);
    });
});
