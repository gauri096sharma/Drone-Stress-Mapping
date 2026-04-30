export default function StatusBadge({ status }) {
  const classes = {
    Healthy: 'bg-emerald-100 text-emerald-700',
    Stable: 'bg-sky-100 text-sky-700',
    Watch: 'bg-amber-100 text-amber-700',
    Critical: 'bg-rose-100 text-rose-700'
  };

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${classes[status] || 'bg-slate-100 text-slate-700'}`}>
      {status}
    </span>
  );
}
