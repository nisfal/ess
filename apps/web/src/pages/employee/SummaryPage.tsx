import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Search,
  RotateCcw,
  Download,
} from 'lucide-react';
import { api } from '../../services/api';
import { Attendance } from '../../types';

export const SummaryPage: React.FC = () => {
  const getTodayString = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const getFirstDayOfMonth = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}-01`;
  };

  const [startDate, setStartDate] = useState(getFirstDayOfMonth());
  const [endDate, setEndDate] = useState(getTodayString());
  const [records, setRecords] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSummary = async (from = startDate, to = endDate) => {
    setIsLoading(true);
    try {
      const response = await api.get('/attendance/summary', {
        params: {
          startDate: from,
          endDate: to,
        },
      });
      setRecords(response.data.records || []);
    } catch (err) {
      console.error('Failed to fetch summary', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSummary(startDate, endDate);
  };

  const handleReset = () => {
    const defaultStart = getFirstDayOfMonth();
    const defaultEnd = getTodayString();
    setStartDate(defaultStart);
    setEndDate(defaultEnd);
    fetchSummary(defaultStart, defaultEnd);
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
      <div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-900">
          Attendance History
        </h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          Review your attendance records and filter by date range.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-zinc-200/80 rounded-xl p-4 shadow-xs">
        <form
          onSubmit={handleFilterSubmit}
          className="flex flex-col sm:flex-row items-end gap-3"
        >
          <div className="w-full sm:w-48">
            <label className="block text-3xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">
              From Date
            </label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-lg text-zinc-900 focus:outline-none focus:border-zinc-900 transition-colors"
            />
          </div>

          <div className="w-full sm:w-48">
            <label className="block text-3xs font-semibold uppercase tracking-wider text-zinc-500 mb-1">
              To Date
            </label>
            <input
              type="date"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-lg text-zinc-900 focus:outline-none focus:border-zinc-900 transition-colors"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              type="submit"
              disabled={isLoading}
              className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              Search
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="p-1.5 border border-zinc-200 rounded-lg text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
              title="Reset range"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white border border-zinc-200/80 rounded-xl shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between text-xs">
          <span className="font-semibold text-zinc-900">
            Records ({records.length})
          </span>
          <span className="text-3xs text-zinc-400 font-mono">
            {startDate} to {endDate}
          </span>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-zinc-400">
            Loading attendance records...
          </div>
        ) : records.length === 0 ? (
          <div className="py-12 text-center text-xs text-zinc-400">
            No records found for the selected range.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50/80 text-3xs font-semibold uppercase tracking-wider text-zinc-500 border-b border-zinc-200">
                <tr>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Check-In</th>
                  <th className="px-5 py-3">Check-Out</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-mono text-xs">
                {records.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="px-5 py-3 font-medium text-zinc-900">
                      {item.date}
                    </td>
                    <td className="px-5 py-3 text-zinc-700">
                      {item.inTime ? (
                        <span>{item.date} {formatTimeOnly(item.inTime)}</span>
                      ) : (
                        <span className="text-zinc-300">-</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-zinc-700">
                      {item.outTime ? (
                        <span>{item.date} {formatTimeOnly(item.outTime)}</span>
                      ) : (
                        <span className="text-zinc-300">-</span>
                      )}
                    </td>
                    <td className="px-5 py-3 font-sans">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-3xs font-medium ${
                          item.outTime
                            ? 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                            : item.inTime
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-zinc-100 text-zinc-400'
                        }`}
                      >
                        {item.outTime ? 'Completed' : item.inTime ? 'Present' : 'Absent'}
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
