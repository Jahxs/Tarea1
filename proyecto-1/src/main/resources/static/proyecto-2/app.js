/**
 * =============================================================================
 * PROYECTO 2 - APP.JS (VANILLA JAVASCRIPT PURO)
 * =============================================================================
 * Requisitos del Ingeniero:
 * 1. Vanilla JS (Fetch API nativa, manipulación de DOM, sin frameworks).
 * 2. Consumo de Rick & Morty (3 endpoints: /character, /location, /episode).
 * 3. Consumo de PokéAPI (2 endpoints: /pokemon listado y /pokemon/{id} detalles).
 * 4. Imagen y Descripción detalladas en tarjetas y modal.
 * 5. Nueva Tabla que NO se sale de la vista (encapsulada en viewport responsivo).
 * 6. Búsqueda con delay de tipeo (debounce) + trigger que activa una animación
 *    de carga de 4 segundos exactos con cuenta regresiva en vivo.
 * =============================================================================
 */

// Estado global de la aplicación
let apiActiva = "rick"; // 'rick' | 'poke'
let subVistaRick = "personajes"; // 'personajes' | 'ubicaciones' | 'episodios'
let textoBusqueda = "";
let filtroEstado = "";
let paginaActual = 1;
let totalPaginas = 1;
let itemsActuales = [];

let timerDebounce = null;
let animacionCargaActiva = false;

// URLs Base de las APIs Oficiales
const RICK_API_BASE = "https://rickandmortyapi.com/api";
const POKE_API_BASE = "https://pokeapi.co/api/v2";

// =============================================================================
// REFERENCIAS AL DOM
// =============================================================================
let btnApiRick, btnApiPoke, btnThemeToggle, themeIcon;
let brandAvatar, brandIcon, brandDot, heroBadgeTitle, heroTitle, heroDesc, endpointChips;
let tabsRickContainer, btnsSubtab, labelSubviewInfo;
let inputBusqueda, btnLimpiarBusqueda, selectFiltroEstado, contenedorFiltroEstado, btnRecargarApi;
let textoResumenResultados, textoStatusPeticion;
let animacionCarga4s, countdownText, progressBar4s;
let contenedorCards, contenedorTablaResponsiva, tablaHead, tablaBody, tablaTituloEncabezado, badgeTablaConteo;
let btnPagPrev, btnPagNext, textoPaginaActual;
let modalDetalleApi, backdropModal, btnCerrarModal, btnModalEntendido;
let modalBadgeId, modalTitulo, modalImagen, modalDescripcionGrid;
let toastContainer;

// =============================================================================
// INICIALIZACIÓN
// =============================================================================
document.addEventListener("DOMContentLoaded", () => {
    enlazarElementosDOM();
    inicializarTema();
    configurarEventos();
    cargarDatos();
});

function enlazarElementosDOM() {
    btnApiRick = document.getElementById("btn-api-rick");
    btnApiPoke = document.getElementById("btn-api-poke");
    btnThemeToggle = document.getElementById("btn-theme-toggle");
    themeIcon = document.getElementById("theme-icon");

    brandAvatar = document.getElementById("brand-avatar");
    brandIcon = document.getElementById("brand-icon");
    brandDot = document.getElementById("brand-dot");
    heroBadgeTitle = document.getElementById("hero-badge-title");
    heroTitle = document.getElementById("hero-title");
    heroDesc = document.getElementById("hero-desc");
    endpointChips = document.getElementById("endpoint-chips");

    tabsRickContainer = document.getElementById("tabs-rick-container");
    btnsSubtab = document.querySelectorAll(".btn-subtab");
    labelSubviewInfo = document.getElementById("label-subview-info");

    inputBusqueda = document.getElementById("input-busqueda");
    btnLimpiarBusqueda = document.getElementById("btn-limpiar-busqueda");
    selectFiltroEstado = document.getElementById("select-filtro-estado");
    contenedorFiltroEstado = document.getElementById("contenedor-filtro-estado");
    btnRecargarApi = document.getElementById("btn-recargar-api");

    textoResumenResultados = document.getElementById("texto-resumen-resultados");
    textoStatusPeticion = document.getElementById("texto-status-peticion");

    animacionCarga4s = document.getElementById("animacion-carga-4s");
    countdownText = document.getElementById("countdown-text");
    progressBar4s = document.getElementById("progress-bar-4s");

    contenedorCards = document.getElementById("contenedor-cards");
    contenedorTablaResponsiva = document.getElementById("contenedor-tabla-responsiva");
    tablaHead = document.getElementById("tabla-head");
    tablaBody = document.getElementById("tabla-body");
    tablaTituloEncabezado = document.getElementById("tabla-titulo-encabezado");
    badgeTablaConteo = document.getElementById("badge-tabla-conteo");

    btnPagPrev = document.getElementById("btn-pag-prev");
    btnPagNext = document.getElementById("btn-pag-next");
    textoPaginaActual = document.getElementById("texto-pagina-actual");

    modalDetalleApi = document.getElementById("modal-detalle-api");
    backdropModal = document.getElementById("backdrop-modal");
    btnCerrarModal = document.getElementById("btn-cerrar-modal");
    btnModalEntendido = document.getElementById("btn-modal-entendido");
    modalBadgeId = document.getElementById("modal-badge-id");
    modalTitulo = document.getElementById("modal-titulo");
    modalImagen = document.getElementById("modal-imagen");
    modalDescripcionGrid = document.getElementById("modal-descripcion-grid");

    toastContainer = document.getElementById("toast-container");
}

