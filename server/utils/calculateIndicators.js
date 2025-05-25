import { RSI, MACD, VWAP } from 'technicalindicators';

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

  const closes = candles.map(c => c.c);
  const highs = candles.map(c => c.h ?? c.c);
  const lows = candles.map(c => c.l ?? c.c);
  const volumes = candles.map(c => c.v ?? 1000);

  if (closes.length < 26) {
    console.warn('❌ Not enough data points to calculate indicators');
    return indicators;
  }

  // ✅ RSI
  try {
    const rsiResult = RSI.calculate({ values: closes, period: 14 });
    indicators.rsi = rsiResult.at(-1) ?? null;
  } catch (err) {
    console.warn('❌ RSI calculation failed:', err.message);
  }

  // ✅ VWAP
  try {
    const vwapResult = VWAP.calculate({
      close: closes,
      high: highs,
      low: lows,
      volume: volumes
    });

    indicators.vwap = vwapResult.at(-1)?.vwap ?? null;
  } catch (err) {
    console.warn('❌ VWAP calculation failed:', err.message);
  }

  // ✅ MACD
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
    }
  } catch (err) {
    console.warn('❌ MACD calculation failed:', err.message);
  }

  return indicators;
}
