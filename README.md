# Web Programming Projects Repository

**Student:** Jhostin Molina  
**Course:** Web Programming  
**Methodology:** SCRUM (Agile Project Management via Atlassian Jira & GitHub)  

---

## 📌 Repository Structure

```text
Programacion Web Proyecto 1/
│
├── .github/
│   └── pull_request_template.md  --> GitHub PR template linked to Jira issue tracking
│
├── docs/
│   └── JIRA_SCRUM_GUIDE.md       --> Complete SCRUM backlog, user stories & automations guide
│
├── proyecto-1/                   --> Project 1: Full-Stack CRUD (Spring Boot 3 + PostgreSQL)
│   ├── pom.xml
│   ├── mvnw.cmd
│   ├── README.md
│   └── src/main/
│       ├── java/...              --> Spring Boot layered architecture (Model, Repo, Service, Controller)
│       └── resources/static/     --> Frontend UI with jQuery & 3-Column Equal-Size Cards Grid
│
├── proyecto-2/                   --> Project 2: National Pokédex (Cascading 3-Endpoint JOIN)
│   ├── index.html                --> Modern Dark UI with Tailwind & Glassmorphism
│   ├── styles.css
│   ├── README.md
│   └── js/
│       ├── utils.js              --> Reusable Debounce (4000ms), Throttle (500ms), and Sanitizers
│       ├── api.js                --> Cascading 3-Endpoint JOIN (/pokemon -> species -> evolution)
│       ├── ui.js                 --> jQuery DOM rendering & same-page modal dossier
│       └── app.js                --> Application controller & lifecycle
│
├── iniciar_servidor.bat          --> One-click launcher for Project 1 (Spring Boot on :8080)
└── abrir_proyecto_2.bat          --> One-click browser launcher for Project 2 (Pokédex)
```

---

## 🚀 Project 1: Full-Stack Task Manager (Spring Boot & PostgreSQL)

Full-stack enterprise application with persistent storage, client-server REST architecture, and an agile Kanban board.

* **Backend:** Spring Boot 3.3.4 (Java 17+) with Spring Data JPA and PostgreSQL.
* **Frontend:** jQuery 3.7.1, CSS Grid, Flexbox, Tailwind CSS, and Native Media Queries.
* **Key Features:**
  * Complete RESTful CRUD operations (`GET`, `POST`, `PUT`, `DELETE` on `/api/tareas`).
  * **3-Column Equal-Size Responsive Grid:** Enforced 3-column equal-width cards on desktop (`repeat(3, 1fr)`).
  * **Structured Description Layout:** Cards with encapsulated metadata, length metrics, and quick status advancement.
  * Multi-view switcher: Cards Grid, 3-Column Kanban Board, and Compact Table.
  * Detail dossier modal with full task specifications.
  * Real-time search (`input` event) and persistent Light / Dark mode.

### How to Run Project 1:
* **Direct Script (Windows):** Run `iniciar_servidor.bat`.
* **From Terminal:**
  ```bash
  cd proyecto-1
  .\mvnw.cmd spring-boot:run
  ```
* **Browser Access:** [http://localhost:8080/](http://localhost:8080/).

---

## ⚡ Project 2: National Pokédex & Cascading 3-Endpoint REST Architecture

Asynchronous web application consuming external REST APIs using **jQuery 3.7.1** and a **Modular JavaScript Architecture**.

* **Cascading 3-Endpoint "JOIN" Architecture:**
  1. `GET https://pokeapi.co/api/v2/pokemon/{id}`: Combat stats, sprites, types, height, weight & `species.url`.
  2. `GET https://pokeapi.co/api/v2/pokemon-species/{id}`: Official English Pokédex lore, habitat, capture rate & `evolution_chain.url`.
  3. `GET https://pokeapi.co/api/v2/evolution-chain/{id}`: Recursive tree traversal parsing full evolution stages.
* **Performance Enhancements:**
  * **4-Second Debounce (`debounce(fn, 4000)`):** Delays the API search until 4 continuous seconds of user inactivity with a live circular countdown indicator (`4.0s` &rarr; `0.0s`).
  * **Throttle (`throttle(fn, 500)`):** Protects pagination and reload controls against click spam.
* **Interactive Modal View:** Card click opens a detailed dossier on the same page without navigating or reloading.

### How to Run Project 2:
* **Direct Script (Windows):** Run `abrir_proyecto_2.bat`.
* **From Browser:** Open `proyecto-2/index.html` directly in any web browser.

---

## 📋 SCRUM & Development Standards

* **SCRUM Management:** Full backlog of Epics, User Stories with Story Points, and Acceptance Criteria documented in [docs/JIRA_SCRUM_GUIDE.md](file:///c:/Users/Jhostin/Programacion%20Web%20Proyecto%201/docs/JIRA_SCRUM_GUIDE.md).
* **Git Flow:** Feature branches (`feature/SCRUM-X-...`) and Smart Commits used throughout the development cycle.
* **Pull Request Template:** Standardized PR submission enforcing Jira linking in [.github/pull_request_template.md](file:///c:/Users/Jhostin/Programacion%20Web%20Proyecto%201/.github/pull_request_template.md).
* **Linguistic Standard:** 100% English source code identifiers, comments, documentation, and commit messages.

---

**Jhostin Molina**  
Web Programming