// =============================================================================
// GESTIÓN DEL TEMA (CLARO / OSCURO)
// =============================================================================
function inicializarTema() {
    const esOscuro = document.documentElement.classList.contains("dark");
    actualizarIconoTema(esOscuro);

    if (btnThemeToggle) {
        btnThemeToggle.addEventListener("click", () => {
            const actualmenteOscuro = document.documentElement.classList.contains("dark");
            if (actualmenteOscuro) {
                document.documentElement.classList.remove("dark");
                localStorage.setItem("theme-p2", "light");
                actualizarIconoTema(false);
            } else {
                document.documentElement.classList.add("dark");
                localStorage.setItem("theme-p2", "dark");
                actualizarIconoTema(true);
            }
        });
    }
}

function actualizarIconoTema(esOscuro) {
    if (!themeIcon) return;
    if (esOscuro) {
        themeIcon.className = "fa-solid fa-sun text-sm text-amber-400";
    } else {
        themeIcon.className = "fa-solid fa-moon text-sm text-indigo-600";
    }
}

// =============================================================================
// CONFIGURACIÓN DE EVENTOS DEL USUARIO
// =============================================================================
function configurarEventos() {
    // 1. Alternancia de API Principal (Rick & Morty <-> PokéAPI)
    btnApiRick.addEventListener("click", () => cambiarApiPrincipal("rick"));
    btnApiPoke.addEventListener("click", () => cambiarApiPrincipal("poke"));

    // 2. Sub-pestañas de Rick & Morty (Personajes, Ubicaciones, Episodios)
    btnsSubtab.forEach(btn => {
        btn.addEventListener("click", () => {
            btnsSubtab.forEach(b => {
                b.classList.remove("active", "bg-emerald-600", "text-white");
                b.classList.add("text-slate-600", "dark:text-slate-400");
            });
            btn.classList.add("active", "bg-emerald-600", "text-white");
            btn.classList.remove("text-slate-600", "dark:text-slate-400");

            subVistaRick = btn.dataset.view;
            paginaActual = 1;
            dispararBusquedaConAnimacion4s();
        });
    });

    // 3. Búsqueda con Delay de tipeo (Debounce) + Trigger de cambio
    inputBusqueda.addEventListener("input", (e) => {
        const val = e.target.value.trim();
        textoBusqueda = val;

        // Mostrar / ocultar botón de limpiar
        if (btnLimpiarBusqueda) {
            btnLimpiarBusqueda.classList.toggle("hidden", val.length === 0);
        }

        // Delay de tipeo (Debounce de 600ms antes de ejecutar trigger)
        clearTimeout(timerDebounce);
        timerDebounce = setTimeout(() => {
            paginaActual = 1;
            dispararBusquedaConAnimacion4s();
        }, 650);
    });

    // Disparo inmediato al presionar ENTER
    inputBusqueda.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            clearTimeout(timerDebounce);
            paginaActual = 1;
            dispararBusquedaConAnimacion4s();
        }
    });

    // Botón Limpiar búsqueda
    if (btnLimpiarBusqueda) {
        btnLimpiarBusqueda.addEventListener("click", () => {
            inputBusqueda.value = "";
            textoBusqueda = "";
            btnLimpiarBusqueda.classList.add("hidden");
            paginaActual = 1;
            dispararBusquedaConAnimacion4s();
        });
    }

    // Filtro por Estado (Alive, Dead, Unknown)
    if (selectFiltroEstado) {
        selectFiltroEstado.addEventListener("change", (e) => {
            filtroEstado = e.target.value;
            paginaActual = 1;
            dispararBusquedaConAnimacion4s();
        });
    }

    // Botón Recargar
    if (btnRecargarApi) {
        btnRecargarApi.addEventListener("click", () => {
            dispararBusquedaConAnimacion4s();
        });
    }

    // Paginación
    if (btnPagPrev) {
        btnPagPrev.addEventListener("click", () => {
            if (paginaActual > 1) {
                paginaActual--;
                dispararBusquedaConAnimacion4s();
            }
        });
    }

    if (btnPagNext) {
        btnPagNext.addEventListener("click", () => {
            if (paginaActual < totalPaginas) {
                paginaActual++;
                dispararBusquedaConAnimacion4s();
            }
        });
    }

    // Cerrar Modal Detalle
    if (btnCerrarModal) btnCerrarModal.addEventListener("click", cerrarModalDetalle);
    if (btnModalEntendido) btnModalEntendido.addEventListener("click", cerrarModalDetalle);
    if (backdropModal) backdropModal.addEventListener("click", cerrarModalDetalle);
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") cerrarModalDetalle();
    });
}

