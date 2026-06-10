/**
 * charts.js — Módulo de gráficas (Chart.js)
 * Convergencia de fitness, Radar de habilidades, Comparativa Best vs Worst
 */

"use strict";

// ─── Referencias a instancias de Chart.js ─────────────────────
let convergenceChart = null;
let radarChart       = null;
let comparisonChart  = null;

// ─── Convergencia ─────────────────────────────────────────────

/**
 * Inicializa o actualiza la gráfica de convergencia.
 * @param {Array<{gen, best, avg, worst}>} history
 */
function updateConvergenceChart(history) {
  const ctx  = document.getElementById('convergenceChart');
  if (!ctx) return;

  const labels = history.map(h => h.gen);
  const bests  = history.map(h => h.best);
  const avgs   = history.map(h => h.avg);
  const worsts = history.map(h => h.worst);

  if (convergenceChart) {
    convergenceChart.data.labels               = labels;
    convergenceChart.data.datasets[0].data     = bests;
    convergenceChart.data.datasets[1].data     = avgs;
    convergenceChart.data.datasets[2].data     = worsts;
    convergenceChart.update('none');
    return;
  }

  convergenceChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Mejor Fitness',
          data: bests,
          borderColor: '#00e5ff',
          backgroundColor: 'rgba(0,229,255,0.08)',
          borderWidth: 2.5,
          pointRadius: 2,
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Fitness Promedio',
          data: avgs,
          borderColor: '#ffd600',
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          pointRadius: 1,
          borderDash: [4, 3],
          tension: 0.4,
        },
        {
          label: 'Peor Fitness',
          data: worsts,
          borderColor: '#ff1744',
          backgroundColor: 'transparent',
          borderWidth: 1,
          pointRadius: 1,
          borderDash: [2, 4],
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      animation: { duration: 150 },
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          labels: {
            color: '#8aacc8',
            font: { family: 'Barlow Condensed', size: 13, weight: '600' },
            boxWidth: 20,
          },
        },
        tooltip: {
          backgroundColor: '#16202e',
          borderColor: '#1e3a5f',
          borderWidth: 1,
          titleColor: '#e8f4ff',
          bodyColor: '#8aacc8',
        },
      },
      scales: {
        x: {
          title: { display: true, text: 'Generación', color: '#4a6a8a', font: { size: 12 } },
          ticks: { color: '#4a6a8a', maxTicksLimit: 12 },
          grid: { color: 'rgba(30,58,95,0.4)' },
        },
        y: {
          title: { display: true, text: 'Fitness', color: '#4a6a8a', font: { size: 12 } },
          ticks: { color: '#4a6a8a' },
          grid: { color: 'rgba(30,58,95,0.4)' },
        },
      },
    },
  });
}

// ─── Radar de Habilidades ─────────────────────────────────────

/**
 * Dibuja el radar con los promedios de atributos del equipo óptimo.
 * @param {Array<Object>} teamPlayers — jugadores seleccionados
 */
function updateRadarChart(teamPlayers) {
  const ctx = document.getElementById('radarChart');
  if (!ctx || teamPlayers.length === 0) return;

  // Promedio de cada atributo
  const avgAttrs = ATTR_NAMES.map((_, ai) => {
    const sum = teamPlayers.reduce((s, p) => s + p.attrs[ai], 0);
    return Math.round(sum / teamPlayers.length);
  });

  const data = {
    labels: ATTR_NAMES,
    datasets: [
      {
        label: 'Equipo Óptimo',
        data: avgAttrs,
        backgroundColor: 'rgba(0,229,255,0.15)',
        borderColor: '#00e5ff',
        borderWidth: 2,
        pointBackgroundColor: '#00e5ff',
        pointRadius: 4,
      },
    ],
  };

  if (radarChart) {
    radarChart.data = data;
    radarChart.update();
    return;
  }

  radarChart = new Chart(ctx, {
    type: 'radar',
    data,
    options: {
      responsive: false,
      plugins: {
        legend: {
          labels: { color: '#8aacc8', font: { family: 'Barlow Condensed', size: 13 } },
        },
      },
      scales: {
        r: {
          min: 50,
          max: 100,
          ticks: { color: '#4a6a8a', stepSize: 10, backdropColor: 'transparent' },
          grid: { color: 'rgba(30,58,95,0.5)' },
          angleLines: { color: 'rgba(30,58,95,0.5)' },
          pointLabels: {
            color: '#8aacc8',
            font: { family: 'Barlow Condensed', size: 13, weight: '600' },
          },
        },
      },
    },
  });
}

// ─── Comparativa Best vs Worst ────────────────────────────────

/**
 * Compara atributos promedio del mejor vs peor individuo.
 * @param {Array<Object>} bestPlayers
 * @param {Array<Object>} worstPlayers
 */
function updateComparisonChart(bestPlayers, worstPlayers) {
  const ctx = document.getElementById('comparisonChart');
  if (!ctx) return;

  const avgOf = (players, attrIdx) => {
    if (!players.length) return 0;
    return Math.round(players.reduce((s, p) => s + p.attrs[attrIdx], 0) / players.length);
  };

  const bestAvgs  = ATTR_NAMES.map((_, i) => avgOf(bestPlayers,  i));
  const worstAvgs = ATTR_NAMES.map((_, i) => avgOf(worstPlayers, i));

  const data = {
    labels: ATTR_NAMES,
    datasets: [
      {
        label: 'Mejor Individuo',
        data: bestAvgs,
        backgroundColor: 'rgba(0,229,255,0.6)',
        borderColor: '#00e5ff',
        borderWidth: 1.5,
        borderRadius: 4,
      },
      {
        label: 'Peor Individuo',
        data: worstAvgs,
        backgroundColor: 'rgba(255,23,68,0.4)',
        borderColor: '#ff1744',
        borderWidth: 1.5,
        borderRadius: 4,
      },
    ],
  };

  if (comparisonChart) {
    comparisonChart.data = data;
    comparisonChart.update();
    return;
  }

  comparisonChart = new Chart(ctx, {
    type: 'bar',
    data,
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: '#8aacc8',
            font: { family: 'Barlow Condensed', size: 13, weight: '600' },
          },
        },
        tooltip: {
          backgroundColor: '#16202e',
          borderColor: '#1e3a5f',
          borderWidth: 1,
          titleColor: '#e8f4ff',
          bodyColor: '#8aacc8',
        },
      },
      scales: {
        x: {
          ticks: { color: '#8aacc8', font: { family: 'Barlow Condensed', size: 13 } },
          grid: { color: 'rgba(30,58,95,0.3)' },
        },
        y: {
          min: 50,
          max: 100,
          ticks: { color: '#4a6a8a' },
          grid: { color: 'rgba(30,58,95,0.3)' },
        },
      },
    },
  });
}

/**
 * Destruye todas las gráficas (al reiniciar).
 */
function destroyCharts() {
  if (convergenceChart) { convergenceChart.destroy(); convergenceChart = null; }
  if (radarChart)       { radarChart.destroy();       radarChart       = null; }
  if (comparisonChart)  { comparisonChart.destroy();  comparisonChart  = null; }
}
