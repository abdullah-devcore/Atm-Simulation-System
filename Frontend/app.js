/* ===================================================================
   NovaBank ATM — Flask API Client
   - All data operations go through Flask (app.py)
   - No localStorage, no client-side balance calculations
   - Browser ↔ Flask ↔ atm_system logic ↔ accounts.json / history.json
=================================================================== */
'use strict';

const API = '';   // same origin — Flask serves this file

/* ══════════════════════════════════════════════════════════
   UI HELPERS
══════════════════════════════════════════════════════════ */
const $   = id => document.getElementById(id);
const val = id => { const e = $(id); return e ? e.value.trim() : ''; };
const clr = id => { const e = $(id); if (e) e.value = ''; };

function showErr(id, msg) {
  const e = $(id);
  if (!e) return;
  e.textContent = msg;
  e.classList.remove('hidden');
}
function hide(id)   { const e = $(id); if (e) e.classList.add('hidden'); }
function showLoad() { $('loading-overlay').classList.remove('hidden'); }
function hideLoad() { $('loading-overlay').classList.add('hidden'); }

function togglePin(inputId, btn) {
  const inp = $(inputId);
  if (!inp) return;
  const show = inp.type === 'password';
  inp.type = show ? 'text' : 'password';
  btn.innerHTML = show
    ? '<i class="fa-solid fa-eye-slash"></i>'
    : '<i class="fa-solid fa-eye"></i>';
}

function setAmount(id, v) { const e = $(id); if (e) e.value = v; }

/* ══════════════════════════════════════════════════════════
   FETCH WRAPPER
══════════════════════════════════════════════════════════ */
async function apiPost(endpoint, body) {
  const res = await fetch(API + endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body)
  });
  return res.json();
}

async function apiGet(endpoint) {
  const res = await fetch(API + endpoint, {
    credentials: 'include'
  });
  return res.json();
}

/* ══════════════════════════════════════════════════════════
   THEME  —  Light / Dark toggle, persists in localStorage
══════════════════════════════════════════════════════════ */
function toggleTheme() {
  const isLight = document.body.classList.toggle('light-mode');
  localStorage.setItem('novabank_theme', isLight ? 'light' : 'dark');
  updateThemeIcons(isLight);
}

function updateThemeIcons(isLight) {
  ['theme-icon-atm', 'theme-icon-db'].forEach(id => {
    const el = $(id);
    if (!el) return;
    el.className = isLight ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
  });
}

function applyStoredTheme() {
  const saved = localStorage.getItem('novabank_theme');
  const isLight = saved === 'light';
  document.body.classList.toggle('light-mode', isLight);
  updateThemeIcons(isLight);
}

/* ══════════════════════════════════════════════════════════
   CLOCK
══════════════════════════════════════════════════════════ */
function updateClock() {
  const now = new Date();
  const h   = String(now.getHours()).padStart(2, '0');
  const m   = String(now.getMinutes()).padStart(2, '0');
  const el  = $('header-time');
  if (el) el.textContent = h + ':' + m;
  const el2 = $('dash-page-time');
  if (el2) el2.textContent = h + ':' + m;
}
setInterval(updateClock, 1000);
updateClock();

/* ══════════════════════════════════════════════════════════
   PAGE NAVIGATION
══════════════════════════════════════════════════════════ */
function openCreatePage() {
  const atm    = $('page-atm');
  const create = $('page-create');
  atm.classList.add('slide-out');
  setTimeout(() => {
    atm.classList.remove('active', 'slide-out');
    create.classList.add('active');
    create.scrollTop = 0;
  }, 300);
  clearCreateForm();
}

function closeCreatePage() {
  $('page-create').classList.remove('active');
  $('page-atm').classList.add('active');
}

/* ── Dashboard full page ─────────────────────────────── */
function openDashboardPage() {
  const atm   = $('page-atm');
  const dash  = $('page-dashboard');
  atm.classList.add('slide-out');
  setTimeout(() => {
    atm.classList.remove('active', 'slide-out');
    dash.classList.add('active');
    dash.scrollTop = 0;
  }, 300);
  loadDashboardPage();
}

function closeDashboardPage() {
  $('page-dashboard').classList.remove('active');
  $('page-atm').classList.add('active');
}