// =============================================================================
// ALTERNANCIA ENTRE APIS PRINCIPALES
// =============================================================================
function cambiarApiPrincipal(api) {
    if (apiActiva === api) return;
    apiActiva = api;
    paginaActual = 1;
    textoBusqueda = "";
    if (inputBusqueda) inputBusqueda.value = "";
    if (btnLimpiarBusqueda) btnLimpiarBusqueda.classList.add("hidden");

    if (api === "rick") {
        // UI Modo Rick & Morty
        btnApiRick.className = "btn-api-switch active px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400";
        btnApiPoke.className = "btn-api-switch px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all flex items-center gap-2 cursor-pointer";

        brandAvatar.className = "w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/25 ring-1 ring-white/30 transform hover:scale-105 transition-transform";
        brandIcon.className = "fa-solid fa-atom text-white text-xl";
        brandDot.textContent = "RickMorty";
        brandDot.className = "text-emerald-500";

        heroBadgeTitle.textContent = "Rick and Morty API v2 (3 Endpoints)";
        heroTitle.textContent = "Explorador Multiversal de Entidades";
        heroDesc.innerHTML = "Consumo con Vanilla JS puro. Consume 3 endpoints oficiales: <strong>/character</strong> (Personajes), <strong>/location</strong> (Ubicaciones) y <strong>/episode</strong> (Episodios).";

        endpointChips.innerHTML = `
            <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-xs">
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span class="font-mono text-[11px] text-slate-700 dark:text-slate-300">GET /character</span>
            </div>
            <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-xs">
                <span class="w-2 h-2 rounded-full bg-blue-500"></span>
                <span class="font-mono text-[11px] text-slate-700 dark:text-slate-300">GET /location</span>
            </div>
            <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-xs">
                <span class="w-2 h-2 rounded-full bg-purple-500"></span>
                <span class="font-mono text-[11px] text-slate-700 dark:text-slate-300">GET /episode</span>
            </div>
        `;

        tabsRickContainer.classList.remove("hidden");
        contenedorFiltroEstado.classList.remove("hidden");
        inputBusqueda.placeholder = "Buscar personajes, ubicaciones o episodios de Rick & Morty...";

    } else {
        // UI Modo PokéAPI
        btnApiPoke.className = "btn-api-switch active px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400";
        btnApiRick.className = "btn-api-switch px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all flex items-center gap-2 cursor-pointer";

        brandAvatar.className = "w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-400 flex items-center justify-center shadow-lg shadow-rose-500/25 ring-1 ring-white/30 transform hover:scale-105 transition-transform";
        brandIcon.className = "fa-solid fa-gamepad text-white text-xl";
        brandDot.textContent = "PokéAPI";
        brandDot.className = "text-rose-500";

        heroBadgeTitle.textContent = "PokéAPI v2 (2 Endpoints)";
        heroTitle.textContent = "Pokédex Nacional Interactiva";
        heroDesc.innerHTML = "Consumo con Vanilla JS puro. Consume 2 endpoints: <strong>/pokemon</strong> (Listado de especies) y <strong>/pokemon/{id}</strong> (Sprites oficiales, tipos, estadísticas y dimensiones).";

        endpointChips.innerHTML = `
            <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-xs">
                <span class="w-2 h-2 rounded-full bg-rose-500"></span>
                <span class="font-mono text-[11px] text-slate-700 dark:text-slate-300">GET /pokemon (Listado)</span>
            </div>
            <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-xs">
                <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                <span class="font-mono text-[11px] text-slate-700 dark:text-slate-300">GET /pokemon/{id} (Ficha)</span>
            </div>
        `;

        tabsRickContainer.classList.add("hidden");
        contenedorFiltroEstado.classList.add("hidden");
        inputBusqueda.placeholder = "Buscar Pokémon por nombre o ID (ej. pikachu, charizard, 25)...";
    }

    dispararBusquedaConAnimacion4s();
}

