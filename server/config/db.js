// ✅ File: server/config/db.js
import mongoose from 'mongoose';

/**
 * 📦 connectDB
 * Connects to MongoDB using the connection string in .env
 */
export const connectDB = async () => {
  try {
    // ⚙️ Mongoose v6+ handles most options internally — no need for useNewUrlParser or useUnifiedTopology
    // These options are now deprecated and can be safely removed.

    // 🔌 Establish connection (clean syntax with built-in defaults)
    await mongoose.connect(process.env.MONGO_URI);

    // 🟢 Success log
    console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
  } catch (error) {
    // 🔴 Failure log
    console.error('❌ MongoDB connection error:', error.message);

    // 🚫 Exit process on failure
    process.exit(1);
  }
};
