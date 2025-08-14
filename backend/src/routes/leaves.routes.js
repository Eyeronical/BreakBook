const express = require('express');
const router = express.Router();
const controller = require('../controllers/leaves.controller');

router.use((req, res, next) => {
  console.log(`Leaves Route: ${req.method} ${req.originalUrl}`);
  next();
});

router.get('/', controller.listLeaves);
router.post('/', controller.applyLeave);
router.post('/:id/approve', controller.approveLeave);
router.post('/:id/reject', controller.rejectLeave);
router.post('/:id/cancel', controller.cancelLeave);
router.get('/:id', controller.getLeaveById);

module.exports = router;