// =============================================================================
// ANIMACIÓN DE CARGA DE 4 SEGUNDOS EXACTOS (REQUISITO EXPLÍCITO DEL INGENIERO)
// =============================================================================
function dispararBusquedaConAnimacion4s() {
    if (animacionCargaActiva) return;
    animacionCargaActiva = true;

    // 1. Ocultar contenedores de contenido
    if (contenedorCards) contenedorCards.classList.add("hidden");
    if (contenedorTablaResponsiva) contenedorTablaResponsiva.classList.add("hidden");

    // 2. Mostrar la animación de carga de 4 segundos
    if (animacionCarga4s) animacionCarga4s.classList.remove("hidden");

    let tiempoRestante = 4.0;
    const duracionTotalMs = 4000;
    const intervaloMs = 50;
    let tiempoTranscurrido = 0;

    countdownText.textContent = "4.0s";
    progressBar4s.style.width = "0%";

    const intervalId = setInterval(() => {
        tiempoTranscurrido += intervaloMs;
        const progresoPct = Math.min((tiempoTranscurrido / duracionTotalMs) * 100, 100);
        tiempoRestante = Math.max((duracionTotalMs - tiempoTranscurrido) / 1000, 0);

        countdownText.textContent = `${tiempoRestante.toFixed(1)}s`;
        progressBar4s.style.width = `${progresoPct}%`;

        if (tiempoTranscurrido >= duracionTotalMs) {
            clearInterval(intervalId);
            animacionCargaActiva = false;
            if (animacionCarga4s) animacionCarga4s.classList.add("hidden");
            
            // Ejecutar la petición HTTP y renderizar los datos
            cargarDatos();
        }
    }, intervaloMs);
}

// =============================================================================
// CONSUMO DE DATOS ASÍNCRONO SEGÚN API Y ENDPOINT
// =============================================================================
async function cargarDatos() {
    textoStatusPeticion.textContent = "Consultando...";
    textoStatusPeticion.className = "font-mono text-[11px] text-amber-500 font-semibold";

    try {
        if (apiActiva === "rick") {
            await cargarDatosRickAndMorty();
        } else {
            await cargarDatosPokemon();
        }
        textoStatusPeticion.textContent = "HTTP 200 OK";
        textoStatusPeticion.className = "font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold";
    } catch (error) {
        console.error("Error al consultar API:", error);
        mostrarEstadoError(error.message);
        textoStatusPeticion.textContent = "HTTP 404 / Error";
        textoStatusPeticion.className = "font-mono text-[11px] text-rose-500 font-semibold";
    }
}

/**
 * Consumo de Rick & Morty (3 Endpoints):
 * 1. /character
 * 2. /location
 * 3. /episode
 */
