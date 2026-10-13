export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  avatarUrl?: string | null;
  role: 'EMPLOYEE' | 'HRD_ADMIN';
  createdAt?: string;
  updatedAt?: string;
}

export interface Attendance {
  id: string;
  date: string;
  inTime: string | null;
  outTime: string | null;
  status: 'IN' | 'OUT';
  employee?: {
    id: string;
    name: string;
    email: string;
    position: string;
    avatarUrl?: string | null;
  };
}

export interface AuditLog {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  changes: Record<string, any>;
  performedBy: string;
  timestamp: string;
}

export interface AppNotification {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  changedFields: string[];
  timestamp: string;
  read: boolean;
  details?: any;
}

export type ProfileUpdateAlert = AppNotification;

