/**
 * Smart Crop Advisor — Frontend Application Logic
 * Handles form validation, API calls, results rendering, charts, and history.
 */

const API_BASE = 'http://localhost:3000';

// ══════════════════════════════════════════════
//  Utilities
// ══════════════════════════════════════════════

function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0
  }).format(amount);
}

function formatNum(n, dec = 2) {
  return parseFloat(n).toFixed(dec);
}

function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = '';
  t.className = `toast toast-${type}`;
  const icon = type === 'success' ? '✅' : '⚠️';
  t.innerHTML = `<span>${icon}</span> ${msg}`;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3500);
}

function showSpinner(show) {
  const el = document.getElementById('spinnerOverlay');
  if (el) el.classList.toggle('visible', show);
}

// ══════════════════════════════════════════════
//  LocalStorage History
// ══════════════════════════════════════════════

const HISTORY_KEY = 'sca_prediction_history';

function getHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; }
  catch { return []; }
}

function saveToHistory(entry) {
  const history = getHistory();
  history.unshift({ ...entry, id: Date.now(), date: new Date().toLocaleString('en-IN') });
  if (history.length > 8) history.pop(); // keep last 8
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
  renderHistoryList();
  showToast('History cleared.', 'success');
}

function renderHistoryList() {
  const list = document.getElementById('historyList');
  if (!list) return;
  const history = getHistory();
  if (!history.length) {
    list.innerHTML = '<p class="no-history">No saved predictions yet.</p>';
    return;
  }
  list.innerHTML = history.map(h => `
    <div class="history-item" onclick="loadFromHistory(${h.id})" title="Click to restore">
      <span style="font-size:1.4rem">${h.topCropIcon || '🌾'}</span>
      <div class="history-meta">
        <div class="history-title">${h.location || 'Unknown'} • ${h.season || ''}</div>
        <div class="history-date">${h.date}</div>
      </div>
      <span style="font-size:0.78rem;color:var(--green-400)">${h.topCrop || ''}</span>
    </div>
  `).join('');
}

function loadFromHistory(id) {
  const history = getHistory();
  const entry = history.find(h => h.id === id);
  if (!entry) return;
  // Prefill the form fields
  const fields = ['soilType', 'soilPH', 'N', 'P', 'K', 'Ca', 'Mg', 'S', 'temperature', 'rainfall', 'location', 'startMonth', 'endMonth'];
  fields.forEach(f => {
    const el = document.getElementById(f);
    if (el && entry[f] !== undefined) {
      el.value = entry[f];
    }
  });
  showToast('Previous data loaded into form.', 'success');
}

// ══════════════════════════════════════════════
//  Form Page Logic
// ══════════════════════════════════════════════

