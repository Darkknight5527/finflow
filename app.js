// ── STATE ──
const STORAGE_KEY = 'finflow_data_v1';

const defaultData = {
  phase: 'intern', // 'intern' | 'job'
  investments: [
    { id: 1, name: 'Nifty 50 Index Fund', type: 'mf', monthly: 1500, units: 0, nav: 168.76, returns: 11.84 },
  ],
  expenses: {},  // { 'YYYY-MM': [{id, date, desc, category, amount, fixed}] }
  goals: [
    { id: 1, name: 'Emergency Fund', target: 60000, saved: 0, color: 'gc-green', monthly: 3500 },
    { id: 2, name: 'First 1 Lakh Invested', target: 100000, saved: 0, color: 'gc-blue', monthly: 0 },
    { id: 3, name: 'Travel Fund', target: 30000, saved: 0, color: 'gc-orange', monthly: 2000 },
  ],
  epfMonths: 0,
};

const PHASES = {
  intern: {
    label: 'Internship',
    income: 15000,
    items: [
      { name: 'Rent', amount: 5000, cat: 'bcat-spend' },
      { name: 'Electricity', amount: 1000, cat: 'bcat-spend' },
      { name: 'Water', amount: 1000, cat: 'bcat-spend' },
      { name: 'Petrol', amount: 2500, cat: 'bcat-spend' },
      { name: 'Groceries', amount: 500, cat: 'bcat-spend' },
      { name: 'Emergency Fund SIP', amount: 3500, cat: 'bcat-save' },
      { name: 'Nifty 50 SIP', amount: 1500, cat: 'bcat-invest' },
    ]
  },
  job: {
    label: 'Post-Absorption',
    income: 42500,
    items: [
      { name: 'Rent', amount: 5000, cat: 'bcat-spend' },
      { name: 'Electricity', amount: 1000, cat: 'bcat-spend' },
      { name: 'Water', amount: 1000, cat: 'bcat-spend' },
      { name: 'Petrol', amount: 2500, cat: 'bcat-spend' },
      { name: 'Groceries', amount: 500, cat: 'bcat-spend' },
      { name: 'Other Living', amount: 5000, cat: 'bcat-spend' },
      { name: 'Personal Spend', amount: 5000, cat: 'bcat-personal' },
      { name: 'Emergency Fund', amount: 4000, cat: 'bcat-save' },
      { name: 'Nifty 50 SIP', amount: 7000, cat: 'bcat-invest' },
      { name: 'Nifty Next 50 SIP', amount: 3000, cat: 'bcat-invest' },
      { name: 'Direct Stocks', amount: 2500, cat: 'bcat-invest' },
      { name: 'Short-term Savings', amount: 4000, cat: 'bcat-save' },
      { name: 'Buffer', amount: 2000, cat: 'bcat-save' },
    ]
  }
};

const EXPENSE_CATS = ['Rent', 'Electricity', 'Water', 'Petrol', 'Groceries', 'Food & Dining', 'Transport', 'Shopping', 'Entertainment', 'Health', 'Education', 'Investment', 'Savings', 'Miscellaneous'];

const COLORS = ['#00e5a0','#5b6af0','#f0a05b','#f05b5b','#a0d4f0','#e0a0f0','#f0e0a0','#a0f0c0'];

let state = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') || JSON.parse(JSON.stringify(defaultData));

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ── UTILS ──
function fmt(n) {
  return '₹' + Math.round(n).toLocaleString('en-IN');
}
function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
}
function monthLabel(ym) {
  const [y, m] = ym.split('-');
  return new Date(y, m-1, 1).toLocaleString('default', { month: 'short', year: 'numeric' });
}
function uid() { return Date.now() + Math.random(); }
function getMonths(n = 12) {
  const months = [];
  const d = new Date();
  for (let i = n-1; i >= 0; i--) {
    const dd = new Date(d.getFullYear(), d.getMonth() - i, 1);
    months.push(`${dd.getFullYear()}-${String(dd.getMonth()+1).padStart(2,'0')}`);
  }
  return months;
}

