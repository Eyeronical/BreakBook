async function updateEmployee(id, data) {
  const emp = await prisma.employee.findUnique({ where: { id } });
  if (!emp) throw new AppError('Employee not found', 404);
  return prisma.employee.update({ where: { id }, data });
}

async function deleteEmployee(id) {
  const emp = await prisma.employee.findUnique({ where: { id } });
  if (!emp) throw new AppError('Employee not found', 404);
  return prisma.employee.delete({ where: { id } });
}

module.exports = {
  createEmployee,
  getEmployeeById,
  listEmployees,
  updateEmployee,
  deleteEmployee
};
