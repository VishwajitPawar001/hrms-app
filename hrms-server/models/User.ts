import {Schema, model} from 'mongoose';

const UserSchema = new Schema({
    employeeId: {type: String, required: true, unique: true},
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    role: {type: String, enum: ['Employee', 'HR'], default: 'Employee', required: true},
    phone: {type: String, required: true,},
    address: {type: String, required: true},
    salaryStructure: {
        basic: {type: Number, default: 0},
        allowances: {type: Number, default: 0},
        deductions: {type: Number, default: 0}
    }
}, { timestamps: true});

export const User = model('User', UserSchema);