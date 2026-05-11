import { useEffect, useState } from 'react';
import { deleteRecord, getRecords } from '../api/api';
import { useAuth } from '../context/AuthContext';
import RecordTable from '../components/RecordTable';

export default function Records() {
  const { user } = useAuth();

  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.id) {
      loadRecords();
    }
  }, [user]);

  async function loadRecords() {
    try {
      setError('');
      const res = await getRecords(user.id);

      const sortedRecords = [...(res.data || [])].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setRecords(sortedRecords);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load records');
    }
  }

  async function handleDelete(id) {
    try {
      setError('');
      await deleteRecord(id);
      await loadRecords();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete record');
    }
  }

  const filtered = records.filter((item) =>
    [item.plot, item.crop, item.status, item.location]
      .join(' ')
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold">Mission database</h2>
        <p className="mt-2 text-sm text-slate-500">
          Search and manage your field records stored in the production database.
        </p>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by plot, crop, status or location"
          className="mt-4 w-full rounded-xl border px-4 py-3 outline-none"
        />
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <RecordTable records={filtered} onDelete={handleDelete} />
    </div>
  );
}