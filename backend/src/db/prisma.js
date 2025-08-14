const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
  errorFormat: 'pretty',
});

async function connectDB() {
  try {
    await prisma.$connect();
    console.log('📊 Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

async function disconnectDB() {
  await prisma.$disconnect();
}

process.on('beforeExit', async () => {
  await disconnectDB();
});

module.exports = { prisma, connectDB, disconnectDB };
