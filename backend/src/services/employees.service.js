const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listEmployees() {
  return prisma.employee.findMany({ where: { status: { not: 'INACTIVE' } } });
}

async function createEmployee(data) {
  return prisma.employee.create({ data });
}

async function updateEmployee(id, data) {
  return prisma.employee.update({ where: { id }, data });
}

async function deleteEmployee(id) {
  return prisma.$transaction(async (tx) => {
    await tx.leaveRequest.deleteMany({ where: { employeeId: id } });
    return tx.employee.delete({ where: { id } });
  });
}

async function leaveBalance(employeeId) {
  const approved = await prisma.leaveRequest.aggregate({
    where: { employeeId, status: 'APPROVED' },
    _sum: { daysRequested: true }
  });
  return {
    accrued: 0,
    approvedDays: approved._sum.daysRequested || 0,
    pendingDays: 0,
    available: 0
  };
}

module.exports = {
  listEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  leaveBalance
};
