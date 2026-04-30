export function deriveStress(record) {
  const waterStress = record.moisture >= 65 ? 'Low' : record.moisture >= 45 ? 'Moderate' : 'High';
  const nutrientAvg = (record.nitrogen + record.phosphorus + record.potassium) / 3;
  const nutrientStress = nutrientAvg >= 65 ? 'Low' : nutrientAvg >= 50 ? 'Moderate' : 'High';
  return { waterStress, nutrientStress };
}

export function computeHealthScore(record) {
  const indexScore = ((record.ndvi + record.ndre + record.gndvi) / 3) * 100;
  const nutrientScore = (record.nitrogen + record.phosphorus + record.potassium) / 3;
  const moistureScore = record.moisture;
  const temperaturePenalty = Math.max(0, record.temperature - 30) * 2.3;
  const score = indexScore * 0.45 + nutrientScore * 0.3 + moistureScore * 0.25 - temperaturePenalty;
  return Math.max(15, Math.min(98, Math.round(score)));
}

export function deriveStatus(score) {
  if (score >= 80) return 'Healthy';
  if (score >= 70) return 'Stable';
  if (score >= 50) return 'Watch';
  return 'Critical';
}
