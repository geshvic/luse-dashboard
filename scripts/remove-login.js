const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'public', 'dashboard.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// Remove the entire login gate div
const startMarker = '<!-- ====== EXECUTIVE LOGIN GATE ====== -->';
const endMarker = '<div class="header">';

const start = html.indexOf(startMarker);
const end = html.indexOf(endMarker, start);

if (start > 0 && end > start) {
  html = html.slice(0, start) + html.slice(end);
  console.log('✅ Login gate HTML removed (', (end - start), 'bytes)');
} else {
  console.log('❌ Markers not found. start:', start, 'end:', end);
}

// Also remove the auth JS block
const authStartMarker = 'const ACCESS_HASH';
const authEndMarker = 'function logout()';

const authStart = html.indexOf(authStartMarker);
const authEnd = html.indexOf(authEndMarker, authStart);

if (authStart > 0 && authEnd > authStart) {
  // Keep logout for now, just remove the auth block
  const fullBlock = html.slice(authStart, html.indexOf('async function load()', authStart));
  html = html.replace(fullBlock, '// Auth removed\n');
  console.log('✅ Auth JS removed');
}

// Remove login CSS (the login-related styles)
const cssStart = html.indexOf('/* === LOGIN GATE === */');
const cssEnd = html.indexOf('/* === HEADER === */', cssStart);
if (cssStart > 0 && cssEnd > cssStart) {
  html = html.slice(0, cssStart) + html.slice(cssEnd);
  console.log('✅ Login CSS removed (', (cssEnd - cssStart), 'bytes)');
}

fs.writeFileSync(htmlPath, html);
console.log('Size:', (fs.statSync(htmlPath).size / 1024).toFixed(1) + 'KB');
