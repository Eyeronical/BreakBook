const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { AppError } = require('../utils/errors');

async function listEmployees(filters = {}) {
  const whereClause = {};
  
  if (filters.status) {
    whereClause.status = filters.status;
  } else {
    whereClause.status = 'ACTIVE';
  }

  if (filters.department) {
    whereClause.department = filters.department;
  }

  if (filters.search) {
    whereClause.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { email: { contains: filters.search, mode: 'insensitive' } }
    ];
  }

  console.log('Employees query where clause:', whereClause);

  const employees = await prisma.employee.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' }
  });

  console.log(`Found ${employees.length} employees`);
  return employees;
}

async function createEmployee(data) {
  const { name, email, department, joiningDate } = data;

  if (!name?.trim() || !email?.trim()) {
    throw new AppError('Name and email are required', 400);
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    throw new AppError('Please provide a valid email address', 400);
  }

  const normalizedEmail = email.toLowerCase().trim();

  const existingEmployee = await prisma.employee.findUnique({
    where: { email: normalizedEmail }
  });

  if (existingEmployee) {
    throw new AppError(`An employee with email "${normalizedEmail}" already exists`, 409);
  }

  const newEmployee = await prisma.employee.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      department: department?.trim() || null,
      joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
      initialLeaveDays: 20,
      status: 'ACTIVE' 
    }
  });

  console.log('Created employee:', newEmployee); 
  return newEmployee;
}

async function updateEmployee(id, data) {
  const employee = await prisma.employee.findUnique({ where: { id } });
  
  if (!employee) {
    throw new AppError('Employee not found', 404);
  }

  if (data.email && data.email !== employee.email) {
    const existingEmployee = await prisma.employee.findUnique({
      where: { email: data.email.toLowerCase().trim() }
    });

    if (existingEmployee) {
      throw new AppError('Employee with this email already exists', 409);
    }
  }

  const updateData = {};
  
  if (data.name) updateData.name = data.name.trim();
  if (data.email) updateData.email = data.email.toLowerCase().trim();
  if (data.department !== undefined) updateData.department = data.department?.trim() || null;
  if (data.joiningDate) updateData.joiningDate = new Date(data.joiningDate);
  if (data.status) updateData.status = data.status;

  return await prisma.employee.update({ 
    where: { id }, 
    data: updateData 
  });
}

async function deleteEmployee(id) {
  const employee = await prisma.employee.findUnique({ where: { id } });
  
  if (!employee) {
    throw new AppError('Employee not found', 404);
  }

  const pendingLeaves = await prisma.leaveRequest.count({
    where: { 
      employeeId: id, 
      status: { in: ['PENDING', 'APPROVED'] } 
    }
  });

  if (pendingLeaves > 0) {
    throw new AppError('Cannot delete employee with pending or approved leave requests', 400);
  }

  return await prisma.$transaction(async (tx) => {
    await tx.leaveRequest.deleteMany({ where: { employeeId: id } });
    return tx.employee.delete({ where: { id } });
  });
}

async function leaveBalance(employeeId) {
  const emp = await prisma.employee.findUnique({ where: { id: employeeId } });
  
  if (!emp) {
    throw new AppError('Employee not found', 404);
  }

  const startingLeaves = emp.initialLeaveDays;

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

  return {
    allocated: startingLeaves,
    used: approvedDays,
    pending: pendingDays,
    available: Math.max(startingLeaves - approvedDays - pendingDays, 0)
  };
}

async function updateLeaveBalance(employeeId, newBalance) {
  if (typeof newBalance !== 'number' || newBalance < 0) {
    throw new AppError('Leave balance must be a non-negative number', 400);
  }

  const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
  
  if (!employee) {
    throw new AppError('Employee not found', 404);
  }

  return await prisma.employee.update({
    where: { id: employeeId },
    data: { initialLeaveDays: newBalance }
  });
}

async function getEmployeeById(id) {
  const employee = await prisma.employee.findUnique({ 
    where: { id },
    include: {
      _count: {
        select: {
          leaveRequests: {
            where: { status: { in: ['PENDING', 'APPROVED'] } }
          }
        }
      }
    }
  });

  if (!employee) {
    throw new AppError('Employee not found', 404);
  }

  return employee;
}

module.exports = {
  listEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  leaveBalance,
  updateLeaveBalance,
  getEmployeeById
};
