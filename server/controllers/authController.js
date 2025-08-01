import User from '../models/UserModel.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = path.join(process.cwd(), 'uploads');

// Ensure the upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

export const upload = multer({ storage });

export const signup = async (req, res) => {
  const { name, email, password, bio, avatar } = req.body;
  console.log('📨 [Signup] Incoming payload:', req.body);

  try {
    // 🔍 Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      console.warn(`⚠️ [Signup] Email already registered: ${email}`);
      return res.status(400).json({ error: 'Email already registered' });
    }

    const avatarUrl = req.file
      ? `/uploads/${req.file.filename}`
      : avatar?.trim() || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`;

    // 🧠 Create user with defaults if necessary
    const newUser = new User({
      name: name?.trim(),
      email: email?.trim().toLowerCase(),
      password,
      bio: bio?.trim() || '💡 Dream big. Trade smart.',
      avatar: avatarUrl,
    });

    // 💾 Save to database
    const savedUser = await newUser.save();
    console.log('✅ [Signup] User saved successfully:', savedUser.email);

    // 🔐 Auto login
    req.login(savedUser, (err) => {
      if (err) {
        console.error('❌ [Signup] Auto-login error:', err);
        return res.status(500).json({ error: 'Login after signup failed' });
      }

      console.log(`🔓 [Signup] Auto-logged in user: ${savedUser.email}`);
      res.status(201).json({
        message: 'Signup successful',
        user: {
          _id: savedUser._id,
          googleId: savedUser.googleId,
          name: savedUser.name,
          email: savedUser.email,
          avatar: savedUser.avatar,
          bio: savedUser.bio,
          createdAt: savedUser.createdAt,
        },
      });
    });
  } catch (err) {
    console.error('❌ [Signup] Server error during signup:', err.message);
    res.status(500).json({ error: 'Server error during signup' });
  }
};

// 🔓 LOGIN CONTROLLER: Handles local user login
export const login = async (req, res, next) => {
  const { email, password } = req.body;
  console.log('📨 [Login] Attempted login with email:', email);

  try {
    const user = await User.findOne({ email });
    if (!user || !user.password) {
      console.warn('⚠️ [Login] Invalid credentials - user not found or no password');
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
      res.json({
        message: 'Login successful',
        user: {
          _id: user._id,
          googleId: user.googleId,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          bio: user.bio,
          createdAt: user.createdAt,
        }
      });
    });
  } catch (err) {
    console.error('❌ [Login] Server error:', err.message);
    res.status(500).json({ error: 'Server error during login' });
  }
};