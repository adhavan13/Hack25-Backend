import { chromium } from 'playwright';
import fs from 'fs-extra';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'services', 'rag', 'data');
await fs.ensureDir(DATA_DIR);

const OUTPUT_FILE = path.join(DATA_DIR, 'kochicorporation_sections.json');
const URL = 'https://en.wikipedia.org/wiki/Kochi_Municipal_Corporation';

async function scrapeKochiSections() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(URL, { waitUntil: 'domcontentloaded' });

  // Grab all content inside the main article container
  const data = await page.evaluate(() => {
    const container = document.querySelector('#mw-content-text .mw-parser-output');
    if (!container) return [];

    const sections = [];
    let currentSection = null;

    container.querySelectorAll('h2, h3, p, ul, ol, table').forEach(el => {
      if (el.tagName.match(/^H[2-3]$/)) {
        // Start a new section
        const heading = el.innerText.replace('[edit]', '').trim();
        currentSection = { heading, content: [] };
        sections.push(currentSection);
      } else if (currentSection) {
        // Capture text content
        if (el.tagName === 'P') {
          const text = el.innerText.trim();
          if (text) currentSection.content.push({ type: 'paragraph', text });
        } else if (el.tagName === 'UL' || el.tagName === 'OL') {
          const items = Array.from(el.querySelectorAll('li')).map(li => li.innerText.trim());
          if (items.length) currentSection.content.push({ type: 'list', items });
        } else if (el.tagName === 'TABLE') {
          currentSection.content.push({ type: 'table', html: el.outerHTML });
        }
      }
    });

    return sections;
  });

  await fs.writeJson(OUTPUT_FILE, data, { spaces: 2 });
  console.log(`✅ Scraped full sections saved to ${OUTPUT_FILE}`);

  await browser.close();
}

scrapeKochiSections().catch(err => {
  console.error('❌ Error scraping Kochi sections:', err);
});
