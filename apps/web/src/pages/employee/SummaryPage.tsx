import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Search,
  Filter,
  CheckCircle,
  Clock,
  ArrowRight,
  RotateCcw,
  FileSpreadsheet,
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
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Summary Absensi WFH
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Riwayat kehadiran kerja bulanan dan filter rentang tanggal.
        </p>
      </div>

      {/* FILTER BOX ACCORDING TO TEST SPEC */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80">
        <div className="flex items-center space-x-2 text-sm font-bold text-slate-800 mb-4">
          <Filter className="w-4 h-4 text-indigo-600" />
          <span>Filter Tanggal (From - To)</span>
        </div>

        <form
          onSubmit={handleFilterSubmit}
          className="flex flex-col md:flex-row items-end gap-4"
        >
          {/* From Date */}
          <div className="w-full md:w-1/3">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Dari Tanggal (From)
            </label>
            <div className="relative rounded-xl shadow-2xs">
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* To Date */}
          <div className="w-full md:w-1/3">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Sampai Tanggal (To)
            </label>
            <div className="relative rounded-xl shadow-2xs">
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full md:w-auto flex items-center space-x-2 pt-2 md:pt-0">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 md:flex-none inline-flex items-center justify-center px-6 py-2.5 border border-transparent rounded-xl shadow-md shadow-indigo-600/20 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition-all cursor-pointer"
            >
              <Search className="w-4 h-4 mr-1.5" />
              <span>Cari</span>
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center justify-center px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
              title="Reset ke bulan berjalan"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </form>

        <p className="text-2xs text-slate-400 mt-3">
          * Default menampilkan data dari awal bulan berjalan (tanggal 1) sampai hari ini.
        </p>
      </div>

      {/* SUMMARY RESULT TABLE */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-800">
              Hasil Presensi ({records.length} Record)
            </h2>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg">
            Periode: {startDate} s/d {endDate}
          </span>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-slate-400">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm">Memuat data absensi...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <Calendar className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-medium text-slate-600">Tidak ada riwayat absensi</p>
            <p className="text-xs text-slate-400">
              Tidak ditemukan data pada rentang tanggal {startDate} s/d {endDate}.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200">
                <tr>
                  <th scope="col" className="px-6 py-4">
                    Tanggal
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Masuk
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Pulang
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Tanggal */}
                    <td className="px-6 py-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {item.date}
                    </td>

                    {/* Masuk */}
                    <td className="px-6 py-4 font-mono font-medium text-slate-800 whitespace-nowrap">
                      {item.inTime ? (
                        <div className="flex items-center space-x-1.5 text-emerald-700 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>{item.date} {formatTimeOnly(item.inTime)}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* Pulang */}
                    <td className="px-6 py-4 font-mono font-medium text-slate-800 whitespace-nowrap">
                      {item.outTime ? (
                        <div className="flex items-center space-x-1.5 text-rose-700 font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          <span>{item.date} {formatTimeOnly(item.outTime)}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          item.outTime
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : item.inTime
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {item.outTime ? 'Selesai Pulang' : item.inTime ? 'Masuk Bekerja' : 'Belum'}
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
