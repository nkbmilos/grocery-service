import request from 'supertest';
import app from '../src/app';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import UserModel from '../src/models/user.model';
import { NodeModel } from '../src/models/node.model';

let mongoServer: MongoMemoryServer;
let nodeId: mongoose.Types.ObjectId;
let token: string;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    const node = await NodeModel.create({ name: 'Serbia' });
    nodeId = node._id;

    await UserModel.create({
        name: 'Manager',
        email: 'manager@test.com',
        password: await UserModel.hashPassword('password'),
        role: 'manager',
        node: nodeId,
    });

    const loginRes = await request(app)
        .post('/api/v1/login')
        .send({ email: 'manager@test.com', password: 'password' });

    token = loginRes.body.token;
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Employee CRUD Operations', () => {
    let employeeId: string;

    it('should create an employee (POST)', async () => {
        const res = await request(app)
            .post('/api/v1/employees')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'CRUD Employee',
                email: 'crud@test.com',
                password: 'testpass',
                role: 'employee',
                node: nodeId,
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.name).toBe('CRUD Employee');
        employeeId = res.body._id;
    });

    it('should get the employee by ID (GET)', async () => {
        const res = await request(app)
            .get(`/api/v1/employees/${employeeId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.email).toBe('crud@test.com');
    });

    it('should return 404 if employee not found (GET)', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const res = await request(app)
            .get(`/api/v1/employees/${fakeId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(404);
    });

    it('should update the employee (PUT)', async () => {
        const res = await request(app)
            .put(`/api/v1/employees/${employeeId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Updated Employee' });

        expect(res.statusCode).toBe(200);
        expect(res.body.name).toBe('Updated Employee');
    });

    it('should return 404 when updating non-existing employee (PUT)', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        const res = await request(app)
            .put(`/api/v1/employees/${fakeId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ name: 'Does not exist' });

        expect(res.statusCode).toBe(404);
    });

    it('should delete the employee (DELETE)', async () => {
        const res = await request(app)
            .delete(`/api/v1/employees/${employeeId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(204);
    });

    it('should return 404 when deleting already deleted employee (DELETE)', async () => {
        const res = await request(app)
            .delete(`/api/v1/employees/${employeeId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.statusCode).toBe(404);
    });
});
