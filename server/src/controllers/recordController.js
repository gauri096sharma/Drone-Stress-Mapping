import prisma from '../config/db.js';
import { computeHealthScore, deriveStatus, deriveStress } from '../services/stressService.js';
import { validateRecordPayload } from '../utils/validateRecord.js';

export async function getRecords(req, res, next) {
  try {
    const records = await prisma.fieldRecord.findMany({
      orderBy: { capturedAt: 'desc' }
    });
    res.json(records);
  } catch (error) {
    next(error);
  }
}

export async function createNewRecord(req, res, next) {
  try {
    const validationError = validateRecordPayload(req.body);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const payload = req.body;
    const numericPayload = {
      ...payload,
      ndvi: Number(payload.ndvi),
      ndre: Number(payload.ndre),
      gndvi: Number(payload.gndvi),
      moisture: Number(payload.moisture),
      temperature: Number(payload.temperature),
      nitrogen: Number(payload.nitrogen),
      phosphorus: Number(payload.phosphorus),
      potassium: Number(payload.potassium)
    };

    const { waterStress, nutrientStress } = deriveStress(numericPayload);
    const healthScore = computeHealthScore(numericPayload);
    const status = deriveStatus(healthScore);

    const record = await prisma.fieldRecord.create({
      data: {
        plot: payload.plot,
        crop: payload.crop,
        location: payload.location,
        capturedAt: new Date(payload.capturedAt),
        ndvi: numericPayload.ndvi,
        ndre: numericPayload.ndre,
        gndvi: numericPayload.gndvi,
        moisture: numericPayload.moisture,
        temperature: numericPayload.temperature,
        nitrogen: numericPayload.nitrogen,
        phosphorus: numericPayload.phosphorus,
        potassium: numericPayload.potassium,
        waterStress,
        nutrientStress,
        healthScore,
        status,
        notes: payload.notes || ''
      }
    });

    res.status(201).json(record);
  } catch (error) {
    next(error);
  }
}

export async function updateExistingRecord(req, res, next) {
  try {
    const { id } = req.params;
    const validationError = validateRecordPayload(req.body);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const payload = req.body;
    const numericPayload = {
      ...payload,
      ndvi: Number(payload.ndvi),
      ndre: Number(payload.ndre),
      gndvi: Number(payload.gndvi),
      moisture: Number(payload.moisture),
      temperature: Number(payload.temperature),
      nitrogen: Number(payload.nitrogen),
      phosphorus: Number(payload.phosphorus),
      potassium: Number(payload.potassium)
    };

    const { waterStress, nutrientStress } = deriveStress(numericPayload);
    const healthScore = computeHealthScore(numericPayload);
    const status = deriveStatus(healthScore);

    const record = await prisma.fieldRecord.update({
      where: { id },
      data: {
        plot: payload.plot,
        crop: payload.crop,
        location: payload.location,
        capturedAt: new Date(payload.capturedAt),
        ndvi: numericPayload.ndvi,
        ndre: numericPayload.ndre,
        gndvi: numericPayload.gndvi,
        moisture: numericPayload.moisture,
        temperature: numericPayload.temperature,
        nitrogen: numericPayload.nitrogen,
        phosphorus: numericPayload.phosphorus,
        potassium: numericPayload.potassium,
        waterStress,
        nutrientStress,
        healthScore,
        status,
        notes: payload.notes || ''
      }
    });

    res.json(record);
  } catch (error) {
    next(error);
  }
}

export async function deleteExistingRecord(req, res, next) {
  try {
    const { id } = req.params;
    await prisma.fieldRecord.delete({ where: { id } });
    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    next(error);
  }
}
