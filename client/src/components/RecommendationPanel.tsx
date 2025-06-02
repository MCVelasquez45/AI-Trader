import React from 'react';
import { Card, ListGroup } from 'react-bootstrap';
import { AnalysisData } from '../types/Analysis';

interface Props {
  analysis?: AnalysisData;
}

const getUnderlyingSymbol = (optionTicker: string | undefined): string => {
  if (!optionTicker) return 'N/A';
  const parts = optionTicker.split(':');
  if (parts.length < 2) return optionTicker.toUpperCase();
  return parts[1].slice(0, 4).toUpperCase(); // Extracts "SOFI" from "SOFI250606..."
};

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

  const fallbackTarget = typeof entryPrice === 'number' ? `${(entryPrice * 1.05).toFixed(2)} (est.)` : 'N/A';
  const fallbackStop = typeof entryPrice === 'number' ? `${(entryPrice * 0.95).toFixed(2)} (est.)` : 'N/A';

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

          <ListGroup.Item><strong>📈 Stock Price:</strong> {typeof entryPrice === 'number' ? `$${entryPrice.toFixed(2)}` : 'N/A'}</ListGroup.Item>
          <ListGroup.Item><strong>📍 Entry Price:</strong> {typeof entryPrice === 'number' ? `$${entryPrice.toFixed(2)}` : 'N/A'}</ListGroup.Item>
          <ListGroup.Item>
            <strong>🎯 Target Price:</strong>{' '}
            {typeof targetPrice === 'number'
              ? `$${targetPrice.toFixed(2)}`
              : fallbackTarget}
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>🛑 Stop Loss:</strong>{' '}
            {typeof stopLoss === 'number'
              ? `$${stopLoss.toFixed(2)}`
              : fallbackStop}
          </ListGroup.Item>

          <ListGroup.Item><strong>📊 RSI:</strong> {typeof rsi === 'number' ? `${rsi.toFixed(2)}` : 'N/A'}</ListGroup.Item>
          <ListGroup.Item><strong>📉 VWAP:</strong> {typeof vwap === 'number' ? `$${vwap.toFixed(2)}` : 'N/A'}</ListGroup.Item>
          <ListGroup.Item><strong>📊 MACD Histogram:</strong> {typeof macd?.histogram === 'number' ? `${macd.histogram.toFixed(2)}` : 'N/A'}</ListGroup.Item>

          {option && (
            <>
              <ListGroup.Item><strong>🧾 Ticker Symbol:</strong> {getUnderlyingSymbol(option?.ticker)}</ListGroup.Item>
              <ListGroup.Item><strong>🎟️ Option Contract:</strong> {option?.ticker}</ListGroup.Item>
              <ListGroup.Item><strong>📌 Strike Price:</strong> ${option?.strike_price}</ListGroup.Item>
              <ListGroup.Item><strong>📆 Option Expiration:</strong> {option?.expiration_date}</ListGroup.Item>
              <ListGroup.Item><strong>💰 Estimated Cost:</strong> ${option?.midPrice?.toFixed(2) ?? 'N/A'}</ListGroup.Item>
            </>
          )}
        </ListGroup>

        <hr />

        <h6 className="mt-3">🧠 GPT Summary</h6>
        <p>{gptResponse || 'N/A'}</p>

        <h6>🗞️ News Sentiment</h6>
        <p>{sentimentSummary || 'N/A'}</p>

        <h6>🏛️ Congressional Activity</h6>
        {congressTrades ? (
          <pre style={{ whiteSpace: 'pre-wrap' }}>
            {congressTrades.split('\n').map((line, i) =>
              line.startsWith('Link:') ? (
                <div key={i}>
                  🔗 <a href={line.replace('Link: ', '')} target="_blank" rel="noopener noreferrer">{line.replace('Link: ', '')}</a>
                </div>
              ) : (
                <div key={i}>{line}</div>
              )
            )}
          </pre>
        ) : (
          <p>N/A</p>
        )}
      </Card.Body>
    </Card>
  );
};

export default RecommendationPanel;
