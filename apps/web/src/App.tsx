import React, { useState } from 'react';
import {
  User as UserIcon,
  Clock,
  FileSpreadsheet,
  Users,
  ClipboardCheck,
  Database,
  Menu,
  X,
  Shield,
  Laptop,
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

  // Set default tab based on user role when loaded
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
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="font-semibold text-slate-300">Memuat Sistem ESS...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const isEmployee = user.role === 'EMPLOYEE';

  const employeeNavItems = [
    { id: 'profile', label: 'Profil Karyawan', icon: UserIcon, desc: 'Identitas, Foto, No HP & Password' },
    { id: 'attendance', label: 'Absen', icon: Clock, desc: 'Absen Masuk & Pulang Harian' },
    { id: 'summary', label: 'Summary Absen', icon: FileSpreadsheet, desc: 'Rekap & Filter Rentang Tanggal' },
  ];

  const adminNavItems = [
    { id: 'employees', label: 'Master Karyawan', icon: Users, desc: 'Tambah & Update Data Karyawan' },
    { id: 'attendance_monitor', label: 'Monitoring Absensi', icon: ClipboardCheck, desc: 'Lihat Seluruh Absensi (Read Only)' },
    { id: 'audit_logs', label: 'Audit Log Stream', icon: Database, desc: 'Data Stream Microservice ke DB Terpisah' },
  ];

  const currentNavItems = isEmployee ? employeeNavItems : adminNavItems;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
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

      {/* Main Body with Sidebar & Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col md:flex-row gap-8">
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden md:block w-64 shrink-0 space-y-6">
          {/* User Quick Card */}
          <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200/80">
            <div className="flex items-center space-x-3">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-12 h-12 rounded-2xl object-cover ring-2 ring-indigo-100 shadow-xs"
                />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                  {user.name.charAt(0)}
                </div>
              )}
              <div className="overflow-hidden">
                <p className="font-bold text-sm text-slate-900 truncate">{user.name}</p>
                <p className="text-2xs text-slate-400 truncate">{user.position}</p>
                <span className="inline-block mt-1 text-3xs font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {user.role === 'HRD_ADMIN' ? 'HRD Admin' : 'Karyawan WFH'}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Menu Links */}
          <nav className="bg-white rounded-3xl p-3 shadow-xs border border-slate-200/80 space-y-1.5">
            <div className="px-3 py-2 text-3xs font-bold text-slate-400 uppercase tracking-wider">
              {isEmployee ? 'Menu Karyawan WFH' : 'Menu Admin HRD'}
            </div>
            {currentNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-2xl text-left text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* MOBILE SLIDE-OUT / DRAWER MENU */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-2xs flex">
            <div className="w-4/5 max-w-xs bg-white h-full p-6 shadow-2xl flex flex-col justify-between animate-in slide-in-from-left">
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center">
                      ESS
                    </div>
                    <span className="font-bold text-slate-900 text-sm">Menu Navigasi</span>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-1.5">
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
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-left text-sm font-bold transition-all ${
                          isActive
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className="w-5 h-5 shrink-0" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 text-2xs text-slate-400">
                Logged in as: <span className="font-bold text-slate-700">{user.email}</span>
              </div>
            </div>
            <div className="flex-1" onClick={() => setIsMobileMenuOpen(false)} />
          </div>
        )}

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 min-w-0">
          {/* Employee Views */}
          {isEmployee && (
            <>
              {activeTab === 'profile' && <ProfilePage />}
              {activeTab === 'attendance' && <AttendancePage />}
              {activeTab === 'summary' && <SummaryPage />}
            </>
          )}

          {/* Admin HRD Views */}
          {!isEmployee && (
            <>
              {activeTab === 'employees' && <EmployeesPage />}
              {activeTab === 'attendance_monitor' && <AttendanceMonitoringPage />}
              {activeTab === 'audit_logs' && <AuditLogsPage />}
            </>
          )}
        </main>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className="md:hidden sticky bottom-0 z-20 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-2 py-2 flex justify-around">
        {currentNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center py-1 px-3 rounded-xl transition-all ${
                isActive ? 'text-indigo-600 font-bold' : 'text-slate-400 font-medium'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-3xs">{item.label}</span>
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
