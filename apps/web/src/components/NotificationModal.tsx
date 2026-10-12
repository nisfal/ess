import React, { useEffect, useState } from 'react';
import { Bell, X, CheckCircle, AlertTriangle, Clock, User, Phone, Image, Key } from 'lucide-react';
import { getSocket, joinAdminRoom } from '../services/socket';
import { useAuth } from '../context/AuthContext';
import { ProfileUpdateAlert } from '../types';

interface NotificationModalProps {
  onViewEmployee?: (employeeId: string) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({ onViewEmployee }) => {
  const { user } = useAuth();
  const [activeAlert, setActiveAlert] = useState<ProfileUpdateAlert | null>(null);
  const [history, setHistory] = useState<ProfileUpdateAlert[]>([]);
  const [isOpenDrawer, setIsOpenDrawer] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    if (user?.role !== 'HRD_ADMIN') return;

    const socket = getSocket();

    const handleConnect = () => {
      joinAdminRoom();
    };

    socket.on('connect', handleConnect);
    if (socket.connected) {
      joinAdminRoom();
    }

    const handleProfileUpdated = (data: any) => {
      const alert: ProfileUpdateAlert = {
        id: Math.random().toString(36).substring(7),
        employeeId: data.employeeId,
        employeeName: data.employeeName,
        employeeEmail: data.employeeEmail,
        changedFields: data.changedFields || [],
        timestamp: data.timestamp || new Date().toISOString(),
        details: data.details,
      };

      // Set current modal popup
      setActiveAlert(alert);
      setHistory((prev) => [alert, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // Play subtle chime sound effect via Audio API
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
      } catch (e) {
        // AudioContext might be blocked until user gesture, ignore safely
      }
    };

    socket.on('admin:profile_updated', handleProfileUpdated);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('admin:profile_updated', handleProfileUpdated);
    };
  }, [user]);

  if (user?.role !== 'HRD_ADMIN') return null;

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) +
        ', ' +
        d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return iso;
    }
  };

  const getFieldIcon = (field: string) => {
    if (field.toLowerCase().includes('handphone') || field.toLowerCase().includes('phone')) {
      return <Phone className="w-3.5 h-3.5 text-blue-500 mr-1" />;
    }
    if (field.toLowerCase().includes('foto') || field.toLowerCase().includes('avatar')) {
      return <Image className="w-3.5 h-3.5 text-purple-500 mr-1" />;
    }
    if (field.toLowerCase().includes('password')) {
      return <Key className="w-3.5 h-3.5 text-amber-500 mr-1" />;
    }
    return <User className="w-3.5 h-3.5 text-slate-500 mr-1" />;
  };

  return (
    <>
      {/* Realtime Floating Notification Bell for Admin Header/Bottom */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => {
            setIsOpenDrawer(true);
            setUnreadCount(0);
          }}
          className="relative p-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-xl hover:shadow-indigo-500/25 transition-all duration-300 flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-indigo-300"
          title="Notifikasi Real-time HRD"
        >
          <Bell className="w-6 h-6 animate-pulse-subtle" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-xs font-bold text-white shadow-md animate-bounce">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* POPUP MODAL ALERT WHEN A NEW UPDATE OCCURS */}
      {activeAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-indigo-100 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 px-6 py-5 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
                  <Bell className="w-6 h-6 text-yellow-300 animate-wiggle" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Alert Update Profil Karyawan</h3>
                  <p className="text-xs text-indigo-100">Pemberitahuan Realtime (Socket.io)</p>
                </div>
              </div>
              <button
                onClick={() => setActiveAlert(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="flex items-start space-x-3 p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-xl">
                <div className="p-2 bg-indigo-600 text-white rounded-lg mt-0.5">
                  <User className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <span className="text-xs font-medium text-indigo-600 uppercase tracking-wider">Identitas Karyawan</span>
                  <p className="text-base font-bold text-slate-800">{activeAlert.employeeName}</p>
                  <p className="text-xs text-slate-500 font-mono">{activeAlert.employeeEmail}</p>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-2">
                  Atribut yang Diperbarui:
                </label>
                <div className="flex flex-wrap gap-2">
                  {activeAlert.changedFields.map((field, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs"
                    >
                      {getFieldIcon(field)}
                      {field}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                <div className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Waktu: {formatDate(activeAlert.timestamp)}</span>
                </div>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-2xs font-medium bg-blue-50 text-blue-700">
                  <CheckCircle className="w-3 h-3 mr-1 text-blue-500" />
                  Logged via MQ
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-3">
              <button
                onClick={() => setActiveAlert(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
              >
                Tutup Alert
              </button>
              {onViewEmployee && (
                <button
                  onClick={() => {
                    const empId = activeAlert.employeeId;
                    setActiveAlert(null);
                    onViewEmployee(empId);
                  }}
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Lihat Karyawan
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DRAWER FOR NOTIFICATION HISTORY */}
      {isOpenDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-2xs transition-opacity"
            onClick={() => setIsOpenDrawer(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
              {/* Drawer Header */}
              <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bell className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-bold text-base">Riwayat Alert Realtime</h3>
                </div>
                <button
                  onClick={() => setIsOpenDrawer(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {history.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <Bell className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">Belum ada alert baru dari karyawan.</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Alert akan otomatis muncul ketika karyawan memperbarui profil.
                    </p>
                  </div>
                ) : (
                  history.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-all space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-bold text-slate-800">{item.employeeName}</p>
                          <p className="text-2xs text-slate-500 font-mono">{item.employeeEmail}</p>
                        </div>
                        <span className="text-2xs text-slate-400">{formatDate(item.timestamp)}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {item.changedFields.map((field, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2 py-0.5 rounded text-2xs font-semibold bg-emerald-100 text-emerald-800"
                          >
                            {field}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
