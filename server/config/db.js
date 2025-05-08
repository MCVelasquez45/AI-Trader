// Import mongoose to handle MongoDB connections and schema management
const mongoose = require('mongoose');

/**
 * Asynchronously connects to MongoDB using the URI from your .env file
 */
const connectDB = async () => {
  try {
    // Attempt to connect to MongoDB using the provided URI in .env (MONGO_URI)
    const conn = await mongoose.connect(process.env.MONGO_URI);

    // Log a success message with the host information
    console.log(`🛢️ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // If the connection fails, log the error and exit the process
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1); // Exit with failure
  }
};

// Export the connectDB function so it can be used in server.js
module.exports = connectDB;
