import path from 'path';
import fs from 'fs';
import User from '../models/UserModel.js';

// 🆕 SIGNUP CONTROLLER: Handles local user registration
export const signup = async (req, res) => {
  const { name, password, bio } = req.body;
  const email = req.body.email?.toLowerCase();
  let avatarUrl = '';

  if (req.file) {
    const filename = `${Date.now()}-${req.file.originalname}`;
    const savePath = path.join('uploads', filename);
    if (req.file.buffer) fs.writeFileSync(savePath, req.file.buffer);
    avatarUrl = `/uploads/${filename}`;
    console.log('📸 [Signup] Avatar uploaded to:', avatarUrl);
  }
  console.log('📨 [Signup] Incoming request payload:', req.body);

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      console.warn('⚠️ [Signup] Email already registered:', email);
      return res.status(400).json({ error: 'Email already registered' });
    }

    const user = new User({
      name,
      email,
      password,
      bio: bio || '💡 Dream big. Trade smart.',
      avatar: avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`,
    });

    await user.save();
    console.log('✅ [Signup] New user created:', user.email);

    req.login(user, (err) => {
      if (err) throw err;
      console.log('🔐 [Signup] User auto-logged in after signup:', user.email);
      console.log('📤 [Signup] Response sent to client with user:', user.email);
      res.status(201).json({ success: true, message: 'Signup successful', user });
    });
  } catch (err) {
    console.error('❌ [Signup] Server error:', err.message);
    if (err.code === 11000 && err.keyPattern?.googleId) {
      console.warn('⚠️ [Signup] Duplicate Google ID — skipping for local user');
      return res.status(400).json({ error: 'Google ID must be unique' });
    }
    res.status(500).json({ error: 'Server error during signup' });
  }
};

// 🔓 LOGIN CONTROLLER: Handles local user login
export const login = async (req, res, next) => {
  const email = req.body.email?.toLowerCase();
  const password = req.body.password;
  console.log('📨 [Login] Attempted login with email:', email);

  try {
    const user = await User.findOne({ email });
    if (!user || !user.password) {
      console.warn('⚠️ [Login] Invalid credentials - user not found or no password');
      console.warn('🔒 [Login] Login attempt failed - credentials issue');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.warn('⚠️ [Login] Password mismatch for user:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    req.login(user, (err) => {
      if (err) return next(err);
      console.log('✅ [Login] Login successful for user:', user.email);
      console.log('📤 [Login] Response sent to client with user:', user.email);
      res.json({ success: true, message: 'Login successful', user });
    });
  } catch (err) {
    console.error('❌ [Login] Server error:', err.message);
    res.status(500).json({ error: 'Server error during login' });
  }
};