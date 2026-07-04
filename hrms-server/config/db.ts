import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        // Fetch from process.env and provide a strict type guard fallback string
        const connURI = process.env.LOCAL_MONGO_URI || '';
        
        if (!connURI) {
            console.error('CRITICAL ERROR: MONGO_URI is missing in the environment configuration.');
            process.exit(1);
        }

        await mongoose.connect(connURI);
        console.log('Local MongoDB connected successfully');
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1); 
    }
};