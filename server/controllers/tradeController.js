// ✅ controllers/tradeController.js

import getStockPrice from '../utils/getStockPrice.js';
import getMinuteCandles from '../utils/getMinuteCandles.js';
import calculateIndicators from '../utils/calculateIndicators.js';
import getAffordableOptionContracts from '../utils/getAffordableOptionContracts.js';
import { getOptionSnapshot } from '../utils/getOptionSnapshot.js';
import { runOptionAssistant } from '../utils/openaiAssistant.js';
import { TradeRecommendation } from '../models/TradeRecommendation.js';
import getNewsSentiment from '../utils/getNewsSentiment.js';
import getCongressTrades from '../utils/getCongressTrades.js';
import getIssuerId from '../scrapers/tickerToIssuerId.js';
import scrapeCapitolTrades from '../scrapers/scrapeCapitolTrades.js';
import dotenv from 'dotenv';
dotenv.config();

// 📈 Get aggregate data for a single ticker (daily candles)
export const getAggregate = async (req, res) => {
  const { ticker } = req.params;
  const polygon = req.app.get('polygon');

  try {
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 30);

    const data = await polygon.stocks.aggregates(
      ticker,
      1,
      "day",
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: `Failed to fetch data for ${ticker}` });
  }
};

// 📊 Get aggregate data for multiple tickers at once
export const getMultiAggregates = async (req, res) => {
  const { tickers } = req.body;
  const polygon = req.app.get('polygon');

  if (!Array.isArray(tickers)) {
    return res.status(400).json({ error: 'Tickers must be an array.' });
  }

  try {
    const results = await Promise.all(
      tickers.map(ticker =>
        polygon.stocks.aggregates(ticker, 1, "day", "2024-05-01", "2024-05-07")
          .then(data => ({ ticker, data }))
          .catch(error => ({ ticker, error: error.message }))
      )
    );
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch multiple aggregates' });
  }
};

export const getSummary = async (req, res) => {
  const { ticker } = req.params;
  const polygon = req.app.get('polygon');

  console.log(`🔍 getSummary (fallback) for: ${ticker}`);

  try {
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 2);

    const agg = await polygon.stocks.aggregates(
      ticker,
      1,
      "day",
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );

    if (!agg.results || agg.results.length === 0) {
      console.warn(`⚠️ No aggregate data returned for ${ticker}`);
    }

    const lastDay = agg.results?.at(-1) || null;
    const trade = await TradeRecommendation.findOne({ tickers: ticker }).sort({ createdAt: -1 });

    res.json({
      trade,
      quote: lastDay ? {
        open: lastDay.o,
        high: lastDay.h,
        low: lastDay.l,
        close: lastDay.c,
        volume: lastDay.v,
        date: new Date(lastDay.t).toISOString()
      } : null
    });

  } catch (error) {
    console.error('🔥 Fallback summary error:', error.message);
    res.status(500).json({ error: 'Summary fallback failed', message: error.message });
  }
};


export const validateTradeRequest = (req, res, next) => {
  const { tickers, capital, riskTolerance } = req.body;

  if (!Array.isArray(tickers)) {
    return res.status(400).json({ error: 'Tickers must be an array' });
  }

  if (typeof capital !== 'number' || capital <= 0) {
    return res.status(400).json({ error: 'Invalid capital amount' });
  }

  if (!['low', 'medium', 'high'].includes(riskTolerance)) {
    return res.status(400).json({ error: 'Invalid risk tolerance value' });
  }

  next();
};