// ── NAVIGATION ──
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    const page = item.dataset.page;
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    item.classList.add('active');
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + page).classList.add('active');
    renderPage(page);
  });
});

// ── PHASE TOGGLE ──
document.getElementById('phaseIntern').addEventListener('click', () => setPhase('intern'));
document.getElementById('phaseJob').addEventListener('click', () => setPhase('job'));
function setPhase(p) {
  state.phase = p;
  save();
  document.getElementById('phaseIntern').classList.toggle('active', p === 'intern');
  document.getElementById('phaseJob').classList.toggle('active', p === 'job');
  renderAll();
}

// ── MONTH SELECTS ──
function populateMonthSelects() {
  const months = getMonths(12);
  ['dashMonth','expMonth'].forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    sel.innerHTML = months.map(m => `<option value="${m}">${monthLabel(m)}</option>`).join('');
    sel.value = currentMonth();
  });
}

// ── RENDER ALL ──
function renderAll() {
  const active = document.querySelector('.page.active');
  if (active) renderPage(active.id.replace('page-', ''));
}

function renderPage(page) {
  switch(page) {
    case 'dashboard': renderDashboard(); break;
    case 'budget': renderBudget(); break;
    case 'investments': renderInvestments(); break;
    case 'expenses': renderExpenses(); break;
    case 'goals': renderGoals(); break;
  }
}

// ─────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────
function renderDashboard() {
  const ym = document.getElementById('dashMonth').value || currentMonth();
  const phase = PHASES[state.phase];
  const exps = state.expenses[ym] || [];
  const totalSpent = exps.reduce((s, e) => s + e.amount, 0);
  const totalInvested = state.investments.reduce((s, i) => s + i.monthly, 0);
  const surplus = phase.income - totalSpent;

  // KPIs
  document.getElementById('kpiRow').innerHTML = `
    <div class="kpi">
      <div class="kpi-label">Monthly Income</div>
      <div class="kpi-value kpi-accent">${fmt(phase.income)}</div>
      <div class="kpi-sub">${phase.label}</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Spent This Month</div>
      <div class="kpi-value ${totalSpent > phase.income * 0.5 ? 'kpi-warn' : ''}">${fmt(totalSpent)}</div>
      <div class="kpi-sub">${Math.round(totalSpent/phase.income*100)}% of income</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Investing Monthly</div>
      <div class="kpi-value kpi-accent">${fmt(totalInvested)}</div>
      <div class="kpi-sub">Across ${state.investments.length} instruments</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Surplus</div>
      <div class="kpi-value ${surplus < 0 ? 'kpi-danger' : 'kpi-accent'}">${fmt(surplus)}</div>
      <div class="kpi-sub">${surplus >= 0 ? 'Available to save' : 'Over budget!'}</div>
    </div>
  `;

  // Cashflow bars
  const cfItems = [
    { label: 'Fixed Expenses', val: phase.items.filter(i=>i.cat==='bcat-spend').reduce((s,i)=>s+i.amount,0), color: '#f05b5b', max: phase.income },
    { label: 'Investments', val: phase.items.filter(i=>i.cat==='bcat-invest').reduce((s,i)=>s+i.amount,0), color: '#00e5a0', max: phase.income },
    { label: 'Savings', val: phase.items.filter(i=>i.cat==='bcat-save').reduce((s,i)=>s+i.amount,0), color: '#5b6af0', max: phase.income },
    { label: 'Personal', val: phase.items.filter(i=>i.cat==='bcat-personal').reduce((s,i)=>s+i.amount,0), color: '#f0a05b', max: phase.income },
  ];
  document.getElementById('cashflowBars').innerHTML = cfItems.map(item => `
    <div class="cf-item">
      <div class="cf-meta"><span>${item.label}</span><span>${fmt(item.val)}</span></div>
      <div class="cf-bar-bg">
        <div class="cf-bar" style="width:${Math.min(100, item.val/item.max*100)}%;background:${item.color}"></div>
      </div>
    </div>
  `).join('');

  // Donut
  const donutData = cfItems.filter(i => i.val > 0);
  const total = donutData.reduce((s,i) => s+i.val, 0) || 1;
  const svg = document.getElementById('donutChart');
  let html = '', angle = -90, cx = 100, cy = 100, r = 70, inner = 45;
  donutData.forEach((item, idx) => {
    const pct = item.val / total;
    const a1 = angle * Math.PI/180;
    const a2 = (angle + pct*360) * Math.PI/180;
    const x1 = cx + r*Math.cos(a1), y1 = cy + r*Math.sin(a1);
    const x2 = cx + r*Math.cos(a2), y2 = cy + r*Math.sin(a2);
    const ix1 = cx + inner*Math.cos(a1), iy1 = cy + inner*Math.sin(a1);
    const ix2 = cx + inner*Math.cos(a2), iy2 = cy + inner*Math.sin(a2);
    const large = pct > 0.5 ? 1 : 0;
    html += `<path d="M${ix1},${iy1} L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} L${ix2},${iy2} A${inner},${inner} 0 ${large} 0 ${ix1},${iy1}" fill="${item.color}" opacity="0.9"/>`;
    angle += pct * 360;
  });
  html += `<text x="100" y="96" text-anchor="middle" fill="#e8eaf0" font-size="13" font-family="JetBrains Mono" font-weight="600">${fmt(total)}</text>
           <text x="100" y="112" text-anchor="middle" fill="#8890a8" font-size="9" font-family="Space Grotesk">planned</text>`;
  svg.innerHTML = html;
  document.getElementById('donutLegend').innerHTML = donutData.map(item =>
    `<div class="legend-item"><span class="legend-dot" style="background:${item.color}"></span>${item.label}</div>`
  ).join('');

  // Projection
  renderProjection();
}

