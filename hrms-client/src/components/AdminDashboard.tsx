import React, { useState, useEffect, useCallback } from 'react';
import API from '../api/axiosInstance';

interface LeaveApplication {
  _id: string;
  employeeId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

interface AttendanceLog {
  _id: string;
  employeeId: string;
  date: string;
  checkInTime: string;
  checkOutTime?: string;
  status: string;
}

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'leaves' | 'attendance'>('leaves');
  const [applications, setApplications] = useState<LeaveApplication[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceLog[]>([]);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const fetchAllApplications = useCallback(async () => {
    try {
      const response = await API.get('/api/leave/admin/all');
      setApplications(response.data?.leaves || []);
    } catch (error) {
      console.error('Failed to pull master administrative leave list:', error);
    }
  }, []);

  const fetchGlobalAttendance = useCallback(async () => {
    try {
      // Endpoint to fetch daily logs across the entire system
      const response = await API.get('/api/attendance/admin/today');
      setAttendanceLogs(response.data?.attendance || response.data || []);
    } catch (error) {
      console.error('Failed to pull master attendance records:', error);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeTab === 'leaves') {
        fetchAllApplications();
      } else {
        fetchGlobalAttendance();
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [activeTab, fetchAllApplications, fetchGlobalAttendance]);

  const handleAction = async (id: string, decision: 'Approved' | 'Rejected') => {
    setMessage(null);
    try {
      await API.patch(`/api/leave/admin/action/${id}`, { status: decision });
      setMessage({ text: `Application status updated to ${decision} successfully.`, isError: false });
      fetchAllApplications();
    } catch (error) {
      setMessage({ text: 'Failed to record administrative action state.', isError: true });
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '—';
    return new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-bg-card border border-zinc-900 rounded-xl p-8 space-y-6 shadow-lg animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h3 className="text-lg tracking-wide text-brand-accent font-medium">HR ADMINISTRATIVE CONTROL PANEL</h3>
          <p className="text-xs font-sans text-zinc-500">Manage, evaluate, and monitor organization-wide operational vectors.</p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex bg-zinc-950 p-1 border border-zinc-900 rounded font-sans text-xs">
          <button 
            onClick={() => setActiveTab('leaves')}
            className={`px-4 py-1.5 rounded uppercase font-bold tracking-wider text-[10px] transition cursor-pointer ${
              activeTab === 'leaves' ? 'bg-gradient-to-r from-brand-accent to-brand-primary text-black' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Leave Requests
          </button>
          <button 
            onClick={() => setActiveTab('attendance')}
            className={`px-4 py-1.5 rounded uppercase font-bold tracking-wider text-[10px] transition cursor-pointer ${
              activeTab === 'attendance' ? 'bg-gradient-to-r from-brand-accent to-brand-primary text-black' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Attendance Logs
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded text-xs font-sans font-medium border transition-all duration-300 ${
          message.isError ? 'bg-status-danger/5 text-status-danger border-status-danger/20' : 'bg-brand-primary/5 text-brand-accent border-brand-primary/20'
        }`}>
          {message.text}
        </div>
      )}

      {/* Conditional Rendering Layer */}
      {activeTab === 'leaves' ? (
        // LEAVE APPLICATIONS MANAGER
        applications.length === 0 ? (
          <div className="p-6 border border-dashed border-zinc-900 rounded text-center font-sans">
            <p className="text-xs text-zinc-600 uppercase tracking-widest">No pending organization leave requests found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-zinc-900 rounded">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="bg-zinc-950 border-b border-zinc-900 text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3">Employee Reference ID</th>
                  <th className="p-3">Duration</th>
                  <th className="p-3">Category</th>
                  <th className="p-3 hidden md:table-cell">Reason Statement</th>
                  <th className="p-3 text-right">Operational Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 bg-bg-card/50">
                {applications.map((app) => (
                  <tr key={app._id} className="hover:bg-zinc-900/40 transition">
                    <td className="p-3 font-mono text-zinc-400">{app.employeeId}</td>
                    <td className="p-3 text-zinc-300 font-medium">
                      {formatDate(app.startDate)} – {formatDate(app.endDate)}
                    </td>
                    <td className="p-3 text-zinc-400">{app.leaveType}</td>
                    <td className="p-3 text-zinc-500 max-w-xs truncate hidden md:table-cell">{app.reason}</td>
                    <td className="p-3 text-right space-x-2">
                      {app.status === 'Pending' ? (
                        <>
                          <button
                            onClick={() => handleAction(app._id, 'Approved')}
                            className="px-2.5 py-1 bg-status-success/10 hover:bg-status-success/20 text-status-success font-bold text-[10px] tracking-wide uppercase rounded cursor-pointer transition border border-status-success/20"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction(app._id, 'Rejected')}
                            className="px-2.5 py-1 bg-status-danger/10 hover:bg-status-danger/20 text-status-danger font-bold text-[10px] tracking-wide uppercase rounded cursor-pointer transition border border-status-danger/20"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <span className={`px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase rounded ${
                          app.status === 'Approved' ? 'bg-status-success/10 text-status-success' : 'bg-status-danger/10 text-status-danger'
                        }`}>
                          {app.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        // ATTENDANCE MONITOR GRID
        attendanceLogs.length === 0 ? (
          <div className="p-6 border border-dashed border-zinc-900 rounded text-center font-sans">
            <p className="text-xs text-zinc-600 uppercase tracking-widest">No attendance shifts recorded for this production track.</p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-zinc-900 rounded">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="bg-zinc-950 border-b border-zinc-900 text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3">Employee Reference ID</th>
                  <th className="p-3">Shift Date</th>
                  <th className="p-3">Clock In Time</th>
                  <th className="p-3">Clock Out Time</th>
                  <th className="p-3 text-right">Shift Metrics</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 bg-bg-card/50">
                {attendanceLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-zinc-900/40 transition">
                    <td className="p-3 font-mono text-zinc-400">{log.employeeId}</td>
                    <td className="p-3 text-zinc-300">{formatDate(log.date)}</td>
                    <td className="p-3 text-brand-primary font-mono">{formatTime(log.checkInTime)}</td>
                    <td className="p-3 text-zinc-400 font-mono">{formatTime(log.checkOutTime)}</td>
                    <td className="p-3 text-right">
                      <span className={`px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase rounded ${
                        log.checkOutTime ? 'bg-zinc-900 text-zinc-500' : 'bg-status-success/10 text-status-success border border-status-success/20'
                      }`}>
                        {log.checkOutTime ? 'Completed' : 'Active On Shift'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
};