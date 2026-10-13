# 📋 CRUD de Tareas - Spring Boot & PostgreSQL

Proyecto web base (Boilerplate) con arquitectura en capas desarrollado en **Java Spring Boot**, base de datos **PostgreSQL**, y frontend con **Vanilla HTML, CSS y JavaScript** consumiendo la API mediante `fetch`.

---

## 🛠️ Tecnologías Utilizadas

* **Backend:** Java 21 LTS, Spring Boot 3.3.4 (Spring Web, Spring Data JPA, Hibernate).
* **Base de Datos:** PostgreSQL 18.
* **Frontend:** HTML5 semántico, CSS3 moderno (Flexbox/Grid), JavaScript nativo (Fetch API + async/await).
* **Herramienta de construcción:** Maven.

---

## 🚀 Cómo Ejecutar el Proyecto

### 1. Requisitos Previos
* Tener instalado **Java 21**.
* Tener **PostgreSQL** corriendo en el puerto `5432` con una base de datos llamada `crud_tareas_db` (credenciales configurables en `src/main/resources/application.properties`).

### 2. Iniciar la Aplicación
Puedes iniciar el servidor de dos formas:

* **Opción A (Fácil):** Doble clic en el archivo `iniciar_servidor.bat`.
* **Opción B (Línea de comandos):**
  ```bash
  .\mvnw.cmd spring-boot:run
  ```

### 3. Abrir en el Navegador
Ingresa a:
```
http://localhost:8080/
```

---

## 📡 Endpoints de la API REST

| Método | Endpoint | Descripción | Formato Body |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/tareas` | Listar todas las tareas | - |
| **GET** | `/api/tareas/{id}` | Obtener una tarea por ID | - |
| **POST** | `/api/tareas` | Crear nueva tarea | JSON (`titulo`, `descripcion`, `estado`) |
| **PUT** | `/api/tareas/{id}` | Actualizar tarea existente | JSON (`titulo`, `descripcion`, `estado`) |
| **DELETE**| `/api/tareas/{id}` | Eliminar tarea por ID | - |

---

## 📁 Estructura del Proyecto

```
Programacion Web Proyecto 1/
├── src/
│   └── main/
│       ├── java/com/proyecto/crudtareas/
│       │   ├── controller/      # Endpoints REST (TareaController.java)
│       │   ├── model/           # Entidades JPA (Tarea.java)
│       │   ├── repository/      # Interfaces de BD (TareaRepository.java)
│       │   ├── service/         # Lógica de negocio (TareaService.java)
│       │   └── CrudTareasApplication.java
│       └── resources/
│           ├── application.properties # Configuración de BD y servidor
│           └── static/          # Frontend Web (index.html, styles.css, app.js)
├── .gitignore
├── pom.xml                      # Dependencias Maven
└── iniciar_servidor.bat         # Script de arranque rápido
```
