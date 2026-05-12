import { useState } from 'react';
import NDVIHeatmap from '../components/NDVIHeatmap';
import { useAuth } from '../context/AuthContext';
import { createRecord } from '../api/api';

function getHealthInterpretation(indices) {
  const ndvi = Number(indices.ndvi);
  const ndre = Number(indices.ndre);
  const gndvi = Number(indices.gndvi);

  if (ndvi >= 0.6 && ndre >= 0.2 && gndvi >= 0.45) {
    return {
      status: 'Healthy Vegetation',
      level: 'Low Stress',
      color: 'emerald',
      recommendation:
        'Crop canopy shows strong vegetation vigor. Maintain current irrigation and nutrient schedule.'
    };
  }

  if (ndvi >= 0.35 && ndvi < 0.6) {
    return {
      status: 'Moderate Crop Stress',
      level: 'Watch Zone',
      color: 'amber',
      recommendation:
        'Crop shows moderate stress signs. Check irrigation level, soil moisture, and nitrogen availability.'
    };
  }

  return {
    status: 'Critical Crop Stress',
    level: 'High Stress',
    color: 'rose',
    recommendation:
      'Crop health is weak. Immediate inspection is recommended for water stress, nutrient deficiency, or disease symptoms.'
  };
}

export default function ImageAnalysis() {
  const { user } = useAuth();

  const [files, setFiles] = useState({
    red: null,
    green: null,
    nir: null,
    redEdge: null
  });

  const [cropName, setCropName] = useState('Wheat');

  const [indices, setIndices] = useState(null);
  const [mlResult, setMlResult] = useState(null);

  const [loading, setLoading] = useState(false);
  const [mlLoading, setMlLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const [error, setError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  function handleFileChange(key, file) {
    setFiles((prev) => ({
      ...prev,
      [key]: file
    }));
  }

  function getApiBase() {
    const rawApiUrl = import.meta.env.VITE_API_URL;

    return rawApiUrl.endsWith('/api')
      ? rawApiUrl
      : `${rawApiUrl}/api`;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError('');
    setIndices(null);
    setMlResult(null);
    setSaveMessage('');

    if (!files.red || !files.green || !files.nir || !files.redEdge) {
      setError('Please upload all four band images: Red, Green, NIR, and RedEdge.');
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append('red', files.red);
      formData.append('green', files.green);
      formData.append('nir', files.nir);
      formData.append('redEdge', files.redEdge);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/images/process`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to process multispectral images.');
      }

      setIndices(data.indices);
    } catch (err) {
      setError(err.message || 'Failed to process images.');
    } finally {
      setLoading(false);
    }
  }

  async function handleMLPrediction() {
    setError('');
    setMlResult(null);

    if (!indices) {
      setError('Please calculate multispectral indices first.');
      return;
    }

    try {
      setMlLoading(true);

      const API_BASE = getApiBase();

      const response = await fetch(`${API_BASE}/ml/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ndvi: Number(indices.ndvi),
          ndre: Number(indices.ndre),
          gndvi: Number(indices.gndvi),
          moisture: 50,
          temperature: 30,
          nitrogen: 55,
          phosphorus: 50,
          potassium: 55
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'CNN prediction failed.');
      }

      setMlResult(data);
    } catch (err) {
      setError(err.message || 'Failed to run CNN prediction.');
    } finally {
      setMlLoading(false);
    }
  }

  async function handleSaveToRecords() {
    setError('');
    setSaveMessage('');

    if (!indices || !mlResult) {
      setError('Please run CNN prediction before saving.');
      return;
    }

    try {
      setSaveLoading(true);

      await createRecord(
        {
          plot: 'Multispectral Image Analysis',
          crop: cropName,
          location: 'Image-Based Analysis',
          capturedAt: new Date().toISOString(),
          ndvi: Number(indices.ndvi),
          ndre: Number(indices.ndre),
          gndvi: Number(indices.gndvi),
          moisture: 50,
          temperature: 30,
          nitrogen: 55,
          phosphorus: 50,
          potassium: 55,
          notes: `Source: Multispectral Image Upload | Crop: ${cropName} | CNN Prediction: ${mlResult.stressLevel} | Confidence: ${mlResult.confidence}% | Recommendation: ${mlResult.recommendation}`
        },
        user?.id
      );

      setSaveMessage(
        'Image analysis saved successfully. It will now appear in Records, Dashboard, and Analytics.'
      );
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save image analysis.');
    } finally {
      setSaveLoading(false);
    }
  }

  const interpretation = indices ? getHealthInterpretation(indices) : null;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 px-6 py-10 text-white shadow-xl">
        <p className="text-sm uppercase tracking-[0.2em] text-emerald-300">
          Multispectral Image Processing
        </p>

        <h2 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight sm:text-4xl">
          Upload multispectral band images to automatically calculate crop vegetation indices.
        </h2>

        <p className="mt-4 max-w-3xl text-slate-300">
          Upload Red, Green, NIR, and RedEdge band images. The system calculates NDVI, NDRE, and GNDVI automatically from image pixel intensity values.
        </p>
      </section>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="text-xl font-semibold">Upload Band Images</h3>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Crop Name
            </label>

            <input
              type="text"
              value={cropName}
              onChange={(e) => setCropName(e.target.value)}
              placeholder="Example: Wheat, Rice, Sugarcane"
              className="w-full rounded-xl border px-4 py-3 outline-none"
              required
            />
          </div>

          {[
            ['red', 'Red Band Image'],
            ['green', 'Green Band Image'],
            ['nir', 'NIR Band Image'],
            ['redEdge', 'RedEdge Band Image']
          ].map(([key, label]) => (
            <div key={key}>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                {label}
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(key, e.target.files[0])}
                className="w-full rounded-xl border px-4 py-3 outline-none"
              />
            </div>
          ))}

          <div className="md:col-span-2">
            <button
              disabled={loading}
              className="rounded-xl bg-brand-dark px-5 py-3 text-white transition hover:opacity-95 disabled:opacity-60"
            >
              {loading ? 'Processing Images...' : 'Calculate Multispectral Indices'}
            </button>
          </div>
        </form>

        {error && (
          <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
            {error}
          </p>
        )}
      </div>

      {indices && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">NDVI</p>
              <p className="mt-2 text-3xl font-semibold text-emerald-600">
                {indices.ndvi}
              </p>
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">NDRE</p>
              <p className="mt-2 text-3xl font-semibold text-blue-600">
                {indices.ndre}
              </p>
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">GNDVI</p>
              <p className="mt-2 text-3xl font-semibold text-lime-600">
                {indices.gndvi}
              </p>
            </div>
          </div>

          <div
            className={`rounded-2xl border p-6 shadow-sm ${
              interpretation.color === 'emerald'
                ? 'border-emerald-200 bg-emerald-50'
                : interpretation.color === 'amber'
                ? 'border-amber-200 bg-amber-50'
                : 'border-rose-200 bg-rose-50'
            }`}
          >
            <h3 className="text-2xl font-semibold">
              {interpretation.status}
            </h3>

            <p className="mt-2 text-sm font-medium text-slate-700">
              Stress Level: {interpretation.level}
            </p>

            <p className="mt-3 text-slate-700">
              {interpretation.recommendation}
            </p>

            <button
              onClick={handleMLPrediction}
              disabled={mlLoading}
              className="mt-5 rounded-xl bg-brand-dark px-5 py-3 text-white transition hover:opacity-95 disabled:opacity-60"
            >
              {mlLoading ? 'Running CNN Prediction...' : 'Predict Stress with CNN'}
            </button>

            {mlResult && (
              <div className="mt-5 rounded-2xl bg-white p-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-slate-500">Predicted Stress Level</p>
                    <p className="mt-1 text-2xl font-semibold text-slate-900">
                      {mlResult.stressLevel}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">Confidence</p>
                    <p className="mt-1 text-2xl font-semibold text-emerald-600">
                      {mlResult.confidence}%
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-xl bg-emerald-50 p-4">
                  <p className="font-semibold text-emerald-800">
                    {mlResult.status}
                  </p>

                  <p className="mt-2 text-sm text-emerald-700">
                    {mlResult.recommendation}
                  </p>
                </div>

                <button
                  onClick={handleSaveToRecords}
                  disabled={saveLoading}
                  className="mt-4 rounded-xl bg-emerald-600 px-5 py-3 text-white transition hover:bg-emerald-700 disabled:opacity-60"
                >
                  {saveLoading ? 'Saving to Records...' : 'Save Analysis to Records'}
                </button>

                {saveMessage && (
                  <p className="mt-3 text-sm font-medium text-emerald-600">
                    {saveMessage}
                  </p>
                )}
              </div>
            )}
          </div>

          <NDVIHeatmap ndvi={indices.ndvi} />
        </>
      )}
    </div>
  );
}