function renderProjection() {
  const container = document.getElementById('projectionChart');
  const w = container.offsetWidth || 600, h = 180;
  const monthly = state.investments.reduce((s,i) => s+i.monthly, 0);
  const years = 10;
  const points = [];
  for (let m = 0; m <= years*12; m++) {
    const val = monthly * ((Math.pow(1 + 0.11/12, m) - 1) / (0.11/12));
    points.push(val);
  }
  const max = points[points.length-1];
  const toX = (i) => (i / (years*12)) * (w - 60) + 30;
  const toY = (v) => h - 20 - (v/max) * (h - 40);
  const path = points.map((v,i) => `${i===0?'M':'L'}${toX(i)},${toY(v)}`).join(' ');
  const area = path + ` L${toX(years*12)},${h-20} L${toX(0)},${h-20} Z`;

  const labels = [0, 2, 4, 6, 8, 10].map(y => {
    const v = points[y*12];
    return `<text x="${toX(y*12)}" y="${h-4}" text-anchor="middle" fill="#545d78" font-size="9" font-family="JetBrains Mono">Yr ${y}</text>
            <text x="${toX(y*12)}" y="${toY(v)-6}" text-anchor="middle" fill="#8890a8" font-size="8" font-family="JetBrains Mono">${fmt(v)}</text>`;
  }).join('');

  container.innerHTML = `<svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" preserveAspectRatio="none">
    <defs>
      <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#00e5a0" stop-opacity="0.25"/>
        <stop offset="100%" stop-color="#00e5a0" stop-opacity="0.02"/>
      </linearGradient>
    </defs>
    <path d="${area}" fill="url(#projGrad)"/>
    <path d="${path}" fill="none" stroke="#00e5a0" stroke-width="2.5" stroke-linecap="round"/>
    ${labels}
  </svg>`;
}

