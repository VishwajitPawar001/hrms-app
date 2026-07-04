import mongoose from 'mongoose';

const LOCAL_MONGO_URI = 'mongodb://localhost:27017/odoo_hrms';

export const connectDB = async () => {
  try {
    await mongoose.connect(LOCAL_MONGO_URI);
    console.log('Local MongoDB connected successfully on port 27017');
    // 🚨 Ensure there is NO process.exit() line here!
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1); // This should ONLY be in the catch block
  }
};