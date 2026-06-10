/**
 * genetic.js — Motor del Algoritmo Genético
 * Escenario 5: Selección de Deportistas Universitarios (Voleibol)
 *
 * Representación del cromosoma:
 *   Array de bits de longitud = número de jugadores disponibles.
 *   Bit[i] = 1 → jugador i está en el equipo
 *   Bit[i] = 0 → jugador i NO está en el equipo
 *
 * Función de Fitness:
 *   Suma de atributos totales de jugadores seleccionados
 *   con penalización si el número de seleccionados ≠ teamSize
 */

"use strict";

// ─── Resultado de la última ejecución ────────────────────────
let gaResult = {
  bestIndividual: null,
  worstIndividual: null,
  fitnessHistory: [], // [{gen, best, avg, worst}]
  finalPopulation: [],
  logs: [],
};

// ─── Cromosoma ────────────────────────────────────────────────

/**
 * Crea un cromosoma aleatorio.
 * @param {number} length — número de jugadores disponibles
 * @param {number} teamSize — jugadores a seleccionar
 * @returns {Array<0|1>}
 */
function createChromosome(length, teamSize) {
  // Inicializa con ceros y activa exactamente teamSize posiciones al azar
  const chromo = new Array(length).fill(0);
  const positions = shuffleArray(Array.from({ length }, (_, i) => i)).slice(0, teamSize);
  positions.forEach(i => { chromo[i] = 1; });
  return chromo;
}

/**
 * Crea la población inicial.
 * @param {number} popSize
 * @param {number} playerCount
 * @param {number} teamSize
 * @returns {Array<{chromo, fitness}>}
 */
function initPopulation(popSize, playerCount, teamSize) {
  return Array.from({ length: popSize }, () => ({
    chromo: createChromosome(playerCount, teamSize),
    fitness: 0,
  }));
}

// ─── Fitness ──────────────────────────────────────────────────

/**
 * Calcula el fitness de un individuo.
 * Suma los atributos totales de los jugadores seleccionados.
 * Aplica penalización proporcional si el número de seleccionados ≠ teamSize.
 *
 * @param {Array<0|1>} chromo
 * @param {Array<Object>} players — pool de jugadores
 * @param {number} teamSize — tamaño objetivo del equipo
 * @returns {number}
 */
function calcFitness(chromo, players, teamSize) {
  let totalScore = 0;
  let selected   = 0;

  for (let i = 0; i < chromo.length; i++) {
    if (chromo[i] === 1) {
      totalScore += players[i].total;
      selected++;
    }
  }

  // Penalización por tamaño incorrecto
  const penalty = Math.abs(selected - teamSize) * 200;
  return Math.max(0, totalScore - penalty);
}

/**
 * Evalúa el fitness de toda la población.
 * @param {Array} population
 * @param {Array} players
 * @param {number} teamSize
 */
function evaluatePopulation(population, players, teamSize) {
  population.forEach(ind => {
    ind.fitness = calcFitness(ind.chromo, players, teamSize);
  });
}

// ─── Selección ────────────────────────────────────────────────

/**
 * Selección por Torneo.
 * Elige k individuos al azar y retorna el de mayor fitness.
 * @param {Array} population
 * @param {number} k — tamaño del torneo
 * @returns {Object}
 */
function tournamentSelection(population, k = 3) {
  let best = null;
  for (let i = 0; i < k; i++) {
    const candidate = population[Math.floor(Math.random() * population.length)];
    if (!best || candidate.fitness > best.fitness) {
      best = candidate;
    }
  }
  return best;
}

/**
 * Selección por Ruleta (proporcional al fitness).
 * @param {Array} population
 * @returns {Object}
 */
function rouletteSelection(population) {
  const totalFitness = population.reduce((s, ind) => s + ind.fitness, 0);
  if (totalFitness === 0) {
    return population[Math.floor(Math.random() * population.length)];
  }
  let rand = Math.random() * totalFitness;
  for (const ind of population) {
    rand -= ind.fitness;
    if (rand <= 0) return ind;
  }
  return population[population.length - 1];
}

/**
 * Selecciona un padre según el método elegido.
 * @param {Array} population
 * @param {'tournament'|'roulette'} method
 * @returns {Object}
 */
function selectParent(population, method) {
  return method === 'roulette'
    ? rouletteSelection(population)
    : tournamentSelection(population);
}

// ─── Crossover ────────────────────────────────────────────────

/**
 * Crossover de un punto.
 * Genera dos hijos a partir de dos padres.
 * @param {Array<0|1>} parent1
 * @param {Array<0|1>} parent2
 * @param {number} crossRate — probabilidad de cruce (0-1)
 * @returns {{child1: Array, child2: Array, point: number}}
 */
function onePointCrossover(parent1, parent2, crossRate) {
  if (Math.random() > crossRate) {
    // Sin cruce: los hijos son copias de los padres
    return {
      child1: [...parent1],
      child2: [...parent2],
      point: -1,
    };
  }

  const point = Math.floor(Math.random() * (parent1.length - 1)) + 1;
  const child1 = [...parent1.slice(0, point), ...parent2.slice(point)];
  const child2 = [...parent2.slice(0, point), ...parent1.slice(point)];
  return { child1, child2, point };
}

