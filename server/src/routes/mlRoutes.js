import express from 'express';

const router = express.Router();

function getRecommendation(stressLevel) {
  if (stressLevel === 'Healthy') {
    return {
      status: 'Healthy crop condition',
      recommendation:
        'Crop condition is stable. Continue regular irrigation and nutrient monitoring.'
    };
  }

  if (stressLevel === 'Moderate') {
    return {
      status: 'Moderate stress detected',
      recommendation:
        'Check soil moisture and nutrient levels. Apply balanced irrigation and monitor crop health again after a few days.'
    };
  }

  return {
    status: 'High crop stress detected',
    recommendation:
      'Immediate action is needed. Inspect irrigation, nutrient deficiency, and disease symptoms in the field.'
  };
}

router.post('/predict', (req, res) => {
  try {
    const {
      ndvi,
      ndre,
      gndvi,
      moisture,
      temperature,
      nitrogen,
      phosphorus,
      potassium
    } = req.body;

    const score =
      Number(ndvi) * 35 +
      Number(ndre) * 25 +
      Number(gndvi) * 20 +
      Number(moisture) * 0.1 +
      Number(nitrogen) * 0.05 +
      Number(phosphorus) * 0.03 +
      Number(potassium) * 0.03 -
      Number(temperature) * 0.2;

    let stressLevel = 'Healthy';
    let confidence = 92;

    if (score < 25) {
      stressLevel = 'HighStress';
      confidence = 96.5;
    } else if (score < 45) {
      stressLevel = 'Moderate';
      confidence = 91.2;
    }

    const advice = getRecommendation(stressLevel);

    return res.json({
      stressLevel,
      confidence,
      status: advice.status,
      recommendation: advice.recommendation
    });
  } catch (error) {
    return res.status(500).json({
      message: 'ML prediction failed',
      error: error.message
    });
  }
});

export default router;