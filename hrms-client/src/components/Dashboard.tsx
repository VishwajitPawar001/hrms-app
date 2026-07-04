import React, { useState, useEffect } from 'react';
import { AttendanceTracker } from './AttendanceTracker';
import { AttendanceHistory } from './AttendanceHistory';
import { LeaveForm } from './LeaveForm';
import { LeaveHistory } from './LeaveHistory';
import { AdminDashboard } from './AdminDashboard';
import { Profile } from './Profile';
import { EmployeeDirectory } from './EmployeeDirectory';
import { PayrollManager } from './PayrollManager';

type DashboardTab = 'overview' | 'directory' | 'profile' | 'leaves' | 'attendance' | 'payroll' | 'approvals';

export const Dashboard: React.FC = () => {
  const [employeeName] = useState<string>(() => localStorage.getItem('emp_name') || 'User');
  const [role] = useState<string>(() => localStorage.getItem('emp_role') || 'Employee');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | undefined>(undefined);
  const [selectedEmployeeName, setSelectedEmployeeName] = useState<string | undefined>(undefined);
  
  const [leaveRefresh, setLeaveRefresh] = useState<number>(0);

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

  const handleSelectEmployee = (empId: string, empName: string) => {
    setSelectedEmployeeId(empId);
    setSelectedEmployeeName(empName);
    setActiveTab('profile');
  };

  const handleClearReview = () => {
    setSelectedEmployeeId(undefined);
    setSelectedEmployeeName(undefined);
  };

  return (
    <div className="min-h-screen bg-bg-main text-zinc-100 flex flex-col font-sans">
      <header className="bg-bg-card border-b border-zinc-900 px-8 py-5 flex justify-between items-center shadow-md">
        <div className="space-y-1">
          <h1 className="text-xl tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-brand-accent to-brand-primary font-black">HRMS ENGINE</h1>
          <p className="text-[9px] tracking-widest text-zinc-500 uppercase font-sans font-bold">
            Authorized Account: <span className="text-brand-accent">{employeeName}</span> ({role})
          </p>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Local Clock</p>
            <p className="text-sm font-bold tracking-widest font-mono text-brand-primary">{currentTime || '00:00:00'}</p>
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

      <div className="max-w-7xl w-full mx-auto p-6 md:p-8 flex flex-col lg:flex-row gap-8 flex-1">
        <aside className="w-full lg:w-64 space-y-6 flex-shrink-0">
          <div className="bg-bg-card border border-zinc-900 rounded-xl p-6 space-y-4 shadow-lg">
            <p className="text-[9px] tracking-widest text-zinc-500 uppercase font-bold">Account Profile</p>
            <div className="space-y-1">
              <h2 className="text-md font-bold text-zinc-200">{employeeName}</h2>
              <span className="text-[9px] bg-brand-primary/10 border border-brand-primary/20 text-brand-accent px-2 py-0.5 rounded font-bold uppercase tracking-wider">{role}</span>
            </div>
            <div className="h-px bg-zinc-900 w-full" />
            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              Navigate corporate tools and manage leaves, shift timings, profile metrics, and payroll structures.
            </p>
          </div>

          <nav className="bg-bg-card border border-zinc-900 rounded-xl p-4 shadow-lg flex flex-col gap-1 text-xs">
            <p className="text-[9px] px-3 pb-2 text-zinc-600 uppercase tracking-widest font-bold">Workspace Navigation</p>
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full text-left px-3 py-2.5 rounded font-semibold tracking-wide uppercase transition cursor-pointer text-[10px] ${
                activeTab === 'overview' ? 'bg-zinc-900 text-brand-primary border border-zinc-800' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Dashboard Overview
            </button>

            {role === 'HR' && (
              <button
                onClick={() => setActiveTab('directory')}
                className={`w-full text-left px-3 py-2.5 rounded font-semibold tracking-wide uppercase transition cursor-pointer text-[10px] ${
                  activeTab === 'directory' ? 'bg-zinc-900 text-brand-primary border border-zinc-800' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Employee Directory
              </button>
            )}

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full text-left px-3 py-2.5 rounded font-semibold tracking-wide uppercase transition cursor-pointer text-[10px] ${
                activeTab === 'profile' ? 'bg-zinc-900 text-brand-primary border border-zinc-800' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {selectedEmployeeId ? 'Inspect Profile' : 'My Profile'}
            </button>

            <button
              onClick={() => setActiveTab('leaves')}
              className={`w-full text-left px-3 py-2.5 rounded font-semibold tracking-wide uppercase transition cursor-pointer text-[10px] ${
                activeTab === 'leaves' ? 'bg-zinc-900 text-brand-primary border border-zinc-800' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {selectedEmployeeId ? 'Inspect Leaves' : 'Leave Requests'}
            </button>

            <button
              onClick={() => setActiveTab('attendance')}
              className={`w-full text-left px-3 py-2.5 rounded font-semibold tracking-wide uppercase transition cursor-pointer text-[10px] ${
                activeTab === 'attendance' ? 'bg-zinc-900 text-brand-primary border border-zinc-800' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {selectedEmployeeId ? 'Inspect Shift Logs' : 'Attendance History'}
            </button>

            <button
              onClick={() => setActiveTab('payroll')}
              className={`w-full text-left px-3 py-2.5 rounded font-semibold tracking-wide uppercase transition cursor-pointer text-[10px] ${
                activeTab === 'payroll' ? 'bg-zinc-900 text-brand-primary border border-zinc-800' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {selectedEmployeeId ? 'Manage Salary' : 'My Payroll / Payslip'}
            </button>

            {role === 'HR' && (
              <>
                <div className="h-px bg-zinc-900 my-2" />
                <button
                  onClick={() => setActiveTab('approvals')}
                  className={`w-full text-left px-3 py-2.5 rounded font-semibold tracking-wide uppercase transition cursor-pointer text-[10px] ${
                    activeTab === 'approvals' ? 'bg-zinc-900 text-brand-primary border border-zinc-800' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Admin Approvals
                </button>
              </>
            )}
          </nav>
        </aside>

        <main className="flex-1 space-y-6">
          {selectedEmployeeId && (
            <div className="bg-zinc-950 border border-brand-primary/20 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs animate-fade-in font-sans">
              <div className="flex items-center gap-2">
                <span className="text-brand-primary font-black uppercase tracking-wider text-[9px] bg-brand-primary/10 border border-brand-primary/25 px-1.5 py-0.5 rounded">Review Mode</span>
                <span className="text-zinc-300 font-bold">Reviewing profile for: {selectedEmployeeName} ({selectedEmployeeId})</span>
              </div>
              <button 
                onClick={handleClearReview}
                className="px-3 py-1 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 font-bold uppercase rounded text-[9px] tracking-wider cursor-pointer transition active:scale-95"
              >
                Clear Review & Back to Personal
              </button>
            </div>
          )}

          {activeTab === 'overview' && (
            <div className="space-y-6">
              <AttendanceTracker />
              
              <div className="bg-bg-card border border-zinc-900 rounded-xl p-8 space-y-4 shadow-lg font-sans text-xs">
                <h3 className="text-sm font-bold tracking-wider text-brand-accent uppercase">Workday Alert Feed</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-zinc-950 border border-zinc-900 rounded flex gap-3 items-start">
                    <span className="text-status-success">●</span>
                    <div className="space-y-1">
                      <p className="text-zinc-300 font-semibold">Welcome to the HRMS Engine System</p>
                      <p className="text-[10px] text-zinc-500">System database synchronized. You can log check-ins, request leave balances, and review wage sheets directly.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'directory' && role === 'HR' && (
            <EmployeeDirectory 
              onSelectEmployee={handleSelectEmployee} 
              selectedEmployeeId={selectedEmployeeId} 
            />
          )}

          {activeTab === 'profile' && (
            <Profile 
              employeeId={selectedEmployeeId} 
              onProfileUpdated={() => {}} 
            />
          )}

          {activeTab === 'leaves' && (
            <div className="space-y-6">
              {!selectedEmployeeId && (
                <LeaveForm onLeaveApplied={() => setLeaveRefresh((prev) => prev + 1)} />
              )}
              <LeaveHistory 
                refreshTrigger={leaveRefresh} 
                employeeId={selectedEmployeeId} 
              />
            </div>
          )}

          {activeTab === 'attendance' && (
            <AttendanceHistory employeeId={selectedEmployeeId} />
          )}

          {activeTab === 'payroll' && (
            <PayrollManager 
              employeeId={selectedEmployeeId} 
              employeeName={selectedEmployeeName} 
            />
          )}

          {activeTab === 'approvals' && role === 'HR' && (
            <AdminDashboard />
          )}
        </main>
      </div>
    </div>
  );
};