// ─────────────────────────────────────────
// BUDGET
// ─────────────────────────────────────────
function renderBudget() {
  const renderPhaseCard = (key, isActive) => {
    const p = PHASES[key];
    const items = p.items;
    const total = items.reduce((s,i) => s+i.amount, 0);
    return `
      <div class="phase-card ${isActive ? 'active-phase' : ''}">
        <div class="phase-card-title">${p.label} ${isActive ? '← Current' : ''}</div>
        <div class="phase-card-sub">Take-home: ${fmt(p.income)}/month</div>
        ${items.map(item => `
          <div class="budget-item">
            <span class="budget-item-name ${item.cat}">
              <span style="width:8px;height:8px;border-radius:50%;background:currentColor;display:inline-block;opacity:0.7"></span>
              ${item.name}
            </span>
            <span class="budget-item-amt">${fmt(item.amount)}</span>
          </div>
        `).join('')}
        <div class="budget-total">
          <span>Total Allocated</span>
          <span style="font-family:var(--font-mono)">${fmt(total)}</span>
        </div>
        <div class="budget-total" style="color:var(--accent)">
          <span>Unallocated</span>
          <span style="font-family:var(--font-mono)">${fmt(p.income - total)}</span>
        </div>
      </div>
    `;
  };

  document.getElementById('budgetPhaseCards').innerHTML =
    renderPhaseCard('intern', state.phase === 'intern') +
    renderPhaseCard('job', state.phase === 'job');

  // Alloc editor for current phase
  const phase = PHASES[state.phase];
  document.getElementById('allocEditor').innerHTML = phase.items.map((item, i) => `
    <div class="alloc-row">
      <span class="alloc-label ${item.cat}">${item.name}</span>
      <input type="range" class="alloc-slider" min="0" max="${phase.income}" step="100" value="${item.amount}" data-idx="${i}" />
      <span class="alloc-val" id="av_${i}">${fmt(item.amount)}</span>
    </div>
  `).join('');

  document.querySelectorAll('.alloc-slider').forEach(sl => {
    sl.addEventListener('input', () => {
      const idx = +sl.dataset.idx;
      document.getElementById('av_' + idx).textContent = fmt(sl.value);
    });
  });
}

// ─────────────────────────────────────────
// INVESTMENTS
// ─────────────────────────────────────────
function renderInvestments() {
  const totalSIP = state.investments.reduce((s,i) => s+i.monthly, 0);
  const totalVal = state.investments.reduce((s,i) => s + (i.units * i.nav), 0);
  const months = state.epfMonths || 0;
  const epfYours = months * 2400;
  const epfEmployer = months * 2400;
  const epfTotal = epfYours + epfEmployer;

  document.getElementById('investKpiRow').innerHTML = `
    <div class="kpi">
      <div class="kpi-label">Total Monthly SIP</div>
      <div class="kpi-value kpi-accent">${fmt(totalSIP)}</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Portfolio Value</div>
      <div class="kpi-value">${fmt(totalVal)}</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">EPF Corpus</div>
      <div class="kpi-value kpi-warn">${fmt(epfTotal)}</div>
      <div class="kpi-sub">${months} months accrued</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Combined Wealth</div>
      <div class="kpi-value kpi-accent">${fmt(totalVal + epfTotal)}</div>
    </div>
  `;

  document.getElementById('investBody').innerHTML = state.investments.map(inv => `
    <tr>
      <td>${inv.name}</td>
      <td><span class="type-badge type-${inv.type}">${inv.type.toUpperCase()}</span></td>
      <td style="font-family:var(--font-mono)">${fmt(inv.monthly)}/mo</td>
      <td style="font-family:var(--font-mono)">${inv.units > 0 ? inv.units.toFixed(3) + ' units' : 'Tracking'}</td>
      <td style="color:var(--accent);font-family:var(--font-mono)">+${inv.returns}%</td>
      <td><button class="del-btn" onclick="deleteInvestment(${inv.id})">✕</button></td>
    </tr>
  `).join('') || '<tr><td colspan="6" style="text-align:center;color:var(--text3);padding:2rem">No investments yet — add one!</td></tr>';

  // EPF info
  document.getElementById('epfInfo').innerHTML = `
    <div class="epf-grid">
      <div class="epf-stat">
        <div class="epf-stat-label">Basic Salary</div>
        <div class="epf-stat-value" style="color:var(--text)">₹20,000</div>
      </div>
      <div class="epf-stat">
        <div class="epf-stat-label">Your Contribution (12%)</div>
        <div class="epf-stat-value" style="color:var(--accent2)">₹2,400/mo</div>
      </div>
      <div class="epf-stat">
        <div class="epf-stat-label">Employer Match</div>
        <div class="epf-stat-value" style="color:var(--accent)">₹2,400/mo</div>
      </div>
      <div class="epf-stat">
        <div class="epf-stat-label">EPF Rate</div>
        <div class="epf-stat-value" style="color:var(--accent3)">8.25% p.a.</div>
      </div>
    </div>
    <div style="margin-top:1rem;display:flex;align-items:center;gap:1rem">
      <span style="font-size:0.82rem;color:var(--text2)">Months at job:</span>
      <input type="number" id="epfMonthsInput" class="form-input" style="width:80px" value="${months}" min="0" max="600" />
      <button class="btn-primary" onclick="updateEPF()">Update</button>
      <span style="font-size:0.82rem;color:var(--text3)">Total EPF corpus: <strong style="color:var(--accent);font-family:var(--font-mono)">${fmt(epfTotal)}</strong></span>
    </div>
  `;
}

