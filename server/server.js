// =============================
// ✅ server.js — Main Entry Point
// =============================

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { restClient } from '@polygon.io/client-js';
import { connectDB } from './config/db.js';
import tradeRoutes from './routes/tradeRoutes.js';
import scrapeRoute from './routes/scraperRoutes.js';
import './jobs/scanTickers.js'; // ⏱ Optional: Cron/interval job

// =============================
// 🔐 Load Environment Variables
// =============================
dotenv.config();

// =============================
// 🚀 Create Express App
// =============================
const app = express();

// =============================
// 🛡️ Middleware — Body Parser
// =============================
// Parses incoming JSON requests
app.use(express.json());

// =============================
// 🌐 Middleware — CORS Setup
// =============================
// Allows frontend to communicate with backend
app.use(cors({
  origin: [
    'http://localhost:5173',                // 🔁 Local Vite frontend
    'https://ai-trader-frontend.vercel.app' // 🌍 Vercel deployed frontend
  ],
  credentials: true
}));

// =============================
// 🌍 Connect to MongoDB Atlas
// =============================
connectDB().catch(err => {
  console.error('❌ FATAL: MongoDB connection failed:', err);
  process.exit(1); // Exit app if DB fails
});

// =============================
// 🔑 Polygon API Setup
// =============================
const POLYGON_API_KEY = process.env.POLYGON_API_KEY;
if (!POLYGON_API_KEY) {
  console.error('❌ FATAL: POLYGON_API_KEY missing from environment');
  process.exit(1);
}

// Attach Polygon client to app for shared access in routes
const polygon = restClient(POLYGON_API_KEY);
app.set('polygon', polygon); // ⛓ Makes Polygon client accessible via req.app.get('polygon')

// =============================
// 📦 API Routes
// =============================
app.use('/api', tradeRoutes);   // 🎯 Trade recommendations + results
app.use('/api', scrapeRoute);   // 🕸️ CapitolTrades scraping (e.g. /scrape/:ticker)

// =============================
// ❌ Global Error Handling
// =============================
app.use((err, req, res, next) => {
  console.error('🔥 Error:', err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// =============================
// 🚦 Start Server
// =============================
const PORT = process.env.PORT || 4545;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
