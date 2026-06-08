async function check() {
  const r = await fetch('https://geshvic.github.io/luse-dashboard/?' + Date.now());
  const html = await r.text();
  
  // Find all screenerSort declarations with context
  const re = /let screenerSort/g;
  let m;
  let count = 0;
  while ((m = re.exec(html)) !== null) {
    count++;
    const ctx = html.slice(Math.max(0, m.index - 30), m.index + 40);
    console.log('Declaration', count, ':', ctx.replace(/\n/g, ' ').slice(0, 80));
  }
  
  // Check if any are inside strings or comments
  console.log('\nTotal:', count);
}
check().catch(e => console.error(e.message));
