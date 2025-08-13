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

// HARD DELETE with dependent cleanup
async function deleteEmployee(id) {
  return prisma.$transaction(async (tx) => {
    // delete dependent leaves first
    await tx.leaveRequest.deleteMany({ where: { employeeId: id } });
    // then delete the employee
    return tx.employee.delete({ where: { id } });
  });
}

async function leaveBalance(employeeId) {
  // keep your existing logic; placeholder here:
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