function updateEPF() {
  state.epfMonths = +document.getElementById('epfMonthsInput').value;
  save();
  renderInvestments();
}

function deleteInvestment(id) {
  state.investments = state.investments.filter(i => i.id !== id);
  save();
  renderInvestments();
}

// ─────────────────────────────────────────
// EXPENSES
// ─────────────────────────────────────────
function renderExpenses() {
  const ym = document.getElementById('expMonth').value || currentMonth();
  const exps = state.expenses[ym] || [];
  const fixed = exps.filter(e => e.fixed);
  const variable = exps.filter(e => !e.fixed);
  const totalFixed = fixed.reduce((s,e) => s+e.amount, 0);
  const totalVar = variable.reduce((s,e) => s+e.amount, 0);
  const total = totalFixed + totalVar;
  const income = PHASES[state.phase].income;

  document.getElementById('expKpiRow').innerHTML = `
    <div class="kpi">
      <div class="kpi-label">Total Spent</div>
      <div class="kpi-value">${fmt(total)}</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Fixed</div>
      <div class="kpi-value kpi-danger">${fmt(totalFixed)}</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Variable</div>
      <div class="kpi-value kpi-warn">${fmt(totalVar)}</div>
    </div>
    <div class="kpi">
      <div class="kpi-label">Remaining</div>
      <div class="kpi-value ${income-total < 0 ? 'kpi-danger' : 'kpi-accent'}">${fmt(income - total)}</div>
    </div>
  `;

  const phase = PHASES[state.phase];
  document.getElementById('fixedList').innerHTML = phase.items
    .filter(i => i.cat === 'bcat-spend')
    .map(i => `
      <div class="expense-pill">
        <span class="pill-name">${i.name}</span>
        <span class="pill-amt" style="color:var(--danger)">${fmt(i.amount)}</span>
      </div>
    `).join('') || '<div style="color:var(--text3);font-size:0.82rem;padding:0.5rem">No fixed expenses</div>';

  document.getElementById('varList').innerHTML = variable.length > 0
    ? variable.map(e => `
      <div class="expense-pill">
        <span class="pill-name">${e.desc} <span style="font-size:0.7rem;color:var(--text3)">${e.category}</span></span>
        <span class="pill-amt" style="color:var(--accent3)">${fmt(e.amount)}</span>
      </div>
    `).join('')
    : '<div style="color:var(--text3);font-size:0.82rem;padding:0.5rem">No variable expenses logged yet</div>';

  document.getElementById('expBody').innerHTML = exps.length > 0
    ? exps.sort((a,b) => new Date(b.date) - new Date(a.date)).map(e => `
      <tr>
        <td style="font-family:var(--font-mono);font-size:0.78rem">${e.date}</td>
        <td>${e.desc}</td>
        <td><span class="type-badge ${e.fixed ? 'type-epf' : 'type-stock'}">${e.category}</span></td>
        <td style="font-family:var(--font-mono)">${fmt(e.amount)}</td>
        <td><button class="del-btn" onclick="deleteExpense('${ym}', ${e.id})">✕</button></td>
      </tr>
    `).join('')
    : '<tr><td colspan="5" style="text-align:center;color:var(--text3);padding:2rem">No expenses logged for this month</td></tr>';
}