function initFormPage() {
  const form = document.getElementById('cropForm');
  if (!form) return;

  renderHistoryList();

  // ── Reset button ──
  document.getElementById('btnReset')?.addEventListener('click', () => {
    form.reset();
    form.querySelectorAll('.form-control').forEach(el => el.classList.remove('is-invalid'));
  });

  // ── Clear history ──
  document.getElementById('btnClearHistory')?.addEventListener('click', clearHistory);

  // ── Geolocation ──
  document.getElementById('btnLocate')?.addEventListener('click', () => {
    if (!navigator.geolocation) {
      showToast('Geolocation not supported by your browser.', 'error');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          const name =
            data.address?.village ||
            data.address?.town ||
            data.address?.city ||
            data.address?.state ||
            'Your Location';
          document.getElementById('location').value = name;
          showToast(`Location detected: ${name}`, 'success');
        } catch {
          document.getElementById('location').value = `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`;
          showToast('Location detected (coordinates).', 'success');
        }
      },
      () => showToast('Could not get location. Please enter manually.', 'error')
    );
  });

  // ── Inline validation ──
  form.querySelectorAll('.form-control').forEach(el => {
    el.addEventListener('blur', () => validateField(el));
    el.addEventListener('input', () => {
      if (el.classList.contains('is-invalid')) validateField(el);
    });
  });

  // ── Submit ──
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateForm(form)) {
      showToast('Please fix the highlighted errors.', 'error');
      return;
    }

    const parseMonth = (val) => {
      const clean = (val || '').toString().toLowerCase().trim();
      const monthMap = {jan:1, feb:2, mar:3, apr:4, may:5, jun:6, jul:7, aug:8, sep:9, oct:10, nov:11, dec:12};
      if (!isNaN(parseInt(clean)) && parseInt(clean) >= 1 && parseInt(clean) <= 12) return parseInt(clean);
      return monthMap[clean.substring(0,3)] || 1;
    };

    const payload = {
      soilType:    document.getElementById('soilType').value,
      soilPH:      parseFloat(document.getElementById('soilPH').value),
      N:           parseFloat(document.getElementById('N').value),
      P:           parseFloat(document.getElementById('P').value),
      K:           parseFloat(document.getElementById('K').value),
      Ca:          parseFloat(document.getElementById('Ca').value) || 0,
      Mg:          parseFloat(document.getElementById('Mg').value) || 0,
      S:           parseFloat(document.getElementById('S').value) || 0,
      temperature: parseFloat(document.getElementById('temperature').value),
      rainfall:    parseFloat(document.getElementById('rainfall').value),
      location:    document.getElementById('location').value || 'Your Farm',
      startMonth:  parseMonth(document.getElementById('startMonth').value),
      endMonth:    parseMonth(document.getElementById('endMonth').value)
    };

    showSpinner(true);

    try {
      // Call all 3 endpoints in parallel
      const [predictRes, recommendRes] = await Promise.all([
        fetch(`${API_BASE}/predict`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }),
        fetch(`${API_BASE}/recommend`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      ]);

      if (!predictRes.ok || !recommendRes.ok) throw new Error('Server error. Is the backend running?');

      const predictData   = await predictRes.json();
      const recommendData = await recommendRes.json();

      // Save to history
      const top = recommendData.top3?.[0];
      saveToHistory({
        ...payload,
        topCrop:     top?.crop     || '',
        topCropIcon: top?.icon     || '🌾',
        topProfit:   top?.profit   || 0
      });

      // Store results for results page
      const resultsPayload = {
        input:       payload,
        predict:     predictData,
        recommend:   recommendData,
        timestamp:   new Date().toISOString()
      };
      sessionStorage.setItem('sca_results', JSON.stringify(resultsPayload));

      showSpinner(false);
      window.location.href = 'results.html';

    } catch (err) {
      showSpinner(false);
      console.error(err);
      showToast(err.message || 'Connection failed. Make sure backend is running on port 3000.', 'error');
    }
  });
}

function validateField(el) {
  const v = el.value.trim();
  let valid = true;

  if (el.required && !v) {
    valid = false;
  } else if (el.type === 'number' && v !== '') {
    const n = parseFloat(v);
    if (el.min !== '' && n < parseFloat(el.min)) valid = false;
    if (el.max !== '' && n > parseFloat(el.max)) valid = false;
  }

  el.classList.toggle('is-invalid', !valid);
  return valid;
}

function validateForm(form) {
  let allValid = true;
  form.querySelectorAll('.form-control[required]').forEach(el => {
    if (!validateField(el)) allValid = false;
  });
  return allValid;
}

// ══════════════════════════════════════════════
//  Results Page Logic
// ══════════════════════════════════════════════

let chartInstance = null;

