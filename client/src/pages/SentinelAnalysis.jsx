import { useState } from 'react';
import NDVIHeatmap from '../components/NDVIHeatmap';
import { useAuth } from '../context/AuthContext';
import { createRecord } from '../api/api';

const indianLocations = [
  { name: 'Delhi NCR', latitude: 28.7041, longitude: 77.1025 },
  { name: 'Lucknow, Uttar Pradesh', latitude: 26.85, longitude: 80.94 },
  { name: 'Ludhiana, Punjab', latitude: 30.9, longitude: 75.85 },
  { name: 'Karnal, Haryana', latitude: 29.69, longitude: 76.98 },
  { name: 'Amritsar, Punjab', latitude: 31.63, longitude: 74.87 },
  { name: 'Jaipur, Rajasthan', latitude: 26.91, longitude: 75.79 },
  { name: 'Indore, Madhya Pradesh', latitude: 22.72, longitude: 75.86 },
  { name: 'Nagpur, Maharashtra', latitude: 21.15, longitude: 79.09 },
  { name: 'Surat, Gujarat', latitude: 21.17, longitude: 72.83 },
  { name: 'Raipur, Chhattisgarh', latitude: 21.25, longitude: 81.63 },
  { name: 'Patna, Bihar', latitude: 25.59, longitude: 85.14 },
  { name: 'Guwahati, Assam', latitude: 26.14, longitude: 91.74 },
  { name: 'Hyderabad, Telangana', latitude: 17.38, longitude: 78.48 },
  { name: 'Thanjavur, Tamil Nadu', latitude: 10.79, longitude: 79.13 },
  { name: 'Kochi, Kerala', latitude: 9.93, longitude: 76.26 },
  { name: 'Shimla, Himachal Pradesh', latitude: 31.1, longitude: 77.17 },
  { name: 'Custom Location', latitude: '', longitude: '' }
];

