const express = require('express')
const router = express.Router()
const controller = require('../controllers/employees.controller')

router.get('/', controller.listEmployees)
router.post('/', controller.createEmployee)
router.put('/:id', controller.updateEmployee)
router.delete('/:id', controller.deleteEmployee)
router.get('/:id/leave-balance', controller.leaveBalance)
router.patch('/:id/leave-balance', controller.updateLeaveBalance)

module.exports = router
