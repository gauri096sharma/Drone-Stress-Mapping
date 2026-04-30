export function validateRecordPayload(data) {
  const requiredFields = [
    'plot',
    'crop',
    'location',
    'capturedAt',
    'ndvi',
    'ndre',
    'gndvi',
    'moisture',
    'temperature',
    'nitrogen',
    'phosphorus',
    'potassium'
  ];

  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      return `${field} is required`;
    }
  }

  return null;
}
