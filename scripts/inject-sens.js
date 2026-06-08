const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'public', 'dashboard.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// Find the exact news section closing
const marker = 'id="newsList"';
const idx = html.indexOf(marker);
if (idx < 0) { console.log('newsList not found!'); process.exit(1); }

// Find the closing </div> for the news section — it's two </div>s after newsList
// Structure: <div class="news-list" id="newsList"></div>\n</div>
// Find the position right after the news section ends
const afterNewsList = html.indexOf('</div>', idx);
const secondClose = html.indexOf('</div>', afterNewsList + 6);
console.log('News section ends at offset:', secondClose + 6);
console.log('Context:', html.slice(secondClose, secondClose + 80));

// Insert SENS HTML right after the news section
const sensHtml = `
<!-- ====== SENS ANNOUNCEMENTS ====== -->
<div class="sens-section">
  <h3>📋 SENS Announcements</h3>
  <div class="sens-filters">
    <button class="btn btn-sm active" onclick="filterSens('all',this)">All</button>
    <button class="btn btn-sm btn-outline" onclick="filterSens('Earnings',this)">📊 Earnings</button>
    <button class="btn btn-sm btn-outline" onclick="filterSens('Dividends',this)">💵 Dividends</button>
    <button class="btn btn-sm btn-outline" onclick="filterSens('Directorate',this)">👤 Directorate</button>
    <button class="btn btn-sm btn-outline" onclick="filterSens('Cautionary',this)">⚠️ Cautionary</button>
    <button class="btn btn-sm btn-outline" onclick="filterSens('AGM',this)">📅 AGM/EGM</button>
  </div>
  <div class="sens-list" id="sensList"></div>
  <div class="note" style="margin-top:0.5rem;">Source: <a href="https://www.luse.co.zm/sens/" target="_blank" style="color:var(--blue);">LuSE SENS</a> — Regulatory announcements from listed companies</div>
</div>
`;

const insertPos = secondClose + 6;
html = html.slice(0, insertPos) + sensHtml + html.slice(insertPos);

// Verify
if (html.includes('id="sensList"') && html.includes('SENS Announcements')) {
  fs.writeFileSync(htmlPath, html);
  console.log('✅ SENS HTML block injected successfully');
  console.log('File size:', (fs.statSync(htmlPath).size / 1024).toFixed(1) + 'KB');
} else {
  console.log('❌ Injection failed — sensList still missing');
}
