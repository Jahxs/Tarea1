# Project 2: National Pokédex & Cascading 3-Endpoint REST Architecture

**Student:** Jhostin Molina  
**Course:** Web Programming  
**Tech Stack:** jQuery 3.7.1, Modular JavaScript (ES6+), Tailwind CSS, CSS Grid/Flexbox, PokéAPI  

---

## 📌 Technical Summary

This web application implements an interactive National Pokédex built with **jQuery** and a **Modular JavaScript Architecture**. It fulfills advanced asynchronous frontend requirements: a **Cascading 3-Endpoint "JOIN" query**, a **4-second Debounced search engine with live countdown feedback**, **Throttle rate-limiting**, and an in-place **Modal Dossier** for seamless user inspection without page reloads.

---

## 🏗️ Architecture & Module Breakdown

The application strictly adheres to the Single Responsibility Principle, separating logic into four modular files located in `proyecto-2/js/`:

```text
proyecto-2/
├── index.html          --> Clean UI, CDN imports (jQuery 3.7.1, Tailwind, FontAwesome)
├── styles.css          --> Custom styling, ambient glassmorphism & keyframe animations
└── js/
    ├── utils.js        --> Reusable Debounce (4000ms), Throttle (500ms), and Sanitizers
    ├── api.js          --> Cascading 3-Endpoint JOIN and asynchronous HTTP handling
    ├── ui.js           --> DOM manipulation, responsive card grid, and detail modal
    └── app.js          --> Main application controller, event listeners, and state
```

### Module Roles:
1. **`js/utils.js` (Utilities):**
   * `debounce(func, delay = 4000)`: Higher-order function that delays invocation until 4000ms of inactivity. Includes a `.cancel()` method to clear pending executions.
   * `throttle(func, limit = 500)`: Higher-order rate-limiter that guarantees a function runs at most once every 500ms, protecting pagination and reload buttons from spam.
   * `escapeHtml(str)`: Defends against cross-site scripting (XSS) by encoding unsafe characters.
   * `formatId(id, padLength)`: Formats integers into standard Pokédex strings (e.g. `25` &rarr; `#025`).

2. **`js/api.js` (Cascading 3-Endpoint "JOIN"):**
   * **Endpoint 1 (`GET /api/v2/pokemon/{id_or_name}`):** Retrieves base combat statistics, elemental types, physical dimensions (height/weight), official artwork sprites, and the `species.url` pointer.
   * **Endpoint 2 (`GET /api/v2/pokemon-species/{id}`):** Triggered using the `species.url` from Endpoint 1. Extracts English Pokédex lore, natural habitat, capture rate, color category, and the `evolution_chain.url` pointer.
   * **Endpoint 3 (`GET /api/v2/evolution-chain/{id}`):** Triggered using the `evolution_chain.url` from Endpoint 2. Recursively traverses the evolutionary tree into stages with evolution triggers (e.g. minimum level, elemental stones).
   * **Result:** Resolves into a unified composite object containing all three layers.

3. **`js/ui.js` (jQuery DOM Rendering):**
   * `renderPokemonCards(pokemonList, onCardClick)`: Generates responsive cards with official artwork, elemental type badges, and action triggers using jQuery (`$`).
   * `openPokemonDetailModal(pokemon)`: Injects the unified 3-endpoint data into an animated modal overlay without leaving the current view.
   * `updatePagination(currentPage, totalPages, totalItems)`: Synchronizes pagination status and enables/disables navigation controls.

4. **`js/app.js` (Controller & Lifecycle):**
   * Initializes theme persistence (`localStorage`), search input bindings with the 4-second Debounce, and throttled pagination controls.

---

## ⚡ Performance Mechanisms

* **4-Second Debounce:** As the user types in the search field, a circular portal countdown animates from `4.0s` down to `0.0s`. If the user continues typing, the timer resets. The API request is only sent once 4 seconds have passed without keystrokes.
* **Throttle Rate-Limiting:** Next/Previous pagination controls and the reload trigger are throttled (500ms / 600ms), eliminating accidental double-clicks and server load spikes.

---

## 💻 Execution Instructions

1. **Direct Launch (Windows):** Run `abrir_proyecto_2.bat` in the repository root.
2. **From Browser:** Open `proyecto-2/index.html` directly in any web browser.
3. **From VS Code:** Right-click `proyecto-2/index.html` and choose **Open with Live Server**.

---

**Jhostin Molina**  
Web Programming
