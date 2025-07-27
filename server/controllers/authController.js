import User from '../models/UserModel.js';

export const signup = async (req, res) => {
  const { name, email, password } = req.body;
  console.log('📨 Signup request:', req.body);

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const user = new User({ name, email, password });
    await user.save();

    req.login(user, (err) => {
      if (err) throw err;
      console.log('✅ New local user registered and logged in:', user.email);
      res.status(201).json({ message: 'Signup successful', user });
    });
  } catch (err) {
    console.error('❌ Signup error:', err.message);
    res.status(500).json({ error: 'Server error during signup' });
  }
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;
  console.log('📨 Login attempt:', email);

  try {
    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    req.login(user, (err) => {
      if (err) return next(err);
      console.log('✅ Local login success:', user.email);
      res.json({ message: 'Login successful', user });
    });
  } catch (err) {
    console.error('❌ Login error:', err.message);
    res.status(500).json({ error: 'Server error during login' });
  }
};