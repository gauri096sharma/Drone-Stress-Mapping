import { useEffect, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getAnalytics, getRecords } from '../api/api';
import StatCard from '../components/StatCard';
import AlertPanel from '../components/AlertPanel';

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [records, setRecords] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [analyticsRes, recordsRes] = await Promise.all([getAnalytics(), getRecords()]);
      setAnalytics(analyticsRes.data);
      setRecords(recordsRes.data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load dashboard data');
    }
  }

  const chartData = records.slice(0, 10).reverse().map((item, index) => ({
    name: `M${index + 1}`,
    health: item.healthScore,
    moisture: item.moisture
  }));

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 px-6 py-10 text-white shadow-xl">
        <p className="text-sm uppercase tracking-[0.2em] text-emerald-300">Production monitoring dashboard</p>
        <h2 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight sm:text-4xl">
          Live crop stress intelligence driven by multispectral field observations and real backend analytics.
        </h2>
        <p className="mt-4 max-w-3xl text-slate-300">
          Monitor plot health, detect nutrient and water stress, manage mission records, and use cloud-stored observations for responsive agricultural decisions.
        </p>
      </section>

      {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Records" value={analytics?.totalRecords || 0} subtitle="Stored in PostgreSQL" />
        <StatCard title="Average Health" value={`${analytics?.averageHealth || 0}%`} subtitle="Computed from current dataset" />
        <StatCard title="Average Moisture" value={`${analytics?.averageMoisture || 0}%`} subtitle="Derived from mission packets" />
        <StatCard title="Critical Zones" value={analytics?.criticalZones || 0} subtitle="Immediate intervention needed" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold">Health and moisture trend</h3>
          <div className="mt-6 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="health" stroke="#16a34a" fill="#bbf7d0" />
                <Area type="monotone" dataKey="moisture" stroke="#0ea5e9" fill="#bae6fd" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <AlertPanel records={records} />
      </div>
    </div>
  );
}
