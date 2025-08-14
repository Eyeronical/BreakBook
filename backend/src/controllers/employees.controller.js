const service = require('../services/employees.service');

async function listEmployees(req, res, next) {
  try {
    const filters = {
      status: req.query.status,
      department: req.query.department,
      search: req.query.search
    };
    const data = await service.listEmployees(filters);
    res.json({
      success: true,
      data,
      count: data.length
    });
  } catch (err) { 
    next(err);
  }
}

async function createEmployee(req, res, next) {
  try {
    const data = await service.createEmployee(req.body);
    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data
    });
  } catch (err) { 
    next(err);
  }
}

async function updateEmployee(req, res, next) {
  try {
    console.log('Updating employee:', req.params.id, req.body);
    const data = await service.updateEmployee(req.params.id, req.body);
    res.json({
      success: true,
      message: 'Employee updated successfully',
      data
    });
  } catch (err) { 
    next(err);
  }
}

async function deleteEmployee(req, res, next) {
  try {
    await service.deleteEmployee(req.params.id);
    res.json({
      success: true,
      message: 'Employee deleted successfully'
    });
  } catch (err) { 
    next(err);
  }
}

async function getEmployeeById(req, res, next) {
  try {
    const data = await service.getEmployeeById(req.params.id);
    res.json({
      success: true,
      data
    });
  } catch (err) { 
    next(err);
  }
}

async function leaveBalance(req, res, next) {
  try {
    const data = await service.leaveBalance(req.params.id);
    res.json({
      success: true,
      data
    });
  } catch (err) { 
    next(err);
  }
}

async function updateLeaveBalance(req, res, next) {
  try {
    const { balance } = req.body;
    
    if (!balance || isNaN(Number(balance))) {
      return res.status(400).json({
        success: false,
        error: 'Valid balance amount is required'
      });
    }

    const data = await service.updateLeaveBalance(req.params.id, Number(balance));
    res.json({
      success: true,
      message: 'Leave balance updated successfully',
      data
    });
  } catch (err) { 
    next(err);
  }
}

module.exports = {
  listEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeById,
  leaveBalance,
  updateLeaveBalance
};
