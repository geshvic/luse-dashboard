async function check() {
  const r = await fetch('https://raw.githubusercontent.com/geshvic/luse-dashboard/master/index.html');
  const html = await r.text();
  console.log('RAW GitHub sensList:', html.includes('id="sensList"'));
  console.log('RAW SENS Announcements:', html.includes('SENS Announcements'));
  console.log('RAW size:', (html.length/1024).toFixed(1) + 'KB');
}
check().catch(e => console.error(e.message));
