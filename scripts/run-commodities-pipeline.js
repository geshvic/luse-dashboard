/**
 * run-commodities-pipeline.js — one-shot commodity pipeline
 * fetch → build → deploy
 */
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const ROOT = path.join(__dirname, '..');
const NOW = new Date().toISOString().split('T')[0];

function run(script, label) {
  console.log(`\n=== ${label} ===`);
  const p = path.join(ROOT, 'scripts', script);
  if (!fs.existsSync(p)) { console.log(`  ⚠️  Not found: ${p}`); return; }
  execSync(`node "${p}"`, { cwd: ROOT, stdio: 'inherit', timeout: 180000 });
  console.log(`  ✅ ${label} done`);
}

function git(cmd) {
  try {
    execSync(`git ${cmd}`, { cwd: ROOT, stdio: 'pipe', timeout: 30000 });
    return true;
  } catch (e) {
    const msg = e.stderr?.toString() || e.message;
    if (msg.includes('nothing to commit')) { console.log('  ℹ️  Nothing to commit'); return true; }
    console.log(`  ⚠️  Git: ${msg.slice(0, 200)}`);
    return false;
  }
}

function main() {
  console.log(`📦 Commodity Pipeline — ${NOW}\n`);
  run('fetch-commodities.js', 'Fetch Commodities');
  run('build-static.js', 'Build Static');
  if (git('add data/ public/data/')) {
    git(`commit -m "commodities: daily price refresh ${NOW}" --allow-empty`);
    git('push');
  }
  console.log('\n✅ Commodity pipeline complete');
}

main();
