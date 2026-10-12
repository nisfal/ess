import React, { useEffect, useState } from 'react';
import { Bell, X, Check, ArrowRight } from 'lucide-react';
import { getSocket, joinAdminRoom } from '../services/socket';
import { useAuth } from '../context/AuthContext';
import { ProfileUpdateAlert } from '../types';

interface NotificationModalProps {
  onViewEmployee?: (employeeId: string) => void;
  openDrawerSignal?: boolean;
  onCloseDrawer?: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  onViewEmployee,
}) => {
  const { user } = useAuth();
  const [toasts, setToasts] = useState<ProfileUpdateAlert[]>([]);
  const [history, setHistory] = useState<ProfileUpdateAlert[]>([]);

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

      setToasts((prev) => [alert, ...prev.slice(0, 2)]);
      setHistory((prev) => [alert, ...prev]);

      // Auto dismiss toast after 6s
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== alert.id));
      }, 6000);
    };

    socket.on('admin:profile_updated', handleProfileUpdated);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('admin:profile_updated', handleProfileUpdated);
    };
  }, [user]);

  if (user?.role !== 'HRD_ADMIN') return null;

  return (
    <>
      {/* Sleek Top-Right Toaster (Linear / Vercel style) */}
      <div className="fixed top-4 right-4 z-50 flex flex-col space-y-2 pointer-events-none max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto bg-white border border-zinc-200/90 shadow-md rounded-xl p-4 flex items-start space-x-3 transition-all animate-in slide-in-from-top-2 duration-200"
          >
            <div className="h-8 w-8 rounded-lg bg-zinc-100 border border-zinc-200/60 flex items-center justify-center shrink-0 text-zinc-700">
              <Bell className="w-4 h-4" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-zinc-900 truncate">
                  Profile Updated: {toast.employeeName}
                </p>
                <button
                  onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                  className="text-zinc-400 hover:text-zinc-600 p-0.5 rounded cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-3xs text-zinc-500 font-mono mt-0.5 truncate">
                {toast.employeeEmail}
              </p>

              <div className="flex flex-wrap gap-1 mt-2">
                {toast.changedFields.map((f, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-1.5 py-0.5 rounded text-3xs font-medium bg-zinc-100 text-zinc-700 border border-zinc-200"
                  >
                    {f}
                  </span>
                ))}
              </div>

              {onViewEmployee && (
                <button
                  onClick={() => {
                    setToasts((prev) => prev.filter((t) => t.id !== toast.id));
                    onViewEmployee(toast.employeeId);
                  }}
                  className="inline-flex items-center text-3xs font-semibold text-zinc-900 hover:text-zinc-700 mt-2 cursor-pointer"
                >
                  <span>View in Employees</span>
                  <ArrowRight className="w-3 h-3 ml-1" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
