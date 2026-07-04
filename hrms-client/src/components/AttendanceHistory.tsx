import React, { useState, useEffect, useCallback } from 'react';
import API from '../api/axiosInstance';

interface AttendanceRecord {
  _id: string;
  date: string;
  checkInTime: string;    // Aligned to match backend schema key
  checkOutTime?: string;  // Aligned to match backend schema key
  status: string;
}

export const AttendanceHistory: React.FC = () => {
  const [history, setHistory] = useState<AttendanceRecord[]>([]);

  const fetchAttendanceHistory = useCallback(async () => {
    try {
      const response = await API.get('/api/attendance/my-history');
      setHistory(response.data?.history || []);
    } catch (error) {
      console.error('Failed to pull attendance logs:', error);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAttendanceHistory();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchAttendanceHistory]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '—';
    return new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-bg-card border border-zinc-900 rounded-xl p-8 space-y-4 shadow-lg animate-slide-up">
      <div>
        <h3 className="text-lg tracking-wide text-brand-accent font-medium">SHIFT HISTORY TIMELINE</h3>
        <p className="text-xs font-sans text-zinc-500 font-serif italic">Review your historical operational workspace metrics.</p>
      </div>

      {history.length === 0 ? (
        <div className="p-6 border border-dashed border-zinc-900 rounded text-center font-sans">
          <p className="text-xs text-zinc-600 uppercase tracking-widest">No previous clock-in milestones logged on this file.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-zinc-900 rounded">
          <table className="w-full text-left border-collapse font-sans text-xs">
            <thead>
              <tr className="bg-zinc-950 border-b border-zinc-900 text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-3">Shift Date</th>
                <th className="p-3">Punch In</th>
                <th className="p-3">Punch Out</th>
                <th className="p-3 text-right">Operational State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 bg-bg-card/50">
              {history.map((log) => (
                <tr key={log._id} className="hover:bg-zinc-900/40 transition">
                  <td className="p-3 font-medium text-zinc-300">{formatDate(log.date)}</td>
                  <td className="p-3 text-brand-primary font-mono">{formatTime(log.checkInTime)}</td>
                  <td className="p-3 text-zinc-400 font-mono">{formatTime(log.checkOutTime)}</td>
                  <td className="p-3 text-right">
                    <span className={`px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase rounded ${
                      log.checkOutTime ? 'bg-zinc-900 text-zinc-500' : 'bg-status-success/10 text-status-success'
                    }`}>
                      {log.checkOutTime ? 'Completed' : 'Active'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};