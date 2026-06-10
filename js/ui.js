/**
 * ui.js — Módulo de Interfaz de Usuario
 * Renderiza la población, los jugadores, el equipo y el flujo de pasos del AG
 */

"use strict";

// ─── Colores de atributos (sincronizado con data.js) ─────────
const ATTR_BAR_COLORS = ["#00e5ff","#00e676","#ff6d00","#ff1744","#ffd600","#9c27b0"];

// ─── Renderizado de Jugadores (Tab Jugadores) ──────────────────

/**
 * Dibuja todas las tarjetas de jugadores en el grid del tab "Jugadores".
 * @param {Array<Object>} players
 */
function renderPlayersGrid(players) {
  const grid = document.getElementById('playersGrid');
  if (!grid) return;

  grid.innerHTML = players.map(p => playerCardHTML(p)).join('');
}

/**
 * Genera el HTML de una tarjeta de jugador.
 * @param {Object} p — jugador
 * @returns {string}
 */
function playerCardHTML(p) {
  const bars = ATTR_NAMES.map((name, i) => {
    const pct = p.attrs[i]; // ya es 60-99
    return `
      <div class="attr-bar-wrap">
        <span class="attr-label">${name}</span>
        <div class="attr-bar">
          <div class="attr-fill" style="width:${pct}%; background:${ATTR_BAR_COLORS[i]};"></div>
        </div>
        <span class="attr-val">${p.attrs[i]}</span>
      </div>`;
  }).join('');

  return `
    <div class="player-card">
      <div class="player-number">${p.number}</div>
      <div class="player-name">${p.name}</div>
      <div class="player-position">${p.position}</div>
      <div class="player-attrs">${bars}</div>
      <div class="player-total">
        <span class="player-total-label">Total</span>
        <span class="player-total-val">${p.total}</span>
      </div>
    </div>`;
}

// ─── Renderizado de Población (Tab Simulador) ─────────────────

/**
 * Actualiza el grid de la población con los individuos actuales.
 * @param {Array<{chromo, fitness}>} population
 */
function renderPopulationGrid(population) {
  const grid = document.getElementById('populationGrid');
  if (!grid) return;

  const sorted = [...population].sort((a, b) => b.fitness - a.fitness);
  const maxFit = sorted[0].fitness;
  const minFit = sorted[sorted.length - 1].fitness;

  grid.innerHTML = sorted.map((ind, idx) => {
    const isBest = idx === 0;
    const isGood = ind.fitness > (minFit + (maxFit - minFit) * 0.6);
    const cls    = isBest ? 'best' : (isGood ? 'good' : '');
    const short  = ind.chromo.join('').substring(0, 16) + (ind.chromo.length > 16 ? '…' : '');
    return `
      <div class="pop-card ${cls}" title="Fitness: ${ind.fitness}">
        <div class="pop-idx">#${idx + 1}</div>
        <div class="pop-fitness">${ind.fitness}</div>
        <div class="pop-chromo">${short}</div>
      </div>`;
  }).join('');
}

// ─── Renderizado del Equipo Final ─────────────────────────────

/**
 * Dibuja el equipo óptimo en la cancha visual.
 * @param {Array<Object>} teamPlayers — jugadores seleccionados
 * @param {number} fitness
 */
function renderTeamCourt(teamPlayers, fitness) {
  const court = document.getElementById('teamCourt');
  const label = document.getElementById('teamFitnessLabel');
  if (!court) return;

  if (label) {
    label.textContent = `Fitness del equipo óptimo: ${fitness} | ${teamPlayers.length} jugadores seleccionados`;
  }

  if (teamPlayers.length === 0) {
    court.innerHTML = '<div class="court-placeholder">Sin jugadores seleccionados</div>';
    return;
  }

  // Divide en dos filas (ataque y defensa)
  const half   = Math.ceil(teamPlayers.length / 2);
  const front  = teamPlayers.slice(0, half);
  const back   = teamPlayers.slice(half);

  const rowHTML = (players) =>
    players.map(p => `
      <div class="team-player-card">
        <div class="team-player-name">${p.name}</div>
        <div class="team-player-pos">${p.position}</div>
        <div class="team-player-score">${p.total}</div>
      </div>`).join('');

  court.innerHTML = `
    <div class="court-label">🔼 Zona de Ataque</div>
    <div class="court-grid">${rowHTML(front)}</div>
    <hr class="court-divider" />
    <div class="court-label">🔽 Zona de Defensa</div>
    <div class="court-grid">${rowHTML(back)}</div>`;
}

// ─── Paso a Paso del Flujo del AG ────────────────────────────

const STEP_IDS   = ['sInit', 'sEval', 'sSel', 'sCross', 'sMut'];

/**
 * Resetea todos los nodos del flujo.
 */
function resetStepFlow() {
  STEP_IDS.forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.classList.remove('active', 'done'); }
  });
}

/**
 * Activa visualmente un nodo del flujo de pasos.
 * @param {string} id — ID del elemento (e.g. 'sEval')
 */
function activateStep(id) {
  resetStepFlow();
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
}

/**
 * Marca todos los pasos como completados.
 */
function completeAllSteps() {
  STEP_IDS.forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.classList.remove('active'); el.classList.add('done'); }
  });
}

// ─── Log del Proceso ──────────────────────────────────────────

/**
 * Actualiza el log del proceso evolutivo.
 * @param {Array<{text, cls}>} logs
 */
function renderLogs(logs) {
  const logEl = document.getElementById('stepLog');
  if (!logEl) return;
  logEl.innerHTML = logs.map(l =>
    `<div class="log-line ${l.cls || ''}">${l.text}</div>`
  ).join('');
  logEl.scrollTop = logEl.scrollHeight;
}

// ─── Stats Panel ──────────────────────────────────────────────

/**
 * Actualiza las estadísticas del panel lateral.
 * @param {number} gen
 * @param {number} best
 * @param {number} avg
 * @param {string} status
 */
function updateStats(gen, best, avg, status) {
  setText('statGen', gen);
  setText('statBest', best);
  setText('statAvg', avg);
  setText('statStatus', status);
}

/**
 * Badge de generación en la población grid.
 * @param {number} gen
 */
function updateGenBadge(gen) {
  setText('genBadge', `Gen ${gen}`);
}

// ─── Helper ───────────────────────────────────────────────────

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}
