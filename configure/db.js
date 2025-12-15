const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    if (!MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    // Check if already connected to avoid multiple connections in Next.js dev
    if (mongoose.connection.readyState >= 1) {
      console.log("DB already connected");
      return mongoose.connection;
    }

    const conn = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      family: 4, // force IPv4 for Windows DNS
    });

    console.log("DB connected");
    return conn;
  } catch (error) {
    console.error("DB connection error:", error);
    process.exit(1); // Exit process if DB connection fails
  }
};

module.exports = connectDB;
