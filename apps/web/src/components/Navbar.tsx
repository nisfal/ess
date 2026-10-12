import React, { useEffect, useState } from 'react';
import { LogOut, Shield, User as UserIcon, Radio, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../services/socket';

interface NavbarProps {
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileMenu, isMobileMenuOpen }) => {
  const { user, logout } = useAuth();
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    const socket = getSocket();
    setIsConnected(socket.connected);

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Brand & Mobile Menu Button */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onToggleMobileMenu}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div className="flex items-center space-x-2.5">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <span className="font-extrabold text-lg tracking-wider">ESS</span>
              </div>
              <div>
                <span className="font-bold text-slate-900 text-lg leading-tight block">
                  Attendance & Monitor
                </span>
                <span className="text-2xs text-slate-500 font-medium">Enterprise WFH Platform</span>
              </div>
            </div>
          </div>

          {/* Right Status & User Info */}
          <div className="flex items-center space-x-4">
            {/* Live Socket Status indicator */}
            <div
              className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                isConnected
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'
                }`}
              />
              <Radio className="w-3.5 h-3.5" />
              <span>{isConnected ? 'Realtime Live' : 'Connecting'}</span>
            </div>

            {/* Role Badge */}
            <span
              className={`hidden md:inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                user?.role === 'HRD_ADMIN'
                  ? 'bg-purple-100 text-purple-800 border border-purple-200'
                  : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
              }`}
            >
              {user?.role === 'HRD_ADMIN' ? (
                <>
                  <Shield className="w-3.5 h-3.5 mr-1" />
                  Admin HRD
                </>
              ) : (
                <>
                  <UserIcon className="w-3.5 h-3.5 mr-1" />
                  Karyawan WFH
                </>
              )}
            </span>

            {/* User Profile avatar & dropdown/action */}
            <div className="flex items-center space-x-3 pl-2 border-l border-slate-200">
              <div className="flex items-center space-x-2.5">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/20"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                )}
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-bold text-slate-800 leading-none">{user?.name}</p>
                  <p className="text-2xs text-slate-500 truncate max-w-[130px]">{user?.position}</p>
                </div>
              </div>

              <button
                onClick={logout}
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                title="Keluar / Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
