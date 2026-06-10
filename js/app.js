/**
 * app.js — Módulo Principal de la Aplicación
 * Conecta todos los módulos: data.js, genetic.js, charts.js, ui.js
 * Maneja eventos de la UI y el ciclo de vida del AG
 */

"use strict";

// ─── Estado de la Aplicación ──────────────────────────────────
const state = {
  running: false,
  stepMode: false,
  stepGen: 0,
  stepPopulation: null,
  lastResult: null,
};

// ─── Inicialización ────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  setupTabs();
  setupControls();
  setupButtons();
  renderPlayersGrid(getPlayerPool());
});

// ─── Tabs ──────────────────────────────────────────────────────
function setupTabs() {
  const buttons = document.querySelectorAll('.tab-btn');
  const panels  = document.querySelectorAll('.tab-panel');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;

      buttons.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const panel = document.getElementById(`tab-${target}`);
      if (panel) panel.classList.add('active');
    });
  });
}

// ─── Controles (sliders + selects) ────────────────────────────
function setupControls() {
  const bindings = [
    { inputId: 'popSize',      valId: 'popSizeVal',     fmt: v => v },
    { inputId: 'maxGen',       valId: 'maxGenVal',      fmt: v => v },
    { inputId: 'mutRate',      valId: 'mutRateVal',     fmt: v => v + '%' },
    { inputId: 'crossRate',    valId: 'crossRateVal',   fmt: v => v + '%' },
    { inputId: 'playerCount',  valId: 'playerCountVal', fmt: v => v },
    { inputId: 'teamSize',     valId: 'teamSizeVal',    fmt: v => v },
  ];

  bindings.forEach(({ inputId, valId, fmt }) => {
    const input = document.getElementById(inputId);
    const val   = document.getElementById(valId);
    if (!input || !val) return;

    input.addEventListener('input', () => {
      val.textContent = fmt(input.value);
      // Si cambia playerCount → regenerar pool
      if (inputId === 'playerCount') {
        regeneratePlayers(Number(input.value));
        renderPlayersGrid(getPlayerPool());
      }
    });
  });
}

// ─── Botones ──────────────────────────────────────────────────
function setupButtons() {
  document.getElementById('btnRun')?.addEventListener('click', () => {
    if (state.running) return;
    startGA(false);
  });

  document.getElementById('btnStep')?.addEventListener('click', () => {
    // Modo paso a paso: ejecuta de 1 en 1 generación
    startGA(true);
  });

  document.getElementById('btnReset')?.addEventListener('click', resetApp);

  document.getElementById('btnRegenPlayers')?.addEventListener('click', () => {
    const count = Number(document.getElementById('playerCount')?.value || 18);
    regeneratePlayers(count);
    renderPlayersGrid(getPlayerPool());
  });
}

// ─── Ejecutar el AG ───────────────────────────────────────────

function getParams() {
  return {
    popSize:     Number(document.getElementById('popSize')?.value   || 30),
    maxGen:      Number(document.getElementById('maxGen')?.value    || 50),
    mutRate:     Number(document.getElementById('mutRate')?.value   || 10),
    crossRate:   Number(document.getElementById('crossRate')?.value || 80),
    selMethod:   document.getElementById('selMethod')?.value || 'tournament',
    teamSize:    Number(document.getElementById('teamSize')?.value  || 6),
  };
}

/**
 * Inicia el AG en modo completo o paso a paso.
 * @param {boolean} stepMode
 */
