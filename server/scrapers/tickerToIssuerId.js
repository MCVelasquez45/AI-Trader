// /server/utils/tickerToIssuerId.js
import puppeteer from 'puppeteer';

/**
 * Uses Puppeteer to dynamically search CapitolTrades for a ticker symbol
 * and extract the internal issuerId (e.g., 435211 for TSLA).
 *
 * @param {string} ticker - Stock ticker symbol like "TSLA", "AAPL", etc.
 * @returns {Promise<string|null>} - Returns issuerId string or null if not found.
 */
export default async function tickerToIssuerId(ticker) {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  try {
    const searchUrl = `https://www.capitoltrades.com/issuers?search=${ticker}`;
    console.log(`🌐 Navigating to: ${searchUrl}`);
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });

    // Look for the first issuer's anchor tag and extract ID from href
    const issuerId = await page.evaluate(() => {
      const anchor = document.querySelector('.issuer-info a');
      if (!anchor || !anchor.href) return null;

      // Extract the numeric ID from the href, e.g. "/issuers/435211"
      const match = anchor.href.match(/\/issuers\/(\d+)/);
      return match ? match[1] : null;
    });

    if (!issuerId) {
      console.warn(`❌ Issuer ID not found for ${ticker}`);
      return null;
    }

    console.log(`✅ Found issuerId for ${ticker}: ${issuerId}`);
    return issuerId;

  } catch (err) {
    console.error(`❌ Puppeteer error while resolving issuerId for ${ticker}:`, err.message);
    return null;
  } finally {
    await browser.close();
  }
}