function deleteExpense(ym, id) {
  state.expenses[ym] = (state.expenses[ym] || []).filter(e => e.id !== id);
  save();
  renderExpenses();
}

// ─────────────────────────────────────────
// GOALS
// ─────────────────────────────────────────
function renderGoals() {
  document.getElementById('goalsGrid').innerHTML = state.goals.map(g => {
    const pct = Math.min(100, (g.saved / g.target) * 100);
    const monthsLeft = g.monthly > 0 ? Math.ceil((g.target - g.saved) / g.monthly) : '∞';
    const colors = { 'gc-green': '#00e5a0', 'gc-blue': '#5b6af0', 'gc-orange': '#f0a05b' };
    return `
      <div class="goal-card ${g.color}">
        <div class="goal-name">${g.name}</div>
        <div class="goal-target">Target: ${fmt(g.target)}</div>
        <div class="goal-progress">
          <div class="goal-bar" style="width:${pct}%;background:${colors[g.color]}"></div>
        </div>
        <div class="goal-meta">
          <span>${fmt(g.saved)} saved (${Math.round(pct)}%)</span>
          <span>${monthsLeft} months left</span>
        </div>
        <div class="goal-actions">
          <button class="btn-ghost" onclick="addToGoal(${g.id})">+ Add Savings</button>
          <button class="del-btn" onclick="deleteGoal(${g.id})" style="margin-left:auto">✕</button>
        </div>
      </div>
    `;
  }).join('') + `
    <div class="goal-card" style="border-style:dashed;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0.5rem;cursor:pointer;min-height:180px" onclick="openAddGoal()">
      <span style="font-size:2rem;color:var(--text3)">+</span>
      <span style="color:var(--text3);font-size:0.85rem">Add a new goal</span>
    </div>
  `;
}

function addToGoal(id) {
  const g = state.goals.find(g => g.id === id);
  if (!g) return;
  openModal('Add Savings to Goal', `
    <div class="form-group">
      <label class="form-label">Goal: ${g.name}</label>
      <input type="number" class="form-input" id="goalAmt" placeholder="Amount to add" min="0" />
    </div>
  `, () => {
    const amt = +document.getElementById('goalAmt').value;
    if (amt > 0) { g.saved = Math.min(g.target, g.saved + amt); save(); renderGoals(); }
  });
}

function deleteGoal(id) {
  state.goals = state.goals.filter(g => g.id !== id);
  save();
  renderGoals();
}

function openAddGoal() {
  openModal('New Goal', `
    <div class="form-group"><label class="form-label">Goal Name</label><input type="text" class="form-input" id="gName" placeholder="e.g. Laptop Fund" /></div>
    <div class="form-group"><label class="form-label">Target Amount (₹)</label><input type="number" class="form-input" id="gTarget" placeholder="50000" /></div>
    <div class="form-group"><label class="form-label">Monthly Savings (₹)</label><input type="number" class="form-input" id="gMonthly" placeholder="2000" /></div>
    <div class="form-group"><label class="form-label">Color</label>
      <select class="form-select" id="gColor">
        <option value="gc-green">Green</option>
        <option value="gc-blue">Blue</option>
        <option value="gc-orange">Orange</option>
      </select>
    </div>
  `, () => {
    const name = document.getElementById('gName').value.trim();
    const target = +document.getElementById('gTarget').value;
    if (!name || !target) return;
    state.goals.push({ id: uid(), name, target, saved: 0, color: document.getElementById('gColor').value, monthly: +document.getElementById('gMonthly').value });
    save(); renderGoals();
  });
}

