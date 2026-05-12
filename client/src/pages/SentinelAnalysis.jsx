import { useState } from 'react';
import NDVIHeatmap from '../components/NDVIHeatmap';

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
  const [selectedLocation, setSelectedLocation] = useState(indianLocations[0].name);

  const [form, setForm] = useState({
    locationName: indianLocations[0].name,
    latitude: indianLocations[0].latitude,
    longitude: indianLocations[0].longitude,
    startDate: '2024-01-01',
    endDate: '2024-03-31'
  });

  const [indices, setIndices] = useState(null);
  const [analysisLocation, setAnalysisLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleLocationChange(value) {
    setSelectedLocation(value);

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

  async function handleSubmit(e) {
    e.preventDefault();

    setError('');
    setIndices(null);
    setAnalysisLocation('');

    try {
      setLoading(true);

      const rawApiUrl = import.meta.env.VITE_API_URL;

      if (!rawApiUrl) {
        throw new Error('API URL is missing. Please check VITE_API_URL in Vercel.');
      }

      const API_BASE = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;

      if (!form.latitude || !form.longitude) {
        throw new Error('Please provide valid latitude and longitude.');
      }

      const response = await fetch(`${API_BASE}/sentinel/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
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
      console.error('Sentinel Analysis Error:', err);
      setError(err.message || 'Failed to analyze Sentinel-2 satellite data.');
    } finally {
      setLoading(false);
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
          Select an Indian agricultural region or enter custom coordinates. The system retrieves Sentinel-2 satellite data and calculates NDVI, NDRE, and GNDVI.
        </p>
      </section>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="text-xl font-semibold">Satellite Data Input</h3>

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

          <NDVIHeatmap ndvi={indices.ndvi} />
        </>
      )}
    </div>
  );
}