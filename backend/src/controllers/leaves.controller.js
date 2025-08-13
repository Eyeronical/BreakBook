const service = require('../services/leaves.service');

async function listLeaves(req, res, next) {
  try {
    const data = await service.listLeaves();
    res.json(data);
  } catch (err) { next(err); }
}

async function applyLeave(req, res, next) {
  try {
    const data = await service.applyLeave(req.body);
    res.status(201).json(data);
  } catch (err) { next(err); }
}

async function approveLeave(req, res, next) {
  try {
    const data = await service.approveLeave(req.params.id, req.body);
    res.json(data);
  } catch (err) { next(err); }
}

async function rejectLeave(req, res, next) {
  try {
    const data = await service.rejectLeave(req.params.id, req.body);
    res.json(data);
  } catch (err) { next(err); }
}

module.exports = {
  listLeaves,
  applyLeave,
  approveLeave,
  rejectLeave
};
