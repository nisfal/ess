import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, Building2, UserCheck, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || 'Invalid credentials. Please verify your email and password.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSelect = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="h-10 w-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold text-base shadow-xs mb-3">
            <Building2 className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">
            Sign in to ESS Platform
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Enterprise WFH Attendance & Employee Portal
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl border border-zinc-200/80 shadow-xs p-6 sm:p-8">
          {errorMessage && (
            <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                Corporate Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-zinc-700">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 pr-9 text-sm bg-white border border-zinc-200 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-zinc-400 hover:text-zinc-600 focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-zinc-900 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Discreet Demo Switcher */}
          <div className="mt-6 pt-5 border-t border-zinc-100">
            <p className="text-3xs font-semibold uppercase tracking-wider text-zinc-400 mb-2 text-center">
              Evaluation Credentials
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickSelect('budi.santoso@company.com', 'Password123!')}
                className="p-2 border border-zinc-200 rounded-lg hover:border-zinc-300 hover:bg-zinc-50 text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-1.5 text-zinc-700 font-medium">
                  <UserCheck className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="truncate">Budi (Staff)</span>
                </div>
                <div className="text-3xs text-zinc-400 font-mono mt-0.5 truncate">
                  budi.santoso@company.com
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickSelect('admin.hrd@company.com', 'Password123!')}
                className="p-2 border border-zinc-200 rounded-lg hover:border-zinc-300 hover:bg-zinc-50 text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-1.5 text-zinc-700 font-medium">
                  <Shield className="w-3.5 h-3.5 text-zinc-500" />
                  <span className="truncate">Dewi (HRD)</span>
                </div>
                <div className="text-3xs text-zinc-400 font-mono mt-0.5 truncate">
                  admin.hrd@company.com
                </div>
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-3xs text-zinc-400 mt-6">
          Employee Self Service &bull; Internal HR Network
        </p>
      </div>
    </div>
  );
};
