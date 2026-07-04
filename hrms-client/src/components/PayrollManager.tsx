import React, { useState, useEffect, useCallback } from 'react';
import API from '../api/axiosInstance';

interface PayrollData {
  employeeId: string;
  wage: number;
  basic: number;
  hra: number;
  standardAllowance: number;
  performanceBonus: number;
  lta: number;
  fixedAllowance: number;
  deductions: number;
  netSalary: number;
}

interface PayrollManagerProps {
  employeeId?: string;
  employeeName?: string;
  onPayrollUpdated?: () => void;
}

export const PayrollManager: React.FC<PayrollManagerProps> = ({ employeeId, employeeName, onPayrollUpdated }) => {
  const [payroll, setPayroll] = useState<PayrollData | null>(null);
  const [sliderWage, setSliderWage] = useState<number>(50000);
  const [realTimeCalc, setRealTimeCalc] = useState<PayrollData | null>(null);
  const [myRole, setMyRole] = useState<string>('Employee');
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setMyRole(localStorage.getItem('emp_role') || 'Employee');
  }, []);

  const fetchPayroll = useCallback(async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const endpoint = employeeId ? `/api/payroll/admin/all` : '/api/payroll/my-salary';
      const response = await API.get(endpoint);
      
      let pData: PayrollData | null = null;
      if (employeeId) {
        const list: PayrollData[] = response.data?.payrolls || [];
        pData = list.find((item) => item.employeeId === employeeId) || null;
        
        if (!pData) {
          pData = {
            employeeId,
            wage: 50000,
            basic: 25000,
            hra: 12500,
            standardAllowance: 4167,
            performanceBonus: 4165,
            lta: 4167,
            fixedAllowance: 0,
            deductions: 3200,
            netSalary: 46800
          };
        }
      } else {
        pData = response.data?.payroll || response.data;
      }

      if (pData) {
        setPayroll(pData);
        setSliderWage(pData.wage);
      }
    } catch (error: any) {
      console.error('Failed to load payroll logs:', error);
      setMessage({ text: 'Unable to fetch payroll record from database.', isError: true });
    } finally {
      setIsLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    fetchPayroll();
  }, [fetchPayroll]);

  const computeRealTimeWage = useCallback((gross: number): PayrollData => {
    const basic = Math.round(gross * 0.5);
    const hra = Math.round(basic * 0.5);
    const standardAllowance = 4167;
    const performanceBonus = Math.round(gross * 0.0833);
    const lta = Math.round(gross * 0.08333);
    const calculatedSum = basic + hra + standardAllowance + performanceBonus + lta;
    const fixedAllowance = Math.round(gross - calculatedSum);
    const deductions = Math.round(basic * 0.12) + 200;
    const netSalary = Math.round(gross - deductions);

    return {
      employeeId: employeeId || '',
      wage: gross,
      basic,
      hra,
      standardAllowance,
      performanceBonus,
      lta,
      fixedAllowance,
      deductions,
      netSalary
    };
  }, [employeeId]);

  useEffect(() => {
    setRealTimeCalc(computeRealTimeWage(sliderWage));
  }, [sliderWage, computeRealTimeWage]);

  const handleUpdate = async () => {
    if (!employeeId) return;
    setMessage(null);
    try {
      const response = await API.put(`/api/payroll/admin/update/${employeeId}`, { wage: sliderWage });
      setPayroll(response.data?.payroll || response.data);
      setMessage({ text: 'Wage settings updated successfully.', isError: false });
      if (onPayrollUpdated) {
        onPayrollUpdated();
      }
    } catch (error: any) {
      setMessage({ text: error.response?.data?.error || 'Failed to update wage configurations.', isError: true });
    }
  };

  if (isLoading) {
    return (
      <div className="bg-bg-card border border-zinc-900 rounded-xl p-8 text-center text-zinc-500 font-sans">
        <p className="text-xs uppercase tracking-widest animate-pulse">Syncing payroll logs...</p>
      </div>
    );
  }

  const renderPayslip = (data: PayrollData, titleName: string) => {
    return (
      <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 md:p-8 space-y-6 shadow-md max-w-2xl mx-auto font-sans text-xs">
        <div className="flex justify-between items-start border-b border-zinc-900 pb-4">
          <div className="space-y-1">
            <h4 className="text-md font-bold tracking-wider text-brand-primary">SALARY STRUCTURE PAYSLIP</h4>
            <p className="text-[9px] tracking-widest text-zinc-500 font-bold uppercase">EMPLOYEE ID: {data.employeeId}</p>
            <p className="text-[10px] text-zinc-400 font-semibold">{titleName}</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] bg-brand-primary/10 border border-brand-primary/20 text-brand-accent px-2 py-0.5 rounded font-bold uppercase tracking-wider">Active Structure</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <h5 className="font-bold text-transparent bg-clip-text bg-gradient-to-b from-brand-accent to-brand-primary border-b border-zinc-900 pb-1.5 uppercase tracking-wider text-[10px]">Earnings (Monthly)</h5>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-zinc-500">Basic Salary</span>
                <span className="text-zinc-200 font-mono">₹{data.basic.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">House Rent Allowance (HRA)</span>
                <span className="text-zinc-200 font-mono">₹{data.hra.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Standard Allowance</span>
                <span className="text-zinc-200 font-mono">₹{data.standardAllowance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Performance Bonus</span>
                <span className="text-zinc-200 font-mono">₹{data.performanceBonus.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Leave Travel Allowance (LTA)</span>
                <span className="text-zinc-200 font-mono">₹{data.lta.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Fixed Allowance</span>
                <span className="text-zinc-200 font-mono">₹{data.fixedAllowance.toLocaleString()}</span>
              </div>
              <div className="h-px bg-zinc-900 my-1" />
              <div className="flex justify-between font-bold">
                <span className="text-zinc-400 uppercase tracking-wide">Gross Wage</span>
                <span className="text-brand-accent font-mono text-sm">₹{data.wage.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h5 className="font-bold text-status-danger border-b border-zinc-900 pb-1.5 uppercase tracking-wider text-[10px]">Deductions (Monthly)</h5>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-zinc-500">Provident Fund (PF @ 12%)</span>
                <span className="text-zinc-200 font-mono">₹{Math.round(data.basic * 0.12).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Professional Tax (PT)</span>
                <span className="text-zinc-200 font-mono">₹200</span>
              </div>
              <div className="h-px bg-zinc-900 my-1" />
              <div className="flex justify-between font-bold">
                <span className="text-zinc-400 uppercase tracking-wide">Total Deductions</span>
                <span className="text-status-danger font-mono">₹{data.deductions.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-900 rounded-xl p-4 mt-8 flex flex-col items-center justify-center text-center space-y-1.5">
              <p className="text-[10px] tracking-widest text-zinc-500 uppercase font-bold">Net Salary (Take-home)</p>
              <p className="text-2xl font-bold font-mono text-brand-primary">₹{data.netSalary.toLocaleString()}</p>
              <p className="text-[9px] text-zinc-600">Calculated after standard tax and statutory PF deductions.</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (myRole !== 'HR') {
    return payroll ? (
      <div className="space-y-6">
        {renderPayslip(payroll, 'My Financial Statement')}
      </div>
    ) : (
      <div className="bg-bg-card border border-zinc-900 rounded-xl p-8 text-center text-zinc-500 font-sans">
        <p className="text-xs uppercase tracking-widest">No payroll structure mapped for your ID.</p>
      </div>
    );
  }

  return (
    <div className="bg-bg-card border border-zinc-900 rounded-xl p-8 space-y-6 shadow-lg animate-slide-up">
      <div className="space-y-1 pb-4 border-b border-zinc-900">
        <h3 className="text-lg font-semibold text-zinc-200">Salary Management</h3>
        <p className="text-xs text-zinc-500">Adjust compensation profile for {employeeName || employeeId}.</p>
      </div>

      {message && (
        <div className={`p-4 rounded text-xs font-sans font-medium border transition-all duration-300 ${
          message.isError ? 'bg-status-danger/5 text-status-danger border-status-danger/20' : 'bg-brand-primary/5 text-brand-accent border-brand-primary/20'
        }`}>
          {message.text}
        </div>
      )}

      {realTimeCalc && (
        <div className="space-y-6">
          <div className="bg-zinc-950 p-6 border border-zinc-900 rounded-xl space-y-4 font-sans text-xs">
            <h4 className="font-bold text-zinc-300 uppercase tracking-widest text-[9px] text-brand-primary">Adjust Compensation Slider</h4>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <span className="text-zinc-400 font-medium">Target Base Wage (Gross)</span>
                <div className="flex items-center gap-3">
                  <span className="text-zinc-500">₹</span>
                  <input
                    type="number"
                    value={sliderWage}
                    onChange={(e) => setSliderWage(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-32 px-3 py-1.5 bg-bg-input border border-zinc-900 rounded text-zinc-200 text-right font-mono focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>
              <input
                type="range"
                min="10000"
                max="250000"
                step="500"
                value={sliderWage}
                onChange={(e) => setSliderWage(parseInt(e.target.value))}
                className="w-full h-1.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-brand-primary"
              />
              <div className="flex justify-between text-[9px] text-zinc-600 font-bold uppercase tracking-wider">
                <span>Min: ₹10,000</span>
                <span>Max: ₹2,50,000</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-bold uppercase tracking-wider text-[10px] text-zinc-400 pb-1 border-b border-zinc-900">Dynamic Adjustments (Earnings)</h4>
              <div className="space-y-2 text-xs font-sans">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Basic (50%)</span>
                  <span className="text-zinc-300 font-mono">₹{realTimeCalc.basic.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">HRA (50% of Basic)</span>
                  <span className="text-zinc-300 font-mono">₹{realTimeCalc.hra.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Standard Allowance (Fixed)</span>
                  <span className="text-zinc-300 font-mono">₹{realTimeCalc.standardAllowance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Performance Bonus (8.33%)</span>
                  <span className="text-zinc-300 font-mono">₹{realTimeCalc.performanceBonus.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">LTA (8.333%)</span>
                  <span className="text-zinc-300 font-mono">₹{realTimeCalc.lta.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Fixed Allowance</span>
                  <span className="text-zinc-300 font-mono">₹{realTimeCalc.fixedAllowance.toLocaleString()}</span>
                </div>
                <div className="h-px bg-zinc-900" />
                <div className="flex justify-between font-semibold">
                  <span className="text-zinc-400">Total Deductions</span>
                  <span className="text-status-danger font-mono">₹{realTimeCalc.deductions.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-sm pt-2">
                  <span className="text-brand-accent">Estimated Net Salary</span>
                  <span className="text-brand-primary font-mono">₹{realTimeCalc.netSalary.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold uppercase tracking-wider text-[10px] text-zinc-400 pb-1 border-b border-zinc-900">Current Salary Payslip</h4>
              {payroll ? (
                renderPayslip(payroll, `Compensation breakdown for ${employeeName || employeeId}`)
              ) : (
                <div className="p-8 border border-dashed border-zinc-900 rounded-xl text-center text-zinc-600">
                  <p className="text-xs uppercase tracking-widest">No compensation record saved yet.</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-zinc-900">
            <button
              onClick={handleUpdate}
              className="px-6 py-3.5 border border-brand-primary text-black bg-gradient-to-r from-brand-accent to-brand-primary font-bold tracking-widest uppercase rounded hover:brightness-110 active:scale-[0.98] transition cursor-pointer"
            >
              Submit Wage Configuration
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
