import mongoose from "mongoose";

let isConnected = false;

/**
 * Connect to MongoDB Atlas.
 * Uses a cached connection so Vercel serverless doesn't open a new
 * connection on every request.
 */
const connectDB = async () => {
  if (isConnected) return;

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "cryptowhatif",
    });
    isConnected = true;
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    throw err;
  }
};

export default connectDB;
