const express = require('express');
const router = express.Router();

const controller = require('../controllers/leaves.controller');

// List leaves
router.get('/', controller.listLeaves);

// Apply leave
router.post('/', controller.applyLeave);

// Approve leave
router.post('/:id/approve', controller.approveLeave);

// Reject leave
router.post('/:id/reject', controller.rejectLeave);

module.exports = router;
