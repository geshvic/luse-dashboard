/**
 * refresh-and-deploy.js — one-command daily refresh
 * 1. Scrapes live LuSE data via Playwright
 * 2. Builds static files
 * 3. Commits + pushes to GitHub (auto-deploys to Pages)
 */
const { execSync } = require('child_process');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SCRIPTS = path.join(ROOT, 'scripts');

function run(cmd, label) {
  console.log(`\n[${label}] Running...`);
  try {
    const out = execSync(cmd, { cwd: ROOT, encoding: 'utf8', timeout: 120000 });
    console.log(`[${label}] ✅ Done\n${out.slice(-300)}`);
    return true;
  } catch (e) {
    console.error(`[${label}] ❌ Failed: ${e.message}`);
    return false;
  }
}

async function main() {
  const today = new Date().toISOString().split('T')[0];
  console.log(`\n🔄 Baobab Capital — Daily Refresh ${today}`);

  // Step 1: Scrape fresh data from LuSE
  if (!run(`node "${path.join(SCRIPTS, 'fetch-luse-data.js')}"`, 'FETCH')) {
    console.log('⚠️ Scrape failed — using cached data');
  }

  // Step 2: Build static files
  if (!run(`node "${path.join(SCRIPTS, 'build-static.js')}"`, 'BUILD')) {
    console.error('❌ Build failed — aborting');
    process.exit(1);
  }

  // Step 2.5: Write to SQLite database
  run(`node "${path.join(SCRIPTS, 'write-to-db.js')}"`, 'DB WRITE');

  // Step 2.6: Generate sector trends for public site
  run(`node "${path.join(SCRIPTS, 'generate-sector-trends.js')}"`, 'SECTOR TRENDS');

  // Step 3: Git add, commit, push
  run('git add data/ index.html public/data/ logo.png', 'GIT ADD');
  
  const commitMsg = `data: daily refresh ${today}`;
  run(`git commit -m "${commitMsg}"`, 'GIT COMMIT');

  if (run('git push', 'GIT PUSH')) {
    console.log(`\n✅ Deployed! https://geshvic.github.io/luse-dashboard/\n`);
  } else {
    console.log('\n⚠️ Push failed — data files built but not deployed\n');
  }
}

main().catch(e => { console.error(e); process.exit(1); });
