const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listEmployees() {
  return prisma.employee.findMany();
}
async function createEmployee(data) {
  return prisma.employee.create({ data });
}
async function updateEmployee(id, data) {
  return prisma.employee.update({ where: { id }, data });
}
async function deleteEmployee(id) {
  return prisma.employee.delete({ where: { id } });
}
async function leaveBalance(employeeId) {
  // Implement your balance logic; return an object
  return { accrued: 0, approvedDays: 0, pendingDays: 0, available: 0 };
}

module.exports = {
  listEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  leaveBalance
};
