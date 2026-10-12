import React, { useEffect, useState } from 'react';
import { LogOut, Building2, Menu, X } from 'lucide-react';
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
    <header className="sticky top-0 z-30 bg-white border-b border-zinc-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Left: Brand & Mobile Toggle */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onToggleMobileMenu}
              className="md:hidden p-1.5 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center space-x-2.5">
              <div className="h-7 w-7 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold text-xs">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="font-semibold text-zinc-900 text-sm tracking-tight">
                  ESS Portal
                </span>
                <span className="hidden sm:inline text-3xs text-zinc-400 font-mono uppercase tracking-wider">
                  v1.0
                </span>
              </div>
            </div>
          </div>

          {/* Right: Live Connection & User */}
          <div className="flex items-center space-x-3">
            {/* Minimal Live Status indicator */}
            <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-3xs font-mono text-zinc-600 bg-zinc-50 border border-zinc-200">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isConnected ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
              <span>{isConnected ? 'Realtime Connected' : 'Connecting'}</span>
            </div>

            {/* Role indicator */}
            <span className="hidden sm:inline-flex text-3xs font-semibold px-2 py-0.5 rounded border border-zinc-200 bg-zinc-50 text-zinc-700 uppercase tracking-wider">
              {user?.role === 'HRD_ADMIN' ? 'HRD Admin' : 'Employee'}
            </span>

            {/* User profile dropdown / logout */}
            <div className="flex items-center space-x-2 pl-2 border-l border-zinc-200">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-7 h-7 rounded-full object-cover border border-zinc-200"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-700 flex items-center justify-center font-medium text-xs">
                  {user?.name?.charAt(0) || 'U'}
                </div>
              )}
              <div className="hidden lg:block text-left text-xs">
                <p className="font-medium text-zinc-900 leading-none truncate max-w-[120px]">
                  {user?.name}
                </p>
              </div>

              <button
                onClick={logout}
                className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
