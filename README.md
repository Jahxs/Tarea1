# Proyectos de Programación Web

**Estudiante:** Jhostin Molina  
**Materia:** Programación Web  

Estimado ingeniero, a continuación presento las instrucciones de ejecución y el detalle técnico de los dos proyectos desarrollados en este repositorio:

---

## Estructura del Repositorio

```text
Programacion Web Proyecto 1/
│
├── proyecto-1/             --> Proyecto 1: CRUD de Tareas Full-Stack (Spring Boot + PostgreSQL)
│   ├── pom.xml
│   ├── mvnw.cmd
│   └── src/
│
├── proyecto-2/             --> Proyecto 2: Consumo Asíncrono de APIs (Vanilla JavaScript)
│   ├── index.html
│   ├── styles.css
│   └── app.js
│
├── iniciar_servidor.bat    --> Script de inicio del Proyecto 1
└── abrir_proyecto_2.bat    --> Script de apertura del Proyecto 2
```

---

## Proyecto 1: Gestor de Tareas CRUD Full-Stack

Aplicación web para gestión de tareas persistente con arquitectura cliente-servidor.

* **Backend:** Spring Boot 3.3.4 (Java) con Spring Data JPA y base de datos PostgreSQL 18.
* **Frontend:** Vanilla JavaScript, CSS Grid, Flexbox, Tailwind CSS y Media Queries para diseño responsivo.
* **Características:**
  * Operaciones CRUD completas (Crear, Listar, Actualizar y Eliminar).
  * Vistas intercambiables: Tarjetas responsivas (Grid), Tablero Kanban (3 columnas) y Tabla compacta.
  * Ficha técnica de detalle por cada tarea.
  * Búsqueda en tiempo real (evento `input`) y cambio de tema Claro / Oscuro.

### Instrucciones de Ejecución
* **Opción directa (Windows):** Ejecutar el archivo `iniciar_servidor.bat`.
* **Desde consola:**
  ```bash
  cd proyecto-1
  .\mvnw.cmd spring-boot:run
  ```
* **Acceso:** Abrir en el navegador [http://localhost:8080/](http://localhost:8080/).

---

## Proyecto 2: Consumo de APIs Externas

Aplicación web desarrollada exclusivamente con **Vanilla JavaScript puro** (DOM API y Fetch nativo) para el consumo asíncrono de servicios REST.

* **APIs Implementadas:**
  * **Rick and Morty API (3 endpoints):**
    * `/character`: Listado de personajes con imagen oficial, badges de estado y ficha técnica.
    * `/location`: Tabla de ubicaciones con nombre, tipo, dimensión y residentes.
    * `/episode`: Tabla de episodios con código de temporada y fecha de emisión.
  * **PokéAPI (2 endpoints):**
    * `/pokemon`: Listado general paginado.
    * `/pokemon/{id}`: Ficha detallada con sprites oficiales, tipos elementales, estadísticas de combate, peso y altura.
* **Características:**
  * **Búsqueda con delay de tipeo (debounce 650ms):** Espera a que el usuario termine de escribir para disparar el trigger.
  * **Animación de carga de 4 segundos:** Cuenta regresiva en vivo de 4.0s a 0.0s con barra de progreso interactiva antes de renderizar los resultados.
  * **Tabla contenida en viewport:** Contenedor con scroll interno (`overflow-x-auto` y `overflow-y-auto`) y cabecera fija (*sticky*), asegurando que la tabla nunca se salga de la vista ni desborde la pantalla.

### Instrucciones de Ejecución
* **Opción directa (Windows):** Ejecutar el archivo `abrir_proyecto_2.bat`.
* **Desde navegador:** Abrir directamente el archivo `proyecto-2/index.html`.
* **Desde VS Code:** Clic derecho sobre `proyecto-2/index.html` y seleccionar *Open with Live Server*.

---

**Jhostin Molina**  
Programación Web
