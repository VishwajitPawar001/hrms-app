import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        const connURI = process.env.LOCAL_MONGO_URI || '';
        
        if (!connURI) {
            console.error('Error: MONGO_URI is not defined in the environment variables.');
            process.exit(1);
        }

        await mongoose.connect(connURI);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1); 
    }
};