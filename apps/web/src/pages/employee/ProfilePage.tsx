import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Key,
  Camera,
  CheckCircle2,
  AlertCircle,
  Lock,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { AvatarUpload } from '../../components/AvatarUpload';

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
        setErrorMessage('Password must be at least 6 characters.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMessage('Password confirmation does not match.');
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
        message: 'Profile changes saved successfully.',
        changedFields: changedFields || [],
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || 'Failed to update profile.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-900">
          Account Settings
        </h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          Manage your personal details, contact information, and security.
        </p>
      </div>

      {/* Success Banner */}
      {successInfo && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {successInfo.message}{' '}
              <span className="font-semibold text-emerald-900">
                ({successInfo.changedFields.join(', ')})
              </span>
            </span>
          </div>
          <span className="text-3xs font-mono text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
            Broadcasted & Logged
          </span>
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Identity & Contact */}
        <div className="bg-white border border-zinc-200/80 rounded-xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
            <div>
              <p className="text-sm font-semibold text-zinc-900">{user?.name}</p>
              <p className="text-xs text-zinc-500 font-mono mt-0.5">{user?.email}</p>
            </div>
            <span className="inline-block text-3xs font-medium px-2.5 py-1 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
              {user?.position}
            </span>
          </div>

          {/* Upload Foto Profil dengan Batasan Ukuran Maksimal */}
          <div>
            <label className="block text-xs font-semibold text-zinc-800 mb-2">
              Foto Profil
            </label>
            <AvatarUpload
              value={avatarUrl}
              onChange={(newUrl) => setAvatarUrl(newUrl)}
              maxSizeMB={2}
              initialName={user?.name || 'U'}
            />
          </div>

          {/* Form fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                disabled
                value={user?.name || ''}
                className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Corporate Email
              </label>
              <input
                type="text"
                disabled
                value={user?.email || ''}
                className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-500 cursor-not-allowed font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Position / Job Title
              </label>
              <input
                type="text"
                disabled
                value={user?.position || ''}
                className="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="081234567890"
                className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-lg text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Security & Credentials */}
        <div className="bg-white border border-zinc-200/80 rounded-xl p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900">
              Security and password
            </h2>
            <p className="text-3xs text-zinc-500 mt-0.5">
              Leave blank if you do not want to change your password.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-lg text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="w-full px-3 py-2 text-xs bg-white border border-zinc-200 rounded-lg text-zinc-900 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-zinc-900 disabled:opacity-50 cursor-pointer shadow-xs"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
