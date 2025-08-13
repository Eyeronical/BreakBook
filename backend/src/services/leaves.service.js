const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { AppError } = require('../utils/errors')

// CONFIG
const START_LEAVE_BALANCE = 7 // default starting days for everyone

function countLeaveDaysExcludingWeekends(startDate, endDate) {
  let count = 0
  const date = new Date(startDate)
  while (date <= endDate) {
    const day = date.getDay()
    if (day !== 0 && day !== 6) count++ // exclude Sunday(0) and Saturday(6)
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

  // Employee must exist
  const employee = await prisma.employee.findUnique({ where: { id: employeeId } })
  if (!employee) {
    throw new AppError('Employee not found', 404)
  }

  const sDate = new Date(startDate)
  const eDate = new Date(endDate)

  // Check: dates are valid
  if (isNaN(sDate) || isNaN(eDate)) {
    throw new AppError('Invalid start or end date')
  }

  // Check: end date after start
  if (eDate < sDate) {
    throw new AppError('End date cannot be before start date')
  }

  // Check: cannot apply before joining date
  if (sDate < new Date(employee.joiningDate)) {
    throw new AppError('Cannot apply for leave before joining date')
  }

  // Number of leave days excluding weekends
  const daysRequested = countLeaveDaysExcludingWeekends(sDate, eDate)
  if (daysRequested <= 0) {
    throw new AppError('Leave days requested must be at least 1 non-weekend day')
  }

  // Calculate leave balance
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
  const available = START_LEAVE_BALANCE - approvedDays - pendingDays

  // Check balance availability
  if (daysRequested > available) {
    throw new AppError(`Requested days (${daysRequested}) exceed available balance (${available})`)
  }

  // Check: overlapping leave requests (PENDING or APPROVED only)
  const overlap = await prisma.leaveRequest.findFirst({
    where: {
      employeeId,
      status: { in: ['PENDING', 'APPROVED'] },
      OR: [
        { startDate: { lte: eDate }, endDate: { gte: sDate } }
      ]
    }
  })
  if (overlap) {
    throw new AppError('Overlapping leave request exists for these dates')
  }

  // OK: create leave record
  return prisma.leaveRequest.create({
    data: {
      employeeId,
      startDate: sDate,
      endDate: eDate,
      reason: reason || '',
      daysRequested
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
