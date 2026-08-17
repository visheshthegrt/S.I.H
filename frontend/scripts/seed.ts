import { PrismaClient } from '@prisma/client';
import { SATELLITE_CATALOG } from '../src/services/tleDatabase.js';

const prisma = new PrismaClient();

async function main() {
  console.log(`🌱 Seeding ${SATELLITE_CATALOG.length} satellites into database...`);

  for (const sat of SATELLITE_CATALOG) {
    await prisma.satellite.upsert({
      where: { id: sat.id },
      update: {
        name: sat.name,
        tleLine1: sat.tle.line1,
        tleLine2: sat.tle.line2,
        type: sat.category,
        updatedAt: new Date()
      },
      create: {
        id: sat.id,
        name: sat.name,
        tleLine1: sat.tle.line1,
        tleLine2: sat.tle.line2,
        type: sat.category,
        launchDate: sat.launchYear ? new Date(`${sat.launchYear}-01-01`) : null
      }
    });
  }

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
