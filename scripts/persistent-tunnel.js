// persistent-tunnel.js — keeps a tunnel alive indefinitely
const localtunnel = require('localtunnel');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3100;
const URL_FILE = path.join(__dirname, '..', 'data', 'tunnel-url.txt');
let currentUrl = null;

async function startTunnel() {
  while (true) {
    try {
      console.log(`[${new Date().toISOString()}] Starting tunnel on port ${PORT}...`);
      const tunnel = await localtunnel({ port: PORT, subdomain: 'baobab-capital' });
      
      currentUrl = tunnel.url;
      fs.writeFileSync(URL_FILE, tunnel.url);
      console.log(`[${new Date().toISOString()}] ✅ TUNNEL LIVE: ${tunnel.url}`);
      
      // Heartbeat: check every 60 seconds that tunnel is still responding
      tunnel.on('error', (err) => {
        console.error(`[${new Date().toISOString()}] ⚠️ Tunnel error:`, err.message);
        tunnel.close();
      });
      
      tunnel.on('close', () => {
        console.log(`[${new Date().toISOString()}] 🔴 Tunnel closed — restarting in 10s...`);
      });
      
      // Wait for tunnel to close
      await new Promise((resolve) => {
        const check = setInterval(() => {
          if (!tunnel.url) { clearInterval(check); resolve(); }
        }, 5000);
        tunnel.on('close', () => { clearInterval(check); resolve(); });
      });
      
    } catch (e) {
      console.error(`[${new Date().toISOString()}] ❌ Tunnel failed:`, e.message);
    }
    
    console.log(`[${new Date().toISOString()}] Restarting tunnel in 10 seconds...`);
    await new Promise(r => setTimeout(r, 10000));
  }
}

console.log('LuSE Dashboard Tunnel — Persistent Mode');
console.log(`Server port: ${PORT}`);
console.log(`URL file: ${URL_FILE}`);
startTunnel();
