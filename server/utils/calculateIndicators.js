// ✅ File: /server/utils/calculateIndicators.js

// 📦 Import indicators from technicalindicators
import { RSI, MACD, VWAP } from 'technicalindicators';

/**
 * 📊 Calculates RSI, MACD, and VWAP using historical candle data.
 * @param {Array} candles - Array of OHLCV data from getMinuteCandles.
 * @returns {Object} indicators - Object containing RSI, VWAP, and MACD values.
 */
export default function calculateIndicators(candles) {
  const indicators = {
    rsi: null,
    vwap: null,
    macd: {
      histogram: null,
      signal: null,
      macd: null
    }
  };

  // Extract arrays for each metric
  const closes = candles.map(c => c.c);
  const highs = candles.map(c => c.h ?? c.c);
  const lows = candles.map(c => c.l ?? c.c);
  const volumes = candles.map(c => c.v ?? 1000);

  // 🚫 Not enough data for proper calculation
  if (closes.length < 26) {
    console.warn('❌ Not enough candle data to calculate MACD, RSI, and VWAP (requires ≥ 26 candles)');
    return indicators;
  }

  // ✅ RSI (Relative Strength Index)
  try {
    const rsiResult = RSI.calculate({ values: closes, period: 14 });
    indicators.rsi = rsiResult.at(-1) ?? null;
    console.log(`📊 RSI calculated: ${indicators.rsi}`);
  } catch (err) {
    console.warn(`❌ RSI calculation failed:`, err.message);
  }

  // ✅ VWAP (Volume Weighted Average Price)
  try {
    const vwapResult = VWAP.calculate({
      close: closes,
      high: highs,
      low: lows,
      volume: volumes
    });
    const latestVWAP = vwapResult.at(-1);
    indicators.vwap = latestVWAP?.vwap ?? null;
    console.log(`📊 VWAP calculated: ${indicators.vwap}`);
  } catch (err) {
    console.warn(`❌ VWAP calculation failed:`, err.message);
  }

  // ✅ MACD (Moving Average Convergence Divergence)
  try {
    const macdResult = MACD.calculate({
      values: closes,
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9,
      SimpleMAOscillator: false,
      SimpleMASignal: false
    });
    const latest = macdResult.at(-1);
    if (latest) {
      indicators.macd = {
        macd: latest.MACD ?? null,
        signal: latest.signal ?? null,
        histogram: latest.histogram ?? null
      };
      console.log('📊 MACD calculated:', indicators.macd);
    }
  } catch (err) {
    console.warn(`❌ MACD calculation failed:`, err.message);
  }

  return indicators;
}
