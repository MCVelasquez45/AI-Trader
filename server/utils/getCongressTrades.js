// utils/getCongressTrades.js
import axios from 'axios';

export default async function getCongressTrades(ticker) {
  const endpoint = 'https://house-stock-watcher-data.s3-us-west-2.amazonaws.com/data/all_transactions.json';

  try {
    const { data } = await axios.get(endpoint);

    const filtered = data
      .filter(tx =>
        tx.ticker?.toUpperCase() === ticker.toUpperCase() &&
        parseInt(tx.disclosure_year) >= 2023 &&
        ['purchase', 'sale', 'sale_partial'].includes(tx.type?.toLowerCase())
      )
      .sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date))
      .slice(0, 5); // You can increase this if needed

    if (!filtered.length) return 'No recent congressional trades.';

    return filtered.map(tx => {
      const typeLabel = tx.type?.toUpperCase().replace('_', ' ');
      return `- ${tx.representative} ${typeLabel} ${tx.amount} on ${tx.transaction_date} (${tx.state}, ${tx.party})`;
    }).join('\n');

  } catch (err) {
    console.error(`❌ Error fetching congressional trades for ${ticker}:`, err.message);
    return 'Unable to retrieve congressional trading data.';
  }
}
