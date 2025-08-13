async function updateEmployee(req, res, next) {
  try {
    const emp = await service.updateEmployee(req.params.id, req.body);
    res.json(emp);
  } catch (err) { next(err); }
}

async function deleteEmployee(req, res, next) {
  try {
    await service.deleteEmployee(req.params.id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) { next(err); }
}

module.exports = {
  createEmployee,
  listEmployees,
  leaveBalance,
  updateEmployee,
  deleteEmployee
};
