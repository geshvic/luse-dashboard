const fs = require('fs');
const f = 'C:/Users/MUSUK/.openclaw/workspace/luse-dashboard/index.html';
let c = fs.readFileSync(f, 'utf8');

// Find the body start — insert login gate right after <body>
const bodyClose = '<body>\r\n';
const bodyIdx = c.indexOf(bodyClose) + bodyClose.length;

const loginGateHTML = `<!-- ====== LOGIN GATE ====== -->
<div id="loginGate">
  <div class="login-bg">
    <div class="orb gold"></div>
    <div class="orb blue"></div>
    <div class="orb" style="width:200px;height:200px;background:var(--green);top:60%;left:60%;animation:orbFloat 12s ease-in-out infinite;opacity:0.06;"></div>
    <div class="orb" style="width:180px;height:180px;background:var(--red);top:15%;right:10%;animation:orbFloat 9s ease-in-out infinite reverse;opacity:0.05;"></div>
  </div>
  <div class="login-card" id="loginCard">
    <!-- Branding -->
    <div class="login-logo">
      <div class="baobab">BAOBAB</div>
      <div class="capital">CAPITAL</div>
      <div class="tagline">African Markets Intelligence</div>
    </div>
    <div class="login-divider"></div>
    <div class="login-subtitle">🔐 Subscriber Portal v2.3</div>

    <!-- Login Form -->
    <div id="loginForm">
      <div class="login-field">
        <input type="text" id="loginUser" placeholder="Username" autocomplete="username" spellcheck="false" onkeydown="if(event.key==='Enter')document.getElementById('loginPass').focus()">
      </div>
      <div class="login-field">
        <input type="password" id="loginPass" placeholder="Password" autocomplete="current-password" onkeydown="if(event.key==='Enter')doLogin()">
        <button class="login-toggle" id="pwToggle" onclick="togglePw()" type="button" title="Show/hide password">👁</button>
      </div>
      <div class="login-error" id="loginError"></div>
      <button class="login-btn" id="loginBtn" onclick="doLogin()">🔓 Authenticate</button>
      <div style="display:flex;justify-content:space-between;margin-top:0.75rem;">
        <span style="font-size:0.6rem;color:var(--muted);cursor:pointer;" onclick="showSignup()">📝 Sign Up</span>
        <span style="font-size:0.6rem;color:var(--muted);cursor:pointer;" onclick="forgotLogin()">❓ Forgot?</span>
      </div>
    </div>

    <!-- Signup Form (hidden by default) -->
    <div id="signupForm" style="display:none;">
      <div class="login-field">
        <input type="text" id="signupUser" placeholder="Choose username" autocomplete="off" spellcheck="false">
      </div>
      <div class="login-field">
        <input type="password" id="signupPass" placeholder="Choose password" autocomplete="off">
      </div>
      <div class="login-field">
        <input type="password" id="signupConfirm" placeholder="Confirm password" autocomplete="off" onkeydown="if(event.key==='Enter')doSignup()">
      </div>
      <div class="login-error" id="signupError"></div>
      <button class="login-btn" onclick="doSignup()">📝 Create Account</button>
      <div style="margin-top:0.75rem;font-size:0.5rem;color:var(--muted);">By signing up you agree to the terms of service. Credentials stored locally.</div>
      <div style="margin-top:0.5rem;"><span style="font-size:0.6rem;color:var(--blue);cursor:pointer;" onclick="showLogin()">← Back to Login</span></div>
    </div>

    <!-- Authenticated state (hidden by default) -->
    <div id="loginAuthed" style="display:none;">
      <div style="font-size:1.2rem;margin:0.5rem 0;">👤 <span id="authedUser"></span></div>
      <div style="font-size:0.62rem;color:var(--green);margin-bottom:1rem;">✓ Authenticated</div>
      <button class="login-btn" onclick="doLogout()" style="background:rgba(248,81,73,0.6);color:var(--text);text-transform:none;">🚪 Logout</button>
    </div>

    <div class="login-footer">SECURED CONNECTION · AES-256-GCM · SESSION v2.3</div>
  </div>
</div>

`;

c = c.slice(0, bodyIdx) + loginGateHTML + c.slice(bodyIdx);

// Fix the JS: update the auth section to use username+password
const oldAuth = `// ====== AUTH GATE ======\r\nconst ACCESS_HASH = '28d657d5cd993f21689047e28091ffadfae9beafeae2c9375503f326f5699a0c'; // default: Lusaka2026`;

