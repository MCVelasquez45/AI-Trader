// ✅ File: server/config/db.js
import mongoose from 'mongoose';

/**
 * 📦 connectDB
 * Connects to MongoDB using the connection string in .env
 */
export const connectDB = async () => {
  try {
    // ⚙️ Recommended connection options for better compatibility
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true
    };

    // 🔌 Establish connection
    await mongoose.connect(process.env.MONGO_URI, options);

    // 🟢 Success log
    console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
  } catch (error) {
    // 🔴 Failure log
    console.error('❌ MongoDB connection error:', error.message);

    // 🚫 Exit process on failure
    process.exit(1);
  }
};
