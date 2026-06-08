async function check() {
  const r = await fetch('https://geshvic.github.io/luse-dashboard/');
  const html = await r.text();
  
  console.log('CDN size:', (html.length/1024).toFixed(1) + 'KB');
  console.log('Has loginGate:', html.includes('loginGate'));
  console.log('Has attemptLogin:', html.includes('attemptLogin'));
  console.log('Has initScreener:', html.includes('initScreener'));
  console.log('Has ACCESS_HASH:', html.includes('ACCESS_HASH'));
  
  // Check for JS syntax errors - look for the init flow
  const loadIdx = html.indexOf('async function load()');
  if (loadIdx > 0) {
    const loadEnd = html.indexOf('function render()', loadIdx);
    const loadFn = html.slice(loadIdx, loadEnd > 0 ? loadEnd : loadIdx + 1000);
    console.log('\n=== load() function ===');
    console.log(loadFn);
  }
  
  // Check if login gate is visible by default
  const gateIdx = html.indexOf('loginGate');
  if (gateIdx > 0) {
    const gateCtx = html.slice(gateIdx, gateIdx + 100);
    console.log('\nGate context:', gateCtx);
  }
}
check().catch(e => console.error(e.message));
