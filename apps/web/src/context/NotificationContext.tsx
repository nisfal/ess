import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AppNotification } from '../types';
import { useAuth } from './AuthContext';
import { getSocket, joinAdminRoom } from '../services/socket';
import { api } from '../services/api';

const STORAGE_KEY = 'ess_admin_notifications_history';

interface NotificationContextType {
  notifications: AppNotification[];
  toasts: AppNotification[];
  unreadCount: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  toggleOpen: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  dismissToast: (id: string) => void;
  onNavigateToEmployee?: (employeeId?: string) => void;
  setOnNavigateToEmployee: (cb: (employeeId?: string) => void) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse notifications from localStorage', e);
    }
    return [];
  });

  const [toasts, setToasts] = useState<AppNotification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [onNavigateCallback, setOnNavigateCallback] = useState<((employeeId?: string) => void) | undefined>(undefined);

  // Sync notifications to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch (e) {
      console.error('Failed to save notifications to localStorage', e);
    }
  }, [notifications]);

  // Initial hydration from audit-logs if history is empty
  useEffect(() => {
    if (user?.role !== 'HRD_ADMIN') return;

    if (notifications.length === 0) {
      api.get('/admin/audit-logs')
        .then((res) => {
          const logs = res.data?.logs || [];
          if (logs.length > 0) {
            const mapped: AppNotification[] = logs
              .filter((log: any) => log.action === 'UPDATE_PROFILE' || log.entityType === 'EMPLOYEE_PROFILE')
              .map((log: any) => ({
                id: log.id || Math.random().toString(36).substring(7),
                employeeId: log.entityId,
                employeeName: log.changes?.new?.name || log.performedBy || 'Karyawan',
                employeeEmail: log.performedBy || '',
                changedFields: log.changes?.changedFields || ['Profil'],
                timestamp: log.timestamp || new Date().toISOString(),
                read: true, // Past logs defaulted to read
                details: log.changes,
              }));

            if (mapped.length > 0) {
              setNotifications((prev) => (prev.length === 0 ? mapped : prev));
            }
          }
        })
        .catch((err) => {
          console.warn('Could not hydrate notifications from audit logs:', err.message);
        });
    }
  }, [user]);

  // Real-time socket listener
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
      const newAlert: AppNotification = {
        id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        employeeId: data.employeeId,
        employeeName: data.employeeName,
        employeeEmail: data.employeeEmail,
        changedFields: data.changedFields || [],
        timestamp: data.timestamp ? new Date(data.timestamp).toISOString() : new Date().toISOString(),
        read: false, // Unread by default
        details: data.details,
      };

      // Add to notifications history (persisted)
      setNotifications((prev) => [newAlert, ...prev]);

      // Add to floating toasts (temporary visual notification)
      setToasts((prev) => [newAlert, ...prev.slice(0, 2)]);

      // Auto dismiss floating toast after 7 seconds, BUT KEEP in notification history!
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newAlert.id));
      }, 7000);
    };

    socket.on('admin:profile_updated', handleProfileUpdated);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('admin:profile_updated', handleProfileUpdated);
    };
  }, [user]);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setToasts([]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const setOnNavigateToEmployee = useCallback((cb: (employeeId?: string) => void) => {
    setOnNavigateCallback(() => cb);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        toasts,
        unreadCount,
        isOpen,
        setIsOpen,
        toggleOpen,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll,
        dismissToast,
        onNavigateToEmployee: onNavigateCallback,
        setOnNavigateToEmployee,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
