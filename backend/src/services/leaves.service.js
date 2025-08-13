const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { AppError } = require('../utils/errors')

function countLeaveDaysExcludingWeekends(startDate, endDate) {
  let count = 0
  const date = new Date(startDate)
  while (date <= endDate) {
    const day = date.getDay()
    if (day !== 0 && day !== 6) count++ // exclude weekends
    date.setDate(date.getDate() + 1)
  }
  return count
}

async function listLeaves() {
  return prisma.leaveRequest.findMany({ include: { employee: true } })
}

async function applyLeave(data) {
  const { employeeId, startDate, endDate, reason } = data

  if (!employeeId || !startDate || !endDate) {
    throw new AppError('Employee ID, start date, and end date are required')
  }

  const employee = await prisma.employee.findUnique({ where: { id: employeeId } })
  if (!employee) throw new AppError('Employee not found', 404)

  const sDate = new Date(startDate)
  const eDate = new Date(endDate)
  if (isNaN(sDate) || isNaN(eDate)) throw new AppError('Invalid dates')
  if (eDate < sDate) throw new AppError('End date cannot be before start date')
  if (sDate < new Date(employee.joiningDate))
    throw new AppError('Cannot apply for leave before joining date')

  const daysRequested = countLeaveDaysExcludingWeekends(sDate, eDate)
  if (daysRequested <= 0) throw new AppError('Leave must be at least 1 day (excluding weekends)')

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
  const available = employee.initialLeaveDays - approvedDays - pendingDays

  if (daysRequested > available) {
    throw new AppError(`Requested ${daysRequested} days, available only ${available}`)
  }

  const overlap = await prisma.leaveRequest.findFirst({
    where: {
      employeeId,
      status: { in: ['PENDING', 'APPROVED'] },
      OR: [{ startDate: { lte: eDate }, endDate: { gte: sDate } }]
    }
  })
  if (overlap) throw new AppError('Overlapping leave request exists')

  return prisma.leaveRequest.create({
    data: {
      employeeId,
      startDate: sDate,
      endDate: eDate,
      daysRequested,
      reason: reason || ''
    }
  })
}

async function approveLeave(id, { approverId, remarks }) {
  const leave = await prisma.leaveRequest.findUnique({ where: { id } })
  if (!leave) throw new AppError('Leave not found', 404)
  if (leave.status !== 'PENDING') throw new AppError('Only pending leaves can be approved')

  return prisma.leaveRequest.update({
    where: { id },
    data: {
      status: 'APPROVED',
      approverId,
      approverRemarks: remarks || '',
      decidedAt: new Date()
    }
  })
}

async function rejectLeave(id, { approverId, remarks }) {
  const leave = await prisma.leaveRequest.findUnique({ where: { id } })
  if (!leave) throw new AppError('Leave not found', 404)
  if (leave.status !== 'PENDING') throw new AppError('Only pending leaves can be rejected')

  return prisma.leaveRequest.update({
    where: { id },
    data: {
      status: 'REJECTED',
      approverId,
      approverRemarks: remarks || '',
      decidedAt: new Date()
    }
  })
}

module.exports = {
  listLeaves,
  applyLeave,
  approveLeave,
  rejectLeave
}
