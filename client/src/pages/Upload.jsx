import { useState } from 'react';
import { createRecord } from '../api/api';
import { useAuth } from '../context/AuthContext';

const indianLocations = [
  'Lucknow, Uttar Pradesh (26.85, 80.94)',
  'Ludhiana, Punjab (30.90, 75.85)',
  'Karnal, Haryana (29.69, 76.98)',
  'Amritsar, Punjab (31.63, 74.87)',
  'Jaipur, Rajasthan (26.91, 75.79)',
  'Indore, Madhya Pradesh (22.72, 75.86)',
  'Bhopal, Madhya Pradesh (23.25, 77.41)',
  'Nagpur, Maharashtra (21.15, 79.09)',
  'Surat, Gujarat (21.17, 72.83)',
  'Raipur, Chhattisgarh (21.25, 81.63)',
  'Ranchi, Jharkhand (23.34, 85.31)',
  'Patna, Bihar (25.59, 85.14)',
  'Kharagpur, West Bengal (22.34, 87.32)',
  'Guwahati, Assam (26.14, 91.74)',
  'Hyderabad, Telangana (17.38, 78.48)',
  'Thanjavur, Tamil Nadu (10.79, 79.13)',
  'Kochi, Kerala (9.93, 76.26)',
  'Coorg, Karnataka (12.34, 75.81)',
  'Shimla, Himachal Pradesh (31.10, 77.17)',
  'Meerut, Uttar Pradesh (28.98, 77.70)'
];

const initialForm = {
  plot: '',
  crop: 'Wheat',
  location: indianLocations[0],
  capturedAt: new Date().toISOString().slice(0, 16),
  ndvi: 0.68,
  ndre: 0.55,
  gndvi: 0.61,
  moisture: 64,
  temperature: 29,
  nitrogen: 66,
  phosphorus: 57,
  potassium: 63,
  notes: 'Manual mission upload'
};

export default function Upload() {
  const { user } = useAuth();

  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!user?.id) {
      setError('Please login before uploading a record.');
      return;
    }

    try {
      await createRecord(
        {
          ...form,
          ndvi: Number(form.ndvi),
          ndre: Number(form.ndre),
          gndvi: Number(form.gndvi),
          moisture: Number(form.moisture),
          temperature: Number(form.temperature),
          nitrogen: Number(form.nitrogen),
          phosphorus: Number(form.phosphorus),
          potassium: Number(form.potassium),
          capturedAt: new Date(form.capturedAt).toISOString()
        },
        user.id
      );

      setMessage('Record stored successfully in your account database.');

      setForm({
        ...initialForm,
        capturedAt: new Date().toISOString().slice(0, 16)
      });
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to store record');
    }
  }

  const fields = [
    ['plot', 'Plot Name', 'text'],
    ['crop', 'Crop', 'text'],
    ['location', 'Location', 'select'],
    ['capturedAt', 'Captured At', 'datetime-local'],
    ['ndvi', 'NDVI', 'number'],
    ['ndre', 'NDRE', 'number'],
    ['gndvi', 'GNDVI', 'number'],
    ['moisture', 'Moisture', 'number'],
    ['temperature', 'Temperature', 'number'],
    ['nitrogen', 'Nitrogen', 'number'],
    ['phosphorus', 'Phosphorus', 'number'],
    ['potassium', 'Potassium', 'number'],
    ['notes', 'Notes', 'textarea']
  ];

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold">
        Upload multispectral field record
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        Insert a new drone mission or manually measured plot record.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-6 grid gap-4 md:grid-cols-2"
      >
        {fields.map(([key, label, type]) => (
          <div
            key={key}
            className={key === 'notes' ? 'md:col-span-2' : ''}
          >
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {label}
            </label>

            {type === 'textarea' ? (
              <textarea
                value={form[key]}
                onChange={(e) => updateField(key, e.target.value)}
                className="min-h-[120px] w-full rounded-xl border px-4 py-3 outline-none"
              />
            ) : type === 'select' ? (
              <div className="space-y-3">
                <select
                  value={
                    indianLocations.includes(form.location)
                      ? form.location
                      : 'custom'
                  }
                  onChange={(e) => {
                    if (e.target.value === 'custom') {
                      updateField('location', '');
                    } else {
                      updateField('location', e.target.value);
                    }
                  }}
                  className="w-full rounded-xl border bg-white px-4 py-3 outline-none"
                >
                  {indianLocations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}

                  <option value="custom">Other Location</option>
                </select>

                {!indianLocations.includes(form.location) && (
                  <input
                    type="text"
                    placeholder="Enter custom location"
                    value={form.location}
                    onChange={(e) =>
                      updateField('location', e.target.value)
                    }
                    className="w-full rounded-xl border px-4 py-3 outline-none"
                    required
                  />
                )}
              </div>
            ) : (
              <input
                type={type}
                step={type === 'number' ? 'any' : undefined}
                value={form[key]}
                onChange={(e) => updateField(key, e.target.value)}
                className="w-full rounded-xl border px-4 py-3 outline-none"
                required={key !== 'notes'}
              />
            )}
          </div>
        ))}

        <div className="md:col-span-2">
          <button className="rounded-xl bg-brand-dark px-5 py-3 text-white transition hover:opacity-95">
            Store Record
          </button>
        </div>
      </form>

      {message && (
        <p className="mt-4 text-sm font-medium text-emerald-600">
          {message}
        </p>
      )}

      {error && (
        <p className="mt-4 text-sm font-medium text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}