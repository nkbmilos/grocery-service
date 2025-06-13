import express from "express";
import {authorizeRoles} from "../middleware/roles.middleware";
import {authenticate} from "../middleware/auth.middleware";
import {createEmployee, deleteEmployee, getEmployeeById, updateEmployee} from "../controllers/employee.controller";
import {asyncHandler} from "../middleware/asyncHandler.middleware";

const router = express.Router();

router.post('/',   authenticate, authorizeRoles('manager'),  createEmployee);
router.get('/:id', asyncHandler(getEmployeeById));
router.put('/:id', authenticate, authorizeRoles('manager'), updateEmployee);
router.delete('/:id', authenticate, authorizeRoles('manager'), deleteEmployee);

export = router;
