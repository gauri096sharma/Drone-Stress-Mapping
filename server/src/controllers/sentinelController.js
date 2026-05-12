import ee from '@google/earthengine';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let earthEngineInitialized = false;

const privateKeyPath = path.join(
  __dirname,
  '../../config/earth-engine-key.json'
);

function getEarthEnginePrivateKey() {
  if (process.env.EARTH_ENGINE_KEY_JSON) {
    return JSON.parse(process.env.EARTH_ENGINE_KEY_JSON);
  }

  return JSON.parse(fs.readFileSync(privateKeyPath, 'utf8'));
}

const privateKey = getEarthEnginePrivateKey();

function initializeEarthEngine() {
  return new Promise((resolve, reject) => {
    if (earthEngineInitialized) {
      return resolve();
    }

    console.log('Authenticating Earth Engine...');

    ee.data.authenticateViaPrivateKey(
      privateKey,
      () => {
        console.log('Earth Engine authentication successful');

        ee.initialize(
          null,
          null,
          () => {
            earthEngineInitialized = true;
            console.log('Earth Engine initialized successfully');
            resolve();
          },
          (err) => {
            console.error('Earth Engine initialization failed:', err);
            reject(err);
          }
        );
      },
      (err) => {
        console.error('Earth Engine authentication failed:', err);
        reject(err);
      }
    );
  });
}

export async function getSentinelAnalysis(req, res, next) {
  try {
    await initializeEarthEngine();

    const {
      longitude = 77.1025,
      latitude = 28.7041,
      startDate = '2024-01-01',
      endDate = '2024-03-31'
    } = req.body;

    const point = ee.Geometry.Point([Number(longitude), Number(latitude)]);

    const collection = ee.ImageCollection('COPERNICUS/S2_SR_HARMONIZED')
      .filterDate(startDate, endDate)
      .filterBounds(point)
      .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 40));

    const image = collection.median();

    const ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI');
    const ndre = image.normalizedDifference(['B8', 'B5']).rename('NDRE');
    const gndvi = image.normalizedDifference(['B8', 'B3']).rename('GNDVI');

    const stats = image.addBands([ndvi, ndre, gndvi]).reduceRegion({
      reducer: ee.Reducer.mean(),
      geometry: point.buffer(5000),
      scale: 20,
      maxPixels: 1e9
    });

    stats.evaluate((result, error) => {
      if (error) {
        return res.status(500).json({
          message: 'Failed to process Sentinel-2 analysis',
          error
        });
      }

      return res.json({
        location: {
          latitude: Number(latitude),
          longitude: Number(longitude)
        },
        dateRange: {
          startDate,
          endDate
        },
        indices: {
          ndvi: Number(result?.NDVI?.toFixed(3) || 0),
          ndre: Number(result?.NDRE?.toFixed(3) || 0),
          gndvi: Number(result?.GNDVI?.toFixed(3) || 0)
        }
      });
    });
  } catch (error) {
    next(error);
  }
}