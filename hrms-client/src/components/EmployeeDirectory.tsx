import React, { useState, useEffect } from 'react';
import API from '../api/axiosInstance';

interface EmployeeProfile {
  _id: string;
  employeeId: string;
  name: string;
  email: string;
  role: 'Employee' | 'HR';
  phone?: string;
  address?: string;
}

interface AttendanceLog {
  employeeId: string;
  date: string;
  checkInTime: string;
  checkOutTime?: string;
}

interface LeaveRequest {
  employeeId: string;
  startDate: string;
  endDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

interface EmployeeDirectoryProps {
  onSelectEmployee: (employeeId: string, employeeName: string) => void;
  selectedEmployeeId?: string;
}

export const EmployeeDirectory: React.FC<EmployeeDirectoryProps> = ({ onSelectEmployee, selectedEmployeeId }) => {
  const [employees, setEmployees] = useState<EmployeeProfile[]>([]);
  const [attendanceToday, setAttendanceToday] = useState<AttendanceLog[]>([]);
  const [leavesAll, setLeavesAll] = useState<LeaveRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDirectoryData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [profilesRes, attendanceRes, leavesRes] = await Promise.all([
          API.get('/api/profile'),
          API.get('/api/attendance/admin/today'),
          API.get('/api/leave/admin/all')
        ]);

        setEmployees(profilesRes.data?.profiles || []);
        setAttendanceToday(attendanceRes.data?.attendance || attendanceRes.data || []);
        setLeavesAll(leavesRes.data?.leaves || []);
      } catch (err: any) {
        console.error('Failed to load directory details:', err);
        setError(err.response?.data?.error || 'Unable to sync organization directory.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDirectoryData();
  }, []);

  const getEmployeeStatus = (employeeId: string) => {
    const todayStr = new Date().toISOString().split('T')[0];

    const checkedIn = attendanceToday.some(
      (log) => log.employeeId === employeeId && log.date === todayStr
    );
    if (checkedIn) return 'Present';

    const onLeave = leavesAll.some(
      (leave) =>
        leave.employeeId === employeeId &&
        leave.status === 'Approved' &&
        todayStr >= leave.startDate &&
        todayStr <= leave.endDate
    );
    if (onLeave) return 'Leave';

    return 'Absent';
  };

  const getInitials = (nameStr: string) => {
    const parts = nameStr.trim().split(' ');
    const f = parts[0]?.substring(0, 1) || '';
    const l = parts[1]?.substring(0, 1) || '';
    return `${f}${l}`.toUpperCase();
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="bg-bg-card border border-zinc-900 rounded-xl p-8 text-center text-zinc-500 font-sans">
        <p className="text-xs uppercase tracking-widest animate-pulse">Syncing directory database record...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-bg-card border border-zinc-900 rounded-xl p-8 text-center text-status-danger font-sans">
        <p className="text-xs uppercase tracking-widest font-bold">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-bg-card border border-zinc-900 rounded-xl p-6 shadow-md">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-zinc-200">Employee Directory</h3>
          <p className="text-xs text-zinc-500">Search profiles, view active work status, and review details.</p>
        </div>
        <div className="w-full sm:max-w-xs font-sans">
          <input
            type="text"
            placeholder="Search name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 bg-zinc-950 border border-zinc-900 rounded text-zinc-200 text-xs placeholder-zinc-700 focus:outline-none focus:border-brand-primary transition"
          />
        </div>
      </div>

      {filteredEmployees.length === 0 ? (
        <div className="bg-bg-card border border-zinc-900 rounded-xl p-12 text-center text-zinc-600 font-sans">
          <p className="text-xs uppercase tracking-widest">No matching employees found in directory.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((emp) => {
            const status = getEmployeeStatus(emp.employeeId);
            const isSelected = selectedEmployeeId === emp.employeeId;
            return (
              <div
                key={emp._id}
                onClick={() => onSelectEmployee(emp.employeeId, emp.name)}
                className={`relative bg-bg-card border rounded-xl p-5 flex items-center gap-4 cursor-pointer hover:border-brand-primary hover:bg-zinc-900/10 transition-all duration-300 shadow-md ${
                  isSelected ? 'border-brand-primary bg-zinc-900/20' : 'border-zinc-900'
                }`}
              >
                <div className="absolute top-3 right-3 flex items-center justify-center">
                  {status === 'Present' && (
                    <span className="w-2.5 h-2.5 rounded-full bg-status-success shadow-lg shadow-status-success/30 animate-pulse" title="Present" />
                  )}
                  {status === 'Leave' && (
                    <span className="text-xs" title="On Leave">✈️</span>
                  )}
                  {status === 'Absent' && (
                    <span className="w-2.5 h-2.5 rounded-full bg-status-warning shadow-lg shadow-status-warning/30" title="Offline / Absent" />
                  )}
                </div>

                <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 text-brand-accent flex items-center justify-center text-sm font-bold shadow-inner">
                  {getInitials(emp.name)}
                </div>

                <div className="space-y-1 font-sans text-xs">
                  <h4 className="font-semibold text-zinc-200 truncate max-w-[150px]">{emp.name}</h4>
                  <p className="text-[9px] tracking-widest text-zinc-500 font-bold uppercase">{emp.employeeId}</p>
                  <p className="text-[10px] text-zinc-500 font-mono truncate max-w-[150px]">{emp.email}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
