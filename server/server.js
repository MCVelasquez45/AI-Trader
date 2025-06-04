// server/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { restClient } from '@polygon.io/client-js';
import { connectDB } from './config/db.js';
import tradeRoutes from './routes/tradeRoutes.js';
import scrapeRoutes from './routes/scraperRoutes.js';
import './jobs/scanTickers.js';

dotenv.config();

const app = express();

// ✅ Middleware
app.use(express.json());

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://ai-trader-uvj9.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// ✅ Connect to MongoDB
await connectDB().catch(err => {
  console.error('❌ MongoDB connection failed:', err.message);
  process.exit(1);
});

// ✅ Polygon.io client setup
const POLYGON_API_KEY = process.env.POLYGON_API_KEY;
if (!POLYGON_API_KEY) {
  console.error('❌ Missing POLYGON_API_KEY in environment.');
  process.exit(1);
}
const polygon = restClient(POLYGON_API_KEY);
app.set('polygon', polygon);

// ✅ Mount routes
app.use('/api', tradeRoutes);
app.use('/api', scrapeRoutes);

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error('🔥 Global Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Unexpected server issue'
  });
});

// ✅ Start server
const PORT = process.env.PORT || 4545;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
