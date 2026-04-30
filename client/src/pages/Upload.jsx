import { useState } from 'react';
import { createRecord } from '../api/api';

const initialForm = {
  plot: '',
  crop: 'Wheat',
  location: '',
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
    try {
      await createRecord({
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
      });
      setMessage('Record stored successfully in the production database.');
      setForm(initialForm);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to store record');
    }
  }

  const fields = [
    ['plot', 'Plot Name', 'text'],
    ['crop', 'Crop', 'text'],
    ['location', 'Location', 'text'],
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
      <h2 className="text-xl font-semibold">Upload multispectral field record</h2>
      <p className="mt-2 text-sm text-slate-500">Insert a new drone mission or manually measured plot record.</p>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
        {fields.map(([key, label, type]) => (
          <div key={key} className={key === 'notes' ? 'md:col-span-2' : ''}>
            <label className="mb-2 block text-sm font-medium text-slate-700">{label}</label>
            {type === 'textarea' ? (
              <textarea
                value={form[key]}
                onChange={(e) => updateField(key, e.target.value)}
                className="min-h-[120px] w-full rounded-xl border px-4 py-3 outline-none"
              />
            ) : (
              <input
                type={type}
                step={type === 'number' ? 'any' : undefined}
                value={form[key]}
                onChange={(e) => updateField(key, e.target.value)}
                className="w-full rounded-xl border px-4 py-3 outline-none"
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

      {message && <p className="mt-4 text-sm font-medium text-emerald-600">{message}</p>}
      {error && <p className="mt-4 text-sm font-medium text-rose-600">{error}</p>}
    </div>
  );
}
