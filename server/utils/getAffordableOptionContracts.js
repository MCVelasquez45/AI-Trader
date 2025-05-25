import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';
import dayjs from 'dayjs';
import { getOptionSnapshot } from './getOptionSnapshot.js';

// 🔍 Automatically set expiry window based on risk
const getExpiryWindowByRisk = (riskTolerance) => {
  if (riskTolerance === 'low') return 90;
  if (riskTolerance === 'medium') return 30;
  if (riskTolerance === 'high') return 14;
  return 30; // default fallback
};

const getAffordableOptionContracts = async ({
  ticker,
  capital,
  riskTolerance,
  expiryWindowDays,
  apiKey
}) => {
  const maxDays = expiryWindowDays ?? getExpiryWindowByRisk(riskTolerance);
  const today = dayjs();
  const expiryLimit = today.add(maxDays, 'day');

  const endpoint = `https://api.polygon.io/v3/reference/options/contracts?underlying_ticker=${ticker}&expiration_date.lte=${expiryLimit.format('YYYY-MM-DD')}&contract_type=call&limit=1000&apiKey=${apiKey}`;

  try {
    const { data } = await axios.get(endpoint);
    if (!data.results?.length) return { contracts: [] };

    const viable = [];

    for (const contract of data.results) {
      const { ticker: contractTicker, strike_price, expiration_date } = contract;
      try {
        const snapshot = await getOptionSnapshot(ticker, contractTicker, apiKey);
        if (!snapshot) continue;

        if (
          !snapshot.delta ||
          !snapshot.implied_volatility ||
          snapshot.open_interest === 0
        ) {
          console.warn(`⚠️ Skipping ${contractTicker}: missing greeks or open interest = 0`);
          continue;
        }

        const ask = snapshot.ask ?? snapshot.vwap ?? 1.5;
        const bid = snapshot.bid ?? snapshot.vwap ?? 1.2;
        const midPrice = (ask + bid) / 2;
        const totalCost = midPrice * 100;

        if (totalCost > capital) continue;

        viable.push({
          ticker: contractTicker,
          strike_price,
          expiration_date,
          midPrice,
          ask,
          bid,
          iv: snapshot.implied_volatility,
          delta: snapshot.delta,
          openInterest: snapshot.open_interest
        });

      } catch (err) {
        console.error(`❌ Snapshot failed for ${contractTicker}:`, err.message);
      }
    }

    viable.sort((a, b) => a.strike_price - b.strike_price);
    return { contracts: viable };

  } catch (err) {
    console.error(`❌ Failed to fetch contracts:`, err.message);
    return { contracts: [] };
  }
};

export default getAffordableOptionContracts;
