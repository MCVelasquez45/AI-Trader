import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { restClient } from '@polygon.io/client-js';
import { connectDB } from './config/db.js';
import tradeRoutes from './routes/tradeRoutes.js';
import './jobs/scanTickers.js';

dotenv.config();

const app = express();
app.use(express.json());

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));


// Database connection
connectDB().catch(err => {
  console.error('❌ FATAL: MongoDB connection failed:', err);
  process.exit(1);
});

// ✅ FIXED: Use POLYGON_API_KEY instead
const POLYGON_API_KEY = process.env.POLYGON_API_KEY;
if (!POLYGON_API_KEY) {
  console.error('❌ FATAL: POLYGON_API_KEY missing from environment');
  process.exit(1);
}

const polygon = restClient(POLYGON_API_KEY);
app.set('polygon', polygon);

// Routes
app.use('/api', tradeRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error('🔥 Error:', err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

const PORT = process.env.PORT || 4545;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
