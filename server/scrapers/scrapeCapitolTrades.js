// /server/scrapers/scrapeCapitolTrades.js
import puppeteer from 'puppeteer';

/**
 * Scrapes congressional trade data from CapitolTrades for a given issuerId.
 * @param {string} issuerId - The internal CapitolTrades ID for a stock (e.g., '435211' for Tesla).
 * @returns {Promise<Array>} - Returns an array of trade objects: { date, representative, type, amount, link }
 */
const scrapeCapitolTrades = async (issuerId) => {
  // Launch a headless Chrome instance
  const browser = await puppeteer.launch({ headless: 'new' });

  // Open a new browser page/tab
  const page = await browser.newPage();

  // Navigate to the issuer's CapitolTrades profile
  const url = `https://www.capitoltrades.com/issuers/${issuerId}`;
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 }); // wait for network activity to settle

  // Scrape table rows from the trades table using in-page DOM access
  const trades = await page.evaluate(() => {
    // Select all rows in the trade table
    const rows = Array.from(document.querySelectorAll('table tbody tr'));

    // Extract structured trade info from each row
    return rows.map(row => {
      const columns = row.querySelectorAll('td');

      const representative = columns[0]?.innerText.trim() || '';     // Congress member's name
      const date = columns[2]?.innerText.trim() || '';               // Date traded
      const type = columns[4]?.innerText.trim().toLowerCase() || ''; // Buy or sell
      const amount = columns[5]?.innerText.trim() || '';             // Amount traded
      const link = row.querySelector('a')?.href || '';               // Link to detailed trade/filer page

      return {
        date,
        representative,
        type,
        amount,
        link
      };
    });
  });

  // Close the browser session to free resources
  await browser.close();

  console.log(`📊 Scraped ${trades.length} trades from issuer ${issuerId}`);
  return trades;
};

export default scrapeCapitolTrades;
