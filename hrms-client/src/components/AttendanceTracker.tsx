import React, { useState } from 'react';
import API from '../api/axiosInstance';

export const AttendanceTracker: React.FC = () => {
  const [isCheckedIn, setIsCheckedIn] = useState<boolean>(false);
  const [isShiftCompleted, setIsShiftCompleted] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const triggerCheckIn = async () => {
    setStatusMessage(null);
    try {
      await API.post('/api/attendance/checkin', {});
      setIsCheckedIn(true);
      setStatusMessage({ text: 'Shift sequence initialized successfully.', isError: false });
    } catch (error: unknown) {
      const axiosError = error as { response?: { status?: number; data?: { error?: string } } };
      
      if (axiosError.response?.status === 400 && axiosError.response?.data?.error?.includes('already checked in')) {
        setIsCheckedIn(true);
        setStatusMessage({ text: 'Your shift sequence for today is already active.', isError: false });
      } else {
        setStatusMessage({ 
          text: axiosError.response?.data?.error || 'Initialization failure.', 
          isError: true 
        });
      }
    }
  };

  const triggerCheckOut = async () => {
    setStatusMessage(null);
    try {
      await API.post('/api/attendance/checkout', {});
      setIsCheckedIn(false);
      setIsShiftCompleted(true);
      setStatusMessage({ text: 'Shift sequence terminated. Summary logged.', isError: false });
    } catch (error: unknown) {
      const axiosError = error as { response?: { status?: number; data?: { error?: string } } };
      
      // Handle the case from image_7711e6.png where user already checked out
      if (axiosError.response?.status === 400 && axiosError.response?.data?.error?.includes('already checked out')) {
        setIsCheckedIn(false);
        setIsShiftCompleted(true);
        setStatusMessage({ text: 'Your shift logs for today are already finalized and completed.', isError: false });
      } else {
        setStatusMessage({ 
          text: axiosError.response?.data?.error || 'Termination failure.', 
          isError: true 
        });
      }
    }
  };

  return (
    <div className="bg-bg-card border border-zinc-900 rounded-xl p-8 space-y-6 shadow-lg animate-slide-up">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg tracking-wide text-brand-accent font-medium">ATTENDANCE LOG PIPELINE</h3>
          <p className="text-xs font-sans text-zinc-500">Record your dynamic standard corporate hours.</p>
        </div>
        <span className={`px-3 py-1 font-sans text-[10px] font-bold tracking-wider uppercase rounded-full ${
          isShiftCompleted ? 'bg-zinc-800 text-zinc-400 border border-zinc-700' :
          isCheckedIn ? 'bg-status-success/10 text-status-success border border-status-success/20' : 
          'bg-zinc-900 text-zinc-500 border border-zinc-800'
        }`}>
          {isShiftCompleted ? 'SHIFT COMPLETED' : isCheckedIn ? 'ACTIVE ON SHIFT' : 'OFFLINE'}
        </span>
      </div>

      {statusMessage && (
        <div className={`p-4 rounded text-xs font-sans font-medium border transition-all duration-300 animate-fade-in ${
          statusMessage.isError ? 'bg-status-danger/5 text-status-danger border-status-danger/20' : 'bg-brand-primary/5 text-brand-accent border-brand-primary/20'
        }`}>
          {statusMessage.text}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 font-sans">
        <button 
          type="button" 
          onClick={triggerCheckIn} 
          disabled={isCheckedIn || isShiftCompleted} 
          className="py-3.5 border border-brand-primary text-black bg-gradient-to-r from-brand-accent to-brand-primary font-bold tracking-widest text-xs uppercase disabled:opacity-30 disabled:pointer-events-none hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer rounded"
        >
          EXECUTE CHECK-IN
        </button>
        <button 
          type="button" 
          onClick={triggerCheckOut} 
          disabled={!isCheckedIn || isShiftCompleted} 
          className="py-3.5 border border-zinc-800 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 font-bold tracking-widest text-xs uppercase disabled:opacity-30 disabled:pointer-events-none active:scale-[0.99] transition-all cursor-pointer rounded"
        >
          RECORD CHECK-OUT
        </button>
      </div>
    </div>
  );
};