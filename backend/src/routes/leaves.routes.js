const express = require('express');
const router = express.Router();
const { applyLeave, approveLeave, rejectLeave, listLeaves } = require('../controllers/leaves.controller');

router.post('/', applyLeave);
router.get('/', listLeaves);
router.post('/:id/approve', approveLeave);
router.post('/:id/reject', rejectLeave);

module.exports = router;
