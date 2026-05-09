import { useState } from 'react';

export default function ImageAnalysis() {
  const [files, setFiles] = useState({
    red: null,
    green: null,
    nir: null,
    redEdge: null
  });

  const [indices, setIndices] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleFileChange(key, file) {
    setFiles((prev) => ({
      ...prev,
      [key]: file
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setIndices(null);

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
        <p className="mt-2 text-sm text-slate-500">
          Use separate grayscale or band-extracted images for each multispectral channel.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
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
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">NDVI</p>
            <p className="mt-2 text-3xl font-semibold text-emerald-600">
              {indices.ndvi}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Indicates vegetation vigor using NIR and Red bands.
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">NDRE</p>
            <p className="mt-2 text-3xl font-semibold text-blue-600">
              {indices.ndre}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Indicates chlorophyll and nitrogen stress using RedEdge band.
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">GNDVI</p>
            <p className="mt-2 text-3xl font-semibold text-lime-600">
              {indices.gndvi}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Indicates crop greenness and photosynthetic activity.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}