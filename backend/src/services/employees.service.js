const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { AppError } = require('../utils/errors')

async function listEmployees() {
  return prisma.employee.findMany({
    where: { status: { not: 'INACTIVE' } }
  })
}

async function createEmployee(data) {
  return prisma.employee.create({
    data: {
      ...data,
      initialLeaveDays: 7
    }
  })
}

async function updateEmployee(id, data) {
  return prisma.employee.update({ where: { id }, data })
}

async function deleteEmployee(id) {
  return prisma.$transaction(async (tx) => {
    await tx.leaveRequest.deleteMany({ where: { employeeId: id } })
    return tx.employee.delete({ where: { id } })
  })
}

async function leaveBalance(employeeId) {
  const emp = await prisma.employee.findUnique({ where: { id: employeeId } })
  if (!emp) throw new AppError('Employee not found', 404)

  const startingLeaves = emp.initialLeaveDays

  const approved = await prisma.leaveRequest.aggregate({
    where: { employeeId, status: 'APPROVED' },
    _sum: { daysRequested: true }
  })
  const pending = await prisma.leaveRequest.aggregate({
    where: { employeeId, status: 'PENDING' },
    _sum: { daysRequested: true }
  })

  const approvedDays = approved._sum.daysRequested || 0
  const pendingDays = pending._sum.daysRequested || 0

  return {
    accrued: startingLeaves,
    approvedDays,
    pendingDays,
    available: Math.max(startingLeaves - approvedDays - pendingDays, 0)
  }
}

async function updateLeaveBalance(employeeId, newBalance) {
  if (newBalance < 0) throw new AppError('Leave balance cannot be negative')
  return prisma.employee.update({
    where: { id: employeeId },
    data: { initialLeaveDays: newBalance }
  })
}

module.exports = {
  listEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  leaveBalance,
  updateLeaveBalance
}
