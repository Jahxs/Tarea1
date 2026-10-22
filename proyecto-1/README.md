# Project 1: Full-Stack Task Manager (Spring Boot & PostgreSQL)

**Student:** Jhostin Molina  
**Course:** Web Programming  
**Tech Stack:** Java 17+, Spring Boot 3.3.4, Spring Data JPA, PostgreSQL, jQuery 3.7.1, CSS Grid & Flexbox, Tailwind CSS  

---

## 📌 Project Overview

**TaskHub Pro** is a full-stack, enterprise-grade task management web application built with a **Spring Boot 3** REST API backend and a **PostgreSQL** relational database. The frontend features an interactive, responsive user interface powered by **jQuery**, featuring a **strictly structured 3-column equal-width card grid**, an interactive **Kanban board**, a **table view**, and an in-place **detail dossier modal**.

---

## 🏛️ Backend Architecture (Spring Boot & PostgreSQL)

The backend follows the standard layered MVC architecture:

```text
com.proyecto.crudtareas/
├── CrudTareasApplication.java   --> Spring Boot entry point
├── controller/
│   └── TareaController.java     --> REST Controller exposing /api/tareas endpoints
├── model/
│   └── Tarea.java               --> JPA Entity mapped to PostgreSQL table 'tareas'
├── repository/
│   └── TareaRepository.java     --> Spring Data JPA repository interface
└── service/
    └── TareaService.java        --> Business logic layer
```

### 📡 RESTful Endpoints

| HTTP Method | Endpoint | Description | Response Status |
|---|---|---|---|
| `GET` | `/api/tareas` | Retrieves all registered tasks (supports ordering & filtering) | `200 OK` |
| `GET` | `/api/tareas/{id}` | Retrieves detailed specification for a single task | `200 OK` / `404 Not Found` |
| `POST` | `/api/tareas` | Creates a new task in PostgreSQL | `201 Created` |
| `PUT` | `/api/tareas/{id}` | Updates an existing task's title, description, or status | `200 OK` |
| `DELETE` | `/api/tareas/{id}` | Deletes a task by ID | `200 OK` / `204 No Content` |

---

## 🎨 Frontend Architecture & 3-Column Grid

### 1. 3-Column Equal-Size Responsive Grid
* **Desktop (&ge; 1024px):** Exactly **3 columns of equal size** enforced via CSS Grid (`grid-template-columns: repeat(3, minmax(0, 1fr)) !important`).
* **Tablet (&ge; 640px):** Adapts responsively to **2 columns**.
* **Mobile (< 640px):** Collapses cleanly into a single vertical column.
* **Structured Description Layout:** Each card contains:
  1. **Header:** Status badge (`PENDING`, `IN_PROGRESS`, `COMPLETED`), pulsator, and ID pill.
  2. **Title:** High-contrast, responsive typography.
  3. **Structured Description Box:** Encapsulated metadata box displaying character count, icon, and formatted description text.
  4. **Footer:** Quick one-click status transition buttons (`Start 🔄`, `Complete ✅`, `Reopen ⏳`) + Action buttons (Dossier, Edit, Delete).

### 2. Multi-View System
* **Cards (3 Columns):** Standard grid presentation.
* **Kanban Board:** 3 status columns (*Pending*, *In Progress*, *Completed*).
* **Compact Table:** Contained tabular view with actionable rows.

### 3. jQuery Integration
* DOM ready initialization via `$(document).ready()`.
* Event handling for real-time live search, theme toggling, and asynchronous CRUD requests.

---

## 💻 Execution Instructions

### Option 1: Direct Script (Windows)
Double-click `iniciar_servidor.bat` in the repository root directory.

### Option 2: Maven CLI
```bash
cd proyecto-1
.\mvnw.cmd spring-boot:run
```

Once running, navigate to: [http://localhost:8080/](http://localhost:8080/) in your browser.

---

**Jhostin Molina**  
Web Programming
