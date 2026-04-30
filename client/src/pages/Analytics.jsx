import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getRecords } from '../api/api';

export default function Analytics() {
  const [records, setRecords] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRecords();
  }, []);

  async function loadRecords() {
    try {
      const res = await getRecords();
      setRecords(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load analytics');
    }
  }

  const trendData = records.slice(0, 10).reverse().map((item, index) => ({
    name: `R${index + 1}`,
    health: item.healthScore,
    moisture: item.moisture
  }));

  const counts = records.reduce(
    (acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    },
    { Healthy: 0, Stable: 0, Watch: 0, Critical: 0 }
  );

  const pieData = [
    { name: 'Healthy', value: counts.Healthy, color: '#16a34a' },
    { name: 'Stable', value: counts.Stable, color: '#0ea5e9' },
    { name: 'Watch', value: counts.Watch, color: '#f59e0b' },
    { name: 'Critical', value: counts.Critical, color: '#dc2626' }
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {error && <div className="xl:col-span-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Health trend</h2>
        <div className="mt-6 h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="health" fill="#0f172a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Status distribution</h2>
        <div className="mt-6 h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={110}>
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
