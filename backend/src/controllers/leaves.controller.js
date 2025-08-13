const service = require('../services/leaves.service');

async function applyLeave(req, res, next) {
  try {
    const leave = await service.applyLeave(req.body);
    res.status(201).json(leave);
  } catch (err) {
    next(err);
  }
}

async function approveLeave(req, res, next) {
  try {
    const leave = await service.approveLeave(req.params.id, req.body.approverId, req.body.remarks);
    res.json(leave);
  } catch (err) {
    next(err);
  }
}

async function rejectLeave(req, res, next) {
  try {
    const leave = await service.rejectLeave(req.params.id, req.body.approverId, req.body.remarks);
    res.json(leave);
  } catch (err) {
    next(err);
  }
}

async function listLeaves(req, res, next) {
  try {
    const leaves = await service.listLeaves(req.query.status);
    res.json(leaves);
  } catch (err) {
    next(err);
  }
}

module.exports = { applyLeave, approveLeave, rejectLeave, listLeaves };
