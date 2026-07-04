import mongoose from "mongoose";
import { log } from "node:console";

const LOCAL_MONGO_URI = 'mongodb://127.0.0.1:27017/odoo_hrms';

export const connectDB = async () => {
    try {
        await mongoose.connect(LOCAL_MONGO_URI);
        console.log("Local MongoDB connected successfully on port 27017");
    }

    catch (error) {
        console.error("Database connection failed:", error);
        process.exit(1);
    }

};