function initResultsPage() {
  const container = document.getElementById('resultsContainer');
  if (!container) return;

  const raw = sessionStorage.getItem('sca_results');
  if (!raw) {
    container.innerHTML = `
      <div class="error-state fade-up">
        <div class="error-icon">🌾</div>
        <h2 class="section-title">No Results Found</h2>
        <p class="section-subtitle" style="margin-bottom:32px">
          Please fill in the form first to get your crop prediction.
        </p>
        <a href="form.html" class="btn btn-primary">← Go to Form</a>
      </div>`;
    return;
  }

  let data;
  try { data = JSON.parse(raw); }
  catch {
    container.innerHTML = `<div class="error-state"><div class="error-icon">❌</div><h2>Data Error</h2><a href="form.html" class="btn btn-primary">← Try Again</a></div>`;
    return;
  }

  const { input, predict, recommend } = data;
  const top3      = recommend.top3 || [];
  const all       = recommend.all || [];
  const bestCrop  = top3[0] || {};
  const yields    = predict.yields || [];

  // ── Build the full results HTML ──
  container.innerHTML = `
    <!-- Summary bar -->
    <div class="summary-bar fade-up">
      <div>
        <h1>Prediction Results</h1>
        <p class="summary-meta">
          📍 ${input.location} &nbsp;·&nbsp; 🗓️ Growing Window: ${input.startMonth} - ${input.endMonth} &nbsp;·&nbsp;
          🕒 ${new Date(data.timestamp).toLocaleString('en-IN')}
        </p>
      </div>
      <div class="summary-actions">
        <button class="btn btn-outline btn-sm" onclick="saveResultPDF()">💾 Save</button>
        <a href="form.html" class="btn btn-primary btn-sm">🔄 New Prediction</a>
      </div>
    </div>

    <!-- Top 4 stat cards -->
    <div class="stats-grid fade-up fade-up-delay-1">
      <div class="stat-card stat-green">
        <div class="stat-icon">🌾</div>
        <div class="stat-label">Best Crop</div>
        <div class="stat-value" style="font-size:1.5rem">${bestCrop.icon || ''} ${bestCrop.crop || '—'}</div>
        <div class="stat-sub">Highest profit potential</div>
      </div>
      <div class="stat-card stat-blue">
        <div class="stat-icon">⚖️</div>
        <div class="stat-label">Predicted Yield</div>
        <div class="stat-value">${formatNum(bestCrop.yield || 0)} <span style="font-size:1rem;opacity:.6">t/ha</span></div>
        <div class="stat-sub">Tons per hectare</div>
      </div>
      <div class="stat-card stat-amber">
        <div class="stat-icon">💰</div>
        <div class="stat-label">Market Revenue</div>
        <div class="stat-value" style="font-size:1.5rem">${formatINR(bestCrop.revenue || 0)}</div>
        <div class="stat-sub">@ ${formatINR(bestCrop.pricePerTon || 0)} / ton</div>
      </div>
      <div class="stat-card ${(bestCrop.profit || 0) >= 0 ? 'stat-green' : 'stat-purple'}">
        <div class="stat-icon">${(bestCrop.profit || 0) >= 0 ? '📈' : '📉'}</div>
        <div class="stat-label">Net Profit</div>
        <div class="stat-value" style="font-size:1.5rem">${formatINR(bestCrop.profit || 0)}</div>
        <div class="stat-sub">After cultivation cost</div>
      </div>
    </div>

    <!-- Top 3 Recommendations -->
    <div class="fade-up fade-up-delay-2" style="margin-top:32px">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">
        <h2 class="section-title" style="font-size:1.4rem">🏆 Top 3 Recommended Crops</h2>
        <div class="badge badge-green">Ranked by Profit</div>
      </div>
      <div class="rec-grid">
        ${top3.map((c, i) => renderRecCard(c, i)).join('')}
      </div>
    </div>

    <!-- Chart -->
    <div class="chart-section fade-up fade-up-delay-3">
      <div class="chart-header">
        <div class="chart-title">📊 Profit Comparison — All Crops</div>
        <div class="chart-tabs">
          <button class="chart-tab active" id="tabProfit"  onclick="switchChart('profit')">Net Profit</button>
          <button class="chart-tab"        id="tabYield"   onclick="switchChart('yield')">Yield (t/ha)</button>
          <button class="chart-tab"        id="tabScore"   onclick="switchChart('score')">Suitability</button>
        </div>
      </div>
      <div class="chart-container">
        <canvas id="cropChart"></canvas>
      </div>
    </div>

    <!-- All Crops Table -->
    <div class="all-crops-section fade-up">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;margin-top:32px">
        <h2 class="section-title" style="font-size:1.3rem">📋 All Crops Analysis</h2>
      </div>
      <div class="table-wrap">
        <table id="cropsTable">
          <thead>
            <tr>
              <th>#</th>
              <th>Crop</th>
              <th>Yield (t/ha)</th>
              <th>Price/ton</th>
              <th>Revenue</th>
              <th>Cost</th>
              <th>Net Profit</th>
              <th>Margin</th>
              <th>Suitability</th>
            </tr>
          </thead>
          <tbody>
            ${all.map((c, i) => `
              <tr>
                <td style="color:var(--text-muted)">${i + 1}</td>
                <td><span style="font-size:1.2rem">${c.icon}</span> <b>${c.crop}</b></td>
                <td>${formatNum(c.yield)} t</td>
                <td>${formatINR(c.pricePerTon)}</td>
                <td>${formatINR(c.revenue)}</td>
                <td style="color:var(--text-muted)">${formatINR(c.cost)}</td>
                <td class="${c.profit >= 0 ? 'profit-positive' : 'profit-negative'} fw-600">${formatINR(c.profit)}</td>
                <td><span class="${c.profitMargin >= 0 ? 'text-green' : 'text-red'}">${formatNum(c.profitMargin)}%</span></td>
                <td>
                  <div style="display:flex;align-items:center;gap:8px">
                    <div class="progress-bar" style="width:70px">
                      <div class="progress-fill" style="width:${c.suitability}%"></div>
                    </div>
                    <span style="font-size:0.78rem;color:var(--text-muted)">${c.suitability}%</span>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Input Summary -->
    <div class="input-summary fade-up" style="margin-top:28px">
      <div class="input-summary-title">📝 Input Summary</div>
      <div class="input-pills">
        <div class="input-pill">🌍 Soil: <b>${capitalize(input.soilType)}</b></div>
        <div class="input-pill">⚗️ pH: <b>${input.soilPH}</b></div>
        <div class="input-pill">🧪 N: <b>${input.N} kg</b></div>
        <div class="input-pill">🧪 P: <b>${input.P} kg</b></div>
        <div class="input-pill">🧪 K: <b>${input.K} kg</b></div>
        <div class="input-pill">🧱 Ca: <b>${input.Ca} kg</b></div>
        <div class="input-pill">🧱 Mg: <b>${input.Mg} kg</b></div>
        <div class="input-pill">🧱 S: <b>${input.S} kg</b></div>
        <div class="input-pill">🌡️ Temp: <b>${input.temperature}°C</b></div>
        <div class="input-pill">🌧️ Rainfall: <b>${input.rainfall} mm</b></div>
        <div class="input-pill">📍 Location: <b>${input.location}</b></div>
        <div class="input-pill">🗓️ Season: <b>Months ${input.startMonth} - ${input.endMonth}</b></div>
      </div>
    </div>
  `;

  // Build initial chart (profit mode)
  buildChart(all, 'profit');

  // Store data for chart switching
  window._chartData = all;
}

function renderRecCard(c, i) {
  const rankColors = ['var(--amber-400)', 'var(--text-secondary)', '#cd7f32'];
  const medals = ['🥇', '🥈', '🥉'];
  const isPositive = (c.profit || 0) >= 0;

  return `
    <div class="rec-card">
      <div class="rec-card-header">
        <span class="rec-crop-icon">${c.icon}</span>
        <div>
          <div style="display:flex;align-items:center;gap:8px">
            <div class="rank-badge rank-${i + 1}">${i + 1}</div>
            <span class="rec-crop-name">${c.crop}</span>
          </div>
          <div class="rec-crop-tag">${medals[i]} Rank #${i + 1} Recommendation</div>
        </div>
      </div>

      <div style="display:flex;flex-direction:column;gap:8px">
        <div class="rec-row">
          <span class="rec-row-label">⚖️ Yield</span>
          <span class="rec-row-val text-blue">${formatNum(c.yield)} t/ha</span>
        </div>
        <div class="rec-row">
          <span class="rec-row-label">💹 Price/ton</span>
          <span class="rec-row-val">${formatINR(c.pricePerTon)}</span>
        </div>
        <div class="rec-row">
          <span class="rec-row-label">💰 Revenue</span>
          <span class="rec-row-val text-amber">${formatINR(c.revenue)}</span>
        </div>
        <div class="rec-row">
          <span class="rec-row-label">🏗️ Cost</span>
          <span class="rec-row-val text-muted">${formatINR(c.cost)}</span>
        </div>
        <div class="rec-row">
          <span class="rec-row-label">📈 Net Profit</span>
          <span class="rec-row-val ${isPositive ? 'text-green' : 'text-red'}" style="font-size:1rem">${formatINR(c.profit)}</span>
        </div>
      </div>

      <div class="rec-score-bar">
        <div class="rec-score-label">
          <span>Suitability Score</span>
          <span style="color:${rankColors[i]};font-weight:600">${c.suitability}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width:${c.suitability}%;background:${
            i === 0 ? 'var(--grad-green)' : i === 1 ? 'linear-gradient(135deg,#94a3b8,#64748b)' : 'linear-gradient(135deg,#b45309,#92400e)'
          }"></div>
        </div>
      </div>
    </div>
  `;
}

function buildChart(crops, mode = 'profit') {
  const canvas = document.getElementById('cropChart');
  if (!canvas) return;

  const labels = crops.map(c => `${c.icon} ${c.crop}`);
  let values, label, colorFn;

  if (mode === 'profit') {
    values  = crops.map(c => c.profit);
    label   = 'Net Profit (₹)';
    colorFn = (v) => v >= 0 ? 'rgba(34,197,94,0.75)' : 'rgba(248,113,113,0.75)';
  } else if (mode === 'yield') {
    values  = crops.map(c => c.yield);
    label   = 'Yield (tons/ha)';
    colorFn = () => 'rgba(96,165,250,0.75)';
  } else {
    values  = crops.map(c => c.suitability);
    label   = 'Suitability Score (%)';
    colorFn = () => 'rgba(251,191,36,0.75)';
  }

  const colors      = values.map(colorFn);
  const borderColors = colors.map(c => c.replace('0.75', '1'));

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label,
        data: values,
        backgroundColor: colors,
        borderColor: borderColors,
        borderWidth: 1.5,
        borderRadius: 6,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(13,21,38,0.95)',
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1,
          padding: 12,
          callbacks: {
            label: ctx => {
              const v = ctx.parsed.y;
              if (mode === 'profit') return ` ₹${v.toLocaleString('en-IN')}`;
              if (mode === 'yield') return ` ${v.toFixed(2)} t/ha`;
              return ` ${v}%`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { color: '#94a3b8', font: { size: 11 } }
        },
        y: {
          grid: { color: 'rgba(255,255,255,0.07)' },
          ticks: {
            color: '#94a3b8',
            font: { size: 11 },
            callback: v => mode === 'profit' ? `₹${(v/1000).toFixed(0)}k` : v
          }
        }
      },
      animation: { duration: 600, easing: 'easeOutQuart' }
    }
  });
}

function switchChart(mode) {
  ['tabProfit','tabYield','tabScore'].forEach(id => {
    document.getElementById(id)?.classList.remove('active');
  });
  const map = { profit: 'tabProfit', yield: 'tabYield', score: 'tabScore' };
  document.getElementById(map[mode])?.classList.add('active');
  if (window._chartData) buildChart(window._chartData, mode);
}

function saveResultPDF() {
  showToast('Prediction saved! Check your browser history sidebar.', 'success');
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ══════════════════════════════════════════════
//  Router — detect which page we're on
// ══════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;

  if (path.includes('form') || path === '/' || path.endsWith('/')) {
    initFormPage();
  }

  if (path.includes('results')) {
    initResultsPage();
  }
});
