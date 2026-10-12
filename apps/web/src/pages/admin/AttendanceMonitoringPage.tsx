import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck,
  Search,
  RotateCcw,
  Eye,
} from 'lucide-react';
import { api } from '../../services/api';
import { Attendance } from '../../types';

export const AttendanceMonitoringPage: React.FC = () => {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchAttendances = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/admin/attendance', {
        params: {
          search: search || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        },
      });
      setAttendances(response.data.records || []);
    } catch (err) {
      console.error('Failed to fetch admin attendances', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendances();
  }, []);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAttendances();
  };

  const handleReset = () => {
    setSearch('');
    setStartDate('');
    setEndDate('');
    api.get('/admin/attendance').then((res) => {
      setAttendances(res.data.records || []);
    });
  };

  const formatTimeOnly = (dateString?: string | null) => {
    if (!dateString) return '-';
    try {
      const d = new Date(dateString);
      return d.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '-';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">
            Attendance Monitoring
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Real-time audit log of all employee check-in and check-out submissions (Read Only).
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-zinc-200/80 rounded-xl p-4 shadow-xs">
        <form onSubmit={handleFilterSubmit} className="flex flex-col sm:flex-row items-end gap-3">
          <div className="flex-1 w-full sm:w-auto">
            <label className="block text-xs font-medium text-zinc-700 mb-1">
              Search employee
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name or position..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-lg text-zinc-900 focus:outline-none focus:border-zinc-900"
              />
            </div>
          </div>

          <div className="w-full sm:w-40">
            <label className="block text-xs font-medium text-zinc-700 mb-1">
              From date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-lg text-zinc-900 focus:outline-none focus:border-zinc-900"
            />
          </div>

          <div className="w-full sm:w-40">
            <label className="block text-xs font-medium text-zinc-700 mb-1">
              To date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-lg text-zinc-900 focus:outline-none focus:border-zinc-900"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              type="submit"
              disabled={isLoading}
              className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              Filter
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="p-1.5 border border-zinc-200 rounded-lg text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
              title="Reset"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white border border-zinc-200/80 rounded-xl shadow-xs overflow-hidden">
        <div className="px-5 py-3 border-b border-zinc-100 flex items-center justify-between text-xs">
          <span className="font-semibold text-zinc-900">
            Submissions ({attendances.length})
          </span>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-zinc-400">
            Loading attendance records...
          </div>
        ) : attendances.length === 0 ? (
          <div className="py-12 text-center text-xs text-zinc-400">
            No attendance records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50/80 text-xs font-medium text-zinc-600 border-b border-zinc-200">
                <tr>
                  <th className="px-5 py-2.5">Employee</th>
                  <th className="px-5 py-2.5">Date</th>
                  <th className="px-5 py-2.5">Clock-in</th>
                  <th className="px-5 py-2.5">Clock-out</th>
                  <th className="px-5 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {attendances.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center space-x-2.5">
                        {item.employee?.avatarUrl ? (
                          <img
                            src={item.employee.avatarUrl}
                            alt={item.employee.name}
                            className="w-7 h-7 rounded-full object-cover border border-zinc-200"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-700 flex items-center justify-center font-medium text-xs">
                            {item.employee?.name?.charAt(0) || 'K'}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-zinc-900 leading-tight">
                            {item.employee?.name || 'Staff'}
                          </p>
                          <p className="text-3xs text-zinc-400">
                            {item.employee?.position || '-'}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3 font-mono text-zinc-900">
                      {item.date}
                    </td>

                    <td className="px-5 py-3 font-mono text-zinc-700">
                      {item.inTime ? (
                        <span>{item.date} {formatTimeOnly(item.inTime)}</span>
                      ) : (
                        <span className="text-zinc-300">-</span>
                      )}
                    </td>

                    <td className="px-5 py-3 font-mono text-zinc-700">
                      {item.outTime ? (
                        <span>{item.date} {formatTimeOnly(item.outTime)}</span>
                      ) : (
                        <span className="text-zinc-300">-</span>
                      )}
                    </td>

                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-3xs font-medium ${
                          item.outTime
                            ? 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                            : item.inTime
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-zinc-100 text-zinc-400'
                        }`}
                      >
                        {item.outTime ? 'Completed' : item.inTime ? 'Active' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
