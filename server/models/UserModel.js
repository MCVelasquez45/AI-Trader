// ✅ models/User.js

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

// 🧬 Define the shape of a User document
const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    unique: true,
    sparse: true, // ✅ Allows null for users not using Google OAuth
  },
  name: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    unique: true, // 🔐 Email must be unique across all users
  },
  password: {
    type: String,
    minlength: 6, // ✅ Minimum password length for local users
  },
  avatar: {
    type: String,
    default: '', // ⬅️ fallback if no image is uploaded or generated
    trim: true,
  },
  bio: {
    type: String,
    default: '💡 Dream big. Trade smart.', // ✅ Fallback bio message
    trim: true,
  }
}, { timestamps: true }); // ⏱ Adds createdAt and updatedAt fields

// 🔐 Hash password before saving ONLY if modified
userSchema.pre('save', async function (next) {
  const user = this;

  if (!user.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    console.log('🔐 [UserSchema] Password hashed successfully');
    next();
  } catch (err) {
    console.error('❌ [UserSchema] Error hashing password:', err);
    next(err);
  }
});

// 🔎 Compare password during login (attach method to schema)
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log('🔍 [UserSchema] Password match result:', isMatch);
    return isMatch;
  } catch (err) {
    console.error('❌ [UserSchema] comparePassword error:', err);
    throw err;
  }
};

// ✅ Create and export model
const User = mongoose.model('User', userSchema);
export default User;