async function cargarDatosRickAndMorty() {
    let url = "";

    if (subVistaRick === "personajes") {
        labelSubviewInfo.textContent = "Endpoint 1 de 3: GET /api/character";
        url = `${RICK_API_BASE}/character/?page=${paginaActual}`;
        if (textoBusqueda) url += `&name=${encodeURIComponent(textoBusqueda)}`;
        if (filtroEstado) url += `&status=${encodeURIComponent(filtroEstado)}`;

    } else if (subVistaRick === "ubicaciones") {
        labelSubviewInfo.textContent = "Endpoint 2 de 3: GET /api/location";
        url = `${RICK_API_BASE}/location/?page=${paginaActual}`;
        if (textoBusqueda) url += `&name=${encodeURIComponent(textoBusqueda)}`;

    } else if (subVistaRick === "episodios") {
        labelSubviewInfo.textContent = "Endpoint 3 de 3: GET /api/episode";
        url = `${RICK_API_BASE}/episode/?page=${paginaActual}`;
        if (textoBusqueda) url += `&name=${encodeURIComponent(textoBusqueda)}`;
    }

    const respuesta = await fetch(url);
    if (!respuesta.ok) {
        throw new Error(`No se encontraron resultados en Rick & Morty API (${respuesta.status})`);
    }

    const data = await respuesta.json();
    itemsActuales = data.results || [];
    totalPaginas = data.info ? data.info.pages : 1;

    actualizarControlesPaginacion(data.info ? data.info.count : itemsActuales.length);

    if (subVistaRick === "personajes") {
        renderizarCardsPersonajes(itemsActuales);
    } else if (subVistaRick === "ubicaciones") {
        renderizarTablaUbicaciones(itemsActuales);
    } else if (subVistaRick === "episodios") {
        renderizarTablaEpisodios(itemsActuales);
    }
}

/**
 * Consumo de PokéAPI (2 Endpoints):
 * 1. GET /pokemon (listado paginado)
 * 2. GET /pokemon/{id_o_nombre} (detalles y sprites)
 */
