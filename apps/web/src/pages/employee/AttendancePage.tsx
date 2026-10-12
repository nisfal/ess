import React, { useState, useEffect } from 'react';
import {
  Clock,
  LogIn,
  LogOut,
  Calendar,
  CheckCircle2,
  AlertCircle,
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
      await api.post('/attendance/clock-in');
      setActionSuccess('Clock-in recorded successfully.');
      await fetchTodayStatus();
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || 'Failed to record clock-in.',
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
      await api.post('/attendance/clock-out');
      setActionSuccess('Clock-out recorded successfully.');
      await fetchTodayStatus();
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || 'Failed to record clock-out.',
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
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-zinc-900">
          Attendance Tracker
        </h1>
        <p className="text-xs text-zinc-500 mt-0.5">
          Record your daily work-from-home clock-in and clock-out timestamps.
        </p>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Clock Card */}
      <div className="bg-white border border-zinc-200/80 rounded-xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-zinc-100 gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs text-zinc-500 font-medium">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDateIndo(currentTime)}</span>
            </div>
            <div className="font-mono text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-900 mt-1">
              {currentTime.toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </div>
          </div>

          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-3xs font-medium bg-zinc-100 text-zinc-700 border border-zinc-200 self-start sm:self-auto">
            <Laptop className="w-3.5 h-3.5 text-zinc-500" />
            <span>Remote WFH Session</span>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6 border-b border-zinc-100">
          <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200/70">
            <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
              <span className="font-medium">Check-In</span>
              <LogIn className="w-3.5 h-3.5 text-zinc-400" />
            </div>
            <div className="font-mono text-base font-semibold text-zinc-900">
              {formatTimeOnly(todayData?.attendance?.inTime)}
            </div>
            <span
              className={`inline-block mt-2 text-3xs font-medium px-2 py-0.5 rounded ${
                todayData?.hasClockedIn
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-zinc-200/60 text-zinc-600'
              }`}
            >
              {todayData?.hasClockedIn ? 'Recorded' : 'Not Recorded'}
            </span>
          </div>

          <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200/70">
            <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
              <span className="font-medium">Check-Out</span>
              <LogOut className="w-3.5 h-3.5 text-zinc-400" />
            </div>
            <div className="font-mono text-base font-semibold text-zinc-900">
              {formatTimeOnly(todayData?.attendance?.outTime)}
            </div>
            <span
              className={`inline-block mt-2 text-3xs font-medium px-2 py-0.5 rounded ${
                todayData?.hasClockedOut
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-zinc-200/60 text-zinc-600'
              }`}
            >
              {todayData?.hasClockedOut ? 'Recorded' : 'Not Recorded'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-6 gap-4">
          <div className="text-xs text-zinc-500">
            Current Status:{' '}
            <span className="font-semibold text-zinc-900">
              {todayData?.hasClockedOut
                ? 'Workday Completed'
                : todayData?.hasClockedIn
                ? 'Working (Clocked In)'
                : 'Not Clocked In'}
            </span>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleClockIn}
              disabled={!canClockIn || isLoading}
              className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
            >
              Clock In
            </button>

            <button
              type="button"
              onClick={handleClockOut}
              disabled={!canClockOut || isLoading}
              className="flex-1 sm:flex-none px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
            >
              Clock Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
