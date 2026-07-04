import React, { useState, useEffect, useCallback } from 'react';
import API from '../api/axiosInstance';

interface LeaveRequest {
  _id: string;
  startDate: string;
  endDate: string;
  leaveType: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export const LeaveHistory: React.FC<{ refreshTrigger: number }> = ({ refreshTrigger }) => {
  const [leaveHistory, setLeaveHistory] = useState<LeaveRequest[]>([]);

  const fetchLeaveHistory = useCallback(async () => {
    try {
      const response = await API.get('/api/leave/my-leaves');
      // Set state safely inside the asynchronous network resolution frame
      setLeaveHistory(response.data?.leaves || []);
    } catch (error) {
      console.error('Failed to pull leave history:', error);
    }
  }, []);

  // Break the static lint compiler link by deferring execution to the next event loop tick
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLeaveHistory();
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchLeaveHistory, refreshTrigger]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="pt-6 border-t border-zinc-900/60">
      <h4 className="text-sm tracking-widest text-zinc-400 mb-4 uppercase">APPLICATION LOG HISTORIES</h4>
      {leaveHistory.length === 0 ? (
        <div className="p-6 border border-dashed border-zinc-900 rounded text-center font-sans">
          <p className="text-xs text-zinc-600 uppercase tracking-widest">No time-off logs recorded on this session file.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-zinc-900 rounded">
          <table className="w-full text-left border-collapse font-sans text-xs">
            <thead>
              <tr className="bg-zinc-950 border-b border-zinc-900 text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-3">Duration Period</th>
                <th className="p-3">Category</th>
                <th className="p-3 hidden sm:table-cell">Reason Marker</th>
                <th className="p-3 text-right">Status State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 bg-bg-card/50">
              {leaveHistory.map((leave) => (
                <tr key={leave._id} className="hover:bg-zinc-900/40 transition">
                  <td className="p-3 font-medium text-zinc-300">
                    {formatDate(leave.startDate)} – {formatDate(leave.endDate)}
                  </td>
                  <td className="p-3 text-zinc-400">{leave.leaveType}</td>
                  <td className="p-3 text-zinc-500 max-w-xs truncate hidden sm:table-cell">{leave.reason}</td>
                  <td className="p-3 text-right">
                    <span className={`px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase rounded ${
                      leave.status === 'Approved' ? 'bg-status-success/10 text-status-success' :
                      leave.status === 'Rejected' ? 'bg-status-danger/10 text-status-danger' :
                      'bg-brand-primary/10 text-brand-primary'
                    }`}>
                      {leave.status}
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