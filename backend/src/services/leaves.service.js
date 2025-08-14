const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { AppError } = require('../utils/errors');
const { countWorkingDays, dateRangesOverlap, getDateBounds } = require('../utils/dates');

async function listLeaves(filters = {}) {
  try {
    const whereClause = {};
    
    if (filters.employeeId) {
      whereClause.employeeId = filters.employeeId;
    }
    
    if (filters.status) {
      whereClause.status = filters.status;
    }
    
    if (filters.startDate && filters.endDate) {
      whereClause.startDate = {
        gte: new Date(filters.startDate)
      };
      whereClause.endDate = {
        lte: new Date(filters.endDate)
      };
    }

    return await prisma.leaveRequest.findMany({
      where: whereClause,
      include: { 
        employee: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  } catch (error) {
    console.error('Error in listLeaves:', error);
    throw new AppError('Failed to fetch leave requests', 500);
  }
}

async function applyLeave(data) {
  const { employeeId, startDate, endDate, reason, leaveType = 'CASUAL' } = data;

  if (!employeeId || !startDate || !endDate) {
    throw new AppError('Employee ID, start date, and end date are required', 400);
  }

  const employee = await prisma.employee.findUnique({ 
    where: { id: employeeId } 
  });
  
  if (!employee) {
    throw new AppError('Employee not found', 404);
  }

  if (employee.status === 'INACTIVE') {
    throw new AppError('Inactive employees cannot apply for leave', 400);
  }

  const sDate = new Date(startDate);
  const eDate = new Date(endDate);
  
  if (isNaN(sDate.getTime()) || isNaN(eDate.getTime())) {
    throw new AppError('Invalid date format', 400);
  }
  
  if (eDate < sDate) {
    throw new AppError('End date cannot be before start date', 400);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (sDate < today) {
    throw new AppError('Cannot apply for leave in the past', 400);
  }

  const joiningDate = new Date(employee.joiningDate);
  if (sDate < joiningDate) {
    throw new AppError('Cannot apply for leave before joining date', 400);
  }

  const daysRequested = countWorkingDays(sDate, eDate);
  
  if (daysRequested <= 0) {
    throw new AppError('Leave must be at least 1 working day', 400);
  }

  const leaveBalance = await calculateLeaveBalance(employeeId);
  
  if (daysRequested > leaveBalance.available) {
    throw new AppError(
      `Insufficient leave balance. Requested: ${daysRequested} days, Available: ${leaveBalance.available} days`,
      400
    );
  }

  const existingLeaves = await prisma.leaveRequest.findMany({
    where: {
      employeeId,
      status: { in: ['PENDING', 'APPROVED'] }
    }
  });

  const hasOverlap = existingLeaves.some(leave => 
    dateRangesOverlap(sDate, eDate, new Date(leave.startDate), new Date(leave.endDate))
  );

  if (hasOverlap) {
    throw new AppError('You have overlapping leave requests for these dates', 400);
  }

  const leaveData = {
    employeeId,
    startDate: sDate,
    endDate: eDate,
    daysRequested,
    reason: reason || '',
    status: 'PENDING'
  };

  const leaveRequest = await prisma.leaveRequest.create({
    data: leaveData,
    include: {
      employee: {
        select: { id: true, name: true, email: true }
      }
    }
  });

  return leaveRequest;
}

async function approveLeave(leaveId, { approverId, remarks = '' }) {
  const leave = await prisma.leaveRequest.findUnique({
    where: { id: leaveId },
    include: { employee: true }
  });
  
  if (!leave) {
    throw new AppError('Leave request not found', 404);
  }
  
  if (leave.status !== 'PENDING') {
    throw new AppError('Only pending leave requests can be approved', 400);
  }

  const updateData = {
    status: 'APPROVED'
  };

  const updatedLeave = await prisma.leaveRequest.update({
    where: { id: leaveId },
    data: updateData,
    include: {
      employee: { select: { id: true, name: true, email: true } }
    }
  });

  return updatedLeave;
}

async function rejectLeave(leaveId, { approverId, remarks = '' }) {
  const leave = await prisma.leaveRequest.findUnique({
    where: { id: leaveId },
    include: { employee: true }
  });
  
  if (!leave) {
    throw new AppError('Leave request not found', 404);
  }
  
  if (leave.status !== 'PENDING') {
    throw new AppError('Only pending leave requests can be rejected', 400);
  }

  const updateData = {
    status: 'REJECTED'
  };

  const updatedLeave = await prisma.leaveRequest.update({
    where: { id: leaveId },
    data: updateData,
    include: {
      employee: { select: { id: true, name: true, email: true } }
    }
  });

  return updatedLeave;
}

async function cancelLeave(leaveId, employeeId) {
  const leave = await prisma.leaveRequest.findUnique({
    where: { id: leaveId }
  });
  
  if (!leave) {
    throw new AppError('Leave request not found', 404);
  }

  if (leave.employeeId !== employeeId) {
    throw new AppError('You can only cancel your own leave requests', 403);
  }

  if (leave.status !== 'PENDING') {
    throw new AppError('Only pending leave requests can be cancelled', 400);
  }

  const updateData = {
    status: 'CANCELLED'
  };

  return prisma.leaveRequest.update({
    where: { id: leaveId },
    data: updateData
  });
}

async function calculateLeaveBalance(employeeId) {
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId }
  });
  
  if (!employee) {
    throw new AppError('Employee not found', 404);
  }

  const [approved, pending] = await Promise.all([
    prisma.leaveRequest.aggregate({
      where: { employeeId, status: 'APPROVED' },
      _sum: { daysRequested: true }
    }),
    prisma.leaveRequest.aggregate({
      where: { employeeId, status: 'PENDING' },
      _sum: { daysRequested: true }
    })
  ]);

  const approvedDays = approved._sum.daysRequested || 0;
  const pendingDays = pending._sum.daysRequested || 0;
  const totalAllocated = employee.initialLeaveDays;

  return {
    allocated: totalAllocated,
    used: approvedDays,
    pending: pendingDays,
    available: Math.max(totalAllocated - approvedDays - pendingDays, 0)
  };
}

module.exports = {
  listLeaves,
  applyLeave,
  approveLeave,
  rejectLeave,
  cancelLeave,
  calculateLeaveBalance
};