export const analyzeTrade = async (req, res) => {
  try {
    const { capital, riskTolerance, watchlist } = req.body;
    const tickers = Array.isArray(watchlist) && watchlist.length > 0 ? watchlist : ['AAPL'];
    const apiKey = process.env.POLYGON_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Missing Polygon API key' });
    }

    const recommendations = [];

    for (const ticker of tickers) {
      console.log(`📊 Analyzing ${ticker}...`);
      const price = await getStockPrice(ticker);
      if (!price) {
        console.warn(`⚠️ Skipping ${ticker} — no stock price found.`);
        continue;
      }

      console.log(`💵 Current Price for ${ticker}: $${price}`);

      const candles = await getMinuteCandles(ticker);
      const indicators = await calculateIndicators(candles);
      const { rsi, vwap, macd } = indicators;
      console.log(`📈 Indicators for ${ticker} — RSI: ${rsi}, VWAP: ${vwap}, MACD Hist: ${macd?.histogram}`);

      const newsHeadlines = await getNewsSentiment(ticker);

      // 🏛️ Scrape trades via issuerId
      let congressActivity = 'Not available';
      try {
        const issuerId = await getIssuerId(ticker);
        const trades = await scrapeCapitolTrades(issuerId);

        if (trades.length > 0) {
          console.log(`📣 Raw Trades for Issuer ID ${issuerId}:\n`);
          trades.forEach((tx, idx) => {
            console.log(`#${idx + 1}`);
            console.log(`🧑 ${tx.representative}`);
            console.log(`📆 ${tx.date}`);
            console.log(`💼 ${tx.type?.toUpperCase()} for ${tx.amount}`);
            console.log(`🔗 ${tx.link}`);
            console.log('---');
          });

          congressActivity = trades.map(tx => (
            `${tx.representative} ${tx.type?.toUpperCase()} (${tx.amount}) on ${tx.date}\nLink: ${tx.link}`
          )).join('\n');
        } else {
          console.warn(`⚠️ No trades found for issuer ${issuerId}`);
          congressActivity = await getCongressTrades(ticker); // fallback
        }
      } catch (err) {
        console.warn(`❌ tickerToIssuerId error for ${ticker}:`, err.message);
        congressActivity = await getCongressTrades(ticker); // fallback
      }

      const sentimentPrompt = `
Summarize the sentiment of the following news headlines for ${ticker}. Just return one sentence like "The overall sentiment is positive", "neutral", or "negative".

Headlines:
${newsHeadlines}`.trim();

      let sentimentSummary = 'Not available';
      try {
        const sentimentResponse = await runOptionAssistant(sentimentPrompt);
        sentimentSummary = sentimentResponse.trim().replace(/^"|"$/g, '');
        console.log(`🧠 News Sentiment for ${ticker}: ${sentimentSummary}`);
      } catch (err) {
        console.warn(`⚠️ Failed to summarize sentiment for ${ticker}:`, err.message);
      }

      const { contracts } = await getAffordableOptionContracts({
        ticker,
        capital,
        riskTolerance,
        apiKey
      });

      if (!contracts?.length) {
        console.warn(`⚠️ No affordable options found for ${ticker}`);
        continue;
      }

      const best = contracts[0];
      const snapshot = await getOptionSnapshot(ticker, best.ticker);
      const snapshotText = snapshot
        ? `\nImplied Volatility: ${snapshot.implied_volatility ?? 'N/A'}\nDelta: ${snapshot.delta ?? 'N/A'}\nOpen Interest: ${snapshot.open_interest ?? 'N/A'}`
        : '';

      const prompt = `
You are a professional trading assistant. Consider technical indicators, news sentiment, and recent congressional trading activity when making a recommendation.

If recent congressional trades align with technical indicators, you may increase your confidence in the recommendation.

Analyze the following stock and recommend if a trader with a ${riskTolerance} risk tolerance should buy this CALL option. Estimate a reasonable target price and stop loss for the option trade based on the technical indicators and volatility.

Ticker: ${ticker}
Current Price: $${price.toFixed(2)}
Strike Price: $${best.strike_price}
Expiration Date: ${best.expiration_date}
Capital Available: $${capital}
Technical Indicators:
  - RSI: ${rsi}
  - VWAP: ${vwap}
  - MACD: ${macd?.macd}
  - MACD Signal: ${macd?.signal}
  - MACD Histogram: ${macd?.histogram}${snapshotText}

Recent News Headlines:
${newsHeadlines}

Congressional Trading Activity:
${congressActivity}`.trim();

      console.log(`📤 GPT Prompt for ${ticker}:\n${prompt}`);

      const gptResponse = await runOptionAssistant(prompt);
      console.log(`🤖 Raw GPT Response for ${ticker}:\n${gptResponse}`);

      let recommendation = null;
      let confidence = null;
      let explanation = gptResponse;
      let targetPrice = null;
      let stopLoss = null;

      try {
        let raw = gptResponse.trim();
        if (raw.startsWith("```json")) {
          raw = raw.replace(/^```json\n/, '').replace(/```$/, '').trim();
        }
        const parsed = JSON.parse(raw);
        recommendation = parsed.recommendation?.toLowerCase() ?? 'hold';
        confidence = parsed.confidence ?? 'low';
        explanation = parsed.explanation ?? gptResponse;
        targetPrice = parsed.targetPrice ?? Number((price * 1.1).toFixed(2));
        stopLoss = parsed.stopLoss ?? Number((price * 0.9).toFixed(2));
      } catch (err) {
        console.warn(`⚠️ GPT did not return valid JSON for ${ticker}, skipping.`);
        continue;
      }

      const trade = await TradeRecommendation.create({
        tickers: [ticker],
        capital,
        riskTolerance,
        entryPrice: price,
        expiryDate: best.expiration_date,
        option: best,
        gptPrompt: prompt,
        gptResponse: explanation,
        recommendationDirection: recommendation,
        confidence,
        indicators: { rsi, vwap, macd },
        congressTrades: congressActivity,
        sentimentSummary,
        targetPrice,
        stopLoss
      });

      console.log(`✅ Saved trade recommendation for ${ticker}`);
      recommendations.push(trade);
    }

    if (recommendations.length === 0) {
      return res.status(400).json({ error: 'No valid trades were generated' });
    }

    res.json({ message: 'Valid trade recommendations created', recommendations });
  } catch (err) {
    console.error('❌ Error in analyzeTrade:', err);
    res.status(500).json({ error: 'Trade analysis failed' });
  }
};
// 📋 Get all trade recommendations
export const getAllTrades = async (req, res) => {
  try {
    const trades = await TradeRecommendation.find().sort({ createdAt: -1 });
    res.json(trades);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trade history' });
  }
};

// ✅ Update a trade with its final outcome
export const updateTradeOutcome = async (req, res) => {
  const { id } = req.params;
  const { outcome, userNotes } = req.body;

  if (!['win', 'loss', 'pending'].includes(outcome)) {
    return res.status(400).json({ error: 'Invalid outcome value' });
  }

  try {
    const updated = await TradeRecommendation.findByIdAndUpdate(
      id,
      { outcome, userNotes },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: 'Trade not found' });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update trade outcome' });
  }
};
// ✅ Final tradeController.js