// ─────────────────────────────────────────
// ADD INVESTMENT MODAL
// ─────────────────────────────────────────
document.getElementById('addInvestmentBtn').addEventListener('click', () => {
  openModal('Add Investment', `
    <div class="form-group"><label class="form-label">Name</label><input type="text" class="form-input" id="iName" placeholder="e.g. Nifty Next 50 Fund" /></div>
    <div class="form-group"><label class="form-label">Type</label>
      <select class="form-select" id="iType"><option value="mf">Mutual Fund</option><option value="stock">Stock</option><option value="epf">EPF/PF</option></select>
    </div>
    <div class="form-group"><label class="form-label">Monthly SIP / Buy Amount (₹)</label><input type="number" class="form-input" id="iMonthly" placeholder="3000" /></div>
    <div class="form-group"><label class="form-label">Expected Returns (% p.a.)</label><input type="number" class="form-input" id="iReturns" placeholder="11" /></div>
  `, () => {
    const name = document.getElementById('iName').value.trim();
    const monthly = +document.getElementById('iMonthly').value;
    if (!name || !monthly) return;
    state.investments.push({ id: uid(), name, type: document.getElementById('iType').value, monthly, units: 0, nav: 0, returns: +document.getElementById('iReturns').value || 11 });
    save(); renderInvestments();
  });
});

// ─────────────────────────────────────────
// ADD EXPENSE MODAL
// ─────────────────────────────────────────
document.getElementById('addExpenseBtn').addEventListener('click', () => {
  const ym = document.getElementById('expMonth').value || currentMonth();
  const today = new Date().toISOString().split('T')[0];
  openModal('Add Expense', `
    <div class="form-group"><label class="form-label">Date</label><input type="date" class="form-input" id="eDate" value="${today}" /></div>
    <div class="form-group"><label class="form-label">Description</label><input type="text" class="form-input" id="eDesc" placeholder="e.g. Swiggy dinner" /></div>
    <div class="form-group"><label class="form-label">Category</label>
      <select class="form-select" id="eCat">${EXPENSE_CATS.map(c => `<option>${c}</option>`).join('')}</select>
    </div>
    <div class="form-group"><label class="form-label">Amount (₹)</label><input type="number" class="form-input" id="eAmt" placeholder="500" /></div>
    <div class="form-group"><label class="form-label" style="display:flex;align-items:center;gap:0.5rem;cursor:pointer">
      <input type="checkbox" id="eFixed" /> Fixed/Recurring expense
    </label></div>
  `, () => {
    const desc = document.getElementById('eDesc').value.trim();
    const amt = +document.getElementById('eAmt').value;
    if (!desc || !amt) return;
    if (!state.expenses[ym]) state.expenses[ym] = [];
    state.expenses[ym].push({
      id: uid(),
      date: document.getElementById('eDate').value,
      desc,
      category: document.getElementById('eCat').value,
      amount: amt,
      fixed: document.getElementById('eFixed').checked
    });
    save(); renderExpenses();
  });
});

// ─────────────────────────────────────────
// MODAL ENGINE
// ─────────────────────────────────────────
let modalCallback = null;
function openModal(title, bodyHTML, onSave) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalBody').innerHTML = bodyHTML;
  modalCallback = onSave;
  document.getElementById('modalOverlay').classList.add('open');
}
document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('modalCancel').addEventListener('click', closeModal);
document.getElementById('modalOverlay').addEventListener('click', e => { if (e.target === document.getElementById('modalOverlay')) closeModal(); });
document.getElementById('modalSave').addEventListener('click', () => { if (modalCallback) modalCallback(); closeModal(); });
function closeModal() { document.getElementById('modalOverlay').classList.remove('open'); modalCallback = null; }

// ─────────────────────────────────────────
// MONTH SELECT LISTENERS
// ─────────────────────────────────────────
document.getElementById('dashMonth').addEventListener('change', () => renderDashboard());
document.getElementById('expMonth').addEventListener('change', () => renderExpenses());

// ─────────────────────────────────────────
// INIT
// ─────────────────────────────────────────
function init() {
  populateMonthSelects();
  setPhase(state.phase);
  // Sync phase buttons
  document.getElementById('phaseIntern').classList.toggle('active', state.phase === 'intern');
  document.getElementById('phaseJob').classList.toggle('active', state.phase === 'job');
  renderDashboard();
  window.addEventListener('resize', () => {
    const active = document.querySelector('.page.active');
    if (active && active.id === 'page-dashboard') renderProjection();
  });
}

init();
