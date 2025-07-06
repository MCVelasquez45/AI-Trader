import React from 'react';
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
    indicators,
    breakEvenPrice,
    expectedROI
  } = analysis;

  const format = (val: number | undefined | null, prefix = '$') =>
    typeof val === 'number' ? `${prefix}${val.toFixed(2)}` : 'N/A';

  const fallbackTarget = entryPrice ? `${(entryPrice * 1.05).toFixed(2)} (est.)` : 'N/A';
  const fallbackStop = entryPrice ? `${(entryPrice * 0.95).toFixed(2)} (est.)` : 'N/A';

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-xl border border-gray-700">
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-2xl font-bold">
          Trade Analysis: <span className="text-blue-400">{option?.ticker || 'N/A'}</span>
        </h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          confidence === 'High' || confidence === 'Very High'
            ? 'bg-green-900/50 text-green-300'
            : confidence === 'Medium'
              ? 'bg-yellow-900/50 text-yellow-300'
              : 'bg-red-900/50 text-red-300'
        }`}>
          Confidence: {confidence}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-700/50 rounded-lg p-4">
          <h4 className="font-semibold text-lg mb-2">Recommendation</h4>
         <div
  className={`text-2xl font-bold ${
    recommendationDirection?.toLowerCase() === 'call'
      ? 'text-green-400'
      : recommendationDirection?.toLowerCase() === 'put'
        ? 'text-red-400'
        : 'text-gray-400'
  }`}
>
  {recommendationDirection?.toUpperCase() || 'N/A'}
</div>

        </div>
        <div className="bg-gray-700/50 rounded-lg p-4">
          <h4 className="font-semibold text-lg mb-2">Sentiment</h4>
          <div className="text-xl font-medium">{sentimentSummary || 'N/A'}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h4 className="font-semibold text-lg mb-2">📈 Entry Price</h4>
          <p>{format(entryPrice)}</p>
        </div>
        <div>
          <h4 className="font-semibold text-lg mb-2">🎯 Target Price</h4>
          <p>{targetPrice ? format(targetPrice) : fallbackTarget}</p>
        </div>
        <div>
          <h4 className="font-semibold text-lg mb-2">🛑 Stop Loss</h4>
          <p>{stopLoss ? format(stopLoss) : fallbackStop}</p>
        </div>
        <div>
          <h4 className="font-semibold text-lg mb-2">📊 Break-Even</h4>
          <p>{format(breakEvenPrice)}</p>
        </div>
        <div>
          <h4 className="font-semibold text-lg mb-2">📆 Expiry</h4>
          <p>{expiryDate ? new Date(expiryDate).toLocaleDateString() : 'N/A'}</p>
        </div>
        <div>
          <h4 className="font-semibold text-lg mb-2">💹 ROI</h4>
          <p>{expectedROI ? `${expectedROI}%` : 'N/A'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h4 className="font-semibold text-lg mb-2">📊 RSI</h4>
          <p>{indicators?.rsi?.toFixed(2) || 'N/A'}</p>
        </div>
        <div>
          <h4 className="font-semibold text-lg mb-2">💵 VWAP</h4>
          <p>{indicators?.vwap?.toFixed(2) || 'N/A'}</p>
        </div>
        <div>
          <h4 className="font-semibold text-lg mb-2">📈 MACD Histogram</h4>
          <p>{indicators?.macd?.histogram?.toFixed(2) || 'N/A'}</p>
        </div>
      </div>

      {option && (
        <div className="mb-6 space-y-2">
          <h4 className="text-lg font-semibold mb-2">🎟️ Option Details</h4>
          <p><strong>Type:</strong> {option.contract_type?.toUpperCase() || 'N/A'}</p>
          <p><strong>Strike:</strong> {format(option.strike_price)}</p>
          <p><strong>Expires:</strong> {new Date(option.expiration_date).toLocaleDateString()}</p>
          <p><strong>Cost:</strong> {format(option.ask ? option.ask * 100 : undefined)}</p>
          <p><strong>Delta:</strong> {option.delta?.toFixed(3) || 'N/A'}</p>
          <p><strong>Gamma:</strong> {option.gamma?.toFixed(3) || 'N/A'}</p>
          <p><strong>Theta:</strong> {option.theta?.toFixed(3) || 'N/A'}</p>
          <p><strong>Vega:</strong> {option.vega?.toFixed(3) || 'N/A'}</p>
          <p><strong>Open Interest:</strong> {option.open_interest || 'N/A'}</p>
        </div>
      )}

      <div className="border-t border-gray-700 pt-6 mt-6 space-y-4">
        <div>
          <h4 className="font-semibold text-lg mb-1">🧠 GPT Explanation</h4>
          <p className="text-gray-300">{gptResponse || 'No explanation available.'}</p>
        </div>
        <div>
          <h4 className="font-semibold text-lg mb-1">🏛️ Congressional Activity</h4>
          <pre className="bg-gray-900 p-4 rounded text-gray-300 whitespace-pre-wrap text-sm">
            {congressTrades || 'N/A'}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default RecommendationPanel;
