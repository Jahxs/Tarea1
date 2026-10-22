# 🚀 Jira & SCRUM Implementation Guide for Web Project

This document outlines the complete setup for managing this project using the **SCRUM methodology** in **Atlassian Jira**, integrating it with **GitHub** (`Jahxs/Proyecto-Crud`), configuring **workflow automations**, and applying the **Git feature-branch** workflow.

---

## 📌 Table of Contents
1. [SCRUM Framework Overview](#1-scrum-framework-overview)
2. [Jira Project Setup](#2-jira-project-setup)
3. [Connecting Jira with GitHub](#3-connecting-jira-with-github)
4. [Jira Workflow Automations](#4-jira-workflow-automations)
5. [Backlog & Ready-to-Use User Stories](#5-backlog--ready-to-use-user-stories)
6. [Git Branching Strategy & Smart Commits](#6-git-branching-strategy--smart-commits)

---

## 1. SCRUM Framework Overview

* **Sprints:** 2-week iterations (or 1-week depending on course deadlines).
* **Board Columns:**
  1. `Backlog` / `To Do`: Stories planned for the current Sprint.
  2. `In Progress`: Actively being developed on a dedicated feature branch.
  3. `In Review`: Pull Request (PR) has been opened in GitHub.
  4. `Done`: PR merged into `main` and acceptance criteria verified.

---

## 2. Jira Project Setup

1. Log into your Atlassian Jira workspace (e.g., `https://your-workspace.atlassian.net`).
2. Click **Projects** > **Create Project**.
3. Select the template: **Software Development** -> **Scrum**.
4. Choose **Team-managed** (recommended for simplicity) or **Company-managed**.
5. Set:
   * **Name:** `Web Programming Project`
   * **Key:** `POKE` (or `PROJ`)
6. Ensure your board has the 4 columns: `To Do`, `In Progress`, `In Review`, and `Done`.

---

## 3. Connecting Jira with GitHub

Connecting Jira with your GitHub repository (`https://github.com/Jahxs/Proyecto-Crud`) enables automatic synchronization of branches, commits, and Pull Requests directly into your Jira issue cards.

### Steps:
1. In Jira, go to **Apps** (top navigation bar) -> **Explore more apps**.
2. Search for **"GitHub for Jira"** (Official Atlassian app) and click **Get app**.
3. Click **Get started** and authorize your GitHub account (`Jahxs`).
4. Select the repository: `Jahxs/Proyecto-Crud`.
5. Once connected, Jira will recognize any branch or commit containing the issue key (e.g., `POKE-12`).

---

## 4. Jira Workflow Automations

Set up these 3 automated rules to save manual work and ensure your Jira board reflects real development progress.

*Go to: **Project Settings** > **Automation** > **Create Rule**.*

### Rule 1: Move to "In Progress" when a branch is created
* **Trigger:** DevOps > `Branch created`
* **Action:** Transition issue to `In Progress`
* **Action (optional):** Assign issue to the user who triggered the event.

### Rule 2: Move to "In Review" when a Pull Request is opened
* **Trigger:** DevOps > `Pull request created`
* **Action:** Transition issue to `In Review`
* **Action:** Add comment: *"Pull Request opened in GitHub. Ready for peer review."*

### Rule 3: Move to "Done" when a Pull Request is merged
* **Trigger:** DevOps > `Pull request merged`
* **Action:** Transition issue to `Done`
* **Action:** Add comment: *"Changes successfully merged into main branch."*

---

## 5. Backlog & Ready-to-Use User Stories

Copy and paste these pre-formatted User Stories directly into your Jira backlog.

---

### 🗂️ EPIC 1: Architecture & Linguistic Standards (`POKE-E1`)

#### Story 1.1: Modularize JavaScript Codebase
* **Issue Type:** Story | **Story Points:** 5
* **Title:** Modularize Frontend JavaScript Codebase
* **Description:**
  > As a developer, I want to decouple `app.js` into distinct ES6/modular files so that the application is maintainable, scalable, and adheres to clean architecture principles.
* **Acceptance Criteria:**
  - [ ] Utility functions (`debounce`, `throttle`) are moved to `utils.js`.
  - [ ] PokéAPI interaction logic is encapsulated in `api.js`.
  - [ ] DOM rendering and modal controls are placed in `ui.js`.
  - [ ] Main entry file `app.js` only handles initialization and event bindings.
  - [ ] No regression in existing functionality.

#### Story 1.2: English Localization of Code, Comments, and Documentation
* **Issue Type:** Story | **Story Points:** 3
* **Title:** English Standardization for Code, Comments, and README
* **Description:**
  > As an engineering team member, I want all source code identifiers, comments, commits, and README documentation to be strictly in English so that the project complies with professional industry standards.
* **Acceptance Criteria:**
  - [ ] All variable and function names in JavaScript and Java are in English.
  - [ ] In-code comments are written in English.
  - [ ] Root `README.md` and project `README.md` files are translated and structured in English.

#### Story 1.3: jQuery Integration Across Both Projects
* **Issue Type:** Story | **Story Points:** 3
* **Title:** Standardize jQuery Usage Across Project 1 and Project 2
* **Description:**
  > As a developer, I want both Project 1 and Project 2 to use jQuery consistently for DOM interactions and event handling according to course specifications.
* **Acceptance Criteria:**
  - [ ] jQuery library is imported via CDN in `proyecto-1` and `proyecto-2`.
  - [ ] DOM queries, event bindings, and AJAX interactions leverage jQuery syntax (`$` notation).

---

### 🗂️ EPIC 2: PokéAPI Chaining & Async Controls (`POKE-E2`)

#### Story 2.1: Chained 3-Endpoint Consumption ("JOIN" pattern)
* **Issue Type:** Story | **Story Points:** 8
* **Title:** Chained PokéAPI Data Fetching (Pokemon -> Species -> Evolution Chain)
* **Description:**
  > As a user, I want to view complete information about a Pokémon including its species data and its full evolution chain, which requires chaining 3 external API endpoints sequentially.
* **Acceptance Criteria:**
  - [ ] Endpoint 1 (`/pokemon/{id_or_name}`) retrieves base stats, types, and species URL.
  - [ ] Endpoint 2 (`/pokemon-species/{id}`) retrieves descriptions, habitat, and evolution chain URL.
  - [ ] Endpoint 3 (`/evolution-chain/{id}`) parses and returns all evolutionary stages.
  - [ ] If any stage fails, user is presented with a graceful error message.

#### Story 2.2: Search Input with 4-Second Debounce Delay
* **Issue Type:** Story | **Story Points:** 5
* **Title:** Implement 4-Second Debounce on Search Input
* **Description:**
  > As a user, I want the search input to delay triggering an API request until 4 seconds after I finish typing, preventing unnecessary API calls while typing.
* **Acceptance Criteria:**
  - [ ] A reusable `debounce(fn, delay)` helper function is implemented.
  - [ ] The search input event listener uses a 4000ms delay.
  - [ ] Visual countdown or typing feedback indicator is shown to the user during the 4-second wait.
  - [ ] Clearing the input stops pending timeouts.

#### Story 2.3: Throttle Utility Implementation
* **Issue Type:** Story | **Story Points:** 5
* **Title:** Implement Throttle Helper for High-Frequency Events
* **Description:**
  > As a developer, I want a reusable `throttle(fn, limit)` helper to limit the execution rate of recurring events (such as scroll or repeated button clicks).
* **Acceptance Criteria:**
  - [ ] `throttle(fn, limit)` function prevents execution more than once per specified interval.
  - [ ] Integrated into infinite scroll or rapid-click pagination/action controls.

#### Story 2.4: Same-Page Detailed Modal View
* **Issue Type:** Story | **Story Points:** 5
* **Title:** Interactive Detail View on Same Page upon Card Click
* **Description:**
  > As a user, I want to click on any Pokémon card to open a detailed modal overlay on the same page showing base stats, species description, and full evolution line.
* **Acceptance Criteria:**
  - [ ] Clicking a card opens a modal without navigating away or reloading the page.
  - [ ] Modal can be closed via a close button (`×`), pressing `ESC`, or clicking the backdrop.
  - [ ] Displays data merged from all 3 chained endpoints.

---

### 🗂️ EPIC 3: Spring Boot Backend & 3-Column Responsive UI (`POKE-E3`)

#### Story 3.1: Spring Boot REST API with PostgreSQL & JPA
* **Issue Type:** Story | **Story Points:** 8
* **Title:** Full CRUD Operations with PostgreSQL Persistence
* **Description:**
  > As a user, I want persistent task/entity storage managed through a Spring Boot backend connected to PostgreSQL via Spring Data JPA.
* **Acceptance Criteria:**
  - [ ] Full CRUD endpoints (`GET`, `POST`, `PUT`, `DELETE`) work as expected.
  - [ ] Database entities are mapped properly with JPA annotations.
  - [ ] CORS is configured to allow frontend requests without issues.

#### Story 3.2: 3-Column Equal-Width Responsive Grid
* **Issue Type:** Story | **Story Points:** 5
* **Title:** Responsive 3-Column Equal Size Card Layout
* **Description:**
  > As a user, I want items displayed in structured 3-column cards of identical width that adapt responsively to mobile and tablet screens.
* **Acceptance Criteria:**
  - [ ] Desktop view displays exactly 3 columns of equal width (`repeat(3, 1fr)`).
  - [ ] Tablet view adapts to 2 columns, mobile view adapts to 1 column.
  - [ ] Cards maintain consistent card height and uniform padding/margins.

---

## 6. Git Branching Strategy & Smart Commits

### Branch Naming Standard
```text
feature/<ISSUE-KEY>-<short-description>
refactor/<ISSUE-KEY>-<short-description>
bugfix/<ISSUE-KEY>-<short-description>
```

**Examples:**
* `feature/POKE-12-pokemon-chained-endpoints`
* `feature/POKE-13-debounce-search`
* `refactor/POKE-10-modularize-js`

### Smart Commits Syntax
When committing, include your Jira issue key to link changes automatically:
```bash
git commit -m "POKE-13: implement 4000ms debounce helper on search input"
```

To comment, log work, or resolve directly from Git:
```bash
git commit -m "POKE-13 #comment Implemented 4s countdown and debounce handler #time 2h"
```

### Pull Request Workflow
1. Create and switch to your feature branch:
   ```bash
   git checkout -b feature/POKE-XX-name
   ```
2. Make changes, test locally, and commit with the issue key.
3. Push to GitHub:
   ```bash
   git push -u origin feature/POKE-XX-name
   ```
4. On GitHub, create a **Pull Request** targeted at `main`. The PR template will automatically guide your submission!
