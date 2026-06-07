// watchdog.js — keeps LuSE dashboard + tunnel alive
const { execSync } = require('child_process');
const http = require('http');

const SERVER_PORT = 3100;
const TUNNEL_SUBDOMAIN = 'vituli-luse';

function isServerAlive() {
  return new Promise(resolve => {
    const req = http.get(`http://localhost:${SERVER_PORT}/`, res => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(3000, () => { req.destroy(); resolve(false); });
  });
}

function isTunnelRunning() {
  try {
    const result = execSync(`netstat -ano | findstr :${SERVER_PORT}`, { encoding: 'utf8' });
    return result.includes('LISTENING');
  } catch { return false; }
}

function startTunnel() {
  try {
    const { spawn } = require('child_process');
    const lt = spawn('npx', ['--yes', 'localtunnel', '--port', String(SERVER_PORT), '--subdomain', TUNNEL_SUBDOMAIN], {
      detached: true,
      stdio: 'ignore'
    });
    lt.unref();
    console.log(`[${new Date().toISOString()}] Tunnel restarted → https://${TUNNEL_SUBDOMAIN}.loca.lt`);
  } catch(e) {
    console.error('Tunnel start failed:', e.message);
  }
}

async function check() {
  const serverOk = await isServerAlive();
  if (!serverOk) {
    console.log(`[${new Date().toISOString()}] ⚠️ Server DOWN — attempting restart...`);
    try {
      execSync(`cd C:\\Users\\MUSUK\\.openclaw\\workspace\\luse-dashboard && start /B node server.js`, { stdio: 'ignore' });
    } catch(e) {}
    return;
  } else {
    console.log(`[${new Date().toISOString()}] ✅ Server OK | Tunnel: https://${TUNNEL_SUBDOMAIN}.loca.lt`);
  }
}

check();
