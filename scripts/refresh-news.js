/**
 * refresh-news.js — daily news feed refresh
 * Scrapes LuSE news, builds static files, deploys to GitHub Pages
 */
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');
const SCRIPTS = path.join(ROOT, 'scripts');
const DATA = path.join(ROOT, 'data');

function run(cmd, label) {
  console.log(`\n[${label}] Running...`);
  try {
    const out = execSync(cmd, { cwd: ROOT, encoding: 'utf8', timeout: 120000 });
    console.log(`[${label}] ✅ Done`);
    if (out) console.log(out.slice(-500));
    return true;
  } catch (e) {
    console.error(`[${label}] ❌ Failed: ${e.message}`);
    return false;
  }
}

async function main() {
  const today = new Date().toISOString().split('T')[0];
  console.log(`\n📰 Baobab Capital — News Refresh ${today}`);

  // Step 1: Fetch fresh news via search
  if (!run(`node "${path.join(SCRIPTS, 'fetch-luse-data.js')}"`, 'FETCH DATA')) {
    console.log('⚠️ Data scrape failed — using cached data');
  }

  // Step 2: Build static files
  if (!run(`node "${path.join(SCRIPTS, 'build-static.js')}"`, 'BUILD')) {
    console.error('❌ Build failed');
    process.exit(1);
  }

  // Step 3: Git add, commit, push
  run('git add data/ index.html public/data/ logo.png', 'GIT ADD');
  
  const commitMsg = `news: daily refresh ${today}`;
  run(`git commit -m "${commitMsg}"`, 'GIT COMMIT');

  if (run('git push', 'GIT PUSH')) {
    console.log(`\n✅ News deployed! https://geshvic.github.io/luse-dashboard/\n`);
  } else {
    console.log('\n⚠️ Push failed\n');
  }
}

main().catch(e => { console.error(e); process.exit(1); });