async function startGA(stepMode) {
  const params  = getParams();
  const players = getPlayerPool();

  // Validación mínima
  if (params.teamSize > players.length) {
    updateStats('—', '—', '—', '⚠ Team > Pool');
    return;
  }

  state.running = true;
  setBtnState(true);
  resetStepFlow();
  activateStep('sInit');
  updateStats(0, '…', '…', '⏳ Corriendo');
  addLog({ text: '🚀 Iniciando Algoritmo Genético…', cls: 'highlight' }, true);

  const delay = stepMode ? 200 : 0;
  const fitnessHistory = [];
  let finalResult = null;

  // Ejecutar AG con callbacks por generación
  await new Promise(resolve => {
    let genQueue = Promise.resolve();

    const result = runGA({
      ...params,
      players,
      onGeneration: (data) => {
        genQueue = genQueue.then(async () => {
          // Flujo de pasos animado (solo si delay > 0)
          if (delay > 0) {
            activateStep('sEval');  await sleep(delay * 0.3);
            activateStep('sSel');   await sleep(delay * 0.2);
            activateStep('sCross'); await sleep(delay * 0.2);
            activateStep('sMut');   await sleep(delay * 0.3);
          }

          fitnessHistory.push(data);
          updateConvergenceChart(data.gen > 0 ? fitnessHistory.map(d => ({
            gen: d.gen, best: d.best, avg: d.avg, worst: d.worst,
          })) : []);

          renderPopulationGrid(data.population);
          updateGenBadge(data.gen);
          updateStats(data.gen, data.best, data.avg, `Gen ${data.gen}/${params.maxGen}`);
          renderLogs(data.logs);

          if (data.gen === params.maxGen) {
            finalResult = data;
            resolve();
          }
        });
      },
    });

    finalResult = result;
    // Para modo sin delay, resolve inmediatamente después del loop
    if (delay === 0) resolve();
  });

  // Convergencia final
  if (fitnessHistory.length > 0) {
    updateConvergenceChart(fitnessHistory.map(d => ({
      gen: d.gen, best: d.best, avg: d.avg, worst: d.worst,
    })));
  } else {
    // Fallback para modo sync
    updateConvergenceChart(gaResult.fitnessHistory);
  }

  // Finalización
  completeAllSteps();
  updateStats(params.maxGen, gaResult.bestIndividual?.fitness || '—', '—', '✅ Completado');
  renderLogs(gaResult.logs);
  renderPopulationGrid(gaResult.finalPopulation);

  // Equipo óptimo
  const bestPlayers  = getSelectedPlayers(gaResult.bestIndividual.chromo, players);
  const worstPlayers = getSelectedPlayers(gaResult.worstIndividual.chromo, players);

  renderTeamCourt(bestPlayers, gaResult.bestIndividual.fitness);
  updateRadarChart(bestPlayers);
  updateComparisonChart(bestPlayers, worstPlayers);

  state.running    = false;
  state.lastResult = gaResult;
  setBtnState(false);
}

// ─── Reset ────────────────────────────────────────────────────
function resetApp() {
  state.running = false;
  setBtnState(false);
  resetStepFlow();
  destroyCharts();
  updateStats('—', '—', '—', 'Listo');
  updateGenBadge(0);
  renderLogs([]);

  const grid = document.getElementById('populationGrid');
  if (grid) grid.innerHTML = '<div class="pop-placeholder">Ejecuta el algoritmo para ver la población</div>';

  const court = document.getElementById('teamCourt');
  if (court) court.innerHTML = '<div class="court-placeholder">Sin equipo generado aún</div>';

  const label = document.getElementById('teamFitnessLabel');
  if (label) label.textContent = 'Ejecuta el algoritmo primero para ver el equipo óptimo.';

  const logEl = document.getElementById('stepLog');
  if (logEl) logEl.innerHTML = '<p class="log-placeholder">El log del proceso aparecerá aquí…</p>';
}

// ─── Helpers ──────────────────────────────────────────────────

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function setBtnState(running) {
  const runBtn  = document.getElementById('btnRun');
  const stepBtn = document.getElementById('btnStep');
  if (runBtn)  { runBtn.disabled  = running; runBtn.classList.toggle('loading', running); }
  if (stepBtn) { stepBtn.disabled = running; }
}

function addLog(entry, clear = false) {
  const logEl = document.getElementById('stepLog');
  if (!logEl) return;
  if (clear) logEl.innerHTML = '';
  const div = document.createElement('div');
  div.className = `log-line ${entry.cls || ''}`;
  div.textContent = entry.text;
  logEl.appendChild(div);
  logEl.scrollTop = logEl.scrollHeight;
}