export default function SentinelAnalysis() {
  const { user } = useAuth();

  const [selectedLocation, setSelectedLocation] = useState(indianLocations[0].name);

  const [form, setForm] = useState({
    locationName: indianLocations[0].name,
    latitude: indianLocations[0].latitude,
    longitude: indianLocations[0].longitude,
    cropName: 'Wheat',
    startDate: '2024-01-01',
    endDate: '2024-03-31'
  });

  const [searchLocation, setSearchLocation] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  const [indices, setIndices] = useState(null);
  const [analysisLocation, setAnalysisLocation] = useState('');
  const [mlResult, setMlResult] = useState(null);

  const [loading, setLoading] = useState(false);
  const [mlLoading, setMlLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  const [error, setError] = useState('');
  const [locationMessage, setLocationMessage] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function getApiBase() {
    const rawApiUrl = import.meta.env.VITE_API_URL;

    if (!rawApiUrl) {
      throw new Error('API URL is missing. Please check VITE_API_URL in Vercel.');
    }

    return rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;
  }

  function handleLocationChange(value) {
    setSelectedLocation(value);
    setError('');
    setLocationMessage('');
    setSaveMessage('');

    const location = indianLocations.find((item) => item.name === value);

    if (location?.name === 'Custom Location') {
      setForm((prev) => ({
        ...prev,
        locationName: 'Custom Location',
        latitude: '',
        longitude: ''
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      locationName: location.name,
      latitude: location.latitude,
      longitude: location.longitude
    }));
  }

  async function handleLocationSearch() {
    setError('');
    setLocationMessage('');
    setSaveMessage('');

    if (!searchLocation.trim()) {
      setError('Please enter a location name to search.');
      return;
    }

    try {
      setSearchLoading(true);

      const query = encodeURIComponent(`${searchLocation}, India`);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`
      );

      const data = await response.json();

      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('Location not found. Please try a nearby city, district, or state name.');
      }

      const place = data[0];

      setSelectedLocation('Custom Location');

      setForm((prev) => ({
        ...prev,
        locationName: place.display_name,
        latitude: Number(place.lat).toFixed(6),
        longitude: Number(place.lon).toFixed(6)
      }));

      setLocationMessage(`Location found: ${place.display_name}`);
    } catch (err) {
      setError(err.message || 'Failed to search location.');
    } finally {
      setSearchLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError('');
    setIndices(null);
    setMlResult(null);
    setAnalysisLocation('');
    setSaveMessage('');

    try {
      setLoading(true);

      const API_BASE = getApiBase();

      if (!form.latitude || !form.longitude) {
        throw new Error('Please provide valid latitude and longitude.');
      }

      const response = await fetch(`${API_BASE}/sentinel/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: Number(form.latitude),
          longitude: Number(form.longitude),
          startDate: form.startDate,
          endDate: form.endDate
        })
      });

      if (!response.ok) {
        let errorMessage = 'Failed to fetch Sentinel-2 data.';

        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = `Server Error (${response.status})`;
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (!data.indices) {
        throw new Error('No vegetation index data returned.');
      }

      setIndices(data.indices);
      setAnalysisLocation(
        `${form.locationName} (${Number(form.latitude).toFixed(4)}, ${Number(form.longitude).toFixed(4)})`
      );
    } catch (err) {
      setError(err.message || 'Failed to analyze Sentinel-2 satellite data.');
    } finally {
      setLoading(false);
    }
  }

  async function handleMLPrediction() {
    setError('');
    setMlResult(null);
    setSaveMessage('');

    if (!indices) {
      setError('Please run Sentinel-2 analysis first.');
      return;
    }

    try {
      setMlLoading(true);

      const API_BASE = getApiBase();

      const response = await fetch(`${API_BASE}/ml/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      setError('Please run Sentinel analysis and CNN prediction before saving.');
      return;
    }

    try {
      setSaveLoading(true);

      await createRecord(
        {
          plot: `Sentinel Analysis - ${form.locationName}`,
          crop: form.cropName,
          location: analysisLocation || form.locationName,
          capturedAt: new Date().toISOString(),
          ndvi: Number(indices.ndvi),
          ndre: Number(indices.ndre),
          gndvi: Number(indices.gndvi),
          moisture: 50,
          temperature: 30,
          nitrogen: 55,
          phosphorus: 50,
          potassium: 55,
          notes: `Source: Sentinel-2 Satellite Analysis | Crop: ${form.cropName} | CNN Prediction: ${mlResult.stressLevel} | Confidence: ${mlResult.confidence}% | Recommendation: ${mlResult.recommendation}`
        },
        user?.id
      );

      setSaveMessage('Analysis saved successfully. It will now appear in Records, Dashboard, and Analytics.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save analysis to records.');
    } finally {
      setSaveLoading(false);
    }
  }

  const isCustomLocation = selectedLocation === 'Custom Location';

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 px-6 py-10 text-white shadow-xl">
        <p className="text-sm uppercase tracking-[0.2em] text-emerald-300">
          Sentinel-2 Satellite Analysis
        </p>

        <h2 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight sm:text-4xl">
          Fetch real Sentinel-2 multispectral data and calculate vegetation indices automatically.
        </h2>

        <p className="mt-4 max-w-3xl text-slate-300">
          Select a region, search any Indian location, or enter custom coordinates. The system retrieves Sentinel-2 satellite data and calculates NDVI, NDRE, and GNDVI.
        </p>
      </section>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="text-xl font-semibold">Satellite Data Input</h3>

        <div className="mt-6 rounded-2xl border bg-slate-50 p-4">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Search Location
          </label>

          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <input
              type="text"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              placeholder="Example: Aligarh, Uttar Pradesh"
              className="w-full rounded-xl border bg-white px-4 py-3 outline-none"
            />

            <button
              type="button"
              onClick={handleLocationSearch}
              disabled={searchLoading}
              className="rounded-xl bg-brand-dark px-5 py-3 text-white transition hover:opacity-95 disabled:opacity-60"
            >
              {searchLoading ? 'Searching...' : 'Search Location'}
            </button>
          </div>

          {locationMessage && (
            <p className="mt-3 text-sm font-medium text-emerald-600">
              {locationMessage}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Select Location
            </label>

            <select
              value={selectedLocation}
              onChange={(e) => handleLocationChange(e.target.value)}
              className="w-full rounded-xl border bg-white px-4 py-3 outline-none"
            >
              {indianLocations.map((location) => (
                <option key={location.name} value={location.name}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>

          {isCustomLocation && (
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Custom Location Name
              </label>

              <input
                type="text"
                placeholder="Example: Aligarh, Uttar Pradesh"
                value={form.locationName === 'Custom Location' ? '' : form.locationName}
                onChange={(e) => updateField('locationName', e.target.value)}
                className="w-full rounded-xl border px-4 py-3 outline-none"
                required
              />
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Latitude
            </label>

            <input
              type="number"
              step="any"
              value={form.latitude}
              onChange={(e) => updateField('latitude', e.target.value)}
              disabled={!isCustomLocation}
              className="w-full rounded-xl border px-4 py-3 outline-none disabled:bg-slate-100"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Longitude
            </label>

            <input
              type="number"
              step="any"
              value={form.longitude}
              onChange={(e) => updateField('longitude', e.target.value)}
              disabled={!isCustomLocation}
              className="w-full rounded-xl border px-4 py-3 outline-none disabled:bg-slate-100"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Crop Name
            </label>

            <input
              type="text"
              value={form.cropName}
              onChange={(e) => updateField('cropName', e.target.value)}
              placeholder="Example: Wheat, Rice, Mango"
              className="w-full rounded-xl border px-4 py-3 outline-none"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Start Date
            </label>

            <input
              type="date"
              value={form.startDate}
              onChange={(e) => updateField('startDate', e.target.value)}
              className="w-full rounded-xl border px-4 py-3 outline-none"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              End Date
            </label>

            <input
              type="date"
              value={form.endDate}
              onChange={(e) => updateField('endDate', e.target.value)}
              className="w-full rounded-xl border px-4 py-3 outline-none"
              required
            />
          </div>

          <div className="md:col-span-2">
            <button
              disabled={loading}
              className="rounded-xl bg-brand-dark px-5 py-3 text-white transition hover:opacity-95 disabled:opacity-60"
            >
              {loading ? 'Fetching Sentinel-2 Data...' : 'Analyze Sentinel-2 Data'}
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
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
              Analyzed Area
            </p>
            <h3 className="mt-2 text-xl font-semibold text-slate-900">
              {analysisLocation}
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Crop: {form.cropName}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Date Range: {form.startDate} to {form.endDate}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">NDVI</p>
              <p className="mt-2 text-3xl font-semibold text-emerald-600">{indices.ndvi}</p>
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">NDRE</p>
              <p className="mt-2 text-3xl font-semibold text-blue-600">{indices.ndre}</p>
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">GNDVI</p>
              <p className="mt-2 text-3xl font-semibold text-lime-600">{indices.gndvi}</p>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold">CNN Stress Prediction</h3>
            <p className="mt-2 text-sm text-slate-500">
              Uses Sentinel-derived NDVI, NDRE, and GNDVI with field parameter defaults to classify crop stress.
            </p>

            <button
              onClick={handleMLPrediction}
              disabled={mlLoading}
              className="mt-4 rounded-xl bg-brand-dark px-5 py-3 text-white transition hover:opacity-95 disabled:opacity-60"
            >
              {mlLoading ? 'Running CNN Prediction...' : 'Predict Stress with CNN'}
            </button>

            {mlResult && (
              <div className="mt-5 rounded-2xl bg-slate-50 p-5">
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
                  <p className="font-semibold text-emerald-800">{mlResult.status}</p>
                  <p className="mt-2 text-sm text-emerald-700">{mlResult.recommendation}</p>
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