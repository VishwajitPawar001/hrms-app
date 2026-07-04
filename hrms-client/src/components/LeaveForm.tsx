import React, { useState } from 'react';
import API from '../api/axiosInstance';

export const LeaveForm: React.FC<{ onLeaveApplied?: () => void }> = ({ onLeaveApplied }) => {
  const [leaveData, setLeaveData] = useState({
    startDate: '',
    endDate: '',
    leaveType: 'Casual',
    durationMode: 'Full',
    reason: ''
  });
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setLeaveData((prev) => ({ ...prev, [name]: value }));
  };

  const submitLeaveRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    try {
      const payload = {
        ...leaveData,
        endDate: leaveData.durationMode === 'Half' ? leaveData.startDate : leaveData.endDate
      };

      await API.post('/api/leave/apply', payload);
      setMessage({ text: 'Leave request submitted successfully.', isError: false });
      setLeaveData({ startDate: '', endDate: '', leaveType: 'Casual', durationMode: 'Full', reason: '' });
      
      if (onLeaveApplied) {
        onLeaveApplied();
      }
    } catch (error: any) {
      setMessage({ text: error.response?.data?.error || 'Failed to submit request.', isError: true });
    }
  };

  return (
    <form onSubmit={submitLeaveRequest} className="bg-bg-card border border-zinc-900 rounded-xl p-8 space-y-6 shadow-lg font-sans text-xs">
      <div>
        <h3 className="text-lg font-semibold text-zinc-200">Apply for Leave</h3>
        <p className="text-xs text-zinc-500">Submit a new leave request for approval.</p>
      </div>

      {message && (
        <div className={`p-4 rounded border transition-all ${
          message.isError ? 'bg-status-danger/5 text-status-danger border-status-danger/20' : 'bg-brand-primary/5 text-brand-accent border-brand-primary/20'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-zinc-400 mb-2 uppercase tracking-wider font-bold text-[10px]">Start Date</label>
          <input type="date" name="startDate" value={leaveData.startDate} onChange={handleInputChange} required className="w-full bg-zinc-950 border border-zinc-900 rounded p-3 text-zinc-300 focus:border-brand-primary outline-none transition" />
        </div>

        <div>
          <label className="block text-zinc-400 mb-2 uppercase tracking-wider font-bold text-[10px]">Duration</label>
          <select name="durationMode" value={leaveData.durationMode} onChange={handleInputChange} className="w-full bg-zinc-950 border border-zinc-900 rounded p-3 text-zinc-300 focus:border-brand-primary outline-none transition">
            <option value="Full">Full Day</option>
            <option value="Half">Half Day</option>
          </select>
        </div>

        <div>
          <label className="block text-zinc-400 mb-2 uppercase tracking-wider font-bold text-[10px]">End Date</label>
          <input 
            type="date" 
            name="endDate" 
            value={leaveData.durationMode === 'Half' ? leaveData.startDate : leaveData.endDate} 
            onChange={handleInputChange} 
            disabled={leaveData.durationMode === 'Half'} 
            required={leaveData.durationMode === 'Full'} 
            className="w-full bg-zinc-950 border border-zinc-900 rounded p-3 text-zinc-300 focus:border-brand-primary outline-none transition disabled:opacity-40" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-zinc-400 mb-2 uppercase tracking-wider font-bold text-[10px]">Type</label>
          <select name="leaveType" value={leaveData.leaveType} onChange={handleInputChange} className="w-full bg-zinc-950 border border-zinc-900 rounded p-3 text-zinc-300 focus:border-brand-primary outline-none transition">
            <option value="Casual">Casual Leave</option>
            <option value="Sick">Medical Leave</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-zinc-400 mb-2 uppercase tracking-wider font-bold text-[10px]">Reason</label>
        <textarea name="reason" value={leaveData.reason} onChange={handleInputChange} required placeholder="Enter reason for leave..." rows={4} className="w-full bg-zinc-950 border border-zinc-900 rounded p-3 text-zinc-300 focus:border-brand-primary outline-none transition resize-none" />
      </div>

      <div className="flex justify-end">
        <button type="submit" className="px-6 py-3.5 border border-brand-primary text-black bg-gradient-to-r from-brand-accent to-brand-primary font-bold tracking-widest uppercase rounded hover:brightness-110 active:scale-[0.98] transition cursor-pointer">
          Submit Request
        </button>
      </div>
    </form>
  );
};