import { Router } from 'express';
import {
    createManager,
    getManagerById,
    updateManager,
    deleteManager,
} from '../controllers/manager.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/roles.middleware';

const router = Router();

router.use(authenticate);
router.use(authorizeRoles('manager'));

router.post('/', createManager);
router.get('/:id', getManagerById);
router.put('/:id', updateManager);
router.delete('/:id', deleteManager);

export = router;
