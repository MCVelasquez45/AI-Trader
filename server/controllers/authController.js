import User from '../models/UserModel.js';

// 🆕 SIGNUP CONTROLLER: Handles local user registration
export const signup = async (req, res) => {
  // Destructure with bio and avatar, add trace log
  const { name, email, password, bio, avatar } = req.body;
  console.log('📨 [Signup] Incoming request payload:', req.body);

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      console.warn('⚠️ [Signup] Email already registered:', email);
      return res.status(400).json({ error: 'Email already registered' });
    }

    // 🧠 Create new user with defaults if bio/avatar missing
    const user = new User({
      name,
      email,
      password,
      bio: bio || '💡 Dream big. Trade smart.',
      avatar: avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name),
    });

    await user.save();
    console.log('✅ [Signup] New user created:', user.email);

    // 🧩 Log user in immediately after signup
    req.login(user, (err) => {
      if (err) throw err;
      console.log('🔐 [Signup] User auto-logged in after signup:', user.email);
      res.status(201).json({ message: 'Signup successful', user });
    });
  } catch (err) {
    console.error('❌ [Signup] Server error:', err.message);
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
      res.json({ message: 'Login successful', user });
    });
  } catch (err) {
    console.error('❌ [Login] Server error:', err.message);
    res.status(500).json({ error: 'Server error during login' });
  }
};