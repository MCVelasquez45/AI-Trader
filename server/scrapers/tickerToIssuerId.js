// ✅ File: /server/utils/tickerToIssuerId.js

import puppeteer from 'puppeteer';

/**
 * 🔍 Resolves a CapitolTrades issuer ID from a stock ticker using Puppeteer.
 * 
 * Steps:
 * 1. Navigate to the CapitolTrades issuer search results page.
 * 2. Scrape the first result and extract the issuer ID from the anchor tag's href.
 * 
 * Example:
 *    TSLA → https://www.capitoltrades.com/issuers/435211 → "435211"
 * 
 * @param {string} ticker - A stock ticker symbol like "TSLA", "AAPL", or "SOFI".
 * @returns {Promise<string|null>} - Returns issuer ID (e.g., "435211") or null if not found.
 */
export default async function tickerToIssuerId(ticker) {
  // 🚀 Launch Puppeteer browser in headless mode (silent, no GUI)
  const browser = await puppeteer.launch({ headless: 'new' }); // 'new' = Chromium headless mode
  const page = await browser.newPage(); // 📄 Open a new browser tab

  try {
    const searchUrl = `https://www.capitoltrades.com/issuers?search=${ticker}`;
    console.log(`🌐 Navigating to: ${searchUrl}`);

    // 🕒 Go to the ticker search URL and wait for the network to become idle
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });

    // 🧠 Evaluate page content and extract the issuer ID
    const issuerId = await page.evaluate(() => {
      const anchor = document.querySelector('.issuer-info a'); // Get the first result's anchor link

      if (!anchor || !anchor.href) return null; // ❌ No valid anchor tag found

      // 🧮 Match and extract the issuer ID using a RegEx pattern
      const match = anchor.href.match(/\/issuers\/(\d+)/);
      return match ? match[1] : null;
    });

    // ❗ Log and return if no ID found
    if (!issuerId) {
      console.warn(`❌ Issuer ID not found for ${ticker}`);
      return null;
    }

    // ✅ Success
    console.log(`✅ Found issuerId for ${ticker}: ${issuerId}`);
    return issuerId;

  } catch (err) {
    // ❌ Catch and log Puppeteer or navigation errors
    console.error(`❌ Puppeteer error while resolving issuerId for ${ticker}:`, err.message);
    return null;
  } finally {
    // 🧹 Always close the browser
    await browser.close();
    console.log(`🔒 Browser instance closed after resolving ${ticker}`);
  }
}
