import { RSI, MACD, VWAP } from 'technicalindicators';

export default function calculateIndicators(candles) {
  if (!candles || candles.length < 14) {
    throw new Error('Minimum 14 data points required');
  }

  const close = candles.map(c => c.c);
  const high = candles.map(c => c.h);
  const low = candles.map(c => c.l);
  const volume = candles.map(c => c.v);

  // RSI Calculation
  const rsi = RSI.calculate({
    values: close,
    period: 14
  }).slice(-1)[0];

  // MACD Calculation
  const macd = MACD.calculate({
    values: close,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    SimpleMAOscillator: false,
    SimpleMASignal: false
  }).slice(-1)[0];

  // VWAP Calculation
  const vwap = VWAP.calculate({
    close,
    high,
    low,
    volume
  }).slice(-1)[0];

  return {
    rsi: rsi ? Number(rsi.toFixed(2)) : null,
    macd: {
      histogram: macd?.histogram ? Number(macd.histogram.toFixed(2)) : null,
      macd: macd?.MACD ? Number(macd.MACD.toFixed(2)) : null,
      signal: macd?.signal ? Number(macd.signal.toFixed(2)) : null
    },
    vwap: vwap ? Number(vwap.toFixed(2)) : null
  };
}