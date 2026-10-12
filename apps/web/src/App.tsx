import React, { useState } from 'react';
import {
  User as UserIcon,
  Clock,
  FileSpreadsheet,
  Users,
  ClipboardCheck,
  Database,
  X,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { NotificationModal } from './components/NotificationModal';
import { Login } from './pages/Login';

// Employee Pages
import { ProfilePage } from './pages/employee/ProfilePage';
import { AttendancePage } from './pages/employee/AttendancePage';
import { SummaryPage } from './pages/employee/SummaryPage';

// Admin Pages
import { EmployeesPage } from './pages/admin/EmployeesPage';
import { AttendanceMonitoringPage } from './pages/admin/AttendanceMonitoringPage';
import { AuditLogsPage } from './pages/admin/AuditLogsPage';

export const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  React.useEffect(() => {
    if (user) {
      if (user.role === 'HRD_ADMIN') {
        setActiveTab((prev) => (prev ? prev : 'employees'));
      } else {
        setActiveTab((prev) => (prev ? prev : 'profile'));
      }
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 text-zinc-500 text-xs">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const isEmployee = user.role === 'EMPLOYEE';

  const employeeNavItems = [
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'summary', label: 'Summary', icon: FileSpreadsheet },
  ];

  const adminNavItems = [
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'attendance_monitor', label: 'Monitoring', icon: ClipboardCheck },
    { id: 'audit_logs', label: 'Audit Trail', icon: Database },
  ];

  const currentNavItems = isEmployee ? employeeNavItems : adminNavItems;

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
      {/* Realtime Alert Modal for Admin HRD */}
      <NotificationModal
        onViewEmployee={(empId) => {
          setActiveTab('employees');
        }}
      />

      {/* Top Navbar */}
      <Navbar
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      {/* Main Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row gap-8">
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden md:block w-52 shrink-0">
          <nav className="sticky top-20 space-y-1">
            <div className="px-3 pb-2 text-xs font-medium text-zinc-500">
              {isEmployee ? 'Self Service' : 'Administration'}
            </div>

            {currentNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-zinc-900 text-white shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* MOBILE DRAWER */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-zinc-900/40 backdrop-blur-2xs flex">
            <div className="w-64 bg-white h-full p-5 shadow-xl flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                  <span className="font-semibold text-zinc-900 text-sm">Navigation</span>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1">
                  {currentNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          isActive
                            ? 'bg-zinc-900 text-white'
                            : 'text-zinc-600 hover:bg-zinc-100'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-100 text-3xs text-zinc-400 font-mono truncate">
                {user.email}
              </div>
            </div>
            <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
          </div>
        )}

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 min-w-0 pb-16 md:pb-0">
          {isEmployee && (
            <>
              {activeTab === 'profile' && <ProfilePage />}
              {activeTab === 'attendance' && <AttendancePage />}
              {activeTab === 'summary' && <SummaryPage />}
            </>
          )}

          {!isEmployee && (
            <>
              {activeTab === 'employees' && <EmployeesPage />}
              {activeTab === 'attendance_monitor' && <AttendanceMonitoringPage />}
              {activeTab === 'audit_logs' && <AuditLogsPage />}
            </>
          )}
        </main>
      </div>

      {/* Watermark Footer */}
      <footer className="mt-auto border-t border-zinc-200/80 bg-white py-3 px-4 text-center text-xs text-zinc-500 flex flex-wrap items-center justify-center gap-3">
        <span>ESS Portal</span>
        <span className="font-medium text-zinc-800 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
          Created by Nisfal Filsa
        </span>
        <span className="text-zinc-400">Fullstack Developer Skill Test</span>
      </footer>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-zinc-200 px-2 py-1.5 flex justify-around">
        {currentNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center py-1 px-3 rounded-lg transition-colors ${
                isActive ? 'text-zinc-900 font-semibold' : 'text-zinc-400'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-3xs mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default function App() {
  return <AppContent />;
}
