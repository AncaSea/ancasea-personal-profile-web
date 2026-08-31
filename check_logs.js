const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const logs = await prisma.systemLog.findMany({ orderBy: { createdAt: 'desc' }, take: 3 });
  console.log(JSON.stringify(logs, null, 2));
}
main().finally(() => prisma.$disconnect());