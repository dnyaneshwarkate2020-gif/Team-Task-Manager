import mongoose from 'mongoose';

/**
 * Connect to MongoDB database
 * Handles connection errors and logs status
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    console.warn('Server will continue running, but database features will fail until the connection is resolved.');
    // process.exit(1); // Removed to prevent the backend from crashing
  }
};

export default connectDB;
