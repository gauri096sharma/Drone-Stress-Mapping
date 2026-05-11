export default function NDVIHeatmap({ ndvi }) {
  const value = Number(ndvi || 0);

  const getStatus = () => {
    if (value >= 0.6) {
      return {
        label: 'Healthy Crop Zone',
        description: 'Strong vegetation response with good canopy vigor.',
        badge: 'bg-emerald-100 text-emerald-700',
        border: 'border-emerald-200'
      };
    }

    if (value >= 0.35) {
      return {
        label: 'Moderate Stress Zone',
        description: 'Crop shows early stress signals and needs monitoring.',
        badge: 'bg-amber-100 text-amber-700',
        border: 'border-amber-200'
      };
    }

    return {
      label: 'Critical Stress Zone',
      description: 'Low vegetation response. Immediate field inspection is recommended.',
      badge: 'bg-rose-100 text-rose-700',
      border: 'border-rose-200'
    };
  };

  const status = getStatus();

  const getCellStyle = (cellValue) => {
    if (cellValue >= 0.6) return 'bg-emerald-600';
    if (cellValue >= 0.45) return 'bg-green-500';
    if (cellValue >= 0.35) return 'bg-lime-400';
    if (cellValue >= 0.25) return 'bg-amber-400';
    return 'bg-rose-500';
  };

  const heatCells = Array.from({ length: 96 }, (_, index) => {
    const row = Math.floor(index / 12);
    const col = index % 12;

    const wave =
      Math.sin(index * 0.8) * 0.08 +
      Math.cos(row * 1.2) * 0.05 +
      Math.sin(col * 0.9) * 0.04;

    const cellValue = Math.max(0, Math.min(1, value + wave));

    return {
      id: index,
      row,
      col,
      cellValue,
      color: getCellStyle(cellValue)
    };
  });

  const healthyCount = heatCells.filter((cell) => cell.cellValue >= 0.45).length;
  const moderateCount = heatCells.filter(
    (cell) => cell.cellValue >= 0.25 && cell.cellValue < 0.45
  ).length;
  const stressedCount = heatCells.filter((cell) => cell.cellValue < 0.25).length;

  const healthyPercent = Math.round((healthyCount / heatCells.length) * 100);
  const moderatePercent = Math.round((moderateCount / heatCells.length) * 100);
  const stressedPercent = Math.round((stressedCount / heatCells.length) * 100);

  return (
    <div className={`rounded-2xl border bg-white p-6 shadow-sm ${status.border}`}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
            NDVI Heatmap Visualization
          </p>

          <h3 className="mt-2 text-xl font-semibold text-slate-900">
            Vegetation Stress Zone Map
          </h3>

          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            This map simulates field-level vegetation zones from the calculated NDVI value.
            Green areas indicate stronger vegetation response, while amber and red areas
            represent crop stress zones.
          </p>
        </div>

        <div className={`rounded-full px-4 py-2 text-sm font-semibold ${status.badge}`}>
          {status.label}
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div>
          <div className="rounded-2xl border bg-slate-100 p-4">
            <div className="grid grid-cols-12 gap-1">
              {heatCells.map((cell) => (
                <div
                  key={cell.id}
                  title={`NDVI: ${cell.cellValue.toFixed(2)}`}
                  className={`h-9 rounded-md shadow-sm transition hover:scale-110 hover:ring-2 hover:ring-slate-900/20 ${cell.color}`}
                />
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-slate-50 p-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">NDVI Score</span>
              <span className="font-semibold text-slate-900">{value.toFixed(3)}</span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-gradient-to-r from-rose-500 via-amber-400 via-lime-400 to-emerald-600">
              <div
                className="h-3 w-1 rounded-full bg-slate-950"
                style={{ marginLeft: `${Math.min(Math.max(value * 100, 0), 100)}%` }}
              />
            </div>

            <div className="mt-2 flex justify-between text-xs text-slate-500">
              <span>0.00</span>
              <span>0.25</span>
              <span>0.45</span>
              <span>0.60</span>
              <span>1.00</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border p-4">
            <p className="text-sm font-semibold text-slate-900">Field Interpretation</p>
            <p className="mt-2 text-sm text-slate-600">{status.description}</p>
          </div>

          <div className="grid gap-3">
            <div className="rounded-xl border p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-700">Healthy Coverage</p>
                <p className="text-sm font-semibold text-emerald-700">{healthyPercent}%</p>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-emerald-500"
                  style={{ width: `${healthyPercent}%` }}
                />
              </div>
            </div>

            <div className="rounded-xl border p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-700">Moderate Coverage</p>
                <p className="text-sm font-semibold text-amber-700">{moderatePercent}%</p>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-amber-400"
                  style={{ width: `${moderatePercent}%` }}
                />
              </div>
            </div>

            <div className="rounded-xl border p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-700">Stressed Coverage</p>
                <p className="text-sm font-semibold text-rose-700">{stressedPercent}%</p>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-rose-500"
                  style={{ width: `${stressedPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-950 p-4 text-white">
            <p className="text-sm font-semibold">Legend</p>
            <div className="mt-3 grid gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-emerald-600" />
                NDVI ≥ 0.60: High vegetation vigor
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-green-500" />
                0.45 - 0.59: Good vegetation condition
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-amber-400" />
                0.25 - 0.44: Moderate stress
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-rose-500" />
                NDVI &lt; 0.25: Severe stress
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}