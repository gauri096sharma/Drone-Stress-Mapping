import prisma from '../config/db.js';

export async function getAnalyticsSummary(req, res, next) {
  try {
    const records = await prisma.fieldRecord.findMany();
    const totalRecords = records.length;
    const divisor = totalRecords || 1;

    const averageHealth = Math.round(records.reduce((sum, item) => sum + item.healthScore, 0) / divisor);
    const averageMoisture = Math.round(records.reduce((sum, item) => sum + item.moisture, 0) / divisor);
    const criticalZones = records.filter((item) => item.status === 'Critical').length;
    const healthyZones = records.filter((item) => item.status === 'Healthy').length;

    res.json({
      totalRecords,
      averageHealth,
      averageMoisture,
      criticalZones,
      healthyZones
    });
  } catch (error) {
    next(error);
  }
}
