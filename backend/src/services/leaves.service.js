const { prisma } = require('../db/prisma');
const { AppError } = require('../utils/errors');
const { countWorkingDays, monthsElapsedForAccrual, computeAccrued } = require('../utils/dates');

const ANNUAL_QUOTA = 18;

async function applyLeave({ employeeId, startDate, endDate, reason }) {
  const emp = await prisma.employee.findUnique({ where: { id: employeeId } });
  if (!emp) throw new AppError('Employee not found', 404, 'NOT_FOUND');

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (end < start) throw new AppError('End date cannot be before start date');
  if (start < new Date(emp.joiningDate)) throw new AppError('Leave before joining date not allowed');

  const daysRequested = countWorkingDays(start, end);

  const overlap = await prisma.leaveRequest.findFirst({
    where: {
      employeeId,
      status: { in: ['PENDING', 'APPROVED'] },
      AND: [{ startDate: { lte: end } }, { endDate: { gte: start } }]
    }
  });
  if (overlap) throw new AppError('Overlapping leave request exists', 409);

  const monthsAccrued = monthsElapsedForAccrual(new Date(emp.joiningDate), end);
  const accrued = computeAccrued(ANNUAL_QUOTA, monthsAccrued);

  const approvedDays = await sumDays(employeeId, 'APPROVED');
  const pendingDays = await sumDays(employeeId, 'PENDING');

  const available = accrued - approvedDays - pendingDays;
  if (daysRequested > available) throw new AppError('Not enough leave balance', 409);

  return prisma.leaveRequest.create({
    data: { employeeId, startDate: start, endDate: end, daysRequested, status: 'PENDING' }
  });
}

async function approveLeave(id, approverId, remarks) {
  let leave = await prisma.leaveRequest.findUnique({ where: { id } });
  if (!leave) throw new AppError('Leave request not found', 404);
  if (leave.status !== 'PENDING') throw new AppError('Only pending requests can be approved');

  leave = await prisma.leaveRequest.update({
    where: { id },
    data: { status: 'APPROVED', approverId, approverRemarks: remarks, decidedAt: new Date() }
  });
  return leave;
}

async function rejectLeave(id, approverId, remarks) {
  let leave = await prisma.leaveRequest.findUnique({ where: { id } });
  if (!leave) throw new AppError('Leave request not found', 404);
  if (leave.status !== 'PENDING') throw new AppError('Only pending requests can be rejected');

  leave = await prisma.leaveRequest.update({
    where: { id },
    data: { status: 'REJECTED', approverId, approverRemarks: remarks, decidedAt: new Date() }
  });
  return leave;
}

async function getBalance(employeeId) {
  const emp = await prisma.employee.findUnique({ where: { id: employeeId } });
  if (!emp) throw new AppError('Employee not found', 404);

  const now = new Date();
  const monthsAccrued = monthsElapsedForAccrual(new Date(emp.joiningDate), now);
  const accrued = computeAccrued(ANNUAL_QUOTA, monthsAccrued);

  const approvedDays = await sumDays(employeeId, 'APPROVED');
  const pendingDays = await sumDays(employeeId, 'PENDING');

  const available = accrued - approvedDays - pendingDays;
  return { accrued, approvedDays, pendingDays, available };
}

async function listLeaves(status) {
  const where = status ? { status } : {};
  return prisma.leaveRequest.findMany({ where, orderBy: { createdAt: 'desc' }, include: { employee: true } });
}

async function sumDays(employeeId, status) {
  const result = await prisma.leaveRequest.aggregate({
    _sum: { daysRequested: true },
    where: { employeeId, status }
  });
  return result._sum.daysRequested || 0;
}

module.exports = { applyLeave, approveLeave, rejectLeave, getBalance, listLeaves };
