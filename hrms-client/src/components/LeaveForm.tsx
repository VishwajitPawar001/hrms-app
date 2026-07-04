import React, { useState } from 'react';
import API from '../api/axiosInstance';
import { LeaveHistory } from './LeaveHistory';

export const LeaveForm: React.FC = () => {
  const [leaveData, setLeaveData] = useState({
    startDate: '',
    endDate: '',
    reason: '',
    leaveType: 'Casual'
  });
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setLeaveData({ ...leaveData, [e.target.name]: e.target.value });
  };

  const handleLeaveSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setMessage(null);

    try {
      await API.post('/api/leave/apply', leaveData);
      setMessage({ text: 'Absence request dispatched to administrative panel.', isError: false });
      setLeaveData({ startDate: '', endDate: '', reason: '', leaveType: 'Casual' });
      setRefreshTrigger(prev => prev + 1);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      setMessage({
        text: axiosError.response?.data?.error || 'Failed to dispatch leave metrics.',
        isError: true
      });
    }
  };

  return (
    <div className="bg-bg-card border border-zinc-900 rounded-xl p-8 space-y-6 shadow-lg animate-slide-up">
      <div>
        <h3 className="text-lg tracking-wide text-brand-accent font-medium">TIME-OFF & ABSENCE DISPATCH</h3>
        <p className="text-xs font-sans text-zinc-500">Forward operational leave requests straight to administrative review panels.</p>
      </div>

      {message && (
        <div className={`p-4 rounded text-xs font-sans font-medium border transition-all duration-300 animate-fade-in ${
          message.isError ? 'bg-status-danger/5 text-status-danger border-status-danger/20' : 'bg-brand-primary/5 text-brand-accent border-brand-primary/20'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleLeaveSubmit} className="space-y-4 font-sans text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Start Date</label>
            <input type="date" name="startDate" required value={leaveData.startDate} onChange={handleInputChange} className="mt-1.5 w-full px-3 py-2 bg-bg-input border border-zinc-900 rounded text-zinc-300 focus:outline-none focus:border-brand-primary" />
          </div>
          <div>
            <label className="block text-[10px] font-bold tracking-widest text-zinc-500 uppercase">End Date</label>
            <input type="date" name="endDate" required value={leaveData.endDate} onChange={handleInputChange} className="mt-1.5 w-full px-3 py-2 bg-bg-input border border-zinc-900 rounded text-zinc-300 focus:outline-none focus:border-brand-primary" />
          </div>
          <div>
            <label className="block text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Category</label>
            <select name="leaveType" value={leaveData.leaveType} onChange={handleInputChange} className="mt-1.5 w-full px-3 py-2 bg-bg-input border border-zinc-900 rounded text-zinc-300 focus:outline-none focus:border-brand-primary">
              <option value="Casual">Casual Leave</option>
              <option value="Medical">Medical Leave</option>
              <option value="Maternity">Maternity Leave</option>
              <option value="Paternity">Paternity Leave</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Reason for Absence</label>
          <textarea name="reason" rows={3} required placeholder="State the formal justification parameters..." value={leaveData.reason} onChange={handleInputChange} className="mt-1.5 w-full px-3 py-2 bg-bg-input border border-zinc-900 rounded text-zinc-300 placeholder-zinc-700 focus:outline-none focus:border-brand-primary resize-none text-sm" />
        </div>

        <div className="flex justify-end pt-2">
          <button type="submit" className="px-6 py-2.5 border border-brand-primary bg-gradient-to-r from-brand-accent to-brand-primary text-black font-bold tracking-widest text-[10px] uppercase hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer rounded shadow-md">
            DISPATCH REQUEST
          </button>
        </div>
      </form>

      <LeaveHistory refreshTrigger={refreshTrigger} />
    </div>
  );
};