const express = require('express');
const router = express.Router();

const controller = require('../controllers/employees.controller');

// List employees
router.get('/', controller.listEmployees);

// Create employee
router.post('/', controller.createEmployee);

// Update employee
router.put('/:id', controller.updateEmployee);

// Delete employee
router.delete('/:id', controller.deleteEmployee);

// Leave balance
router.get('/:id/leave-balance', controller.leaveBalance);

module.exports = router;
