import express from 'express';
import { spawn } from 'child_process';

const router = express.Router();

router.post('/predict', async (req, res) => {
  try {
    const inputData = JSON.stringify(req.body);

   const pythonProcess = spawn(process.env.PYTHON_BIN || 'python', [
      'src/ml/stressPredictorApi.py',
      inputData
    ]);

    let result = '';
    let error = '';

    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        return res.status(500).json({
          message: 'ML prediction failed',
          error
        });
      }

      try {
        const lines = result.trim().split('\n');
        const jsonLine = lines[lines.length - 1];
        const parsedResult = JSON.parse(jsonLine);

        return res.json(parsedResult);
      } catch (parseError) {
        return res.status(500).json({
          message: 'Failed to parse ML prediction output',
          rawOutput: result,
          error: parseError.message
        });
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to run ML prediction',
      error: error.message
    });
  }
});

export default router;