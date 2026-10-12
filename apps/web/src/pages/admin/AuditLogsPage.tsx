import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  Clock,
  Database,
  Terminal,
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">
            System Audit Trail
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Decoupled event stream persisted into the isolated audit database.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={isLoading}
          className="inline-flex items-center px-3 py-1.5 border border-zinc-200 rounded-lg text-xs font-medium text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Info Bar */}
      <div className="bg-zinc-900 text-zinc-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2.5">
          <Terminal className="w-4 h-4 text-zinc-400 shrink-0" />
          <span className="font-mono text-3xs text-zinc-300">
            Transport: Message Queue / TCP Event Stream &bull; Destination: Dedicated Audit Database
          </span>
        </div>
        <span className="inline-flex items-center text-3xs font-mono font-medium px-2 py-0.5 rounded bg-zinc-800 text-emerald-400 border border-zinc-700">
          Consumer Active
        </span>
      </div>

      {/* Table */}
      <div className="bg-white border border-zinc-200/80 rounded-xl shadow-xs overflow-hidden">
        <div className="px-5 py-3 border-b border-zinc-100 flex items-center justify-between text-xs">
          <span className="font-semibold text-zinc-900">
            Captured Events ({logs.length})
          </span>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-zinc-400">
            Fetching audit records from microservice...
          </div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center text-xs text-zinc-400">
            No audit records captured yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50/80 text-xs font-medium text-zinc-600 border-b border-zinc-200">
                <tr>
                  <th className="px-5 py-2.5">Timestamp</th>
                  <th className="px-5 py-2.5">Event type</th>
                  <th className="px-5 py-2.5">Initiator</th>
                  <th className="px-5 py-2.5">Stream payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-zinc-50/60 transition-colors">
                    <td className="px-5 py-3 font-mono text-3xs text-zinc-500 whitespace-nowrap">
                      {formatDate(log.timestamp)}
                    </td>

                    <td className="px-5 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-3xs font-mono font-medium bg-zinc-100 text-zinc-800 border border-zinc-200">
                        {log.action}
                      </span>
                    </td>

                    <td className="px-5 py-3 font-mono text-3xs text-zinc-700 whitespace-nowrap">
                      {log.performedBy}
                    </td>

                    <td className="px-5 py-3">
                      <pre className="font-mono text-3xs bg-zinc-50 border border-zinc-200 p-2 rounded-lg text-zinc-800 max-w-md overflow-x-auto">
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
