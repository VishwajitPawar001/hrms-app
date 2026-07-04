import React, { useState, useEffect } from 'react';
import { AttendanceTracker } from './AttendanceTracker';
import { AttendanceHistory } from './AttendanceHistory'; // Imported the history timeline module
import { LeaveForm } from './LeaveForm';
import { AdminDashboard } from './AdminDashboard';

export const Dashboard: React.FC = () => {
  const [employeeName] = useState<string>(() => localStorage.getItem('emp_name') || 'Personnel');
  const [role] = useState<string>(() => localStorage.getItem('emp_role') || 'Employee');
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-bg-main text-zinc-100 flex flex-col animate-fade-in font-serif">
      <header className="bg-bg-card border-b border-zinc-900 px-8 py-5 flex justify-between items-center shadow-md">
        <div className="space-y-1">
          <h1 className="text-xl tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-brand-accent to-brand-primary font-black">HRMS SYSTEM</h1>
          <p className="text-[10px] tracking-widest text-zinc-500 uppercase font-sans font-bold">
            Assignment: <span className="text-brand-accent">{role}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-6 font-sans">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-zinc-400">System Time</p>
            <p className="text-sm font-bold tracking-widest text-brand-primary">{currentTime || '00:00:00'}</p>
          </div>
          <button type="button" onClick={handleLogout} className="px-4 py-2 border border-status-danger/30 hover:bg-status-danger/10 rounded text-[10px] font-bold tracking-widest text-status-danger uppercase transition active:scale-95 cursor-pointer">
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-7xl w-full mx-auto p-8 grid grid-cols-1 md:grid-cols-3 gap-8 flex-1">
        <div className="md:col-span-1">
          <div className="bg-bg-card border border-zinc-900 rounded-xl p-8 space-y-4 shadow-lg animate-slide-up">
            <p className="text-[10px] tracking-widest text-zinc-500 uppercase font-sans font-bold">Welcome Back</p>
            <h2 className="text-2xl font-light text-zinc-100 leading-tight">
              Hello, <span className="font-bold text-brand-accent">{employeeName}</span>
            </h2>
            <div className="h-px bg-zinc-900 w-full my-2" />
            <p className="text-xs font-sans text-zinc-400 leading-relaxed">
              {role === 'HR' ? 'Administrative privileges verified. Operational dashboard live.' : 'Your structural workspace modules are live.'}
            </p>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          {/* HR Roles see the Admin Management grid; Employees see the Attendance tracker, History Log, and Form dispatcher */}
          {role === 'HR' ? (
            <AdminDashboard />
          ) : (
            <>
              <AttendanceTracker />
              <AttendanceHistory /> 
              <LeaveForm />
            </>
          )}
        </div>
      </main>
    </div>
  );
};