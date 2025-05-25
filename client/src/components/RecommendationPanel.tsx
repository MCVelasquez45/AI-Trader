import React from 'react';
import { Card, ListGroup } from 'react-bootstrap';
import { AnalysisData } from '../types/Analysis';

interface Props {
  analysis?: AnalysisData;
}

const RecommendationPanel: React.FC<Props> = ({ analysis }) => {
  if (!analysis) return null;

  const {
    option,
    entryPrice,
    targetPrice,
    stopLoss,
    gptResponse,
    sentimentSummary,
    congressTrades,
    confidence,
    recommendationDirection,
    expiryDate,
    indicators
  } = analysis;

  const rsi = indicators?.rsi;
  const vwap = indicators?.vwap;
  const macd = indicators?.macd;

  // 🎯 and 🛑 fallback logic
  const fallbackTarget = entryPrice ? `${(entryPrice * 1.05).toFixed(2)} (est.)` : 'N/A';
  const fallbackStop = entryPrice ? `${(entryPrice * 0.95).toFixed(2)} (est.)` : 'N/A';

  return (
    <Card className="m-3 shadow">
      <Card.Header>
        <span role="img" aria-label="ai">🤖</span> GPT Trade Recommendation
      </Card.Header>
      <Card.Body>
        <ListGroup variant="flush">
          <ListGroup.Item><strong>📣 Recommendation:</strong> {recommendationDirection?.toUpperCase() ?? 'N/A'}</ListGroup.Item>
          <ListGroup.Item><strong>💪 Confidence:</strong> {confidence ?? 'N/A'}</ListGroup.Item>
          <ListGroup.Item><strong>📅 Expiration Date:</strong> {expiryDate ? new Date(expiryDate).toLocaleDateString() : 'N/A'}</ListGroup.Item>

          <ListGroup.Item><strong>📈 Stock Price:</strong> ${entryPrice?.toFixed(2) ?? 'N/A'}</ListGroup.Item>
          <ListGroup.Item><strong>📍 Entry Price:</strong> ${entryPrice?.toFixed(2) ?? 'N/A'}</ListGroup.Item>
          <ListGroup.Item>
            <strong>🎯 Target Price:</strong>{' '}
            {targetPrice !== undefined && targetPrice !== null
              ? `$${targetPrice.toFixed(2)}`
              : fallbackTarget}
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>🛑 Stop Loss:</strong>{' '}
            {stopLoss !== undefined && stopLoss !== null
              ? `$${stopLoss.toFixed(2)}`
              : fallbackStop}
          </ListGroup.Item>

          <ListGroup.Item><strong>📊 RSI:</strong> {rsi !== undefined && rsi !== null ? `${rsi.toFixed(2)}` : 'N/A'}</ListGroup.Item>
          <ListGroup.Item><strong>📉 VWAP:</strong> {vwap !== undefined && vwap !== null ? `$${vwap.toFixed(2)}` : 'N/A'}</ListGroup.Item>
          <ListGroup.Item><strong>📊 MACD Histogram:</strong> {macd?.histogram !== undefined && macd?.histogram !== null ? `${macd.histogram.toFixed(2)}` : 'N/A'}</ListGroup.Item>

          {option && (
            <>
              <ListGroup.Item><strong>🎟️ Option Contract:</strong> {option.contract}</ListGroup.Item>
              <ListGroup.Item><strong>📌 Strike Price:</strong> ${option.strike}</ListGroup.Item>
              <ListGroup.Item><strong>📆 Option Expiration:</strong> {option.expiration}</ListGroup.Item>
              <ListGroup.Item><strong>💰 Estimated Cost:</strong> ${option.estimatedCost}</ListGroup.Item>
            </>
          )}
        </ListGroup>

        <hr />

        <h6 className="mt-3">🧠 GPT Summary</h6>
        <p>{gptResponse || 'N/A'}</p>

        <h6>🗞️ News Sentiment</h6>
        <p>{sentimentSummary || 'N/A'}</p>

        <h6>🏛️ Congressional Activity</h6>
        <pre style={{ whiteSpace: 'pre-wrap' }}>{congressTrades || 'N/A'}</pre>
      </Card.Body>
    </Card>
  );
};

export default RecommendationPanel;
