# Repositorio de Proyectos - Programación Web

Este repositorio contiene dos proyectos completos e independientes según los requerimientos solicitados para la asignatura:

```text
Programacion Web Proyecto 1/
│
├── 📁 proyecto-1/             --> PROYECTO 1: CRUD de Tareas con Spring Boot 3 & PostgreSQL
│   ├── pom.xml
│   ├── mvnw.cmd
│   └── src/
│
└── 📁 proyecto-2/             --> PROYECTO 2: Consumo de APIs Externas con Vanilla JavaScript
    ├── index.html
    ├── styles.css
    ├── app.js
    └── README.md
```

---

## 📌 Proyecto 1: Gestor de Tareas CRUD Full-Stack

* **Backend**: Spring Boot 3.3.4 (Java 17/21) + Spring Data JPA + Hibernate.
* **Base de Datos**: PostgreSQL 18 (`crud_tareas_db`).
* **Frontend**: Vanilla JavaScript + Tailwind CSS + Media Queries nativas (Grid/Flexbox).
* **Características**:
  * Operaciones CRUD completas (Crear, Listar, Actualizar, Eliminar).
  * Vistas múltiples: **Tarjetas Responsivas (Grid)**, **Tablero Kanban (3 columnas)** y **Tabla Compacta**.
  * Ficha Técnica (Document Sheet) con indicador visual interactivo.
  * Búsqueda en tiempo real (*Realtime*) y cambio de tema Claro ☀️ / Oscuro 🌙.
* **Ejecución**:
  * Doble clic en `iniciar_servidor.bat` o desde la terminal:
    ```bash
    cd proyecto-1
    .\mvnw.cmd spring-boot:run
    ```
  * Abrir en el navegador: `http://localhost:8080/`

---

## 🚀 Proyecto 2: Consumo de APIs Externas (Vanilla JS)

* **Tecnología**: Vanilla JavaScript puro (DOM API, Fetch nativo, CSS Grid/Flexbox).
* **APIs Consumidas**:
  * **Rick and Morty API (3 Endpoints)**:
    1. `/character` (Personajes con imagen oficial, badges dinámicos y descripción completa).
    2. `/location` (Ubicaciones en tabla responsiva contenida).
    3. `/episode` (Episodios con código de temporada y fecha de emisión).
  * **PokéAPI (2 Endpoints)**:
    1. `/pokemon` (Listado y paginación).
    2. `/pokemon/{id}` (Ficha de detalle con sprites oficiales, tipos y estadísticas de combate).
* **Características Clave**:
  * **Búsqueda con Delay de tipeo (Debounce 650ms)** que activa el trigger de búsqueda.
  * **Animación de carga de 4 segundos exactos** con cuenta regresiva en vivo (`4.0s ... 0.0s`) y barra de progreso.
  * **Nueva Tabla Contenida que NO se sale de la vista**: Encapsulada con scroll interno para no desbordar el viewport en móvil, tablet o monitor.
  * **Imagen y Descripción**: Tarjetas interactivas con apertura de Ficha Técnica en modal.
* **Ejecución**:
  * Doble clic en `abrir_proyecto_2.bat`.
  * O abrir directamente el archivo `proyecto-2/index.html` en cualquier navegador.