// ─── Mutación ─────────────────────────────────────────────────

/**
 * Mutación por intercambio (swap mutation).
 * Intercambia aleatoriamente un bit 0 y un bit 1 para mantener el tamaño del equipo.
 * @param {Array<0|1>} chromo
 * @param {number} mutRate — probabilidad de mutación (0-1)
 * @returns {Array<0|1>}
 */
function swapMutation(chromo, mutRate) {
  if (Math.random() > mutRate) return chromo;

  const ones  = chromo.map((b, i) => b === 1 ? i : -1).filter(i => i >= 0);
  const zeros = chromo.map((b, i) => b === 0 ? i : -1).filter(i => i >= 0);

  if (ones.length === 0 || zeros.length === 0) return chromo;

  const iOne  = ones[Math.floor(Math.random() * ones.length)];
  const iZero = zeros[Math.floor(Math.random() * zeros.length)];

  const mutated = [...chromo];
  mutated[iOne]  = 0;
  mutated[iZero] = 1;
  return mutated;
}

// ─── Ciclo Principal del AG ──────────────────────────────────

/**
 * Ejecuta el Algoritmo Genético completo.
 *
 * @param {Object} params — configuración del AG
 * @param {number} params.popSize
 * @param {number} params.maxGen
 * @param {number} params.mutRate       — porcentaje (0-100)
 * @param {number} params.crossRate     — porcentaje (0-100)
 * @param {string} params.selMethod     — 'tournament' | 'roulette'
 * @param {Array}  params.players       — pool de jugadores
 * @param {number} params.teamSize      — tamaño del equipo objetivo
 * @param {Function} params.onGeneration — callback(genData) por generación
 * @returns {Object} gaResult
 */
function runGA(params) {
  const {
    popSize, maxGen,
    mutRate, crossRate,
    selMethod,
    players, teamSize,
    onGeneration,
  } = params;

  const mRate = mutRate  / 100;
  const cRate = crossRate / 100;
  const n     = players.length;

  const logs = [];
  const fitnessHistory = [];

  // 1. INICIALIZACIÓN
  logs.push({ text: `[Gen 0] Inicializando población de ${popSize} individuos…`, cls: 'highlight' });
  let population = initPopulation(popSize, n, teamSize);

  // 2. EVALUACIÓN INICIAL
  evaluatePopulation(population, players, teamSize);
  logs.push({ text: `[Gen 0] Evaluación inicial completada.`, cls: '' });

  for (let gen = 1; gen <= maxGen; gen++) {
    // 3. SELECCIÓN + CROSSOVER + MUTACIÓN → nueva población
    const newPop = [];

    while (newPop.length < popSize) {
      // Selección de padres
      const p1 = selectParent(population, selMethod);
      const p2 = selectParent(population, selMethod);

      // Crossover
      const { child1, child2 } = onePointCrossover(p1.chromo, p2.chromo, cRate);

      // Mutación
      const m1 = swapMutation(child1, mRate);
      const m2 = swapMutation(child2, mRate);

      newPop.push({ chromo: m1, fitness: 0 });
      if (newPop.length < popSize) {
        newPop.push({ chromo: m2, fitness: 0 });
      }
    }

    // Elitismo: conservar el mejor individuo de la generación anterior
    population.sort((a, b) => b.fitness - a.fitness);
    newPop[newPop.length - 1] = { ...population[0] };

    population = newPop;

    // 4. EVALUACIÓN
    evaluatePopulation(population, players, teamSize);

    // Estadísticas de la generación
    population.sort((a, b) => b.fitness - a.fitness);
    const best  = population[0].fitness;
    const worst = population[population.length - 1].fitness;
    const avg   = Math.round(population.reduce((s, i) => s + i.fitness, 0) / population.length);

    fitnessHistory.push({ gen, best, avg, worst });

    // Log cada 5 generaciones
    if (gen % 5 === 0 || gen === 1 || gen === maxGen) {
      logs.push({
        text: `[Gen ${gen}] Mejor=${best} | Prom=${avg} | Peor=${worst}`,
        cls: gen === maxGen ? 'success' : '',
      });
    }

    // Callback de progreso
    if (onGeneration) {
      onGeneration({
        gen, maxGen,
        best, avg, worst,
        population: population.map(ind => ({ ...ind, chromo: [...ind.chromo] })),
        logs: [...logs],
      });
    }
  }

  // Resultado final
  population.sort((a, b) => b.fitness - a.fitness);
  const bestInd  = population[0];
  const worstInd = population[population.length - 1];

  logs.push({ text: `✅ AG completado. Fitness óptimo: ${bestInd.fitness}`, cls: 'success' });

  gaResult = {
    bestIndividual:  bestInd,
    worstIndividual: worstInd,
    fitnessHistory,
    finalPopulation: population,
    logs,
  };

  return gaResult;
}

// ─── Helpers ─────────────────────────────────────────────────

/**
 * Retorna los jugadores seleccionados por un cromosoma.
 * @param {Array<0|1>} chromo
 * @param {Array} players
 * @returns {Array}
 */
function getSelectedPlayers(chromo, players) {
  return players.filter((_, i) => chromo[i] === 1);
}

/**
 * Fisher-Yates shuffle
 * @param {Array} arr
 * @returns {Array}
 */
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
