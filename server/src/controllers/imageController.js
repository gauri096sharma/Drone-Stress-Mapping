import fs from 'fs';
import sharp from 'sharp';

async function readImageAsGrayscale(filePath) {
  const image = sharp(filePath).greyscale();
  const metadata = await image.metadata();

  const buffer = await image
    .raw()
    .toBuffer();

  return {
    buffer,
    width: metadata.width,
    height: metadata.height
  };
}

function calculateIndex(numeratorA, numeratorB, denominatorA, denominatorB) {
  const numerator = numeratorA - numeratorB;
  const denominator = denominatorA + denominatorB;

  if (denominator === 0) return 0;

  return numerator / denominator;
}

function averageIndex(indexValues) {
  if (!indexValues.length) return 0;
  const total = indexValues.reduce((sum, value) => sum + value, 0);
  return Number((total / indexValues.length).toFixed(3));
}

export async function processMultispectralImages(req, res, next) {
  try {
    const { red, green, nir, redEdge } = req.files;

    if (!red || !green || !nir || !redEdge) {
      return res.status(400).json({
        message: 'Please upload Red, Green, NIR, and RedEdge band images.'
      });
    }

    const redImage = await readImageAsGrayscale(red[0].path);
    const greenImage = await readImageAsGrayscale(green[0].path);
    const nirImage = await readImageAsGrayscale(nir[0].path);
    const redEdgeImage = await readImageAsGrayscale(redEdge[0].path);

    const width = Math.min(
      redImage.width,
      greenImage.width,
      nirImage.width,
      redEdgeImage.width
    );

    const height = Math.min(
      redImage.height,
      greenImage.height,
      nirImage.height,
      redEdgeImage.height
    );

    const totalPixels = width * height;

    const ndviValues = [];
    const ndreValues = [];
    const gndviValues = [];

    for (let i = 0; i < totalPixels; i++) {
      const redValue = redImage.buffer[i] / 255;
      const greenValue = greenImage.buffer[i] / 255;
      const nirValue = nirImage.buffer[i] / 255;
      const redEdgeValue = redEdgeImage.buffer[i] / 255;

      const ndvi = calculateIndex(nirValue, redValue, nirValue, redValue);
      const ndre = calculateIndex(nirValue, redEdgeValue, nirValue, redEdgeValue);
      const gndvi = calculateIndex(nirValue, greenValue, nirValue, greenValue);

      if (Number.isFinite(ndvi)) ndviValues.push(ndvi);
      if (Number.isFinite(ndre)) ndreValues.push(ndre);
      if (Number.isFinite(gndvi)) gndviValues.push(gndvi);
    }

    const ndvi = averageIndex(ndviValues);
    const ndre = averageIndex(ndreValues);
    const gndvi = averageIndex(gndviValues);

    Object.values(req.files).flat().forEach((file) => {
      fs.unlink(file.path, () => {});
    });

    res.json({
      message: 'Multispectral indices calculated successfully.',
      indices: {
        ndvi,
        ndre,
        gndvi
      }
    });
  } catch (error) {
    next(error);
  }
}