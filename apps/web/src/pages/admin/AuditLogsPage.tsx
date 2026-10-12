import React, { useState, useEffect } from 'react';
import {
  Database,
  RefreshCw,
  Clock,
  Layers,
  ArrowRight,
  ShieldCheck,
  Cpu,
} from 'lucide-react';
import { api } from '../../services/api';
import { AuditLog } from '../../types';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/admin/audit-logs');
      setLogs(response.data.logs || []);
    } catch (err) {
      console.error('Failed to fetch audit logs', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }) + ', ' + d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return iso;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Title & Architecture Explainer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
            <Cpu className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            <span>Microservice Consumer & Dedicated Audit DB</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Audit Stream & Logging Activity
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Log aktivitas yang dialirkan via Message Queue (RabbitMQ / Event Stream) ke Database Audit Terpisah.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={isLoading}
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Log</span>
        </button>
      </div>

      {/* ARCHITECTURE SUMMARY CARD */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-indigo-900/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-2xs font-bold uppercase tracking-wider text-indigo-400">
              Pemisahan Database (Requirement 1.a.2)
            </span>
            <h3 className="text-base font-bold">Asynchronous Decoupled Event Logging</h3>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Ketika karyawan mengubah profil, API Gateway mempublikasikan event ke <b>Message Queue</b> secara non-blocking. Microservice terpisah kemudian mengonsumsi event dan menyimpannya ke <b>Database Audit Terpisah</b> (bukan tabel utama).
            </p>
          </div>
          <div className="shrink-0 flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-2xl backdrop-blur-md">
            <Database className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold font-mono">Separate DB: OK</span>
          </div>
        </div>
      </div>

      {/* LOGS TABLE */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-800">
              Riwayat Log Konsumsi Microservice ({logs.length} Event)
            </h2>
          </div>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-slate-400">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm">Memuat log dari database audit...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <Database className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-medium text-slate-600">Belum ada log audit</p>
            <p className="text-xs text-slate-400">
              Ubah data pada profil karyawan untuk melihat event baru yang dialirkan ke sini.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200">
                <tr>
                  <th scope="col" className="px-6 py-4">
                    Waktu Event
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Aksi / Tipe
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Inisiator
                  </th>
                  <th scope="col" className="px-6 py-4">
                    Detail Perubahan (Payload Stream)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Timestamp */}
                    <td className="px-6 py-4 font-mono text-xs whitespace-nowrap text-slate-500">
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatDate(log.timestamp)}</span>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {log.action}
                      </span>
                    </td>

                    {/* Inisiator */}
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-xs font-semibold text-slate-800">
                      {log.performedBy}
                    </td>

                    {/* Detail Changes */}
                    <td className="px-6 py-4">
                      <pre className="text-2xs font-mono bg-slate-900 text-indigo-300 p-2.5 rounded-xl max-w-lg overflow-x-auto shadow-inner">
                        {JSON.stringify(log.changes, null, 2)}
                      </pre>
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
