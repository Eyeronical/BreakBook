const express = require('express')
const router = express.Router()
const controller = require('../controllers/leaves.controller')

router.get('/', controller.listLeaves)
router.post('/', controller.applyLeave)
router.post('/:id/approve', controller.approveLeave)
router.post('/:id/reject', controller.rejectLeave)

module.exports = router
