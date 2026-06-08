async function check() {
  const r = await fetch('https://geshvic.github.io/luse-dashboard/?' + Date.now());
  const html = await r.text();
  
  console.log('CDN size:', (html.length/1024).toFixed(1) + 'KB');
  console.log('Has screener HTML:', html.includes('Stock Screener'));
  console.log('Has scrSector:', html.includes('scrSector'));
  console.log('Has initScreener:', html.includes('function initScreener'));
  console.log('Has screener CSS:', html.includes('screener-section'));
  
  // Check the initScreener call in load()
  const loadIdx = html.indexOf('async function load');
  const endIdx = html.indexOf('function render()', loadIdx);
  console.log('\nload() has initScreener:', html.slice(loadIdx, endIdx).includes('initScreener'));
}
check().catch(e => console.error(e.message));
