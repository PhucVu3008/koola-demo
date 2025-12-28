/**
 * ============================================================================
 * DATABASE CONNECTION
 * ============================================================================
 *
 * Purpose:
 * - Establish a single MongoDB connection on startup
 * - Exit the process if the connection fails
 * ============================================================================
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Use the connection string from environment variables.
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // Fail fast so the server does not run without a database.
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
