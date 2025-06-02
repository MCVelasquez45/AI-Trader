// /server/scrapers/scrapePoliticianProfile.js
import puppeteer from 'puppeteer';

/**
 * Scrapes a CapitolTrades politician profile for bio info
 * @param {string} profileUrl - Full URL like https://www.capitoltrades.com/politicians/G000596
 */
const scrapePoliticianProfile = async (profileUrl) => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  try {
    console.log(`🌐 Navigating to profile page: ${profileUrl}`);
    await page.goto(profileUrl, { waitUntil: 'networkidle2', timeout: 30000 });

    // Optionally wait for .bio element
    await page.waitForSelector('.bio', { timeout: 10000 }).catch(() => {
      console.warn(`⚠️ '.bio' selector not found on page: ${profileUrl}`);
    });

    const profileData = await page.evaluate(() => {
      const name = document.querySelector('h1')?.innerText || '';
      const partyState = document.querySelector('.subtitle')?.innerText || '';
      const committeeText = Array.from(document.querySelectorAll('.committee'))
        .map(el => el.innerText)
        .join(', ');
      const summaryBio = document.querySelector('.bio')?.innerText || '';

      return { name, partyState, committeeText, summaryBio };
    });

    console.log(`🧠 Scraped Profile from ${profileUrl}:\n`, profileData);
    return profileData;

  } catch (err) {
    console.error(`❌ Error scraping ${profileUrl}:`, err.message);
    return null;
  } finally {
    await browser.close();
  }
};

export default scrapePoliticianProfile;
