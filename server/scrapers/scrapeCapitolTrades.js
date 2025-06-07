// /server/scrapers/scrapeCapitolTrades.js
import puppeteer from 'puppeteer';
import { executablePath } from 'puppeteer'; // ✅ Added to resolve headless Chromium on Render

/**
 * Scrapes congressional trade data from CapitolTrades for a given issuerId.
 * @param {string} issuerId - The internal CapitolTrades ID for a stock (e.g., '435211' for Tesla).
 * @returns {Promise<Array>} - Returns an array of trade objects: { date, representative, type, amount, link }
 */
const scrapeCapitolTrades = async (issuerId) => {
  // ✅ Launch a headless Chrome instance compatible with Render's environment
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: executablePath(), // 👈 use puppeteer-installed Chromium
    args: ['--no-sandbox', '--disable-setuid-sandbox'] // 👈 required in most serverless Linux containers
  });

  const page = await browser.newPage();

  const url = `https://www.capitoltrades.com/issuers/${issuerId}`;
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

  const trades = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('table tbody tr'));

    return rows.map(row => {
      const columns = row.querySelectorAll('td');

      const representative = columns[0]?.innerText.trim() || '';
      const date = columns[2]?.innerText.trim() || '';
      const type = columns[4]?.innerText.trim().toLowerCase() || '';
      const amount = columns[5]?.innerText.trim() || '';
      const link = row.querySelector('a')?.href || '';

      return {
        date,
        representative,
        type,
        amount,
        link
      };
    });
  });

  await browser.close();
  console.log(`📊 Scraped ${trades.length} trades from issuer ${issuerId}`);
  return trades;
};

export default scrapeCapitolTrades;
