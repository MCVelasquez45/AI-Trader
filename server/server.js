import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { restClient } from '@polygon.io/client-js';
import { connectDB } from './config/db.js';
import tradeRoutes from './routes/tradeRoutes.js';
import scrapeRoute from './routes/scraperRoutes.js';
import './jobs/scanTickers.js';

dotenv.config();

const app = express();

// ✅ Enable JSON parsing for incoming requests
app.use(express.json());

// ✨ FULL fix for CORS issues
app.use(cors({
  origin: [
    'http://localhost:5173',            // for local dev
    'https://ai-trader-uvj9.vercel.app' // for deployed frontend
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ✅ Connect to MongoDB Atlas
connectDB().catch(err => {
  console.error('❌ FATAL: MongoDB connection failed:', err);
  process.exit(1);
});

// ✅ Get Polygon.io API key from environment
const POLYGON_API_KEY = process.env.POLYGON_API_KEY;
if (!POLYGON_API_KEY) {
  console.error('❌ FATAL: POLYGON_API_KEY missing from environment');
  process.exit(1);
}

// ✅ Set Polygon client on app instance
const polygon = restClient(POLYGON_API_KEY);
app.set('polygon', polygon);

// ✅ Register API routes
app.use('/api', tradeRoutes);
app.use('/api', scrapeRoute);

// ✅ Global error handler for all unhandled errors
app.use((err, req, res, next) => {
  console.error('🔥 Error:', err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// ✅ Start the server
const PORT = process.env.PORT || 4545;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
