// 🌐 Core server modules
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// 📦 Custom modules
const connectDB = require('./config/db');           // MongoDB connection
const tradeRoutes = require('./routes/tradeRoutes'); // Main trade API routes
require('./jobs/scanTickers');                       // Scheduled ticker scanner job

// 📊 Polygon.io client setup
const { restClient } = require('@polygon.io/client-js');

// 🔐 Load environment variables from .env file
dotenv.config();

// 🔧 Initialize Express app
const app = express();

// Enable JSON parsing and CORS support
app.use(express.json());
app.use(cors());

// 🛢️ Connect to MongoDB using Mongoose
connectDB();

// 🔗 Set up Polygon client using your API key
const polygon = restClient(process.env.POLY_API_KEY);

// ✅ Log env variables to confirm they're loaded (useful for debugging)
console.log("🧪 ENV check (backend)");
console.log("POLY_API_KEY:", process.env.POLY_API_KEY ? '✔️ loaded' : '❌ missing');
console.log("OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? '✔️ loaded' : '❌ missing');
console.log("MONGO_URI:", process.env.MONGO_URI ? '✔️ loaded' : '❌ missing');

// Make Polygon client accessible to all controllers via app context
app.set('polygon', polygon);

// 📘 Mount trade-related routes under the `/api` prefix
app.use('/api', tradeRoutes);

// 🚀 Start the Express server
app.listen(4545, () => {
  console.log('✅ Express server running on http://localhost:4545');
});
