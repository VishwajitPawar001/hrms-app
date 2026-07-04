import { Schema, model, Document } from 'mongoose';

export interface IAttendance extends Document {
    employeeId: string;
    date: string;
    checkInTime?: Date;
    checkOutTime?: Date;
    status: 'Present' | 'Absent' | 'Half-day' | 'Leave';
}

const AttendanceSchema = new Schema<IAttendance>({
    employeeId: { type: String, required: true },
    date: { type: String, required: true },
    checkInTime: { type: Date },
    checkOutTime: { type: Date },
    status: { type: String, enum: ['Present', 'Absent', 'Half-day', 'Leave'], default: 'Present' }
}, { timestamps: true });

AttendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

export const Attendance = model<IAttendance>('Attendance', AttendanceSchema);