const newAuth = `// ====== AUTH GATE ======\r\nfunction getUsers(){try{return JSON.parse(localStorage.getItem('bc_users')||'{}')}catch(e){return{}}}\r\nfunction saveUsers(u){localStorage.setItem('bc_users',JSON.stringify(u))}\r\nfunction ensureDefaultUser(){const u=getUsers();if(!u.admin){u.admin={pw:'Lusaka2026',created:Date.now(),role:'admin'};saveUsers(u)}return u}\r\nensureDefaultUser();`;

c = c.replace(oldAuth, newAuth);

// Add login/logout/signup functions before the load() function
const loadFunc = 'async function load()';
const newFuncs = `
// ====== LOGIN / LOGOUT / SIGNUP ======
function togglePw() {
  const p = document.getElementById('loginPass');
  p.type = p.type === 'password' ? 'text' : 'password';
}

function showSignup() {
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('signupForm').style.display = 'block';
  document.getElementById('loginError').textContent = '';
}
function showLogin() {
  document.getElementById('loginForm').style.display = 'block';
  document.getElementById('signupForm').style.display = 'none';
  document.getElementById('signupError').textContent = '';
}

function doLogin() {
  const user = document.getElementById('loginUser').value.trim();
  const pass = document.getElementById('loginPass').value;
  const err = document.getElementById('loginError');
  if (!user || !pass) { err.textContent = 'Username and password required'; err.classList.add('show'); return; }
  err.classList.remove('show');
  const users = getUsers();
  if (!users[user]) { err.textContent = 'Invalid credentials'; err.classList.add('show'); return; }
  if (users[user].pw !== pass) { err.textContent = 'Invalid credentials'; err.classList.add('show'); return; }
  localStorage.setItem('bc_session', JSON.stringify({user, time: Date.now(), role: users[user].role||'user'}));
  document.getElementById('loginGate').classList.add('hidden');
}

function doLogout() {
  localStorage.removeItem('bc_session');
  document.getElementById('loginGate').classList.remove('hidden');
  document.getElementById('loginForm').style.display = 'block';
  document.getElementById('signupForm').style.display = 'none';
  document.getElementById('loginAuthed').style.display = 'none';
  document.getElementById('loginUser').value = '';
  document.getElementById('loginPass').value = '';
}

function doSignup() {
  const user = document.getElementById('signupUser').value.trim();
  const pass = document.getElementById('signupPass').value;
  const confirm = document.getElementById('signupConfirm').value;
  const err = document.getElementById('signupError');
  if (!user || !pass) { err.textContent = 'Username and password required'; err.classList.add('show'); return; }
  if (user.length < 3) { err.textContent = 'Username must be at least 3 characters'; err.classList.add('show'); return; }
  if (pass.length < 6) { err.textContent = 'Password must be at least 6 characters'; err.classList.add('show'); return; }
  if (pass !== confirm) { err.textContent = 'Passwords do not match'; err.classList.add('show'); return; }
  err.classList.remove('show');
  const users = getUsers();
  if (users[user]) { err.textContent = 'Username already taken'; err.classList.add('show'); return; }
  users[user] = {pw: pass, created: Date.now(), role: 'user'};
  saveUsers(users);
  localStorage.setItem('bc_session', JSON.stringify({user, time: Date.now(), role: 'user'}));
  document.getElementById('loginGate').classList.add('hidden');
}

function forgotLogin() {
  const err = document.getElementById('loginError');
  err.textContent = 'Contact Baobab Capital support to reset credentials.';
  err.classList.add('show');
}

// Check session on load
(function() {
  try {
    const sess = JSON.parse(localStorage.getItem('bc_session'));
    if (sess && sess.user && sess.time > Date.now() - 86400000) {
      document.getElementById('loginGate').classList.add('hidden');
    }
  } catch(e) {}
})();

`;

c = c.replace(loadFunc, newFuncs + '\r\n' + loadFunc);

fs.writeFileSync(f, c);
const sizeKb = Math.round(fs.statSync(f).size / 1024);
console.log('Done. Size:', sizeKb, 'KB');

// Verify
const check = fs.readFileSync(f, 'utf8');
const checks = ['id="loginGate"', 'loginUser', 'loginPass', 'doLogin', 'doLogout', 'doSignup', 'showSignup'];
checks.forEach(k => console.log('  ' + k + ':', check.includes(k)));
