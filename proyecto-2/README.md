# Project 2: Asynchronous External API Integration & Modular Architecture

**Student:** Jhostin Molina  
**Course:** Web Programming  
**Tech Stack:** jQuery 3.7.1, Modular JavaScript (ES6+), Tailwind CSS, CSS Grid/Flexbox  

---

## 📌 Technical Overview

This application implements advanced asynchronous data consumption from two major public REST APIs, structured using a clean modular architecture and responsive modern design.

---

## 🚀 Key Architectural Features

### 1. Modular JavaScript Architecture
The codebase has been refactored from a monolithic file into decoupled, single-responsibility modules:
* `js/utils.js`: Core reusable utilities:
  * `debounce(fn, delay)`: Delays execution until silence period (configured for 4000ms / 4.0s).
  * `throttle(fn, limit)`: Rate-limiting utility ensuring functions execute at most once per interval.
  * `escapeHtml(str)`: XSS sanitization helper.
  * `formatId(id, padLength)`: Formats numeric identifiers (e.g. `#025`).
* `js/api.js`: Centralized asynchronous HTTP fetching and cascading endpoint joins.
* `js/ui.js`: DOM generation, contained responsive tables, and interactive modal dossiers leveraging **jQuery**.
* `js/app.js`: Main application orchestrator managing reactive events, state, and theme settings.

---

### 2. Cascading 3-Endpoint "JOIN" (PokéAPI)
To provide a complete Pokémon dossier without redundant navigation, the application performs a chained 3-endpoint cascade:
1. **Endpoint 1 (`GET /api/v2/pokemon/{id_or_name}`):** Retrieves base combat stats, official artwork sprites, height, weight, and elemental types. Extracts `species.url`.
2. **Endpoint 2 (`GET /api/v2/pokemon-species/{id}`):** Chained from Step 1. Retrieves official Pokédex English lore, habitat, capture rate, color, and `evolution_chain.url`.
3. **Endpoint 3 (`GET /api/v2/evolution-chain/{id}`):** Chained from Step 2. Recursively parses the evolutionary tree into stages with evolution triggers and minimum levels.
4. **Result:** A unified data model passed to the modal view overlay on the same page.

---

### 3. Rick & Morty API (3 Endpoints)
* `GET https://rickandmortyapi.com/api/character`: Character cards with vital status indicators (Alive, Dead, Unknown).
* `GET https://rickandmortyapi.com/api/location`: Contained table with dimension, type, and resident count.
* `GET https://rickandmortyapi.com/api/episode`: Contained table with air dates, episode codes, and cast size.

---

### 4. 4-Second Debounce & Throttle Controls
* **Debounce (4000ms):** When typing in the search box, the request is postponed until 4 seconds after the user stops typing, paired with a live countdown ring (4.0s &rarr; 0.0s).
* **Throttle Rate-Limiting:** Pagination and data reload triggers are throttle-protected to prevent API rate exhaustion from rapid user clicks.

---

### 5. Contained Non-Overflowing Tables
* Built with sticky headers and encapsulated scroll wrappers (`overflow-x-auto` & `overflow-y-auto`).
* Guaranteed to never break or exceed the mobile or desktop viewport width.

---

## 💻 Execution Instructions

1. **Direct Launch (Windows):** Double click `abrir_proyecto_2.bat` in the repository root.
2. **From Browser:** Open `proyecto-2/index.html` directly in any modern browser.
3. **From VS Code:** Right-click `proyecto-2/index.html` and choose **Open with Live Server**.

---

**Jhostin Molina**  
Web Programming