async function cargarDatosPokemon() {
    // Si el usuario buscó por nombre específico
    if (textoBusqueda) {
        const query = textoBusqueda.toLowerCase();
        const res = await fetch(`${POKE_API_BASE}/pokemon/${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error(`Pokémon "${textoBusqueda}" no encontrado.`);
        
        const pokeData = await res.json();
        itemsActuales = [pokeData];
        totalPaginas = 1;
        paginaActual = 1;

        actualizarControlesPaginacion(1);
        renderizarCardsPokemon(itemsActuales);
        return;
    }

    // Listado paginado de 24 Pokémon
    const limit = 24;
    const offset = (paginaActual - 1) * limit;
    const resList = await fetch(`${POKE_API_BASE}/pokemon?limit=${limit}&offset=${offset}`);
    if (!resList.ok) throw new Error("Error al obtener listado de Pokémon");

    const dataList = await resList.json();
    totalPaginas = Math.ceil(dataList.count / limit);

    // Consumir el Endpoint 2 en paralelo para obtener detalles de cada Pokémon
    const promesasDetalles = dataList.results.map(p => fetch(p.url).then(r => r.json()));
    itemsActuales = await Promise.all(promesasDetalles);

    actualizarControlesPaginacion(dataList.count);
    renderizarCardsPokemon(itemsActuales);
}

// =============================================================================
// RENDERIZADO: 1. PERSONAJES DE RICK & MORTY (IMAGEN Y DESCRIPCIÓN)
// =============================================================================
function renderizarCardsPersonajes(personajes) {
    contenedorTablaResponsiva.classList.add("hidden");
    contenedorCards.classList.remove("hidden");
    contenedorCards.innerHTML = "";

    personajes.forEach(p => {
        const card = document.createElement("article");
        card.className = "entity-card animate-fade-in group";

        const estadoConfig = obtenerConfigEstadoRick(p.status);

        card.innerHTML = `
            <div class="entity-image-wrapper">
                <img src="${p.image}" alt="${escaparHTML(p.name)}" class="entity-image" loading="lazy">
                <span class="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold ${estadoConfig.badgeClass} shadow-md backdrop-blur-md">
                    <span class="w-2 h-2 rounded-full ${estadoConfig.dotClass} inline-block mr-1"></span>
                    ${p.status}
                </span>
                <span class="absolute top-3 right-3 px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-slate-900/80 text-white backdrop-blur-md">
                    #${p.id}
                </span>
            </div>

            <div class="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
                <div>
                    <h3 class="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors line-clamp-1">
                        ${escaparHTML(p.name)}
                    </h3>
                    <p class="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <i class="fa-solid fa-dna text-emerald-500 text-[10px]"></i>
                        <span>${p.species} &bull; ${p.gender}</span>
                    </p>
                </div>

                <div class="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 text-[11px] space-y-1">
                    <div class="text-slate-400">Origen:</div>
                    <div class="font-semibold text-slate-700 dark:text-slate-300 truncate">${escaparHTML(p.origin.name)}</div>
                </div>

                <button 
                    type="button" 
                    class="btn-ver-detalle-personaje w-full py-2 px-3 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                    <i class="fa-solid fa-address-card text-xs"></i>
                    <span>Ver Ficha Técnica</span>
                </button>
            </div>
        `;

        card.addEventListener("click", () => abrirModalPersonaje(p));
        const btnVer = card.querySelector(".btn-ver-detalle-personaje");
        if (btnVer) btnVer.addEventListener("click", (e) => {
            e.stopPropagation();
            abrirModalPersonaje(p);
        });

        contenedorCards.appendChild(card);
    });
}

// =============================================================================
// RENDERIZADO: 2. TARJETAS DE POKÉMON (IMAGEN Y DESCRIPCIÓN)
// =============================================================================
function renderizarCardsPokemon(pokemons) {
    contenedorTablaResponsiva.classList.add("hidden");
    contenedorCards.classList.remove("hidden");
    contenedorCards.innerHTML = "";

    pokemons.forEach(p => {
        const card = document.createElement("article");
        card.className = "entity-card animate-fade-in group";

        const sprite = p.sprites.other["official-artwork"].front_default || p.sprites.front_default || "";
        const tiposHTML = p.types.map(t => `
            <span class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                ${t.type.name}
            </span>
        `).join("");

        card.innerHTML = `
            <div class="entity-image-wrapper bg-gradient-to-b from-rose-50/50 to-amber-50/50 dark:from-slate-900 dark:to-slate-950">
                <img src="${sprite}" alt="${escaparHTML(p.name)}" class="entity-image object-contain p-3" loading="lazy">
                <span class="absolute top-3 right-3 px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-rose-600 text-white shadow-xs">
                    #${p.id.toString().padStart(3, "0")}
                </span>
            </div>

            <div class="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                    <h3 class="font-extrabold text-base capitalize text-slate-900 dark:text-white group-hover:text-rose-500 transition-colors">
                        ${escaparHTML(p.name)}
                    </h3>
                    <div class="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        ${tiposHTML}
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-2 text-[11px] p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                    <div>
                        <span class="text-slate-400 block">Altura:</span>
                        <span class="font-bold text-slate-700 dark:text-slate-300">${(p.height / 10).toFixed(1)} m</span>
                    </div>
                    <div>
                        <span class="text-slate-400 block">Peso:</span>
                        <span class="font-bold text-slate-700 dark:text-slate-300">${(p.weight / 10).toFixed(1)} kg</span>
                    </div>
                </div>

                <button 
                    type="button" 
                    class="btn-ver-detalle-poke w-full py-2 px-3 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 border border-rose-200 dark:border-rose-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                    <i class="fa-solid fa-gamepad text-xs"></i>
                    <span>Ver Estadísticas</span>
                </button>
            </div>
        `;

        card.addEventListener("click", () => abrirModalPokemon(p));
        const btnVer = card.querySelector(".btn-ver-detalle-poke");
        if (btnVer) btnVer.addEventListener("click", (e) => {
            e.stopPropagation();
            abrirModalPokemon(p);
        });

        contenedorCards.appendChild(card);
    });
}

// =============================================================================
// RENDERIZADO: 3. TABLA RESPONSIVA QUE NO SE SALE DE LA VISTA (UBICACIONES)
// =============================================================================
function renderizarTablaUbicaciones(ubicaciones) {
    contenedorCards.classList.add("hidden");
    contenedorTablaResponsiva.classList.remove("hidden");

    tablaTituloEncabezado.textContent = "Ubicaciones Multiversales (Endpoint: /api/location)";
    badgeTablaConteo.textContent = `${ubicaciones.length} ubicaciones mostradas`;

    tablaHead.innerHTML = `
        <tr>
            <th class="px-5 py-3.5">ID</th>
            <th class="px-5 py-3.5">Nombre de la Ubicación</th>
            <th class="px-5 py-3.5">Tipo</th>
            <th class="px-5 py-3.5">Dimensión</th>
            <th class="px-5 py-3.5 text-right">Residentes</th>
        </tr>
    `;

    tablaBody.innerHTML = "";
    ubicaciones.forEach(loc => {
        const tr = document.createElement("tr");
        tr.className = "hover:bg-emerald-50/50 dark:hover:bg-emerald-500/5 transition-colors";

        tr.innerHTML = `
            <td class="px-5 py-3.5 font-mono font-bold text-slate-400">#${loc.id}</td>
            <td class="px-5 py-3.5 font-bold text-slate-900 dark:text-white table-truncate" title="${escaparHTML(loc.name)}">
                <i class="fa-solid fa-location-dot text-emerald-500 mr-1.5"></i>${escaparHTML(loc.name)}
            </td>
            <td class="px-5 py-3.5">
                <span class="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    ${escaparHTML(loc.type || "Desconocido")}
                </span>
            </td>
            <td class="px-5 py-3.5 text-slate-600 dark:text-slate-400 table-truncate" title="${escaparHTML(loc.dimension)}">
                ${escaparHTML(loc.dimension)}
            </td>
            <td class="px-5 py-3.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                ${loc.residents ? loc.residents.length : 0}
            </td>
        `;
        tablaBody.appendChild(tr);
    });
}

// =============================================================================
// RENDERIZADO: 4. TABLA RESPONSIVA QUE NO SE SALE DE LA VISTA (EPISODIOS)
// =============================================================================
function renderizarTablaEpisodios(episodios) {
    contenedorCards.classList.add("hidden");
    contenedorTablaResponsiva.classList.remove("hidden");

    tablaTituloEncabezado.textContent = "Episodios de la Serie (Endpoint: /api/episode)";
    badgeTablaConteo.textContent = `${episodios.length} episodios mostrados`;

    tablaHead.innerHTML = `
        <tr>
            <th class="px-5 py-3.5">ID</th>
            <th class="px-5 py-3.5">Código</th>
            <th class="px-5 py-3.5">Título del Episodio</th>
            <th class="px-5 py-3.5">Fecha de Emisión</th>
            <th class="px-5 py-3.5 text-right">Personajes</th>
        </tr>
    `;

    tablaBody.innerHTML = "";
    episodios.forEach(ep => {
        const tr = document.createElement("tr");
        tr.className = "hover:bg-purple-50/50 dark:hover:bg-purple-500/5 transition-colors";

        tr.innerHTML = `
            <td class="px-5 py-3.5 font-mono font-bold text-slate-400">#${ep.id}</td>
            <td class="px-5 py-3.5">
                <span class="px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">
                    ${ep.episode}
                </span>
            </td>
            <td class="px-5 py-3.5 font-bold text-slate-900 dark:text-white table-truncate" title="${escaparHTML(ep.name)}">
                <i class="fa-solid fa-play text-purple-500 mr-1.5 text-[10px]"></i>${escaparHTML(ep.name)}
            </td>
            <td class="px-5 py-3.5 text-slate-600 dark:text-slate-400">
                ${escaparHTML(ep.air_date)}
            </td>
            <td class="px-5 py-3.5 text-right font-mono font-bold text-purple-600 dark:text-purple-400">
                ${ep.characters ? ep.characters.length : 0}
            </td>
        `;
        tablaBody.appendChild(tr);
    });
}

// =============================================================================
// MODALES DE DETALLE (IMAGEN Y DESCRIPCIÓN COMPLETA)
// =============================================================================
function abrirModalPersonaje(p) {
    modalBadgeId.textContent = `ID #${p.id} &bull; Rick & Morty`;
    modalTitulo.textContent = p.name;
    modalImagen.src = p.image;
    modalImagen.alt = p.name;

    const estado = obtenerConfigEstadoRick(p.status);

    modalDescripcionGrid.innerHTML = `
        <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <span class="text-slate-400 block mb-0.5">Estado Vital:</span>
            <span class="font-bold ${estado.textClass} flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full ${estado.dotClass}"></span>
                ${p.status}
            </span>
        </div>
        <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <span class="text-slate-400 block mb-0.5">Especie y Género:</span>
            <span class="font-bold text-slate-800 dark:text-slate-200">${p.species} (${p.gender})</span>
        </div>
        <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 col-span-2">
            <span class="text-slate-400 block mb-0.5">Planeta / Dimensión de Origen:</span>
            <span class="font-bold text-slate-800 dark:text-slate-200">${p.origin.name}</span>
        </div>
        <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 col-span-2">
            <span class="text-slate-400 block mb-0.5">Última Ubicación Conocida:</span>
            <span class="font-bold text-slate-800 dark:text-slate-200">${p.location.name}</span>
        </div>
        <div class="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 col-span-2 text-emerald-600 dark:text-emerald-400">
            <span class="block font-semibold">Aparición en Episodios:</span>
            <span class="font-extrabold text-base">${p.episode.length} capítulos emitidos</span>
        </div>
    `;

    modalDetalleApi.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");
}

function abrirModalPokemon(p) {
    modalBadgeId.textContent = `Pokédex #${p.id.toString().padStart(3, "0")} &bull; PokéAPI`;
    modalTitulo.textContent = p.name.toUpperCase();
    modalImagen.src = p.sprites.other["official-artwork"].front_default || p.sprites.front_default || "";
    modalImagen.alt = p.name;

    const statsHTML = p.stats.map(s => `
        <div class="space-y-1">
            <div class="flex justify-between text-[10px] font-semibold text-slate-400 uppercase">
                <span>${s.stat.name}</span>
                <span class="font-bold text-slate-800 dark:text-slate-200">${s.base_stat}</span>
            </div>
            <div class="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div class="bg-rose-500 h-full rounded-full" style="width: ${Math.min((s.base_stat / 150) * 100, 100)}%;"></div>
            </div>
        </div>
    `).join("");

    modalDescripcionGrid.innerHTML = `
        <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <span class="text-slate-400 block mb-0.5">Altura:</span>
            <span class="font-bold text-slate-800 dark:text-slate-200">${(p.height / 10).toFixed(1)} m</span>
        </div>
        <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <span class="text-slate-400 block mb-0.5">Peso:</span>
            <span class="font-bold text-slate-800 dark:text-slate-200">${(p.weight / 10).toFixed(1)} kg</span>
        </div>
        <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 col-span-2 space-y-2">
            <span class="text-slate-400 block font-bold text-[11px]">Estadísticas Base de Combate:</span>
            ${statsHTML}
        </div>
    `;

    modalDetalleApi.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");
}

function cerrarModalDetalle() {
    modalDetalleApi.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
}

// =============================================================================
// HELPERS Y ESTILOS
// =============================================================================
function obtenerConfigEstadoRick(status) {
    if (status === "Alive") {
        return {
            badgeClass: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30",
            dotClass: "bg-emerald-500",
            textClass: "text-emerald-600 dark:text-emerald-400"
        };
    } else if (status === "Dead") {
        return {
            badgeClass: "bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30",
            dotClass: "bg-rose-500",
            textClass: "text-rose-600 dark:text-rose-400"
        };
    } else {
        return {
            badgeClass: "bg-slate-500/20 text-slate-600 dark:text-slate-400 border border-slate-500/30",
            dotClass: "bg-slate-400",
            textClass: "text-slate-500 dark:text-slate-400"
        };
    }
}

function actualizarControlesPaginacion(totalRegistros) {
    textoResumenResultados.innerHTML = `Mostrando <strong class="text-slate-900 dark:text-white">${itemsActuales.length}</strong> de <strong class="text-slate-900 dark:text-white">${totalRegistros}</strong> registros en API`;
    textoPaginaActual.textContent = `Página ${paginaActual} de ${totalPaginas}`;

    btnPagPrev.disabled = paginaActual <= 1;
    btnPagNext.disabled = paginaActual >= totalPaginas;
}

function mostrarEstadoError(mensaje) {
    contenedorCards.classList.remove("hidden");
    contenedorTablaResponsiva.classList.add("hidden");
    contenedorCards.innerHTML = `
        <div class="col-span-full py-16 px-4 text-center rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40">
            <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-500 text-2xl">
                <i class="fa-solid fa-triangle-exclamation"></i>
            </div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-1">No se encontraron resultados</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-4">${mensaje}</p>
        </div>
    `;
    textoResumenResultados.textContent = "0 resultados encontrados";
}

function escaparHTML(str) {
    if (!str) return "";
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
