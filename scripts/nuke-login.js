const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'public', 'dashboard.html');
let html = fs.readFileSync(htmlPath, 'utf8');

// Remove login gate HTML completely
const gateStart = html.indexOf('<!-- ====== EXECUTIVE LOGIN GATE ====== -->');
const gateEnd = html.indexOf('<div class="header">', gateStart);

if (gateStart > 0 && gateEnd > gateStart) {
  html = html.slice(0, gateStart) + html.slice(gateEnd);
  console.log('Login gate HTML removed:', (gateEnd - gateStart), 'bytes');
}

// Remove login JS functions (checkAuth, toggleLoginPW, attemptLogin)
const authStart = html.indexOf('function checkAuth()');
const authEnd = html.indexOf('async function load()', authStart);

if (authStart > 0 && authEnd > authStart) {
  // Remove everything from checkAuth to load, keep load
  html = html.slice(0, authStart) + html.slice(authEnd);
  console.log('Auth JS removed');
}

// Verify
console.log('loginGate remains:', html.includes('id="loginGate"'));
console.log('checkAuth remains:', html.includes('checkAuth'));

fs.writeFileSync(htmlPath, html);
console.log('Size:', (fs.statSync(htmlPath).size / 1024).toFixed(1) + 'KB');
