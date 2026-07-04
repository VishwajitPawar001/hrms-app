import { Schema, model, Document } from 'mongoose';

export interface IPayroll extends Document {
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

const PayrollSchema = new Schema<IPayroll>(
  {
    employeeId: { type: String, required: true, unique: true },
    wage: { type: Number, required: true, default: 50000 },
    basic: { type: Number, required: true },
    hra: { type: Number, required: true },
    standardAllowance: { type: Number, required: true, default: 4167 },
    performanceBonus: { type: Number, required: true },
    lta: { type: Number, required: true },
    fixedAllowance: { type: Number, required: true },
    deductions: { type: Number, required: true },
    netSalary: { type: Number, required: true }
  },
  { timestamps: true }
);

// Pre-save validation & calculation middleware to keep data structurally synchronized.
// Defined with zero parameters so Mongoose executes it synchronously without passing a callback.
PayrollSchema.pre('save', function (this: any) {
  const wage = this.wage;
  this.basic = Math.round(wage * 0.5);
  this.hra = Math.round(this.basic * 0.5);
  this.standardAllowance = 4167;
  this.performanceBonus = Math.round(wage * 0.0833);
  this.lta = Math.round(wage * 0.08333);
  
  const calculatedSum = this.basic + this.hra + this.standardAllowance + this.performanceBonus + this.lta;
  this.fixedAllowance = Math.round(wage - calculatedSum);
  
  this.deductions = Math.round(this.basic * 0.12) + 200; // 12% PF rate of basic + 200 flat Professional Tax
  this.netSalary = Math.round(wage - this.deductions);
});

export const Payroll = model<IPayroll>('Payroll', PayrollSchema);
