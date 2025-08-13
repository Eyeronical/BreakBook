const { prisma } = require('../src/db/prisma');

async function main() {
  await prisma.employee.createMany({
    data: [
      { name: 'John Doe', email: 'john@example.com', department: 'Engineering', joiningDate: new Date('2025-04-10') },
      { name: 'Jane Smith', email: 'jane@example.com', department: 'HR', joiningDate: new Date('2025-05-15') }
    ]
  });
  console.log('✅ Seed data inserted');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
