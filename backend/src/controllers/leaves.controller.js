const service = require('../services/leaves.service');

async function listLeaves(req, res, next) {
  try {
    const filters = {
      employeeId: req.query.employeeId,
      status: req.query.status,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };
    const data = await service.listLeaves(filters);
    res.json({
      success: true,
      data,
      count: data.length
    });
  } catch (err) { 
    next(err);
  }
}

async function applyLeave(req, res, next) {
  try {
    const data = await service.applyLeave(req.body);
    res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully',
      data
    });
  } catch (err) { 
    next(err);
  }
}

async function approveLeave(req, res, next) {
  try {
    const data = await service.approveLeave(req.params.id, req.body);
    res.json({
      success: true,
      message: 'Leave request approved successfully',
      data
    });
  } catch (err) { 
    next(err);
  }
}

async function rejectLeave(req, res, next) {
  try {
    const data = await service.rejectLeave(req.params.id, req.body);
    res.json({
      success: true,
      message: 'Leave request rejected',
      data
    });
  } catch (err) { 
    next(err);
  }
}

async function cancelLeave(req, res, next) {
  try {
    const data = await service.cancelLeave(req.params.id, req.body.employeeId);
    res.json({
      success: true,
      message: 'Leave request cancelled',
      data
    });
  } catch (err) { 
    next(err);
  }
}

async function getLeaveById(req, res, next) {
  try {
    const data = await service.getLeaveById(req.params.id);
    res.json({
      success: true,
      data
    });
  } catch (err) { 
    next(err);
  }
}

module.exports = {
  listLeaves,
  applyLeave,
  approveLeave,
  rejectLeave,
  cancelLeave,
  getLeaveById
};
