import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.fieldRecord.deleteMany();

  await prisma.fieldRecord.createMany({
    data: [
      {
        plot: 'North Field A1',
        crop: 'Wheat',
        location: '26.8467, 80.9462',
        capturedAt: new Date('2026-04-20T09:10:00.000Z'),
        ndvi: 0.81,
        ndre: 0.67,
        gndvi: 0.72,
        moisture: 78,
        temperature: 27,
        nitrogen: 82,
        phosphorus: 68,
        potassium: 74,
        waterStress: 'Low',
        nutrientStress: 'Low',
        healthScore: 91,
        status: 'Healthy',
        notes: 'Uniform canopy, irrigation stable.'
      },
      {
        plot: 'North Field A2',
        crop: 'Wheat',
        location: '26.8469, 80.9468',
        capturedAt: new Date('2026-04-20T09:18:00.000Z'),
        ndvi: 0.62,
        ndre: 0.48,
        gndvi: 0.57,
        moisture: 52,
        temperature: 31,
        nitrogen: 58,
        phosphorus: 49,
        potassium: 60,
        waterStress: 'Moderate',
        nutrientStress: 'Moderate',
        healthScore: 67,
        status: 'Watch',
        notes: 'Patchy canopy vigor and mild heat loading.'
      },
      {
        plot: 'South Orchard B1',
        crop: 'Maize',
        location: '26.8457, 80.9457',
        capturedAt: new Date('2026-04-20T09:25:00.000Z'),
        ndvi: 0.44,
        ndre: 0.36,
        gndvi: 0.41,
        moisture: 34,
        temperature: 35,
        nitrogen: 39,
        phosphorus: 42,
        potassium: 46,
        waterStress: 'High',
        nutrientStress: 'High',
        healthScore: 38,
        status: 'Critical',
        notes: 'Strong canopy stress signatures and low nutrient availability.'
      },
      {
        plot: 'West Block C4',
        crop: 'Soybean',
        location: '26.8474, 80.9448',
        capturedAt: new Date('2026-04-20T09:37:00.000Z'),
        ndvi: 0.73,
        ndre: 0.61,
        gndvi: 0.69,
        moisture: 69,
        temperature: 28,
        nitrogen: 71,
        phosphorus: 64,
        potassium: 70,
        waterStress: 'Low',
        nutrientStress: 'Low',
        healthScore: 84,
        status: 'Healthy',
        notes: 'Good vigor and balanced nutrient response.'
      }
    ]
  });

  console.log('Seed data inserted successfully');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
