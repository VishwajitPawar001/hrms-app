import {Schema, model} from 'mongoose';

const AttendanceSchema = new Schema ({
    employeeId: {type: String, required: true},
    date: {type: String, required: true},
    checkInTime: {type: Date},
    checkOutTime: {type: Date},
    status: {type: String, enum: ['Present', 'Absent', 'Half-day', 'Leave'], default: true}
}, {timestamps: true})

AttendanceSchema.index({ employeeId: 1, date:1}, {unique: true});

export const Attendance = model('Attendance', AttendanceSchema);