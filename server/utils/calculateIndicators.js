// Import specific technical indicators from the 'technicalindicators' library
const { RSI, MACD, VWAP } = require('technicalindicators');

/**
 * Calculates RSI, MACD, and VWAP based on historical candlestick data
 * @param {Array} candles - Array of candlestick objects from Polygon API (each includes o, h, l, c, v)
 * @returns {Object} An object with the latest RSI, MACD, and VWAP values
 */
function calculateIndicators(candles) {
  // Extract individual arrays for each price/volume type from the candle data
  const close = candles.map(c => c.c);   // closing prices
  const high = candles.map(c => c.h);    // high prices
  const low = candles.map(c => c.l);     // low prices
  const open = candles.map(c => c.o);    // open prices
  const volume = candles.map(c => c.v);  // volume data

  // 🟢 RSI (Relative Strength Index): measures momentum (overbought/oversold conditions)
  // Using a 14-period RSI, which is standard
  const rsi = RSI.calculate({ values: close, period: 14 }).slice(-1)[0];

  // 🔵 MACD (Moving Average Convergence Divergence): measures trend direction and strength
  const macdSeries = MACD.calculate({
    values: close,
    fastPeriod: 12,         // short-term EMA
    slowPeriod: 26,         // long-term EMA
    signalPeriod: 9,        // signal line EMA
    SimpleMAOscillator: false,
    SimpleMASignal: false
  });
  const macd = macdSeries.slice(-1)[0]; // Get the latest MACD value

  // 🟣 VWAP (Volume-Weighted Average Price): gives average price adjusted by volume
  const vwap = VWAP.calculate({ close, high, low, volume }).slice(-1)[0];

  // Return the latest values, rounding RSI and VWAP for display
  return {
    rsi: rsi?.toFixed(2),
    macd,
    vwap: vwap?.toFixed(2)
  };
}

// Export the function for use in the analyzeTrade controller
module.exports = calculateIndicators;
