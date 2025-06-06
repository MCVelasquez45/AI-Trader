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

// 🔍 Debug app.use() to find malformed route paths
const originalUse = app.use.bind(app);
app.use = function (path, ...rest) {
  console.log('📍 Registering route:', path);
  return originalUse(path, ...rest);
};

// ✅ CORS Setup
const allowedOrigins = [
  'http://localhost:5173',
  'https://ai-trader-uvj9.vercel.app',
  'https://ai-trader-uvj9-qurp9efkm-mcvelasquez45s-projects.vercel.app',
  'https://ai-trader-uvj9.vercel.app/' // Optional duplicate
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('❌ Blocked by CORS:', origin);
      callback(new Error('CORS not allowed from this origin.'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// ✅ Preflight Support
app.use(cors());

// ✅ JSON Parser
app.use(express.json());

// ✅ Root Health Check
app.get('/', (req, res) => {
  res.send('🚀 AI-Trader API is running');
});

// ✅ MongoDB Connection
await connectDB().catch(err => {
  console.error('❌ MongoDB connection failed:', err.message);
  process.exit(1);
});

// ✅ Polygon.io Client Setup
const POLYGON_API_KEY = process.env.POLYGON_API_KEY;
if (!POLYGON_API_KEY) {
  console.error('❌ Missing POLYGON_API_KEY in environment.');
  process.exit(1);
}
const polygon = restClient(POLYGON_API_KEY);
app.set('polygon', polygon);

// ✅ API Routes
app.use('/api', tradeRoutes);
app.use('/api', scrapeRoutes);

// ✅ Error Handling
app.use((err, req, res, next) => {
  console.error('🔥 Global Error:', err.stack || err.message);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Unexpected server issue'
  });
});

// ✅ Start Server
const PORT = process.env.PORT || 4545;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
