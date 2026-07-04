import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  employeeId: { type: String, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Employee', 'HR'], default: 'Employee' },
  phone: { type: String },
  address: { type: String },
  panNo: { type: String, default: '' },
  uanNo: { type: String, default: '' },
  dateOfJoining: { type: Date, default: Date.now }
});

// Using clean modern Mongoose async middleware pattern.
// Mongoose automatically waits for the promise returned by async functions to resolve.
// Calling next() is not needed and will throw a TypeError because the first parameter is options.
userSchema.pre('save', async function (this: any) {
  if (!this.isNew) {
    return;
  }

  const currentYear = new Date().getFullYear();
  
  const nameParts = this.name.trim().split(' ');
  const firstNamePart = (nameParts[0] || 'XX').substring(0, 2).toUpperCase();
  const lastNamePart = (nameParts[1] || nameParts[0] || 'XX').substring(0, 2).toUpperCase();
  const nameInitials = `${firstNamePart}${lastNamePart}`;

  const startOfYear = new Date(currentYear, 0, 1);
  const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);
  
  const yearlyCount = await model('User').countDocuments({
    dateOfJoining: { $gte: startOfYear, $lte: endOfYear }
  });

  const serialNumber = String(yearlyCount + 1).padStart(4, '0');
  
  this.employeeId = `OI${nameInitials}${currentYear}${serialNumber}`;
});

export const User = model('User', userSchema);