import React, { useState, useEffect } from 'react';
import {
  Clock,
  LogIn,
  LogOut,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  MapPin,
  Laptop,
} from 'lucide-react';
import { api } from '../../services/api';
import { Attendance } from '../../types';

export const AttendancePage: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [todayData, setTodayData] = useState<{
    today: string;
    hasClockedIn: boolean;
    hasClockedOut: boolean;
    attendance: Attendance | null;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Live Clock updater every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchTodayStatus = async () => {
    try {
      const response = await api.get('/attendance/today');
      setTodayData(response.data);
    } catch (err: any) {
      console.error('Failed to fetch today status', err);
    }
  };

  useEffect(() => {
    fetchTodayStatus();
  }, []);

  const handleClockIn = async () => {
    setErrorMessage(null);
    setActionSuccess(null);
    setIsLoading(true);

    try {
      const response = await api.post('/attendance/clock-in');
      setActionSuccess('Absen Masuk berhasil dicatat! Selamat bekerja.');
      await fetchTodayStatus();
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || 'Gagal melakukan absen masuk. Silakan coba lagi.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClockOut = async () => {
    setErrorMessage(null);
    setActionSuccess(null);
    setIsLoading(true);

    try {
      const response = await api.post('/attendance/clock-out');
      setActionSuccess('Absen Pulang berhasil dicatat! Terima kasih atas dedikasi Anda.');
      await fetchTodayStatus();
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || 'Gagal melakukan absen pulang. Silakan coba lagi.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeOnly = (dateString?: string | null) => {
    if (!dateString) return '-';
    try {
      const d = new Date(dateString);
      return d.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return '-';
    }
  };

  const formatDateIndo = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const canClockIn = !todayData?.hasClockedIn;
  const canClockOut = todayData?.hasClockedIn && !todayData?.hasClockedOut;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Presensi Online (WFH)
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Lakukan pencatatan absen masuk dan pulang kerja secara real-time.
        </p>
      </div>

      {/* Feedback alerts */}
      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center space-x-2 text-sm animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-semibold">{actionSuccess}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center space-x-2 text-sm animate-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* LIVE DIGITAL CLOCK DISPLAY CARD */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white p-8 sm:p-10 shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-60 h-60 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-indigo-200 border border-white/10">
            <Laptop className="w-3.5 h-3.5" />
            <span>Mode Kerja: Work From Home (WFH)</span>
          </div>

          {/* Digital Clock */}
          <div className="font-mono text-5xl sm:text-7xl font-extrabold tracking-wider text-white drop-shadow-md">
            {currentTime.toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </div>

          {/* Date */}
          <div className="flex items-center space-x-2 text-indigo-200 text-sm sm:text-base font-medium">
            <Calendar className="w-4 h-4" />
            <span>{formatDateIndo(currentTime)}</span>
          </div>
        </div>
      </div>

      {/* TODAY'S STATUS & ACTION BUTTONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card Status Hari Ini */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center space-x-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              <span>Status Presensi Hari Ini</span>
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                    <LogIn className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Jam Masuk</span>
                    <span className="text-sm font-bold text-slate-800">
                      {formatTimeOnly(todayData?.attendance?.inTime)}
                    </span>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                    todayData?.hasClockedIn
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {todayData?.hasClockedIn ? 'Tercatat' : 'Belum'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-rose-100 text-rose-700 rounded-xl">
                    <LogOut className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Jam Pulang</span>
                    <span className="text-sm font-bold text-slate-800">
                      {formatTimeOnly(todayData?.attendance?.outTime)}
                    </span>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                    todayData?.hasClockedOut
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {todayData?.hasClockedOut ? 'Tercatat' : 'Belum'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Status Keseluruhan:</span>
            <span
              className={`font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                todayData?.hasClockedOut
                  ? 'bg-blue-100 text-blue-800'
                  : todayData?.hasClockedIn
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {todayData?.hasClockedOut
                ? 'Selesai Pulang'
                : todayData?.hasClockedIn
                ? 'Sedang Bekerja (Masuk)'
                : 'Belum Presensi'}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80 flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-800 mb-1 flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <span>Tombol Aksi Presensi</span>
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Tekan tombol di bawah untuk mencatat kehadiran Anda hari ini.
            </p>

            <div className="space-y-4">
              {/* Tombol Absen Masuk */}
              <button
                type="button"
                onClick={handleClockIn}
                disabled={!canClockIn || isLoading}
                className="w-full flex items-center justify-between p-4 rounded-2xl text-left font-bold transition-all shadow-md cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <LogIn className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-base block">Absen Masuk</span>
                    <span className="text-xs font-normal text-emerald-100">
                      Mulai jam kerja harian
                    </span>
                  </div>
                </div>
                {todayData?.hasClockedIn ? (
                  <span className="text-xs bg-white/20 px-2.5 py-1 rounded-lg">Sudah Masuk</span>
                ) : (
                  <span className="text-xs bg-white text-emerald-800 px-3 py-1 rounded-lg font-extrabold">
                    Klik Disini →
                  </span>
                )}
              </button>

              {/* Tombol Absen Pulang */}
              <button
                type="button"
                onClick={handleClockOut}
                disabled={!canClockOut || isLoading}
                className="w-full flex items-center justify-between p-4 rounded-2xl text-left font-bold transition-all shadow-md cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <LogOut className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-base block">Absen Pulang</span>
                    <span className="text-xs font-normal text-rose-100">
                      Akhiri jam kerja harian
                    </span>
                  </div>
                </div>
                {todayData?.hasClockedOut ? (
                  <span className="text-xs bg-white/20 px-2.5 py-1 rounded-lg">Sudah Pulang</span>
                ) : canClockOut ? (
                  <span className="text-xs bg-white text-rose-800 px-3 py-1 rounded-lg font-extrabold">
                    Klik Disini →
                  </span>
                ) : (
                  <span className="text-xs text-white/70">Terkunci (Perlu Masuk Dulu)</span>
                )}
              </button>
            </div>
          </div>

          <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/60 text-2xs text-slate-500 text-center">
            Informasi tanggal & waktu ditangkap secara akurat langsung oleh server backend.
          </div>
        </div>
      </div>
    </div>
  );
};
