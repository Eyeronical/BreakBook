const service = require('../services/employees.service');

async function listEmployees(req, res, next) {
  try {
    const data = await service.listEmployees();
    res.json(data);
  } catch (err) { next(err); }
}

async function createEmployee(req, res, next) {
  try {
    const data = await service.createEmployee(req.body);
    res.status(201).json(data);
  } catch (err) { next(err); }
}

async function updateEmployee(req, res, next) {
  try {
    const data = await service.updateEmployee(req.params.id, req.body);
    res.json(data);
  } catch (err) { next(err); }
}

async function deleteEmployee(req, res, next) {
  try {
    await service.deleteEmployee(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    if (err.code === 'P2003') {
      return res.status(409).json({
        message: 'Cannot delete employee with existing leave records.'
      });
    }
    next(err);
  }
}

async function leaveBalance(req, res, next) {
  try {
    const data = await service.leaveBalance(req.params.id);
    res.json(data);
  } catch (err) { next(err); }
}

module.exports = {
  listEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  leaveBalance
};
