const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config({ path: '.env' });

async function main() {
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  const tables = ['ProfileInfo', 'Experience', 'Education', 'Skill', 'Project', 'Blog', 'AiUsageLog'];

  for (const table of tables) {
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY;`);
      
      // Check if policy exists first to prevent errors on re-run
      const policyExists = await prisma.$queryRawUnsafe(`
        SELECT 1 FROM pg_policies WHERE tablename = '${table}' AND policyname = 'Public Read Only';
      `);

      if (policyExists.length === 0) {
        await prisma.$executeRawUnsafe(`
          CREATE POLICY "Public Read Only" 
          ON "${table}" 
          FOR SELECT 
          TO PUBLIC 
          USING (true);
        `);
      }
      console.log(`Enabled RLS and Read-Only policy for ${table}`);
    } catch (e) {
      console.log(`Error on ${table}:`, e.message);
    }
  }

  await prisma.$disconnect();
}
main();