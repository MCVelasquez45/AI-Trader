// Reusable migration logic to normalize congressTrades
// Exports: migrateCongressTrades({ dryRun }) -> { scanned, updated, skipped, errors }

import TradeRecommendation from '../../models/TradeRecommendation.js';

// Parse legacy newline string into structured array
export function parseCongressString(text) {
  if (!text || typeof text !== 'string') return [];
  const items = [];
  const blocks = text
    .split(/\n\s*\n/)
    .map(b => b.trim())
    .filter(Boolean);

  for (const block of blocks) {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
    const nameLine = lines.find(l => l.startsWith('•')) || lines[0] || '';
    const metaLine = lines.find(l => /(BUY|SELL)\s*\(/i.test(l)) || '';
    const linkLine = lines.find(l => l.startsWith('🔗')) || '';

    const politician = nameLine.replace(/^•\s*/, '').trim();
    const transactionTypeMatch = metaLine.match(/(BUY|SELL)/i);
    const amountMatch = metaLine.match(/\(([^)]+)\)/);
    const dateMatch = metaLine.match(/on\s+(.+)$/i);
    const urlMatch = linkLine.match(/https?:\/\/\S+/);

    const obj = {
      politician: politician || undefined,
      transactionType: transactionTypeMatch ? transactionTypeMatch[1].toLowerCase() : undefined,
      amountRange: amountMatch ? amountMatch[1] : undefined,
      transactionDate: dateMatch ? new Date(dateMatch[1]).toISOString() : undefined,
      source: urlMatch ? urlMatch[0] : undefined,
    };

    if (
      obj.politician &&
      !obj.politician.toLowerCase().includes('unknown') &&
      obj.transactionType &&
      obj.amountRange &&
      obj.source && obj.source !== '#'
    ) {
      items.push(obj);
    }
  }
  return items;
}

// Normalize an array of possibly mixed/legacy objects
export function normalizeCongressArray(arr) {
  if (!Array.isArray(arr)) return [];
  return arr
    .map((t) => {
      if (t && typeof t === 'object') {
        if (t.politician || t.transactionType || t.amountRange || t.source) {
          return {
            politician: t.politician,
            transactionType: t.transactionType,
            amountRange: t.amountRange,
            transactionDate: t.transactionDate,
            source: t.source,
          };
        }
        if (t.representative || t.type || t.amount || t.link || t.date) {
          return {
            politician: t.representative,
            transactionType: t.type ? String(t.type).toLowerCase() : undefined,
            amountRange: t.amount,
            transactionDate: t.date ? new Date(t.date).toISOString() : undefined,
            source: t.link,
          };
        }
      }
      return null;
    })
    .filter(Boolean)
    .filter((ct) => {
      const pol = (ct.politician || '').toString().trim().toLowerCase();
      const type = (ct.transactionType || '').toString().trim();
      const amt = (ct.amountRange || '').toString().trim();
      const src = (ct.source || '').toString().trim();
      if (!pol || pol.includes('unknown')) return false;
      if (!type || type === 'N/A') return false;
      if (!amt || amt === 'N/A') return false;
      if (!src || src === '#') return false;
      return true;
    });
}

export async function migrateCongressTrades({ dryRun = false } = {}) {
  let scanned = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  const cursor = TradeRecommendation.find({
    $or: [
      { congressTrades: { $type: 'string' } },
      { congressTrades: { $type: 'array' } },
    ],
  }).cursor();

  for await (const doc of cursor) {
    scanned += 1;
    try {
      const orig = doc.congressTrades;
      let next = [];

      if (typeof orig === 'string') {
        next = parseCongressString(orig);
      } else if (Array.isArray(orig)) {
        next = normalizeCongressArray(orig);
      } else {
        skipped += 1;
        continue;
      }

      const origJSON = JSON.stringify(orig);
      const nextJSON = JSON.stringify(next);
      const shouldUpdate = origJSON !== nextJSON;
      if (!shouldUpdate) {
        skipped += 1;
        continue;
      }

      if (!dryRun) {
        doc.congressTrades = next;
        await doc.save();
      }
      updated += 1;
    } catch (e) {
      errors += 1;
    }
  }

  return { scanned, updated, skipped, errors, dryRun };
}

