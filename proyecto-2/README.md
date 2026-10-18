# Proyecto 2: Consumo Asíncrono de APIs Externas

**Estudiante:** Jhostin Molina  
**Materia:** Programación Web  
**Tecnología:** Vanilla JavaScript puro (DOM API, Fetch API nativa, CSS Grid/Flexbox)  

---

## Descripción Técnica

### 1. APIs Implementadas
* **Rick and Morty API (3 endpoints):**
  * `GET https://rickandmortyapi.com/api/character` - Listado y búsqueda de personajes con imagen oficial y badges de estado.
  * `GET https://rickandmortyapi.com/api/location` - Ubicaciones con tipo, dimensión y conteo de residentes.
  * `GET https://rickandmortyapi.com/api/episode` - Episodios con código de temporada, fecha de emisión y elenco.
* **PokéAPI (2 endpoints):**
  * `GET https://pokeapi.co/api/v2/pokemon` - Listado general paginado.
  * `GET https://pokeapi.co/api/v2/pokemon/{id}` - Ficha de detalle con sprites oficiales, tipos elementales, estadísticas de combate, peso y altura.

### 2. Imagen y Ficha Técnica
* Tarjetas interactivas con imagen oficial en alta resolución y estados vitales (*Alive*, *Dead*, *Unknown* con indicador pulsante).
* Ficha técnica detallada en modal con especificaciones completas al hacer clic en cualquier elemento.

### 3. Tabla Contenida en Viewport
* Contenedor con scroll interno horizontal y vertical (`overflow-x-auto` y `overflow-y-auto`).
* Cabecera fija (*sticky header*) y columnas truncadas con tooltip nativo.
* Diseño adaptado para que la tabla nunca se desborde ni ensanche la pantalla en ningún dispositivo.

### 4. Búsqueda con Delay de Tipeo y Animación de 4 Segundos
* **Delay de tipeo (debounce 650ms):** Espera a que el usuario termine de escribir antes de disparar el trigger.
* **Animación de carga:** Portal animado con cuenta regresiva en vivo de 4.0s a 0.0s y barra de progreso durante exactamente 4 segundos antes de mostrar los datos.

---

## Instrucciones de Ejecución

* **Opción directa (Windows):** Ejecutar el archivo `abrir_proyecto_2.bat` en la raíz del repositorio.
* **Desde navegador:** Abrir directamente el archivo `index.html`.
* **Desde VS Code:** Clic derecho sobre `index.html` y seleccionar *Open with Live Server*.

---

**Jhostin Molina**  
Programación Web
