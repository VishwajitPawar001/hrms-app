import { Schema, model, Document } from 'mongoose';

export interface ILeave extends Document {
    employeeId: string;
    leaveType: 'Casual' | 'Sick' | 'Maternity' | 'Paternity' | 'Unpaid';
    startDate: string; // Format: YYYY-MM-DD
    endDate: string;   // Format: YYYY-MM-DD
    reason: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    appliedAt: Date;
}

const LeaveSchema = new Schema<ILeave>({
    employeeId: { type: String, required: true },
    leaveType: { 
        type: String, 
        enum: ['Casual', 'Sick', 'Maternity', 'Paternity', 'Unpaid'], 
        required: true 
    },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    reason: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['Pending', 'Approved', 'Rejected'], 
        default: 'Pending' 
    }
}, { timestamps: true });

export const Leave = model<ILeave>('Leave', LeaveSchema);