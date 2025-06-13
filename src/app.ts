import dotenv from 'dotenv'
import express from 'express';
import authRoutes from './routes/auth.routes';


dotenv.config();
const app = express();
app.use(express.json());

const employeeRoutes = require('./routes/employee.routes');
const managerRoutes = require('./routes/manager.routes');
const userRoutes = require('./routes/user.routes');

app.use('/api/v1', authRoutes);
app.use('/api/v1/employees', employeeRoutes);
app.use('/api/v1/managers', managerRoutes);
app.use('/api/v1/users', userRoutes);


export default app;
