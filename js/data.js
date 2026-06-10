/**
 * data.js — Generación y manejo del pool de jugadores
 * Escenario 5: Selección de Deportistas Universitarios (Voleibol)
 * CECAR 2026 — Estructuras de Datos y Análisis de Algoritmos
 */

"use strict";

// ─── Constantes ─────────────────────────────────────────────
const POSITIONS = ["Líbero", "Setter", "Opuesto", "Central", "Receptor", "Punta"];

const FIRST_NAMES = [
  "Carlos", "Andrés", "Sebastián", "Miguel", "Juan", "David", "Felipe",
  "Alejandro", "Santiago", "Nicolás", "Camilo", "Esteban", "Luisa", "Valeria",
  "Daniela", "María", "Laura", "Sofía", "Natalia", "Juliana", "Karen",
  "Marcela", "Tatiana", "Paula", "Andrea", "Diana", "Manuela", "Catalina"
];

const LAST_NAMES = [
  "García", "Rodríguez", "López", "Martínez", "González", "Hernández",
  "Pérez", "Torres", "Flores", "Ramírez", "Morales", "Jiménez",
  "Álvarez", "Castro", "Romero", "Vargas", "Díaz", "Reyes",
  "Sánchez", "Ortiz", "Medina", "Ruiz", "Chávez", "Mendoza"
];

// Atributos evaluados (cromosoma de atributos)
const ATTR_NAMES = ["Velocidad", "Resistencia", "Ofensiva", "Defensa", "Eq.Trabajo", "Experiencia"];
const ATTR_COLORS = ["#00e5ff", "#00e676", "#ff6d00", "#ff1744", "#ffd600", "#9c27b0"];

/**
 * Genera un nombre aleatorio único.
 */
function randomName(index) {
  const fn = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const ln = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  return `${fn} ${ln}`;
}

/**
 * Genera un jugador con atributos aleatorios.
 * @param {number} index — índice del jugador (0-based)
 * @returns {Object} Objeto jugador
 */
function generatePlayer(index) {
  const attrs = ATTR_NAMES.map(() => Math.floor(Math.random() * 40) + 60); // 60-99
  const total  = attrs.reduce((s, v) => s + v, 0);
  const position = POSITIONS[Math.floor(Math.random() * POSITIONS.length)];
  return {
    id:       index,
    name:     randomName(index),
    number:   index + 1,
    position,
    attrs,   // [velocidad, resistencia, ofensiva, defensa, equipoTrabajo, experiencia]
    total,
  };
}

/**
 * Genera un pool completo de jugadores.
 * @param {number} count — cantidad de jugadores
 * @returns {Array<Object>}
 */
function generatePlayerPool(count) {
  const pool = [];
  for (let i = 0; i < count; i++) {
    pool.push(generatePlayer(i));
  }
  return pool;
}

// ─── Estado global del pool ──────────────────────────────────
let currentPlayerPool = generatePlayerPool(18);

/**
 * Actualiza el pool con un nuevo tamaño.
 * @param {number} count
 */
function regeneratePlayers(count) {
  currentPlayerPool = generatePlayerPool(count);
}

/**
 * Retorna el pool actual.
 */
function getPlayerPool() {
  return currentPlayerPool;
}
