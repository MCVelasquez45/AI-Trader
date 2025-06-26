// ✅ File: /server/scrapers/scrapeCapitolTrades.js

import puppeteer from 'puppeteer';
import { executablePath } from 'puppeteer';

/**
 * 📊 Scrapes congressional trades from CapitolTrades.com for a specific issuer.
 * 
 * Workflow:
 * 1. Launch Puppeteer browser in headless mode.
 * 2. Navigate to the CapitolTrades issuer detail page.
 * 3. Scrape trade data from the HTML table.
 * 4. Return structured trade data or empty array on error.
 * 
 * @param {string} issuerId - Unique ID from CapitolTrades (e.g., "2334511" for SOFI).
 * @returns {Promise<Array>} - Array of trade objects { representative, date, type, amount, link }
 */
const scrapeCapitolTrades = async (issuerId) => {
  const url = `https://www.capitoltrades.com/issuers/${issuerId}`;
  console.log(`🌐 Visiting CapitolTrades URL: ${url}`);

  let browser; // We'll assign this later so we can close it in `finally`

  try {
    // 🧭 Launch Puppeteer browser
    browser = await puppeteer.launch({
      headless: true, // Run without UI
      executablePath: executablePath(), // Use system default Chromium
      args: ['--no-sandbox', '--disable-setuid-sandbox'] // Required in many Linux environments
    });

    // 🌐 Open a new browser tab
    const page = await browser.newPage();

    // 🕒 Navigate to the page and wait until the network is idle
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    console.log(`✅ Page loaded for issuer ${issuerId}`);

    // 🧹 Scrape trade rows from table using page.evaluate
    const trades = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('table tbody tr'));

      return rows.map(row => {
        const columns = row.querySelectorAll('td');

        // 🗃️ Extract clean values from each column
        const representative = columns[0]?.innerText.trim() || '';
        const date = columns[2]?.innerText.trim() || '';
        const type = columns[4]?.innerText.trim().toLowerCase() || '';
        const amount = columns[5]?.innerText.trim() || '';
        const link = row.querySelector('a')?.href || '';

        return { date, representative, type, amount, link };
      });
    });

    console.log(`📊 Scraped ${trades.length} trades from issuer ${issuerId}`);
    return trades;

  } catch (err) {
    // ❌ Catch and log any scraping errors
    console.error(`❌ Error scraping CapitolTrades for issuer ${issuerId}: ${err.message}`);
    return [];
  } finally {
    // 🧹 Always close the browser, even if error occurs
    if (browser) {
      await browser.close();
      console.log(`🔒 Browser instance closed`);
    }
  }
};

export default scrapeCapitolTrades;
