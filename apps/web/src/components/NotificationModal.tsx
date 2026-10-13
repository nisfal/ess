import React from 'react';
import { Bell, X, ArrowRight, UserCheck } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

interface NotificationModalProps {
  onViewEmployee?: (employeeId: string) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  onViewEmployee,
}) => {
  const { user } = useAuth();
  const { toasts, dismissToast, markAsRead, setIsOpen, onNavigateToEmployee } =
    useNotifications();

  if (user?.role !== 'HRD_ADMIN') return null;

  const handleView = (toastId: string, employeeId: string) => {
    markAsRead(toastId);
    dismissToast(toastId);
    if (onViewEmployee) {
      onViewEmployee(employeeId);
    } else if (onNavigateToEmployee) {
      onNavigateToEmployee(employeeId);
    }
  };

  return (
    <>
      {/* Sleek Floating Toasts Container (Top-Right) */}
      <div className="fixed top-16 right-4 z-50 flex flex-col space-y-2.5 pointer-events-none max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto bg-white border border-zinc-200/90 shadow-xl rounded-2xl p-4 flex items-start space-x-3.5 transition-all animate-in slide-in-from-top-3 fade-in duration-200 hover:shadow-2xl"
          >
            <div className="h-9 w-9 rounded-xl bg-blue-50 border border-blue-200/70 flex items-center justify-center shrink-0 text-blue-700 shadow-xs">
              <Bell className="w-4 h-4 animate-bounce" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-3xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                  Realtime Alert
                </span>
                <button
                  onClick={() => dismissToast(toast.id)}
                  className="text-zinc-400 hover:text-zinc-600 p-0.5 rounded-lg hover:bg-zinc-100 transition-colors cursor-pointer"
                  title="Tutup banner (tetap tersimpan di menu notifikasi)"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-xs font-bold text-zinc-900 mt-1 truncate">
                {toast.employeeName}
              </p>
              <p className="text-3xs text-zinc-500 font-mono truncate">
                {toast.employeeEmail}
              </p>

              <div className="flex flex-wrap gap-1 mt-2">
                {toast.changedFields.map((f, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center px-1.5 py-0.5 rounded text-3xs font-medium bg-zinc-100 text-zinc-800 border border-zinc-200"
                  >
                    {f}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between mt-3 pt-1 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => handleView(toast.id, toast.employeeId)}
                  className="inline-flex items-center text-3xs font-semibold text-blue-700 hover:text-blue-900 cursor-pointer"
                >
                  <span>Buka Data Karyawan</span>
                  <ArrowRight className="w-3 h-3 ml-1" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    dismissToast(toast.id);
                    setIsOpen(true);
                  }}
                  className="text-3xs text-zinc-400 hover:text-zinc-700 cursor-pointer"
                >
                  Lihat Riwayat
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
