// Import required modules
const cron = require('node-cron');                        // To schedule tasks
const axios = require('axios');                           // (Optional) For external requests if needed
const fs = require('fs');                                 // (Not currently used — safe to remove if unused)
const path = require('path');                             // (Not currently used — safe to remove if unused)
const mongoose = require('mongoose');                     // For MongoDB interaction
const TradeScan = require('../models/TradeScan');         // Mongoose model to store scan data
const { restClient } = require('@polygon.io/client-js');  // Polygon.io client for stock data

// Initialize the Polygon API client using your API key from .env
const polygon = restClient(process.env.POLY_API_KEY);

// Define which tickers to monitor — can later pull from DB or config file
const tickerList = ['SOFI', 'AAPL', 'TSLA'];

/**
 * Fetch recent aggregate (candle) data for a given ticker
 * Uses the last 5-minute time window in "minute" granularity
 */
const fetchAggregate = async (ticker) => {
  try {
    const data = await polygon.stocks.aggregates(
      ticker,
      1, // 1-minute candles
      'minute',
      new Date(Date.now() - 5 * 60 * 1000).toISOString().split('T')[0], // start date
      new Date().toISOString().split('T')[0] // end date = today
    );
    return data.results || [];
  } catch (error) {
    console.error(`Error fetching data for ${ticker}:`, error.message);
    return null;
  }
};

/**
 * Main scanning job: loops over tickers, fetches their data,
 * and saves it to MongoDB using the TradeScan model.
 */
const scanTickers = async () => {
  console.log('⏱️ Starting scheduled ticker scan...');
  for (const ticker of tickerList) {
    const data = await fetchAggregate(ticker);
    if (data && data.length > 0) {
      await TradeScan.create({ ticker, candles: data });
      console.log(`📈 Saved scan data for ${ticker}`);
    } else {
      console.log(`⚠️ No data returned for ${ticker}`);
    }
  }
  console.log('✅ Scan complete.\n');
};

// Schedule scan to run every 5 minutes using cron syntax
// '*/5 * * * *' = every 5 minutes
cron.schedule('*/5 * * * *', scanTickers);

// Optional: export for manual triggering or testing
module.exports = scanTickers;
