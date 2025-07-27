// ✅ Core imports
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from 'passport';

import { restClient } from '@polygon.io/client-js';
import { connectDB } from './config/db.js';
import tradeRoutes from './routes/tradeRoutes.js';
import scrapeRoutes from './routes/scraperRoutes.js';
import authRoutes from './routes/authRoutes.js'; // 🆕 Google Auth Routes
import cron from 'node-cron';
import evaluateExpiredTrades from './jobs/evaluateExpiredTrades.js'; // ✅ Cron task
import './jobs/scanTickers.js'; // 📈 Your ticker scanner
import './auth/passport.js'; // 🧠 Load Passport strategy

// ✅ Load environment variables from .env
dotenv.config();

const app = express();

// ✅ Debug route registration log
const originalUse = app.use.bind(app);
app.use = function (path, ...rest) {
  console.log('📍 Registering route:', path);
  return originalUse(path, ...rest);
};

// ✅ Define allowed frontend origins for CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://ai-trader-uvj9.vercel.app',
];

// ✅ Setup CORS for local + production + dynamic Vercel preview domains
app.use(cors({
  origin: function (origin, callback) {
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      /https:\/\/ai-trader-uvj9-.*\.vercel\.app/.test(origin)
    ) {
      callback(null, true);
    } else {
      console.warn('❌ Blocked by CORS:', origin);
      callback(new Error('CORS not allowed from this origin.'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // 🔐 Important for session cookies
}));

// ✅ Body parser middleware (for POST/PUT form data & JSON)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Session middleware (required for Passport.js to persist login state)
app.use(session({
  secret: process.env.SESSION_SECRET || 'defaultsecret', // 🔐 Use strong secret in production
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // ✅ Use true if behind HTTPS reverse proxy like Vercel/Render
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 // ⏱️ 1 day
  }
}));

// ✅ Initialize Passport for authentication
app.use(passport.initialize());
app.use(passport.session()); // 🍪 Supports persistent login via cookie session

// ✅ Health check route — root GET request
app.get('/', (req, res) => {
  res.send('🚀 AI-Trader API is running');
});

// ✅ Connect to MongoDB
await connectDB().catch(err => {
  console.error('❌ MongoDB connection failed:', err.message);
  process.exit(1); // Exit process on DB failure
});

// ✅ Polygon.io API Client setup
const POLYGON_API_KEY = process.env.POLYGON_API_KEY;
if (!POLYGON_API_KEY) {
  console.error('❌ Missing POLYGON_API_KEY in environment.');
  process.exit(1);
}
const polygon = restClient(POLYGON_API_KEY);

// ✅ Attach Polygon client to global app scope
app.set('polygon', polygon);

// ✅ Mount API + Auth Routes
// 🔐 Google login/logout/me/current-user routes available under /api/auth
app.use('/api/auth', authRoutes); // includes /current-user endpoint
app.use('/api', tradeRoutes);         // 📊 Trade recommendation & analysis
app.use('/api', scrapeRoutes);        // 🧠 CapitolTrades scraping, GPT sentiment

// ✅ Global error handling middleware
app.use((err, req, res, next) => {
  console.error('🔥 Global Error:', err.stack || err.message);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Unexpected server issue'
  });
});

// ✅ Run cron job every 15 minutes to check option expiry + outcomes
cron.schedule('*/15 * * * *', async () => {
  console.log('⏳ Cron triggered: Evaluating expired trades...');
  await evaluateExpiredTrades(); // 🧮 Updates trade outcome fields
});

// ✅ Start Express server
const PORT = process.env.PORT || 4545;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});