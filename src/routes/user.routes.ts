import { Router } from 'express';
import { getUsers } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/roles.middleware';

const router = Router();

router.get(
    '/',
    authenticate,
    authorizeRoles('manager'),
    getUsers
);

export = router;
