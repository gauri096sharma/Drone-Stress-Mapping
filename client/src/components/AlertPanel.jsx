import StatusBadge from './StatusBadge';

export default function AlertPanel({ records }) {
  const alerts = records.filter(
    (item) => item.status === 'Critical' || item.waterStress === 'High' || item.nutrientStress === 'High'
  );

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold">Priority alerts</h3>
      <div className="mt-4 space-y-4">
        {alerts.length === 0 ? (
          <p className="text-sm text-slate-500">No high-priority alerts found.</p>
        ) : (
          alerts.slice(0, 5).map((item) => (
            <div key={item.id} className="rounded-2xl border p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-900">{item.plot}</p>
                  <p className="text-sm text-slate-500">{item.crop} • {item.location}</p>
                </div>
                <StatusBadge status={item.status} />
              </div>
              <div className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
                <div className="rounded-xl bg-slate-50 p-3">Water Stress: <span className="font-medium">{item.waterStress}</span></div>
                <div className="rounded-xl bg-slate-50 p-3">Nutrient Stress: <span className="font-medium">{item.nutrientStress}</span></div>
                <div className="rounded-xl bg-slate-50 p-3">Health: <span className="font-medium">{item.healthScore}%</span></div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
