import { useState } from 'react';

export default function MLPrediction() {
  const [form, setForm] = useState({
    ndvi: 0.29,
    ndre: 0.14,
    gndvi: 0.21,
    moisture: 30,
    temperature: 39,
    nitrogen: 28,
    phosphorus: 22,
    potassium: 25
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setResult(null);

    try {
      setLoading(true);

      const rawApiUrl = import.meta.env.VITE_API_URL;
      const API_BASE = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;

      const response = await fetch(`${API_BASE}/ml/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          Object.fromEntries(
            Object.entries(form).map(([key, value]) => [key, Number(value)])
          )
        )
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'ML prediction failed.');
      }

      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to predict crop stress.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 px-6 py-10 text-white shadow-xl">
        <p className="text-sm uppercase tracking-[0.2em] text-emerald-300">
          CNN Stress Prediction
        </p>

        <h2 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight sm:text-4xl">
          Predict crop stress using multispectral indices and field parameters.
        </h2>

        <p className="mt-4 max-w-3xl text-slate-300">
          This module uses a trained CNN model to classify crop condition and generate stress-based recommendations.
        </p>
      </section>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h3 className="text-xl font-semibold">Model Input</h3>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
          {Object.keys(form).map((key) => (
            <div key={key}>
              <label className="mb-2 block text-sm font-medium capitalize text-slate-700">
                {key}
              </label>

              <input
                type="number"
                step="any"
                value={form[key]}
                onChange={(e) => updateField(key, e.target.value)}
                className="w-full rounded-xl border px-4 py-3 outline-none"
                required
              />
            </div>
          ))}

          <div className="md:col-span-2">
            <button
              disabled={loading}
              className="rounded-xl bg-brand-dark px-5 py-3 text-white transition hover:opacity-95 disabled:opacity-60"
            >
              {loading ? 'Predicting...' : 'Predict Stress'}
            </button>
          </div>
        </form>

        {error && (
          <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
            {error}
          </p>
        )}
      </div>

      {result && (
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold">Prediction Result</h3>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Stress Level</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {result.stressLevel}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Confidence</p>
              <p className="mt-2 text-2xl font-semibold text-emerald-600">
                {result.confidence}%
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-emerald-50 p-4">
            <p className="font-semibold text-emerald-800">{result.status}</p>
            <p className="mt-2 text-sm text-emerald-700">{result.recommendation}</p>
          </div>
        </div>
      )}
    </div>
  );
}