import axios from 'axios';
import dayjs from 'dayjs';
import { getOptionSnapshot } from './getOptionSnapshot.js';

/**
 * 🔁 Determine expiry search window based on user risk profile
 */
const getExpiryWindowByRisk = (riskTolerance) => {
  if (riskTolerance === 'low') return 90;     // Low risk → longer expiry
  if (riskTolerance === 'medium') return 30;  // Medium risk → mid-term expiry
  if (riskTolerance === 'high') return 14;    // High risk → short-term trades
  return 30; // Default fallback
};

/**
 * 🧠 Main option contract selector:
 * Fetches metadata, filters by capital, and selects viable + closest ITM/ATM
 */
export const getAffordableOptionContracts = async ({
  ticker,
  capital,
  riskTolerance,
  expiryWindowDays,
  apiKey = process.env.POLYGON_API_KEY,
  contractType = 'call'
}) => {
  try {
    console.log(`\n🚀 [getAffordableOptionContracts] Starting for: ${ticker}`);
    console.log(`🫮 Parameters — Capital: $${capital}, Risk: ${riskTolerance}, Type: ${contractType}`);

    // 🗓️ Setup expiry date window (based on user risk)
    const maxDays = expiryWindowDays ?? getExpiryWindowByRisk(riskTolerance);
    const today = dayjs();
    const expiryLimit = today.add(maxDays, 'day').format('YYYY-MM-DD');
    console.log(`📅 Expiry limit set to: ${expiryLimit} (${maxDays} days ahead)`);

    // 🔗 Construct Polygon reference API endpoint
    const endpoint = `https://api.polygon.io/v3/reference/options/contracts?underlying_ticker=${ticker}&expiration_date.lte=${expiryLimit}&contract_type=${contractType}&limit=1000&apiKey=${apiKey}`;
    console.log(`🌐 Fetching contract metadata from: ${endpoint}`);

    const { data } = await axios.get(endpoint);
    const results = data.results ?? [];

    console.log(`📦 Total Contracts Retrieved: ${results.length}`);
    if (!results.length) {
      console.warn(`⚠️ No contracts found for ${ticker}`);
      return { contracts: [], cheapestUnaffordable: null, closestITM: null };
    }

    const viable = []; // ✅ Contracts user can afford
    let cheapestUnaffordable = null; // 💸 Fallback if none are affordable
    let closestITM = null; // 🧢 Closest to ATM
    let closestDistance = Infinity;

    let stockPrice = null; // 💲 Needed to determine ATM proximity

    // 🔄 Loop through each contract from metadata
    for (const contract of results) {
      const { ticker: contractTicker, strike_price, expiration_date } = contract;
      console.log(`\n📁 Evaluating: ${contractTicker} | Strike: ${strike_price} | Exp: ${expiration_date}`);

      try {
        const snapshot = await getOptionSnapshot(ticker, contractTicker, apiKey);
        if (!snapshot) {
          console.warn(`⛔ Snapshot missing or invalid for ${contractTicker}`);
          continue;
        }

        const {
          delta, gamma, theta, vega,
          implied_volatility, open_interest,
          ask, bid, vwap, close, strike_price: snapStrike
        } = snapshot;

        if (!stockPrice && snapshot?.close) {
          stockPrice = close;
          console.log(`📈 Underlying stock price detected: $${stockPrice}`);
        }

        const useAsk = ask ?? vwap ?? null;
        const useBid = bid ?? vwap ?? null;

        if (useAsk === null || useBid === null || isNaN(useAsk) || isNaN(useBid)) {
          console.warn(`⚠️ Invalid pricing for ${contractTicker} — Ask: ${ask}, Bid: ${bid}, VWAP: ${vwap}`);
          continue;
        }

        const midPrice = (useAsk + useBid) / 2;
        const totalCost = midPrice * 100;
        console.log(`💰 Cost Estimation — MidPrice: $${midPrice.toFixed(2)} → Total: $${totalCost.toFixed(2)} vs Budget: $${capital}`);

        const missingFields = [];
        if (delta == null) missingFields.push('delta');
        if (gamma == null) missingFields.push('gamma');
        if (theta == null) missingFields.push('theta');
        if (vega == null) missingFields.push('vega');
        if (implied_volatility == null) missingFields.push('IV');
        if (strike_price == null) missingFields.push('strike_price');
        if (missingFields.length > 0) {
          console.warn(`⚠️ Skipping ${contractTicker} — Missing critical data: ${missingFields.join(', ')}`);
          continue;
        }

        const contractObj = {
          ticker: contractTicker,
          strike_price,
          expiration_date,
          contract_type: contractType,
          ask: useAsk,
          bid: useBid,
          delta,
          gamma,
          theta,
          vega,
          implied_volatility,
          open_interest,
          midPrice
        };

        if (totalCost <= capital) {
          console.log(`✅ Added to affordable list: ${contractTicker}`);
          viable.push(contractObj);
        } else {
          if (!cheapestUnaffordable || totalCost < cheapestUnaffordable.midPrice * 100) {
            console.log(`💡 Tracking fallback (unaffordable): ${contractTicker}`);
            cheapestUnaffordable = contractObj;
          }
        }

        // 🧢 Closest ITM/ATM contract (by price proximity)
        if (stockPrice) {
          const distance = Math.abs(strike_price - stockPrice);
          if (distance < closestDistance) {
            closestDistance = distance;
            closestITM = contractObj;
            console.log(`🎯 Closest ITM/ATM updated: ${contractTicker} | ∆: ${distance.toFixed(2)}`);
          }
        }

      } catch (err) {
        console.warn(`❌ Error evaluating ${contract.ticker}: ${err.message}`);
      }
    }

    viable.sort((a, b) => a.strike_price - b.strike_price);
    console.log(`\n✅ Final Results for ${ticker}`);
    console.log(`📊 Affordable Contracts: ${viable.length}`);
    if (closestITM) {
      console.log(`🎯 Closest ITM/ATM Contract: ${closestITM.ticker} | Strike: ${closestITM.strike_price}`);
    } else {
      console.warn(`⚠️ No closest ITM/ATM identified`);
    }

    return {
      contracts: viable,
      cheapestUnaffordable,
      closestITM
    };

  } catch (err) {
    console.error(`🔥 [getAffordableOptionContracts] Fatal Error: ${err.message}`);
    return {
      contracts: [],
      cheapestUnaffordable: null,
      closestITM: null
    };
  }
};
