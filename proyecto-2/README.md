# Proyecto 2: Consumo de APIs Externas con Vanilla JavaScript

**Asignatura:** Programación Web  
**Tecnología:** Vanilla JavaScript puro (DOM API, Fetch API nativa, CSS Grid/Flexbox)  

---

## 🚀 Requisitos Cumplidos

### 1. APIs Externas Consumidas
* **Rick and Morty API (3 Endpoints cumplidos)**:
  1. `GET https://rickandmortyapi.com/api/character` - Listado y búsqueda de personajes con imagen oficial y badges de estado.
  2. `GET https://rickandmortyapi.com/api/location` - Ubicaciones con tipo, dimensión y conteo de residentes.
  3. `GET https://rickandmortyapi.com/api/episode` - Episodios con código de temporada, fecha de emisión y elenco.
* **PokéAPI (2 Endpoints cumplidos)**:
  1. `GET https://pokeapi.co/api/v2/pokemon` - Listado general con paginación.
  2. `GET https://pokeapi.co/api/v2/pokemon/{id}` - Ficha de detalle con sprites oficiales, tipos elementales, estadísticas de combate, peso y altura.

### 2. Imagen y Descripción
* Tarjetas de alta fidelidad con arte oficial, estados vitales (*Alive*, *Dead*, *Unknown* con indicador pulsante) y especificación completa.
* Al hacer clic en cualquier tarjeta se abre un modal con la **Ficha Técnica Detallada**.

### 3. Nueva Tabla que NO se sale de la vista (Contained Table)
* Implementada con contenedor de scroll encapsulado horizontal y vertical (`overflow-x-auto` y `overflow-y-auto`).
* Cabecera fija (*sticky header*) y columnas truncadas (`table-truncate`) con tooltip nativo.
* **Garantiza que la tabla nunca ensanche la pantalla ni se desborde del viewport en dispositivos móviles, tablets o monitores**.

### 4. Búsqueda con Delay de Tipeo (Debounce) y Animación de Carga de 4 Segundos
* **Delay de tipeo**: Temporizador debounce de 650ms que espera a que el usuario deje de escribir antes de disparar el trigger.
* **Trigger y animación de 4s**: Muestra un portal animado con cuenta regresiva en vivo (`4.0s ... 3.5s ... 0.0s`) y barra de progreso al 100% durante los **4 segundos exactos** solicitados por el profesor antes de renderizar los datos.

---

## 🌐 Cómo Ejecutar el Proyecto 2

Simplemente abre el archivo [`index.html`](file:///c:/Users/Jhostin/Programacion%20Web%20Proyecto%201/proyecto-2/index.html) en tu navegador favorito:
* Puedes hacer doble clic sobre `proyecto-2/index.html`.
* O usar la extensión Live Server de VS Code.
