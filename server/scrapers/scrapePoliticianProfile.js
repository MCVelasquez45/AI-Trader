// ✅ File: /server/scrapers/scrapePoliticianProfile.js

import puppeteer from 'puppeteer';

/**
 * 🧑‍⚖️ Scrapes biographical and committee info from a politician's CapitolTrades profile.
 * 
 * Example URL: https://www.capitoltrades.com/politicians/G000596
 * 
 * @param {string} profileUrl - The full profile URL for the politician.
 * @returns {Promise<Object|null>} - Returns profile data object or null if scraping fails.
 */
const scrapePoliticianProfile = async (profileUrl) => {
  // 🚀 Launch Puppeteer browser (headless by default)
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  try {
    console.log(`🌐 Navigating to profile page: ${profileUrl}`);
    
    // 🕸️ Load the profile page and wait for all network activity to finish
    await page.goto(profileUrl, { waitUntil: 'networkidle2', timeout: 30000 });

    // ⏳ Try waiting for the .bio element to appear (optional, may not always be present)
    await page.waitForSelector('.bio', { timeout: 10000 }).catch(() => {
      console.warn(`⚠️ '.bio' selector not found on page: ${profileUrl}`);
    });

    // 🔍 Scrape multiple fields from the politician's page
    const profileData = await page.evaluate(() => {
      // 🏷️ Extract the name (typically in <h1>)
      const name = document.querySelector('h1')?.innerText || '';

      // 🏛️ Party and state info (usually subtitle under the name)
      const partyState = document.querySelector('.subtitle')?.innerText || '';

      // 👥 Committees the politician is part of
      const committeeText = Array.from(document.querySelectorAll('.committee'))
        .map(el => el.innerText)
        .join(', ');

      // 📖 Short biographical description
      const summaryBio = document.querySelector('.bio')?.innerText || '';

      // Return all the collected data
      return { name, partyState, committeeText, summaryBio };
    });

    // ✅ Log and return the scraped profile info
    console.log(`🧠 Scraped Profile from ${profileUrl}:\n`, profileData);
    return profileData;

  } catch (err) {
    // ❌ Catch and log any scraping or navigation errors
    console.error(`❌ Error scraping ${profileUrl}:`, err.message);
    return null;
  } finally {
    // 🧹 Clean up: close the Puppeteer browser session
    await browser.close();
    console.log(`🔒 Browser closed after scraping profile: ${profileUrl}`);
  }
};

export default scrapePoliticianProfile;