async function loadDashboardPage() {
  const data = await apiGet('/api/account');
  if (!data.success) { closeDashboardPage(); showAtmScreen('screen-home'); return; }

  const now = new Date();
  const timeStr = String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0');
  const dateStr = now.toLocaleDateString('en-PK', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
  const shortDate = now.toLocaleDateString('en-PK', { day:'numeric', month:'short', year:'numeric' });

  // Top nav time
  const timeEl = $('dash-page-time');
  if (timeEl) timeEl.textContent = timeStr;

  // Top nav user chip
  const firstName = data.name.split(' ')[0];
  const chipName = $('db-chip-name'); if (chipName) chipName.textContent = firstName;
  const chipAcc  = $('db-chip-accno'); if (chipAcc) chipAcc.textContent = data.account_number;

  // Welcome title
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const wt = $('db-welcome-title'); if (wt) wt.textContent = greeting + ', ' + firstName + ' 👋';
  const wd = $('db-today-date'); if (wd) wd.textContent = dateStr;

  // Virtual card
  const vcBal  = $('db-vcard-balance'); if (vcBal) vcBal.textContent = data.balance_formatted;
  const vcName = $('db-vcard-name');    if (vcName) vcName.textContent = data.name;
  // Show masked card number: •••• •••• •••• XXXX (last 4 of account number)
  const vcAcc  = $('db-vcard-accno');
  if (vcAcc) {
    const parts = data.account_number.split('-');
    const last4 = parts[parts.length - 1] || '••••';
    vcAcc.textContent = '•••• •••• •••• ' + last4;
  }

  // Account info panel
  const aiName  = $('db-ai-name');  if (aiName)  aiName.textContent  = data.name.toUpperCase();
  const aiAcc   = $('db-ai-accno'); if (aiAcc)   aiAcc.textContent   = data.account_number;
  const aiDate  = $('db-ai-date');  if (aiDate)  aiDate.textContent  = shortDate;
}

/* ── Preset amount button helper ─────────────────────────── */
function dbSetAndHighlight(inputId, amount, btn) {
  const inp = $(inputId);
  if (inp) inp.value = amount;
  // Highlight selected preset, clear others in same grid
  const grid = btn.closest('.db-preset-grid');
  if (grid) grid.querySelectorAll('.db-preset-btn').forEach(b => b.classList.remove('db-preset-active'));
  btn.classList.add('db-preset-active');
}

function dbClearPresets(container) {
  if (!container) return;
  container.querySelectorAll('.db-preset-btn').forEach(b => b.classList.remove('db-preset-active'));
}

/* ── Dashboard section switcher ──────────────────────────── */
function dbShowSection(sectionId, navId, iconClass, title) {
  // Hide all sections
  document.querySelectorAll('.db-section').forEach(s => s.classList.remove('active'));
  // Show target section
  const el = $(sectionId); if (el) el.classList.add('active');
  // Update active nav item
  document.querySelectorAll('.db-nav-item').forEach(n => n.classList.remove('active'));
  const navEl = navId ? $(navId) : null;
  if (navEl) navEl.classList.add('active');
  // Update top nav title
  const titleEl = $('db-page-title');
  if (titleEl && iconClass && title) {
    titleEl.innerHTML = `<i class="${iconClass}"></i>&nbsp; ${title}`;
  }
  // Load data for the section
  if (sectionId === 'section-withdraw')  { dbLoadBalance('db-wd-balance'); clr('db-wd-amount'); hide('db-wd-error'); dbClearPresets($('section-withdraw')); }
  if (sectionId === 'section-deposit')   { dbLoadBalance('db-dep-balance'); clr('db-dep-amount'); hide('db-dep-error'); dbClearPresets($('section-deposit')); }
  if (sectionId === 'section-transfer')  { dbLoadBalance('db-tr-balance'); hide('db-tr-receiver-name'); clr('db-tr-receiver'); clr('db-tr-amount'); hide('db-tr-error'); }
  if (sectionId === 'section-statement') dbLoadStatement();
}

/* ── Dashboard inline balance loader ──────────────────────── */
async function dbLoadBalance(targetId) {
  const el = $(targetId);
  if (el) el.textContent = '…';
  const data = await apiGet('/api/account');
  if (data.success && el) el.textContent = data.balance_formatted;
}

/* ── Dashboard inline Withdraw ──────────────────────────── */
async function dbDoWithdraw() {
  hide('db-wd-error');
  const amount = val('db-wd-amount');
  if (!amount || +amount <= 0) return showErr('db-wd-error', 'Please enter a valid positive amount.');
  showLoad();
  const data = await apiPost('/api/withdraw', { amount: +amount });
  hideLoad();
  if (!data.success) return showErr('db-wd-error', data.message);
  clr('db-wd-amount');
  dbShowSuccess('Withdrawal Successful', 'Please collect your cash from the slot.', 'New Balance: ' + data.balance_formatted);
}

/* ── Dashboard inline Deposit ────────────────────────────── */
async function dbDoDeposit() {
  hide('db-dep-error');
  const amount = val('db-dep-amount');
  if (!amount || +amount <= 0) return showErr('db-dep-error', 'Please enter a valid positive amount.');
  showLoad();
  const data = await apiPost('/api/deposit', { amount: +amount });
  hideLoad();
  if (!data.success) return showErr('db-dep-error', data.message);
  clr('db-dep-amount');
  dbShowSuccess('Deposit Successful', 'Funds have been added to your account.', 'New Balance: ' + data.balance_formatted);
}

/* ── Dashboard inline Transfer ───────────────────────────── */
async function dbDoLookup() {
  const receiver = val('db-tr-receiver');
  const badge = $('db-tr-receiver-name');
  const label = $('db-tr-receiver-label');
  if (!receiver) return;
  badge.classList.add('hidden');
  hide('db-tr-error');
  const data = await apiPost('/api/lookup', { account_number: receiver });
  if (!data.success) return showErr('db-tr-error', data.message);
  if (label) label.textContent = data.name;
  badge.classList.remove('hidden');
}

async function dbDoTransfer() {
  hide('db-tr-error');
  const receiver = val('db-tr-receiver');
  const amount   = val('db-tr-amount');
  if (!receiver)               return showErr('db-tr-error', "Enter the receiver's account number.");
  if (!amount || +amount <= 0) return showErr('db-tr-error', 'Please enter a valid positive amount.');
  showLoad();
  const data = await apiPost('/api/transfer', { receiver, amount: +amount });
  hideLoad();
  if (!data.success) return showErr('db-tr-error', data.message);
  clr('db-tr-receiver'); clr('db-tr-amount');
  $('db-tr-receiver-name').classList.add('hidden');
  dbShowSuccess('Transfer Successful', data.message, 'New Balance: ' + data.balance_formatted);
}

/* ── Dashboard inline Mini Statement ─────────────────────── */
async function dbLoadStatement() {
  const box = $('db-stmt-list');
  const countEl = $('db-stmt-count');
  if (!box) return;
  box.innerHTML = '<div class="txn-empty"><div class="loader-ring" style="width:30px;height:30px;border-width:3px;margin:0 auto 12px"></div><p>Loading…</p></div>';
  if (countEl) countEl.textContent = '…';

  const data = await apiGet('/api/history');
  if (!data.success) {
    box.innerHTML = '<div class="txn-empty"><i class="fa-solid fa-triangle-exclamation"></i><p>Not logged in.</p></div>';
    return;
  }

  const items = (data.history || []).slice().reverse();
  if (countEl) countEl.textContent = items.length + ' total';

  // Count summary
  let credits = 0, debits = 0, transfers = 0;
  items.forEach(item => {
    const lo = item.toLowerCase();
    if (lo.includes('deposit') || lo.includes('received') || lo.includes('created')) credits++;
    else if (lo.includes('withdrew') || lo.includes('withdraw')) debits++;
    else if (lo.includes('transfer') || lo.includes('transferred')) transfers++;
  });
  const sc = $('db-stmt-credits');   if (sc) sc.textContent = credits;
  const sd = $('db-stmt-debits');    if (sd) sd.textContent = debits;
  const st = $('db-stmt-transfers'); if (st) st.textContent = transfers;

  if (!items.length) {
    box.innerHTML = '<div class="txn-empty"><i class="fa-regular fa-clock"></i><p>No transactions yet.</p></div>';
    return;
  }

  box.innerHTML = '';
  items.forEach((item, idx) => {
    const lo = item.toLowerCase();
    let cls = 'dot-in', icon = 'fa-circle-info', typeLabel = 'Info', amountMatch = item.match(/Rs\.\s*[\d,]+/);
    if (lo.includes('deposit') || lo.includes('received') || lo.includes('created'))
      { cls = 'dot-cr'; icon = 'fa-plus'; typeLabel = lo.includes('created') ? 'Account Created' : lo.includes('received') ? 'Credit Received' : 'Deposit'; }
    else if (lo.includes('withdrew') || lo.includes('withdraw'))
      { cls = 'dot-db'; icon = 'fa-minus'; typeLabel = 'Cash Withdrawal'; }
    else if (lo.includes('transfer') || lo.includes('transferred'))
      { cls = 'dot-tr'; icon = 'fa-paper-plane'; typeLabel = lo.includes('to ') ? 'Transfer Sent' : 'Transfer Received'; }

    const amount = amountMatch ? amountMatch[0] : '';
    const el = document.createElement('div');
    el.className = 'db-stmt-item';
    el.innerHTML = `
      <div class="db-si-left">
        <div class="txn-dot ${cls}"><i class="fa-solid ${icon}"></i></div>
        <div class="db-si-info">
          <div class="db-si-type">${typeLabel}</div>
          <div class="db-si-desc">${item}</div>
        </div>
      </div>
      <div class="db-si-amount ${cls === 'dot-cr' ? 'db-si-cr' : cls === 'dot-db' ? 'db-si-db' : 'db-si-tr'}">${amount}</div>`;
    box.appendChild(el);
  });
}

/* ── Dashboard inline Success ────────────────────────────── */
function dbShowSuccess(title, msg, detail) {
  $('db-success-title').textContent = title;
  $('db-success-msg').textContent   = msg;
  const d = $('db-success-detail');
  if (detail) { d.textContent = detail; d.classList.remove('hidden'); }
  else d.classList.add('hidden');
  dbShowSection('section-success', null, null, null);
  // Update title manually since navId is null
  const titleEl = $('db-page-title');
  if (titleEl) titleEl.innerHTML = '<i class="fa-solid fa-circle-check"></i>&nbsp; Transaction Complete';
  // Deactivate all nav items on success screen
  document.querySelectorAll('.db-nav-item').forEach(n => n.classList.remove('active'));
  // Refresh dashboard data in background for when user returns
  loadDashboardPage();
}

/* ── ATM screen routing ─────────────────────────────────── */
const BACK_TARGETS = {
  'screen-login': 'screen-home',
};

function showAtmScreen(id) {
  const prev = document.querySelector('.screen.active');
  if (prev && prev.id === id) return;
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active', 'slide-back'));

  const next = $(id);
  if (!next) return;
  next.classList.add('active');

  const backBtn    = $('header-back-btn');
  const logoWrap   = $('header-logo');
  const backTarget = BACK_TARGETS[id];
  if (backTarget) {
    backBtn.onclick = () => showAtmScreen(backTarget);
    backBtn.classList.remove('hidden');
    logoWrap.classList.add('hidden');
  } else {
    backBtn.classList.add('hidden');
    logoWrap.classList.remove('hidden');
  }

  if (id === 'screen-history')   loadHistory();
  if (id === 'screen-withdraw')  loadBalance('wd-balance');
  if (id === 'screen-deposit')   loadBalance('dep-balance');
  if (id === 'screen-transfer')  loadBalance('tr-balance');
  if (id === 'screen-login')     { clr('login-cnic'); clr('login-pin'); hide('login-error'); }
}

/* Fetch current balance from server and put it in an element */
async function loadBalance(targetId) {
  const data = await apiGet('/api/account');
  if (data.success) {
    const el = $(targetId);
    if (el) el.textContent = data.balance_formatted;
  }
}

/* ══════════════════════════════════════════════════════════
   AUTH  —  Login / Logout
══════════════════════════════════════════════════════════ */
async function doLogin() {
  hide('login-error');
  const cnic = val('login-cnic');
  const pin  = val('login-pin');

  if (!cnic || !pin)           return showErr('login-error', 'Please fill in both fields.');
  if (!/^\d{13}$/.test(cnic)) return showErr('login-error', 'CNIC must be exactly 13 digits.');
  if (!/^\d{4}$/.test(pin))   return showErr('login-error', 'PIN must be exactly 4 digits.');

  showLoad();
  const data = await apiPost('/api/login', { cnic, pin });
  hideLoad();

  if (!data.success) return showErr('login-error', data.message);

  openDashboardPage();
}

async function doLogout() {
  showLoad();
  await apiPost('/api/logout', {});
  hideLoad();
  $('page-dashboard').classList.remove('active');
  $('page-atm').classList.add('active');
  showAtmScreen('screen-home');
}

/* ══════════════════════════════════════════════════════════
   WITHDRAW
══════════════════════════════════════════════════════════ */
async function doWithdraw() {
  hide('wd-error');
  const amount = val('wd-amount');
  if (!amount || +amount <= 0) return showErr('wd-error', 'Please enter a valid positive amount.');

  showLoad();
  const data = await apiPost('/api/withdraw', { amount: +amount });
  hideLoad();

  if (!data.success) return showErr('wd-error', data.message);

  clr('wd-amount');
  showSuccess('Withdrawal Successful', 'Please collect your cash from the slot.', 'New Balance: ' + data.balance_formatted);
}

/* ══════════════════════════════════════════════════════════
   DEPOSIT
══════════════════════════════════════════════════════════ */
async function doDeposit() {
  hide('dep-error');
  const amount = val('dep-amount');
  if (!amount || +amount <= 0) return showErr('dep-error', 'Please enter a valid positive amount.');

  showLoad();
  const data = await apiPost('/api/deposit', { amount: +amount });
  hideLoad();

  if (!data.success) return showErr('dep-error', data.message);

  clr('dep-amount');
  showSuccess('Deposit Successful', 'Funds added to your account.', 'New Balance: ' + data.balance_formatted);
}

/* ══════════════════════════════════════════════════════════
   TRANSFER
══════════════════════════════════════════════════════════ */
async function doLookup() {
  const receiver = val('tr-receiver');
  const badge    = $('tr-receiver-name');
  if (!receiver) return;
  badge.classList.add('hidden');
  hide('tr-error');

  const data = await apiPost('/api/lookup', { account_number: receiver });
  if (!data.success) return showErr('tr-error', data.message);

  badge.textContent = data.name;
  badge.classList.remove('hidden');
}

async function doTransfer() {
  hide('tr-error');
  const receiver = val('tr-receiver');
  const amount   = val('tr-amount');

  if (!receiver)             return showErr('tr-error', "Enter receiver's account number.");
  if (!amount || +amount <= 0) return showErr('tr-error', 'Please enter a valid positive amount.');

  showLoad();
  const data = await apiPost('/api/transfer', { receiver, amount: +amount });
  hideLoad();

  if (!data.success) return showErr('tr-error', data.message);

  clr('tr-receiver');
  clr('tr-amount');
  $('tr-receiver-name').classList.add('hidden');
  showSuccess('Transfer Successful', data.message, 'New Balance: ' + data.balance_formatted);
}

/* ══════════════════════════════════════════════════════════
   HISTORY
══════════════════════════════════════════════════════════ */
async function loadHistory() {
  const box = $('history-list');
  box.innerHTML = '<div class="txn-empty"><div class="loader-ring" style="width:32px;height:32px;border-width:3px;margin:0 auto 12px"></div><p>Loading...</p></div>';

  const data = await apiGet('/api/history');

  if (!data.success) {
    box.innerHTML = '<div class="txn-empty"><i class="fa-solid fa-triangle-exclamation"></i><p>Not logged in.</p></div>';
    return;
  }

  const items = (data.history || []).slice().reverse();
  if (!items.length) {
    box.innerHTML = '<div class="txn-empty"><i class="fa-regular fa-clock"></i><p>No transactions yet.</p></div>';
    return;
  }

  box.innerHTML = '';
  items.forEach(item => {
    const lo = item.toLowerCase();
    let cls = 'dot-in', icon = 'fa-info-circle';
    if (lo.includes('deposit') || lo.includes('received') || lo.includes('created'))
      { cls = 'dot-cr'; icon = 'fa-plus'; }
    else if (lo.includes('withdrew') || lo.includes('withdraw'))
      { cls = 'dot-db'; icon = 'fa-minus'; }
    else if (lo.includes('transfer'))
      { cls = 'dot-tr'; icon = 'fa-paper-plane'; }

    const el = document.createElement('div');
    el.className = 'txn-item';
    el.innerHTML = `<div class="txn-dot ${cls}"><i class="fa-solid ${icon}"></i></div><div class="txn-text">${item}</div>`;
    box.appendChild(el);
  });
}

/* ══════════════════════════════════════════════════════════
   CREATE ACCOUNT
══════════════════════════════════════════════════════════ */
async function doCreate() {
  hide('create-error');

  const name       = val('c-name');
  const fatherName = val('c-father');
  const phone      = val('c-phone');
  const cnic       = val('c-cnic');
  const email      = val('c-email');
  const city       = val('c-city');
  const pin        = val('c-pin');
  const deposit    = val('c-deposit');

  // Basic client-side presence check only — Flask does full validation
  if (!name || !fatherName || !phone || !cnic || !email || !city || !pin || !deposit)
    return showErr('create-error', 'All fields are required.');

  showLoad();
  const data = await apiPost('/api/create_account', {
    name,
    father_name: fatherName,
    phone,
    cnic,
    email,
    city,
    pin,
    deposit: +deposit
  });
  hideLoad();

  if (!data.success) return showErr('create-error', data.message);

  clearCreateForm();
  $('modal-acc-no').textContent = data.account_number;
  $('acc-created-modal').classList.remove('hidden');
}

function clearCreateForm() {
  ['c-name', 'c-father', 'c-phone', 'c-cnic', 'c-email', 'c-city', 'c-pin', 'c-deposit'].forEach(clr);
  hide('create-error');
  document.querySelectorAll('.sdot').forEach((d, i) => d.classList.toggle('active', i === 0));
}

function closeAccModal() {
  $('acc-created-modal').classList.add('hidden');
  closeCreatePage();
  showAtmScreen('screen-home');
}

/* ══════════════════════════════════════════════════════════
   SUCCESS SCREEN
══════════════════════════════════════════════════════════ */
function showSuccess(title, msg, detail = null) {
  $('success-title').textContent = title;
  $('success-msg').textContent   = msg;
  const d = $('success-detail');
  if (detail) { d.textContent = detail; d.classList.remove('hidden'); }
  else d.classList.add('hidden');

  // Show in the ATM panel
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active', 'slide-back'));
  $('screen-success').classList.add('active');

  // Back button — return to dashboard page
  const backBtn  = $('header-back-btn');
  const logoWrap = $('header-logo');
  backBtn.onclick = () => {
    showAtmScreen('screen-home');
    $('page-atm').classList.remove('active');
    $('page-dashboard').classList.add('active');
    loadDashboardPage();
  };
  backBtn.classList.remove('hidden');
  logoWrap.classList.add('hidden');

  // Override "Back to Dashboard" button inside success screen
  const successBackBtn = $('screen-success').querySelector('.submit-btn');
  if (successBackBtn) {
    successBackBtn.onclick = () => {
      showAtmScreen('screen-home');
      $('page-atm').classList.remove('active');
      $('page-dashboard').classList.add('active');
      loadDashboardPage();
    };
  }
}

/* ══════════════════════════════════════════════════════════
   STEP DOTS
══════════════════════════════════════════════════════════ */
function updateStepDots() {
  const fields = ['c-name', 'c-father', 'c-phone', 'c-cnic', 'c-email', 'c-city', 'c-pin', 'c-deposit'];
  const filled = fields.filter(f => val(f)).length;
  const step   = filled < 3 ? 0 : filled < 6 ? 1 : 2;
  document.querySelectorAll('.sdot').forEach((d, i) => d.classList.toggle('active', i <= step));
}

/* ══════════════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {

  /* Apply saved theme immediately */
  applyStoredTheme();

  /* Keyboard submit shortcuts */
  document.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    const active = document.querySelector('.screen.active');
    if (!active) return;
    const id = active.id;
    if (id === 'screen-login')    doLogin();
    if (id === 'screen-withdraw') doWithdraw();
    if (id === 'screen-deposit')  doDeposit();
    if (id === 'screen-transfer') doTransfer();
  });

  /* Step dot progress */
  document.querySelectorAll('#page-create .field-input').forEach(inp => {
    inp.addEventListener('input', updateStepDots);
  });

  /* Boot */
  showAtmScreen('screen-home');
  $('page-atm').classList.add('active');
});
