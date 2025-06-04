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
app.use(express.json());

// ✅ Allow requests from localhost (dev) and Vercel frontend (prod)
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://ai-trader-uvj9.vercel.app'
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// ✅ Connect to MongoDB
connectDB().catch(err => {
  console.error('❌ MongoDB connection failed:', err);
  process.exit(1);
});

// ✅ Set up Polygon client
const POLYGON_API_KEY = process.env.POLYGON_API_KEY;
if (!POLYGON_API_KEY) {
  console.error('❌ FATAL: POLYGON_API_KEY missing from .env');
  process.exit(1);
}
const polygon = restClient(POLYGON_API_KEY);
app.set('polygon', polygon);

// ✅ Register API routes
app.use('/api', tradeRoutes);
app.use('/api', scrapeRoute);

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error('🔥 Error:', err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// ✅ Start server
const PORT = process.env.PORT || 4545;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
