import React, { useState, useEffect } from 'react';
import {
  ClipboardCheck,
  Search,
  Calendar,
  Filter,
  User,
  Clock,
  RotateCcw,
  CheckCircle,
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
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Title */}
      <div>
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 mb-2">
          <Eye className="w-3.5 h-3.5 mr-1" />
          <span>Akses Khusus HRD (Read-Only)</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Monitoring Absensi Seluruh Karyawan
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Pantau seluruh rekaman presensi WFH yang disubmit oleh karyawan secara transparan.
        </p>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80">
        <form onSubmit={handleFilterSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Cari Karyawan / Posisi
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Nama atau jabatan..."
                  className="block w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* From Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Dari Tanggal
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>

            {/* To Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Sampai Tanggal
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 inline mr-1" />
              Reset
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5 inline mr-1" />
              Terapkan Filter
            </button>
          </div>
        </form>
      </div>

      {/* MONITORING TABLE */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ClipboardCheck className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-800">
              Rekap Seluruh Presensi ({attendances.length} Record)
            </h2>
          </div>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-slate-400">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm">Memuat data monitoring absensi...</p>
          </div>
        ) : attendances.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <Calendar className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-medium text-slate-600">Tidak ada rekaman absensi ditemukan</p>
            <p className="text-xs text-slate-400">Silakan sesuaikan parameter pencarian atau tanggal.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200">
                <tr>
                  <th scope="col" className="px-6 py-4">
                    Karyawan
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Tanggal
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Jam Masuk
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Jam Pulang
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendances.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Karyawan info */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        {item.employee?.avatarUrl ? (
                          <img
                            src={item.employee.avatarUrl}
                            alt={item.employee.name}
                            className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                            {item.employee?.name?.charAt(0) || 'K'}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900 text-xs leading-tight">
                            {item.employee?.name || 'Karyawan'}
                          </p>
                          <p className="text-2xs text-slate-400 font-medium">
                            {item.employee?.position || '-'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Tanggal */}
                    <td className="px-6 py-4 font-mono font-bold text-slate-800 text-xs whitespace-nowrap">
                      {item.date}
                    </td>

                    {/* Masuk */}
                    <td className="px-6 py-4 font-mono text-xs whitespace-nowrap">
                      {item.inTime ? (
                        <span className="font-bold text-emerald-700">
                          {formatTimeOnly(item.inTime)}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* Pulang */}
                    <td className="px-6 py-4 font-mono text-xs whitespace-nowrap">
                      {item.outTime ? (
                        <span className="font-bold text-rose-700">
                          {formatTimeOnly(item.outTime)}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-bold ${
                          item.outTime
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : item.inTime
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {item.outTime ? 'Selesai Pulang' : item.inTime ? 'Masuk (Aktif)' : 'Belum'}
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
