import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async (): Promise<void> => {
    try {
        if (mongoose.connection.readyState >= 1) {
            console.log('[database]: MongoDB already connected');
            return;
        }

        const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/resume-builder';

        await mongoose.connect(mongoURI);

        console.log(`[database]: MongoDB Connected Successfully to ${mongoURI}`);
    } catch (error) {
        if (error instanceof Error) {
            console.error(`[database]: FATAL ERROR connecting to MongoDB: ${error.message}`);
            console.error(`[database]: Ensure MongoDB is running on port 27017 or check MONGO_URI`);
        }
        // process.exit(1); // Do not exit process in serverless environment
    }
};

export default connectDB;
