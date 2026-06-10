# 🏐 AG — Selección de Deportistas Universitarios (Voleibol)
### Proyecto Final · Estructuras de Datos y Análisis de Algoritmos · CECAR 2026

---

## 📁 Estructura del Proyecto

```
volleyball-ga/
│
├── index.html              ← Punto de entrada principal (HTML)
│
├── css/
│   ├── base.css            ← Variables CSS, reset, layout global, header, tabs
│   ├── components.css      ← Tarjetas, controles, población, jugadores, cancha, teoría
│   └── animations.css      ← Keyframes y clases de animación
│
├── js/
│   ├── data.js             ← Generación del pool de jugadores (nombres, posiciones, atributos)
│   ├── genetic.js          ← Motor del Algoritmo Genético (población, fitness, selección, crossover, mutación)
│   ├── charts.js           ← Gráficas con Chart.js (convergencia, radar, comparativa)
│   ├── ui.js               ← Renderizado de la interfaz (jugadores, población, equipo, logs)
│   └── app.js              ← Módulo principal: conecta todo, maneja eventos y ciclo del AG
│
└── README.md               ← Esta documentación
```

---

## 🧬 Descripción del Algoritmo Genético

### Representación del Cromosoma
Cada individuo es un **array de bits** de longitud igual al número de jugadores disponibles:
- `1` = Jugador seleccionado para el equipo
- `0` = Jugador no seleccionado

Ejemplo (18 jugadores, equipo de 6): `[1,0,0,1,0,0,1,0,1,0,0,0,1,0,0,0,0,1]`

### Función de Fitness
```
Fitness = Σ(total_atributos de jugadores seleccionados) − (|seleccionados − teamSize| × 200)
```
- Suma los atributos totales de los jugadores cuyo bit es `1`
- Penaliza fuertemente si el número de seleccionados no coincide con el tamaño deseado

### Atributos de cada Jugador (60–99)
1. Velocidad
2. Resistencia
3. Capacidad Ofensiva
4. Defensa
5. Trabajo en Equipo
6. Experiencia Competitiva

### Operadores Genéticos

| Operador | Implementación |
|----------|---------------|
| **Selección** | Torneo (k=3) o Ruleta proporcional |
| **Crossover** | Un punto aleatorio con tasa configurable |
| **Mutación** | Swap mutation (intercambio 0↔1 para mantener tamaño) |
| **Elitismo** | El mejor individuo siempre pasa a la siguiente generación |

---

## 🚀 Cómo Usar

1. Abrir `index.html` en cualquier navegador moderno.
2. Configurar los **parámetros del AG** en el panel izquierdo.
3. Presionar **▶ Ejecutar AG** para correr el algoritmo completo.
4. Ver la **convergencia del fitness** y la **evolución de la población** en tiempo real.
5. Ir al tab **Equipo Final** para ver el equipo óptimo, el radar de habilidades y la comparativa.
6. Explorar **Fundamentos** para revisar la teoría de los Algoritmos Genéticos.

---

## 📚 Referencias

- https://www.cs.us.es/~fsancho/Blog/posts/Algoritmos_Geneticos.md.html
- https://www.geeksforgeeks.org/genetic-algorithms/
- https://youtu.be/nhT56blfRpE?si=CYs8tWXKIBdATNI6
