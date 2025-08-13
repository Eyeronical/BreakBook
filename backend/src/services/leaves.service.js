const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listLeaves() {
  return prisma.leaveRequest.findMany({ include: { employee: true } });
}
async function applyLeave(data) {
  return prisma.leaveRequest.create({ data });
}
async function approveLeave(id, { approverId, remarks }) {
  return prisma.leaveRequest.update({
    where: { id },
    data: { status: 'APPROVED', approverId, approverRemarks: remarks, decidedAt: new Date() }
  });
}
async function rejectLeave(id, { approverId, remarks }) {
  return prisma.leaveRequest.update({
    where: { id },
    data: { status: 'REJECTED', approverId, approverRemarks: remarks, decidedAt: new Date() }
  });
}

module.exports = {
  listLeaves,
  applyLeave,
  approveLeave,
  rejectLeave
};
