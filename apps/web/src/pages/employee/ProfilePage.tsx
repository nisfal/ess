import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Key,
  Camera,
  Save,
  CheckCircle2,
  AlertCircle,
  Radio,
  Database,
  ArrowRight,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const ProfilePage: React.FC = () => {
  const { user, updateUserContext } = useAuth();
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{
    message: string;
    changedFields: string[];
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Avatar presets for quick photo change demo
  const avatarPresets = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
  ];

  useEffect(() => {
    if (user) {
      setPhone(user.phone || '');
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessInfo(null);

    if (newPassword) {
      if (newPassword.length < 6) {
        setErrorMessage('Password baru minimal 6 karakter.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMessage('Konfirmasi password baru tidak cocok.');
        return;
      }
    }

    setIsLoading(true);

    try {
      const payload: any = {
        phone,
        avatarUrl,
      };

      if (newPassword) {
        payload.password = newPassword;
        if (currentPassword) {
          payload.currentPassword = currentPassword;
        }
      }

      const response = await api.put('/employees/profile', payload);
      const { user: updatedUser, changedFields } = response.data;

      updateUserContext(updatedUser);
      setSuccessInfo({
        message: 'Data profil berhasil disimpan!',
        changedFields: changedFields || [],
      });

      // Clear password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || 'Gagal memperbarui profil. Silakan coba lagi.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Title & Introduction */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Profil Karyawan WFH
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Kelola informasi identitas, kontak, dan keamanan akun Anda.
        </p>
      </div>

      {/* Success Notification Alert */}
      {successInfo && (
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-2 animate-in slide-in-from-top-3">
          <div className="flex items-center space-x-2 font-bold text-base">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{successInfo.message}</span>
          </div>
          <div className="text-xs text-emerald-700 pl-7 space-y-1">
            <p>
              Data yang diperbarui:{' '}
              <span className="font-semibold">{successInfo.changedFields.join(', ')}</span>
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center px-2 py-1 rounded bg-emerald-100 font-semibold text-2xs text-emerald-900">
                <Radio className="w-3 h-3 mr-1 text-emerald-700" />
                Realtime alert dikirim ke Admin HRD (Socket.io)
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded bg-emerald-100 font-semibold text-2xs text-emerald-900">
                <Database className="w-3 h-3 mr-1 text-emerald-700" />
                Log perubahan dialirkan ke Database Audit terpisah (Message Queue)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center space-x-2 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Profile Overview Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 pb-6 border-b border-slate-100">
          <div className="relative group">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={user?.name}
                className="w-24 h-24 sm:w-28 sm:set-28 rounded-2xl object-cover ring-4 ring-indigo-50 shadow-md"
              />
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white font-black text-3xl flex items-center justify-center shadow-md">
                {user?.name?.charAt(0) || 'K'}
              </div>
            )}
            <div className="absolute -bottom-2 -right-2 p-1.5 bg-white rounded-xl shadow-md border border-slate-200 text-indigo-600">
              <Camera className="w-4 h-4" />
            </div>
          </div>

          <div className="text-center sm:text-left space-y-1.5 flex-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{user?.name}</h2>
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
              <Briefcase className="w-3.5 h-3.5 mr-1.5" />
              {user?.position}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 pt-2 text-xs text-slate-500">
              <div className="flex items-center justify-center sm:justify-start space-x-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono">{user?.email}</span>
              </div>
              <div className="flex items-center justify-center sm:justify-start space-x-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{user?.phone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile Form */}
        <form onSubmit={handleSubmit} className="pt-8 space-y-6">
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <span>Ubah Data Profil</span>
            <span className="text-xs font-normal text-slate-400">
              (Foto, Nomor Handphone & Password)
            </span>
          </h3>

          {/* Avatar Selector Presets & URL */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Foto Karyawan (Pilih Avatar Preset atau Masukkan URL)
            </label>
            <div className="grid grid-cols-6 gap-2 max-w-sm">
              {avatarPresets.map((preset, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setAvatarUrl(preset)}
                  className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all cursor-pointer ${
                    avatarUrl === preset
                      ? 'border-indigo-600 ring-2 ring-indigo-400/30 scale-105'
                      : 'border-transparent opacity-75 hover:opacity-100'
                  }`}
                >
                  <img src={preset} alt={`Preset ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <input
              type="text"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://contoh-url-foto.com/avatar.jpg"
              className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>

          {/* Nomor Handphone */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Nomor Handphone (Aktif)
            </label>
            <div className="relative rounded-xl shadow-2xs max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Phone className="h-4 w-4" />
              </div>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="081234567890"
                className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Ganti Password Section */}
          <div className="pt-6 border-t border-slate-100 space-y-4">
            <div>
              <h4 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                <Key className="w-4 h-4 text-indigo-600" />
                <span>Ganti Password Akun (Opsional)</span>
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Kosongkan kolom di bawah ini jika tidak ingin mengubah password akun Anda.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Password Baru
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Konfirmasi Password Baru
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password baru"
                  className="block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-xl shadow-md shadow-indigo-600/20 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  <span>Simpan Perubahan Profil</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
