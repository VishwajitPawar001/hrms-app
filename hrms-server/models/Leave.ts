import {Schema, model} from 'mongoose';

const LeaveSchema = new Schema({
    employeeId: {type: String, required: true},
    leaveType: {type: String, enum: ['Paid', 'Sick', 'Unpaid'], required: true},
    startDate: {type: String, required: true},
    endDate: {type: String, required: true},
    remarks: {type: String},
    status: {type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending', required: true},
    adminComments: {type: String, default: ''}
}, {timestamps: true});

export const Leave = model('Leave', LeaveSchema);