import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  CheckCheck,
  Trash2,
  Check,
  User,
  ArrowRight,
  Clock,
  Sparkles,
  Phone,
  Image,
  KeyRound,
  FileText,
  X,
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { AppNotification } from '../types';

export const NotificationDropdown: React.FC = () => {
  const {
    notifications,
    unreadCount,
    isOpen,
    setIsOpen,
    toggleOpen,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    onNavigateToEmployee,
  } = useNotifications();

  const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, setIsOpen]);

  const filteredNotifications = notifications.filter((item) => {
    if (activeFilter === 'unread') return !item.read;
    return true;
  });

  const formatRelativeTime = (isoString: string): string => {
    try {
      const now = new Date();
      const date = new Date(isoString);
      const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffSec < 60) return 'Baru saja';
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin} mnt lalu`;
      const diffHour = Math.floor(diffMin / 60);
      if (diffHour < 24) return `${diffHour} jam lalu`;
      const diffDay = Math.floor(diffHour / 24);
      if (diffDay === 1) {
        return `Kemarin, ${date.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
        })}`;
      }
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const getFieldIcon = (field: string) => {
    const lower = field.toLowerCase();
    if (lower.includes('phone') || lower.includes('handphone') || lower.includes('hp')) {
      return <Phone className="w-2.5 h-2.5 mr-1" />;
    }
    if (lower.includes('avatar') || lower.includes('foto') || lower.includes('profile')) {
      return <Image className="w-2.5 h-2.5 mr-1" />;
    }
    if (lower.includes('password') || lower.includes('kata sandi')) {
      return <KeyRound className="w-2.5 h-2.5 mr-1" />;
    }
    return <FileText className="w-2.5 h-2.5 mr-1" />;
  };

  const handleItemClick = (item: AppNotification) => {
    if (!item.read) {
      markAsRead(item.id);
    }
  };

  const handleViewEmployee = (item: AppNotification) => {
    markAsRead(item.id);
    setIsOpen(false);
    if (onNavigateToEmployee) {
      onNavigateToEmployee(item.employeeId);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Header Bell Button */}
      <button
        onClick={toggleOpen}
        aria-label="Notifikasi Realtime"
        className={`relative p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
          isOpen
            ? 'bg-zinc-900 text-white shadow-xs'
            : unreadCount > 0
            ? 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200'
            : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
        }`}
        title="Riwayat Notifikasi"
      >
        <Bell className="w-4 h-4" />

        {/* Unread Badge Counter */}
        {unreadCount > 0 && (
          <>
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-600 text-white text-[10px] font-bold shadow-xs">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
            <span className="absolute -top-1 -right-1 flex h-4 w-4 rounded-full bg-rose-500 opacity-75 animate-ping" />
          </>
        )}
      </button>

      {/* Dropdown Menu Popover */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-84 sm:w-96 md:w-[420px] bg-white rounded-2xl shadow-2xl border border-zinc-200/90 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="px-4 py-3.5 bg-zinc-50/80 border-b border-zinc-200/80 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-zinc-900 text-sm">
                Notifikasi
              </span>
              {unreadCount > 0 ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-3xs font-semibold bg-rose-100 text-rose-700 border border-rose-200">
                  {unreadCount} Baru
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-3xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
                  Semua Dibaca
                </span>
              )}
            </div>

            <div className="flex items-center space-x-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="inline-flex items-center px-2 py-1 rounded-lg text-3xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60 transition-colors cursor-pointer"
                  title="Tandai semua sudah dibaca"
                >
                  <CheckCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  <span>Tandai Semua</span>
                </button>
              )}

              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="p-1 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Hapus riwayat notifikasi"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 transition-colors cursor-pointer ml-1"
                aria-label="Tutup notifikasi"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center px-4 pt-2 pb-1 border-b border-zinc-100 bg-white text-xs gap-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-zinc-900 text-white'
                  : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              Semua ({notifications.length})
            </button>
            <button
              onClick={() => setActiveFilter('unread')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center space-x-1.5 ${
                activeFilter === 'unread'
                  ? 'bg-zinc-900 text-white'
                  : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              <span>Belum Dibaca</span>
              {unreadCount > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-3xs font-bold ${
                    activeFilter === 'unread'
                      ? 'bg-rose-500 text-white'
                      : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Notification List Scroll Area */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-zinc-100 bg-white">
            {filteredNotifications.length === 0 ? (
              <div className="py-12 px-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-400 flex items-center justify-center mx-auto mb-3">
                  <Bell className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-zinc-900">
                  {activeFilter === 'unread'
                    ? 'Tidak ada notifikasi yang belum dibaca'
                    : 'Belum ada riwayat notifikasi'}
                </p>
                <p className="text-3xs text-zinc-500 mt-1 max-w-[260px] mx-auto">
                  {activeFilter === 'unread'
                    ? 'Semua pembaruan data karyawan telah Anda tinjau.'
                    : 'Aktivitas realtime pembaruan profil atau data absensi karyawan akan tercatat di sini.'}
                </p>
              </div>
            ) : (
              filteredNotifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`p-3.5 transition-colors relative cursor-pointer group ${
                    !item.read
                      ? 'bg-blue-50/30 hover:bg-blue-50/60 border-l-4 border-l-blue-600'
                      : 'hover:bg-zinc-50 border-l-4 border-l-transparent opacity-90'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Left Icon / Avatar */}
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                        !item.read
                          ? 'bg-blue-100/70 border-blue-200 text-blue-700'
                          : 'bg-zinc-100 border-zinc-200/80 text-zinc-600'
                      }`}
                    >
                      <User className="w-4 h-4" />
                    </div>

                    {/* Middle: Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center space-x-1.5 min-w-0">
                          <p
                            className={`text-xs truncate ${
                              !item.read
                                ? 'font-bold text-zinc-900'
                                : 'font-medium text-zinc-800'
                            }`}
                          >
                            {item.employeeName}
                          </p>
                          {!item.read && (
                            <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                          )}
                        </div>

                        <div className="flex items-center space-x-1 text-3xs text-zinc-400 font-medium shrink-0">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{formatRelativeTime(item.timestamp)}</span>
                        </div>
                      </div>

                      <p className="text-3xs text-zinc-500 font-mono mt-0.5 truncate">
                        {item.employeeEmail}
                      </p>

                      <div className="mt-1.5">
                        <span className="text-3xs text-zinc-500 mr-1.5">
                          Memperbarui:
                        </span>
                        <div className="inline-flex flex-wrap gap-1 align-middle">
                          {item.changedFields.map((field, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-1.5 py-0.5 rounded text-3xs font-medium bg-zinc-100 text-zinc-800 border border-zinc-200"
                            >
                              {getFieldIcon(field)}
                              {field}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-2.5 flex items-center justify-between pt-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewEmployee(item);
                          }}
                          className="inline-flex items-center text-3xs font-semibold text-blue-700 hover:text-blue-900 cursor-pointer"
                        >
                          <span>Buka Data Karyawan</span>
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </button>

                        <div className="flex items-center space-x-1">
                          {!item.read && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(item.id);
                              }}
                              className="p-1 rounded text-zinc-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                              title="Tandai sudah dibaca"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNotification(item.id);
                            }}
                            className="p-1 rounded text-zinc-300 hover:text-rose-600 hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100"
                            title="Hapus"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Bar */}
          <div className="px-4 py-2.5 bg-zinc-50 border-t border-zinc-200/80 flex items-center justify-between text-3xs text-zinc-500">
            <div className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Realtime WebSocket Aktif</span>
            </div>
            <span>Tersimpan di sistem monitoring</span>
          </div>
        </div>
      )}
    </div>
  );
};
