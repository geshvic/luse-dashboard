/**
 * run-sens-pipeline.js — one-shot SENS pipeline
 * Runs fetch-sens.js → generate-calendar.js → build-static.js → git deploy
 * No LLM orchestration needed; single Node process.
 */
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const NOW = new Date().toISOString().split('T')[0];

function run(script, label) {
  console.log(`\n=== ${label} ===`);
  const p = path.join(ROOT, 'scripts', script);
  if (!fs.existsSync(p)) {
    console.log(`  ⚠️  Script not found: ${p} — skipping`);
    return;
  }
  execSync(`node "${p}"`, { cwd: ROOT, stdio: 'inherit', timeout: 180000 });
  console.log(`  ✅ ${label} done`);
}

function git(cmd) {
  try {
    execSync(`git ${cmd}`, { cwd: ROOT, stdio: 'pipe', timeout: 30000 });
    return true;
  } catch (e) {
    const msg = e.stderr?.toString() || e.message;
    if (msg.includes('nothing to commit')) {
      console.log('  ℹ️  Nothing to commit');
      return true;
    }
    console.log(`  ⚠️  Git: ${msg.slice(0, 200)}`);
    return false;
  }
}

function main() {
  console.log(`📋 SENS Pipeline — ${NOW}\n`);

  // Step 1: Scrape SENS announcements
  run('fetch-sens.js', 'Fetch SENS');

  // Step 2: Regenerate calendar
  run('generate-calendar.js', 'Generate Calendar');

  // Step 3: Build static
  run('build-static.js', 'Build Static');

  // Step 4: Deploy
  if (git('add data/ public/data/')) {
    git(`commit -m "sens: daily SENS + calendar refresh ${NOW}" --allow-empty`);
    git('push');
  }

  // Quick summary
  const sensPath = path.join(DATA_DIR, 'sens.json');
  if (fs.existsSync(sensPath)) {
    const sens = JSON.parse(fs.readFileSync(sensPath, 'utf8'));
    const recent = sens.filter(a => a.date >= NOW).length;
    console.log(`\n📊 Summary: ${sens.length} total announcements, ${recent} from today`);
  }

  console.log('\n✅ SENS pipeline complete');
}

main();
