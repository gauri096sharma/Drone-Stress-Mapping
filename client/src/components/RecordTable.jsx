import { formatDateTime } from '../utils/formatters';
import StatusBadge from './StatusBadge';

export default function RecordTable({ records, onDelete }) {
  return (
    <div className="overflow-x-auto rounded-2xl border bg-white shadow-sm">
      <table className="w-full min-w-[900px] text-sm">
        <thead className="bg-slate-50 text-left text-slate-600">
          <tr>
            <th className="px-4 py-3">Plot</th>
            <th className="px-4 py-3">Crop</th>
            <th className="px-4 py-3">Captured</th>
            <th className="px-4 py-3">NDVI</th>
            <th className="px-4 py-3">Moisture</th>
            <th className="px-4 py-3">Water Stress</th>
            <th className="px-4 py-3">Nutrient Stress</th>
            <th className="px-4 py-3">Health</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id} className="border-t">
              <td className="px-4 py-3 font-medium">{record.plot}</td>
              <td className="px-4 py-3">{record.crop}</td>
              <td className="px-4 py-3">{formatDateTime(record.capturedAt)}</td>
              <td className="px-4 py-3">{record.ndvi}</td>
              <td className="px-4 py-3">{record.moisture}%</td>
              <td className="px-4 py-3">{record.waterStress}</td>
              <td className="px-4 py-3">{record.nutrientStress}</td>
              <td className="px-4 py-3">{record.healthScore}%</td>
              <td className="px-4 py-3"><StatusBadge status={record.status} /></td>
              <td className="px-4 py-3">
                <button
                  onClick={() => onDelete(record.id)}
                  className="rounded-lg bg-rose-600 px-3 py-2 text-white transition hover:bg-rose-700"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
