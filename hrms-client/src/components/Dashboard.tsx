import React, { useState, useEffect } from 'react';
import API from '../api/axiosInstance';

export const Dashboard: React.FC = () => {
  // Initialize state directly from localStorage to satisfy the strict linter rule in image_763904.png
  const [employeeName] = useState<string>(() => {
    return localStorage.getItem('emp_name') || 'Personnel';
  });
  
  const [role] = useState<string>(() => {
    return localStorage.getItem('emp_role') || 'Employee';
  });

  const [isCheckedIn, setIsCheckedIn] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');

  // Time-Off State Hooks
  const [leaveData, setLeaveData] = useState({
    startDate: '',
    endDate: '',
    reason: '',
    type: 'Casual'
  });
  const [leaveMessage, setLeaveMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Live clock tick
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const triggerCheckIn = async () => {
    setStatusMessage(null);
    try {
      await API.post('/api/attendance/checkin', {});
      setIsCheckedIn(true);
      setStatusMessage({ text: 'Shift sequence initialized successfully.', isError: false });
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      setStatusMessage({ 
        text: axiosError.response?.data?.error || 'Initialization failure. Verify check-in window.', 
        isError: true 
      });
    }
  };

  const triggerCheckOut = async () => {
    setStatusMessage(null);
    try {
      await API.post('/api/attendance/checkout', {});
      setIsCheckedIn(false);
      setStatusMessage({ text: 'Shift sequence terminated. Summary logged.', isError: false });
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      setStatusMessage({ 
        text: axiosError.response?.data?.error || 'Termination failure. Check active session markers.', 
        isError: true 
      });
    }
  };

  const handleLeaveInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setLeaveData({ ...leaveData, [e.target.name]: e.target.value });
  };

  const handleLeaveSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setLeaveMessage(null);

    try {
      await API.post('/api/leave/apply', leaveData);
      setLeaveMessage({ text: 'Absence request dispatched to administrative panel.', isError: false });
      setLeaveData({ startDate: '', endDate: '', reason: '', type: 'Casual' });
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { error?: string } } };
      setLeaveMessage({
        text: axiosError.response?.data?.error || 'Failed to dispatch leave metrics.',
        isError: true
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('emp_name');
    localStorage.removeItem('emp_role');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-bg-main text-zinc-100 flex flex-col animate-fade-in font-serif">
      {/* Top Corporate Masthead Header */}
      <header className="bg-bg-card border-b border-zinc-900 px-8 py-5 flex justify-between items-center shadow-md">
        <div className="space-y-1">
          <h1 className="text-xl tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-brand-accent to-brand-primary font-black">
            HRMS SYSTEM
          </h1>
          <p className="text-[10px] tracking-widest text-zinc-500 uppercase font-sans font-bold">
            Assignment: <span className="text-brand-accent">{role}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-6 font-sans">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-zinc-400">System Time</p>
            <p className="text-sm font-bold tracking-widest text-brand-primary">{currentTime || '00:00:00'}</p>
          </div>
          <button 
            type="button"
            onClick={handleLogout}
            className="px-4 py-2 border border-status-danger/30 hover:bg-status-danger/10 rounded text-[10px] font-bold tracking-widest text-status-danger uppercase transition active:scale-95 cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Framework Body */}
      <main className="max-w-7xl w-full mx-auto p-8 grid grid-cols-1 md:grid-cols-3 gap-8 flex-1">
        {/* Left Column: Greeting Panel */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-bg-card border border-zinc-900 rounded-xl p-8 space-y-4 shadow-lg animate-slide-up">
            <p className="text-[10px] tracking-widest text-zinc-500 uppercase font-sans font-bold">Welcome Back</p>
            <h2 className="text-2xl font-light text-zinc-100 leading-tight">
              Hello, <span className="font-bold text-brand-accent">{employeeName}</span>
            </h2>
            <div className="h-px bg-zinc-900 w-full my-2" />
            <p className="text-xs font-sans text-zinc-400 leading-relaxed">
              Your structural workspace modules are live. Initialize your shift logs or handle operational time-off schedules.
            </p>
          </div>
        </div>

        {/* Right Columns: Shift Operations & Leave Controls */}
        <div className="md:col-span-2 space-y-6">
          {/* Shift Tracker Panel */}
          <div className="bg-bg-card border border-zinc-900 rounded-xl p-8 space-y-6 shadow-lg animate-slide-up">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg tracking-wide text-brand-accent font-medium">ATTENDANCE LOG PIPELINE</h3>
                <p className="text-xs font-sans text-zinc-500">Record your dynamic standard corporate hours.</p>
              </div>
              <span className={`px-3 py-1 font-sans text-[10px] font-bold tracking-wider uppercase rounded-full ${
                isCheckedIn 
                  ? 'bg-status-success/10 text-status-success border border-status-success/20' 
                  : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
              }`}>
                {isCheckedIn ? 'ACTIVE ON SHIFT' : 'OFFLINE'}
              </span>
            </div>

            {statusMessage && (
              <div className={`p-4 rounded text-xs font-sans font-medium border transition-all duration-300 animate-fade-in ${
                statusMessage.isError 
                  ? 'bg-status-danger/5 text-status-danger border-status-danger/20' 
                  : 'bg-brand-primary/5 text-brand-accent border-brand-primary/20'
              }`}>
                {statusMessage.text}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 font-sans">
              <button 
                type="button"
                onClick={triggerCheckIn}
                disabled={isCheckedIn}
                className="py-3.5 border border-brand-primary text-black bg-gradient-to-r from-brand-accent to-brand-primary font-bold tracking-widest text-xs uppercase disabled:opacity-30 disabled:pointer-events-none hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer rounded"
              >
                EXECUTE CHECK-IN
              </button>
              <button 
                type="button"
                onClick={triggerCheckOut}
                disabled={!isCheckedIn}
                className="py-3.5 border border-zinc-800 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 font-bold tracking-widest text-xs uppercase disabled:opacity-30 disabled:pointer-events-none active:scale-[0.99] transition-all cursor-pointer rounded"
              >
                RECORD CHECK-OUT
              </button>
            </div>
          </div>

          {/* Active Leave Module */}
          <div className="bg-bg-card border border-zinc-900 rounded-xl p-8 space-y-6 shadow-lg animate-slide-up">
            <div>
              <h3 className="text-lg tracking-wide text-brand-accent font-medium">TIME-OFF & ABSENCE DISPATCH</h3>
              <p className="text-xs font-sans text-zinc-500">Forward operational leave requests straight to administrative review panels.</p>
            </div>

            {leaveMessage && (
              <div className={`p-4 rounded text-xs font-sans font-medium border transition-all duration-300 animate-fade-in ${
                leaveMessage.isError 
                  ? 'bg-status-danger/5 text-status-danger border-status-danger/20' 
                  : 'bg-brand-primary/5 text-brand-accent border-brand-primary/20'
              }`}>
                {leaveMessage.text}
              </div>
            )}

            <form onSubmit={handleLeaveSubmit} className="space-y-4 font-sans text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    required
                    value={leaveData.startDate}
                    onChange={handleLeaveInputChange}
                    className="mt-1.5 w-full px-3 py-2 bg-bg-input border border-zinc-900 rounded text-zinc-300 focus:outline-none focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-widest text-zinc-500 uppercase">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    required
                    value={leaveData.endDate}
                    onChange={handleLeaveInputChange}
                    className="mt-1.5 w-full px-3 py-2 bg-bg-input border border-zinc-900 rounded text-zinc-300 focus:outline-none focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Category</label>
                  <select
                    name="type"
                    value={leaveData.type}
                    onChange={handleLeaveInputChange}
                    className="mt-1.5 w-full px-3 py-2 bg-bg-input border border-zinc-900 rounded text-zinc-300 focus:outline-none focus:border-brand-primary"
                  >
                    <option value="Casual">Casual Leave</option>
                    <option value="Medical">Medical Leave</option>
                    <option value="Maternity">Maternity Leave</option>
                    <option value="Paternity">Paternity Leave</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-widest text-zinc-500 uppercase">Reason for Absence</label>
                <textarea
                  name="reason"
                  rows={3}
                  required
                  placeholder="State the formal justification parameters..."
                  value={leaveData.reason}
                  onChange={handleLeaveInputChange}
                  className="mt-1.5 w-full px-3 py-2 bg-bg-input border border-zinc-900 rounded text-zinc-300 placeholder-zinc-700 focus:outline-none focus:border-brand-primary resize-none text-sm"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 border border-brand-primary bg-gradient-to-r from-brand-accent to-brand-primary text-black font-bold tracking-widest text-[10px] uppercase hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer rounded shadow-md"
                >
                  DISPATCH REQUEST
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};