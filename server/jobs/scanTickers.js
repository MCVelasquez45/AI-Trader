import cron from 'node-cron';
import mongoose from 'mongoose';
import { restClient } from '@polygon.io/client-js';
import { TradeScan } from '../models/TradeScan.js';

const polygon = restClient(process.env.POLY_API_KEY);
const tickerList = ['SOFI', 'AAPL', 'TSLA'];

const fetchAggregate = async (ticker) => {
  try {
    const data = await polygon.stocks.aggregates(
      ticker,
      1,
      'minute',
      new Date(Date.now() - 5 * 60 * 1000).toISOString().split('T')[0],
      new Date().toISOString().split('T')[0]
    );
    return data.results || [];
  } catch (error) {
    console.error(`Error fetching ${ticker}:`, error.message);
    return null;
  }
};

const scanTickers = async () => {
  console.log('⏱️ Starting ticker scan...');
  for (const ticker of tickerList) {
    const data = await fetchAggregate(ticker);
    if (data?.length) {
      await TradeScan.create({ ticker, candles: data });
      console.log(`📈 Saved ${ticker} data`);
    }
  }
  console.log('✅ Scan complete\n');
};

cron.schedule('*/5 * * * *', scanTickers);