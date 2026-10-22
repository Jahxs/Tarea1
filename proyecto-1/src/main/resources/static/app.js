/**
 * =============================================================================
 * APP.JS - GESTIÓN FRONTEND PRO (VANILLA JAVASCRIPT)
 * =============================================================================
 * Cumple con los requerimientos de la pizarra:
 * 1. Búsqueda Instantánea ("realtime") en tiempo real conforme se escribe.
 * 2. Visualización en Cards responsivas (Grid & Flexbox con Media Queries / Tailwind).
 * 3. Vista de detalle completa (flecha hacia documento de detalles).
 * 4. Integración completa CRUD (GET, POST, PUT, DELETE) con Spring Boot & PostgreSQL.
 * 5. Alternancia fluida entre Modo Claro y Modo Oscuro con persistencia en localStorage.
 * 6. Dashboard KPI con métricas interactivas y atajos de teclado.
 */

// Configuración de endpoints (soporta ejecución directa en 8080, Live Server u otros orígenes)
const API_BASE_URL = (typeof window !== "undefined" && window.location && window.location.protocol && window.location.protocol.startsWith("http") && (window.location.port === "8080" || window.location.port === ""))
    ? `${window.location.origin}/api/tareas`
    : "http://localhost:8080/api/tareas";

console.log("[TaskHub] Conectando a:", API_BASE_URL);

// Estado en memoria de la aplicación
let tareas = [];
let filtroEstado = "TODOS";
let textoBusqueda = "";
let ordenSeleccionado = "recientes";
let tareaEnDetalle = null;
let vistaActual = "grid"; // 'grid', 'kanban', 'tabla'

// =============================================================================
// REFERENCIAS A ELEMENTOS DEL DOM
// =============================================================================
// Selector de tema (Claro / Oscuro)
let btnThemeToggle, themeToggleIcon, themeToggleText;

// Acciones Hero
let btnHeroCrear, btnDemoData, btnExportarJson, btnVacioDemo, heroGreeting;

// KPIs del Dashboard y Barras de Progreso
let kpiTotal, kpiPendientes, kpiPendientesPct, kpiProceso, kpiProcesoPct, kpiCompletadas, kpiCompletadasPct, metricCards;
let kpiTotalBar, kpiPendientesBar, kpiProcesoBar, kpiCompletadasBar;

// Selectores de Vista (Grid / Kanban / Tabla)
let btnVistaGrid, btnVistaKanban, btnVistaTabla;
let kanbanView, kanbanListPendiente, kanbanListProceso, kanbanListCompletada;
let kanbanCountPendiente, kanbanCountProceso, kanbanCountCompletada;
let tableView, tableBody;

// Búsqueda, orden y filtros
let inputBusqueda, btnLimpiarBusqueda, btnsFiltro, selectOrden, gridTareas, loadingSpinner, estadoVacio, vacioTitulo, vacioSubtitulo, btnVacioCrear, textoConteoResultados, btnRecargar;

// Badges de conteo
let badgeTotal, badgePendientes, badgeProceso, badgeCompletadas;

// Estado del backend
let backendStatusBadge, backendStatusText;

// Modal Detalle
let modalDetalle, backdropDetalle, btnCerrarDetalle, detalleIdBadge, detalleEstadoBadge, detalleTitulo, detalleDescripcion, detalleEstadoTexto, btnDetalleEditar, btnDetalleEliminar, btnCopiarDescripcion;
let btnDetalleStatusPendiente, btnDetalleStatusProceso, btnDetalleStatusCompletada;

// Modal Formulario (Crear / Editar)
let modalForm, backdropForm, btnNuevaTarea, btnCerrarForm, btnCancelarForm, formTarea, modalFormTitulo, btnSubmitTexto, inputTareaId, inputTitulo, inputDescripcion, selectEstado, charTitulo, charDescripcion;
let selectorEstadoCards, btnsEstadoOpcion, btnsTemplate;

// Contenedor de Toasts
let toastContainer;

/**
 * Busca y enlaza todos los elementos del DOM de forma segura.
 */
function inicializarElementosDOM() {
    btnThemeToggle = document.getElementById("btn-theme-toggle");
    themeToggleIcon = document.getElementById("theme-toggle-icon");
    themeToggleText = document.getElementById("theme-toggle-text");

    btnHeroCrear = document.getElementById("btn-hero-crear");
    btnDemoData = document.getElementById("btn-demo-data");
    btnExportarJson = document.getElementById("btn-exportar-json");
    btnVacioDemo = document.getElementById("btn-vacio-demo");
    heroGreeting = document.getElementById("hero-greeting");

    kpiTotal = document.getElementById("kpi-total");
    kpiPendientes = document.getElementById("kpi-pendientes");
    kpiPendientesPct = document.getElementById("kpi-pendientes-pct");
    kpiProceso = document.getElementById("kpi-proceso");
    kpiProcesoPct = document.getElementById("kpi-proceso-pct");
    kpiCompletadas = document.getElementById("kpi-completadas");
    kpiCompletadasPct = document.getElementById("kpi-completadas-pct");
    metricCards = document.querySelectorAll(".metric-card");

    kpiTotalBar = document.getElementById("kpi-total-bar");
    kpiPendientesBar = document.getElementById("kpi-pendientes-bar");
    kpiProcesoBar = document.getElementById("kpi-proceso-bar");
    kpiCompletadasBar = document.getElementById("kpi-completadas-bar");

    btnVistaGrid = document.getElementById("btn-vista-grid");
    btnVistaKanban = document.getElementById("btn-vista-kanban");
    btnVistaTabla = document.getElementById("btn-vista-tabla");

    kanbanView = document.getElementById("kanban-view");
    kanbanListPendiente = document.getElementById("kanban-list-pendiente");
    kanbanListProceso = document.getElementById("kanban-list-proceso");
    kanbanListCompletada = document.getElementById("kanban-list-completada");
    kanbanCountPendiente = document.getElementById("kanban-count-pendiente");
    kanbanCountProceso = document.getElementById("kanban-count-proceso");
    kanbanCountCompletada = document.getElementById("kanban-count-completada");

    tableView = document.getElementById("table-view");
    tableBody = document.getElementById("table-body");

    inputBusqueda = document.getElementById("input-busqueda");
    btnLimpiarBusqueda = document.getElementById("btn-limpiar-busqueda");
    btnsFiltro = document.querySelectorAll(".btn-filtro");
    selectOrden = document.getElementById("select-orden");
    gridTareas = document.getElementById("grid-tareas");
    loadingSpinner = document.getElementById("loading-spinner");
    estadoVacio = document.getElementById("estado-vacio");
    vacioTitulo = document.getElementById("vacio-titulo");
    vacioSubtitulo = document.getElementById("vacio-subtitulo");
    btnVacioCrear = document.getElementById("btn-vacio-crear");
    textoConteoResultados = document.getElementById("texto-conteo-resultados");
    btnRecargar = document.getElementById("btn-recargar");

    badgeTotal = document.getElementById("badge-total");
    badgePendientes = document.getElementById("badge-pendientes");
    badgeProceso = document.getElementById("badge-proceso");
    badgeCompletadas = document.getElementById("badge-completadas");

    backendStatusBadge = document.getElementById("backend-status-badge");
    backendStatusText = document.getElementById("backend-status-text");

    modalDetalle = document.getElementById("modal-detalle");
    backdropDetalle = document.getElementById("backdrop-detalle");
    btnCerrarDetalle = document.getElementById("btn-cerrar-detalle");
    detalleIdBadge = document.getElementById("detalle-id-badge");
    detalleEstadoBadge = document.getElementById("detalle-estado-badge");
    detalleTitulo = document.getElementById("detalle-titulo");
    detalleDescripcion = document.getElementById("detalle-descripcion");
    detalleEstadoTexto = document.getElementById("detalle-estado-texto");
    btnDetalleEditar = document.getElementById("btn-detalle-editar");
    btnDetalleEliminar = document.getElementById("btn-detalle-eliminar");
    btnCopiarDescripcion = document.getElementById("btn-copiar-descripcion");
    btnDetalleStatusPendiente = document.getElementById("btn-detalle-status-pendiente");
    btnDetalleStatusProceso = document.getElementById("btn-detalle-status-proceso");
    btnDetalleStatusCompletada = document.getElementById("btn-detalle-status-completada");

    modalForm = document.getElementById("modal-form");
    backdropForm = document.getElementById("backdrop-form");
    btnNuevaTarea = document.getElementById("btn-nueva-tarea");
    btnCerrarForm = document.getElementById("btn-cerrar-form");
    btnCancelarForm = document.getElementById("btn-cancelar-form");
    formTarea = document.getElementById("tarea-form");
    modalFormTitulo = document.getElementById("modal-form-titulo");
    btnSubmitTexto = document.getElementById("btn-submit-texto");
    inputTareaId = document.getElementById("tarea-id");
    inputTitulo = document.getElementById("titulo");
    inputDescripcion = document.getElementById("descripcion");
    selectEstado = document.getElementById("estado");
    charTitulo = document.getElementById("char-titulo");
    charDescripcion = document.getElementById("char-descripcion");

    selectorEstadoCards = document.getElementById("selector-estado-cards");
    btnsEstadoOpcion = document.querySelectorAll(".btn-estado-opcion");
    btnsTemplate = document.querySelectorAll(".btn-template");

    toastContainer = document.getElementById("toast-container");
}

// =============================================================================
// INICIALIZACIÓN Y EVENT LISTENERS RESILIENTE
// =============================================================================
function init() {
    inicializarElementosDOM();
    inicializarTema();
    actualizarSaludoHero();
    cargarTareas();
    configurarEventos();
}

// jQuery Initialization (Required Standard)
if (typeof jQuery !== "undefined") {
    $(document).ready(init);
} else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}

// -----------------------------------------------------------------------------
// GESTIÓN DEL MODO CLARO / OSCURO
// -----------------------------------------------------------------------------
function inicializarTema() {
    const esOscuro = document.documentElement.classList.contains("dark");
    actualizarBotonTema(esOscuro);

    if (btnThemeToggle) {
        btnThemeToggle.addEventListener("click", () => alternarTema());
    }
}

function alternarTema() {
    const actualmenteOscuro = document.documentElement.classList.contains("dark");
    if (actualmenteOscuro) {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("color-theme", "light");
        actualizarBotonTema(false);
        mostrarToast("Modo claro activado ☀️", "info");
    } else {
        document.documentElement.classList.add("dark");
        localStorage.setItem("color-theme", "dark");
        actualizarBotonTema(true);
        mostrarToast("Modo oscuro activado 🌙", "info");
    }
}

function actualizarBotonTema(esOscuro) {
    if (!themeToggleIcon || !themeToggleText) return;

    if (esOscuro) {
        themeToggleIcon.className = "fa-solid fa-sun text-amber-400 text-sm transition-transform duration-300 rotate-0";
        themeToggleText.textContent = "Modo Claro";
        btnThemeToggle.title = "Cambiar a Modo Claro (Alt + T)";
    } else {
        themeToggleIcon.className = "fa-solid fa-moon text-indigo-600 text-sm transition-transform duration-300 rotate-0";
        themeToggleText.textContent = "Modo Oscuro";
        btnThemeToggle.title = "Cambiar a Modo Oscuro (Alt + T)";
    }
}

// -----------------------------------------------------------------------------
// CONFIGURACIÓN DE EVENTOS DEL USUARIO
// -----------------------------------------------------------------------------
function configurarEventos() {
    // 1. Búsqueda instantánea ("realtime") al escribir en el input
    if (inputBusqueda) {
        inputBusqueda.addEventListener("input", (e) => {
            textoBusqueda = e.target.value.trim().toLowerCase();

            // Mostrar / ocultar botón de limpiar
            if (btnLimpiarBusqueda) {
                if (textoBusqueda.length > 0) {
                    btnLimpiarBusqueda.classList.remove("hidden");
                } else {
                    btnLimpiarBusqueda.classList.add("hidden");
                }
            }

            aplicarFiltrosYRenderizar();
        });
    }

    // Limpiar búsqueda
    if (btnLimpiarBusqueda) {
        btnLimpiarBusqueda.addEventListener("click", () => {
            if (inputBusqueda) {
                inputBusqueda.value = "";
                inputBusqueda.focus();
            }
            textoBusqueda = "";
            btnLimpiarBusqueda.classList.add("hidden");
            aplicarFiltrosYRenderizar();
        });
    }

    // 2. Filtros por botones de estado (Flexbox)
    if (btnsFiltro) {
        btnsFiltro.forEach((btn) => {
            btn.addEventListener("click", () => {
                seleccionarFiltro(btn.dataset.filtro);
            });
        });
    }

    // Filtros por tarjetas de métricas (KPIs)
    if (metricCards) {
        metricCards.forEach((card) => {
            card.addEventListener("click", () => {
                const filtro = card.dataset.filtro;
                seleccionarFiltro(filtro);
            });
        });
    }

    // Ordenamiento dinámico
    if (selectOrden) {
        selectOrden.addEventListener("change", (e) => {
            ordenSeleccionado = e.target.value;
            aplicarFiltrosYRenderizar();
        });
    }

    // Recargar lista
    if (btnRecargar) {
        btnRecargar.addEventListener("click", () => {
            cargarTareas();
            mostrarToast("Actualizando lista de tareas...", "info");
        });
    }

    // Contador de caracteres para campos de formulario
    if (inputTitulo && charTitulo) {
        inputTitulo.addEventListener("input", () => {
            charTitulo.textContent = `${inputTitulo.value.length}/150`;
        });
    }

    if (inputDescripcion && charDescripcion) {
        inputDescripcion.addEventListener("input", () => {
            charDescripcion.textContent = `${inputDescripcion.value.length}/500`;
        });
    }

    // Copiar descripción en modal de detalle
    if (btnCopiarDescripcion) {
        btnCopiarDescripcion.addEventListener("click", async () => {
            if (tareaEnDetalle && tareaEnDetalle.descripcion) {
                try {
                    await navigator.clipboard.writeText(tareaEnDetalle.descripcion);
                    mostrarToast("Descripción copiada al portapapeles 📋", "success");
                } catch {
                    mostrarToast("No se pudo copiar automáticamente", "warning");
                }
            }
        });
    }

    // Cambio rápido de estado desde la ficha de detalle
    if (btnDetalleStatusPendiente) {
        btnDetalleStatusPendiente.addEventListener("click", async () => {
            if (!tareaEnDetalle) return;
            await cambiarEstadoRapido(tareaEnDetalle.id, "PENDIENTE");
            const actualizado = tareas.find(t => t.id === tareaEnDetalle.id);
            if (actualizado) abrirModalDetalle(actualizado);
        });
    }
    if (btnDetalleStatusProceso) {
        btnDetalleStatusProceso.addEventListener("click", async () => {
            if (!tareaEnDetalle) return;
            await cambiarEstadoRapido(tareaEnDetalle.id, "EN_PROCESO");
            const actualizado = tareas.find(t => t.id === tareaEnDetalle.id);
            if (actualizado) abrirModalDetalle(actualizado);
        });
    }
    if (btnDetalleStatusCompletada) {
        btnDetalleStatusCompletada.addEventListener("click", async () => {
            if (!tareaEnDetalle) return;
            await cambiarEstadoRapido(tareaEnDetalle.id, "COMPLETADA");
            const actualizado = tareas.find(t => t.id === tareaEnDetalle.id);
            if (actualizado) abrirModalDetalle(actualizado);
        });
    }

    // Atajos de teclado útiles
    document.addEventListener("keydown", (e) => {
        // Presionar '/' para enfocar búsqueda
        if (e.key === "/" && document.activeElement !== inputBusqueda && document.activeElement !== inputTitulo && document.activeElement !== inputDescripcion) {
            e.preventDefault();
            if (inputBusqueda) inputBusqueda.focus();
        }
        // Atajo Alt + T para cambiar tema
        if (e.altKey && (e.key === "t" || e.key === "T")) {
            e.preventDefault();
            alternarTema();
        }
        // Atajo ESC para cerrar modales
        if (e.key === "Escape") {
            cerrarModalForm();
            cerrarModalDetalle();
        }
    });

    // Modal Crear Tarea
    if (btnNuevaTarea) btnNuevaTarea.addEventListener("click", () => abrirFormularioCrear());
    if (btnHeroCrear) btnHeroCrear.addEventListener("click", () => abrirFormularioCrear());
    if (btnVacioCrear) btnVacioCrear.addEventListener("click", () => abrirFormularioCrear());

    // Acciones Hero y Demo
    if (btnDemoData) btnDemoData.addEventListener("click", () => crearTareaDemo());
    if (btnVacioDemo) btnVacioDemo.addEventListener("click", () => crearTareaDemo());
    if (btnExportarJson) btnExportarJson.addEventListener("click", () => exportarTareasJSON());

    // Selectores de Vista (Tarjetas / Kanban / Tabla)
    if (btnVistaGrid) btnVistaGrid.addEventListener("click", () => cambiarVista("grid"));
    if (btnVistaKanban) btnVistaKanban.addEventListener("click", () => cambiarVista("kanban"));
    if (btnVistaTabla) btnVistaTabla.addEventListener("click", () => cambiarVista("tabla"));

    // Plantillas rápidas en formulario
    if (btnsTemplate) {
        btnsTemplate.forEach(btn => {
            btn.addEventListener("click", () => {
                if (inputTitulo) inputTitulo.value = btn.dataset.titulo || "";
                if (inputDescripcion) inputDescripcion.value = btn.dataset.desc || "";
                if (charTitulo && inputTitulo) charTitulo.textContent = `${inputTitulo.value.length}/150`;
                if (charDescripcion && inputDescripcion) charDescripcion.textContent = `${inputDescripcion.value.length}/500`;
                mostrarToast("Plantilla cargada en el formulario 🚀", "info");
            });
        });
    }

    // Selector visual de estado en formulario
    if (btnsEstadoOpcion) {
        btnsEstadoOpcion.forEach(btn => {
            btn.addEventListener("click", () => {
                seleccionarEstadoModal(btn.dataset.estadoVal);
            });
        });
    }

    // Cerrar modales
    if (btnCerrarForm) btnCerrarForm.addEventListener("click", cerrarModalForm);
    if (btnCancelarForm) btnCancelarForm.addEventListener("click", cerrarModalForm);
    if (backdropForm) backdropForm.addEventListener("click", cerrarModalForm);

    if (btnCerrarDetalle) btnCerrarDetalle.addEventListener("click", cerrarModalDetalle);
    if (backdropDetalle) backdropDetalle.addEventListener("click", cerrarModalDetalle);

    // Envío del formulario (Crear o Actualizar)
    if (formTarea) formTarea.addEventListener("submit", procesarFormulario);

    // Acciones desde el modal de detalle
    if (btnDetalleEditar) {
        btnDetalleEditar.addEventListener("click", () => {
            if (tareaEnDetalle) {
                const tareaAEditar = { ...tareaEnDetalle };
                cerrarModalDetalle();
                abrirFormularioEditar(tareaAEditar);
            }
        });
    }

    if (btnDetalleEliminar) {
        btnDetalleEliminar.addEventListener("click", () => {
            if (tareaEnDetalle) {
                const idAEliminar = tareaEnDetalle.id;
                cerrarModalDetalle();
                confirmarYEliminar(idAEliminar);
            }
        });
    }
}

function seleccionarFiltro(nuevoFiltro) {
    filtroEstado = nuevoFiltro;

    btnsFiltro.forEach((b) => {
        if (b.dataset.filtro === nuevoFiltro) {
            b.classList.add("active", "bg-indigo-600", "text-white");
            b.classList.remove("bg-slate-100", "text-slate-700", "dark:bg-slate-800", "dark:text-slate-300");
        } else {
            b.classList.remove("active", "bg-indigo-600", "text-white");
            b.classList.add("bg-slate-100", "text-slate-700", "dark:bg-slate-800", "dark:text-slate-300");
        }
    });

    aplicarFiltrosYRenderizar();
}

// =============================================================================
// PETICIONES A LA API REST (SPRING BOOT & POSTGRESQL)
// =============================================================================

/**
 * 1. GET /api/tareas
 * Carga todas las tareas desde el backend
 */
async function cargarTareas() {
    mostrarCarga(true);
    try {
        const respuesta = await fetch(API_BASE_URL);

        if (!respuesta.ok) {
            throw new Error(`Error en el servidor: HTTP ${respuesta.status}`);
        }

        tareas = await respuesta.json();
        actualizarEstadoServidor(true);
        actualizarDashboardKPIs();
        aplicarFiltrosYRenderizar();
    } catch (error) {
        console.error("Error al obtener tareas:", error);
        actualizarEstadoServidor(false);
        mostrarToast("No se pudo conectar con el servidor Spring Boot (puerto 8080)", "error");

        mostrarCarga(false);
        gridTareas.classList.add("hidden");
        estadoVacio.classList.remove("hidden");
        vacioTitulo.textContent = "Error de conexión con el Backend";
        vacioSubtitulo.textContent = "Verifica que el servidor Spring Boot esté ejecutándose en http://localhost:8080";
        textoConteoResultados.textContent = "Sin conexión con la base de datos";
    }
}

/**
 * 2. POST /api/tareas o PUT /api/tareas/{id}
 * Guarda o actualiza una tarea en la base de datos
 */
async function procesarFormulario(e) {
    e.preventDefault();

    const id = inputTareaId.value;
    const esEdicion = Boolean(id);

    const tareaPayload = {
        titulo: inputTitulo.value.trim(),
        descripcion: inputDescripcion.value.trim(),
        estado: selectEstado.value
    };

    if (!tareaPayload.titulo) {
        mostrarToast("El título de la tarea es obligatorio", "warning");
        return;
    }

    try {
        const url = esEdicion ? `${API_BASE_URL}/${id}` : API_BASE_URL;
        const metodo = esEdicion ? "PUT" : "POST";

        const respuesta = await fetch(url, {
            method: metodo,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(tareaPayload)
        });

        if (!respuesta.ok) {
            throw new Error(`Error en la operación HTTP ${respuesta.status}`);
        }

        const tareaGuardada = await respuesta.json();

        cerrarModalForm();
        mostrarToast(
            esEdicion
                ? `Tarea #${tareaGuardada.id} actualizada correctamente`
                : `Tarea #${tareaGuardada.id} creada con éxito`,
            "success"
        );

        await cargarTareas();

    } catch (error) {
        console.error("Error al guardar tarea:", error);
        mostrarToast("Ocurrió un error al guardar la tarea en PostgreSQL", "error");
    }
}

/**
 * 3. DELETE /api/tareas/{id}
 * Elimina una tarea por su ID
 */
async function confirmarYEliminar(id) {
    const confirmacion = confirm(`¿Estás seguro de que deseas eliminar la tarea #${id}? Esta acción no se puede deshacer.`);
    if (!confirmacion) return;

    try {
        const respuesta = await fetch(`${API_BASE_URL}/${id}`, {
            method: "DELETE"
        });

        if (respuesta.status === 204 || respuesta.status === 200 || respuesta.ok) {
            mostrarToast(`Tarea #${id} eliminada correctamente`, "success");
            await cargarTareas();
        } else {
            throw new Error(`Código de respuesta inesperado: ${respuesta.status}`);
        }
    } catch (error) {
        console.error("Error al eliminar tarea:", error);
        mostrarToast(`No se pudo eliminar la tarea #${id}`, "error");
    }
}

/**
 * Cambio rápido de estado con 1 clic (sin necesidad de abrir modal)
 */
async function cambiarEstadoRapido(id, nuevoEstado) {
    const tareaExistente = tareas.find(t => t.id === id);
    if (!tareaExistente) return;

    try {
        const respuesta = await fetch(`${API_BASE_URL}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                titulo: tareaExistente.titulo,
                descripcion: tareaExistente.descripcion,
                estado: nuevoEstado
            })
        });

        if (!respuesta.ok) throw new Error("Error al cambiar estado");
        mostrarToast(`Tarea #${id} movida a ${nuevoEstado} ✨`, "success");
        await cargarTareas();
    } catch (error) {
        console.error("Error rápido de estado:", error);
        mostrarToast("No se pudo actualizar el estado", "error");
    }
}

// =============================================================================
// LÓGICA DE FILTRADO INSTANTÁNEO Y GESTIÓN MULTI-VISTA (CARDS, KANBAN, TABLA)
// =============================================================================

function cambiarVista(nuevaVista) {
    vistaActual = nuevaVista;

    // Actualizar botones de vista
    const botonesVista = [
        { btn: btnVistaGrid, vista: "grid" },
        { btn: btnVistaKanban, vista: "kanban" },
        { btn: btnVistaTabla, vista: "tabla" }
    ];

    botonesVista.forEach(item => {
        if (!item.btn) return;
        if (item.vista === nuevaVista) {
            item.btn.className = "btn-vista active p-1.5 px-3 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm transition-all cursor-pointer";
        } else {
            item.btn.className = "btn-vista p-1.5 px-3 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer";
        }
    });

    aplicarFiltrosYRenderizar();
}

function aplicarFiltrosYRenderizar() {
    mostrarCarga(false);

    // 1. Filtrar por estado seleccionado
    let filtradas = [...tareas];
    if (filtroEstado !== "TODOS") {
        filtradas = filtradas.filter(t => t.estado === filtroEstado);
    }

    // 2. Filtrar instantáneamente por término de búsqueda (realtime)
    if (textoBusqueda) {
        filtradas = filtradas.filter(t => {
            const tituloMatch = t.titulo && t.titulo.toLowerCase().includes(textoBusqueda);
            const descMatch = t.descripcion && t.descripcion.toLowerCase().includes(textoBusqueda);
            const idMatch = t.id && t.id.toString().includes(textoBusqueda);
            return tituloMatch || descMatch || idMatch;
        });
    }

    // 3. Ordenamiento
    if (ordenSeleccionado === "recientes") {
        filtradas.sort((a, b) => b.id - a.id);
    } else if (ordenSeleccionado === "antiguos") {
        filtradas.sort((a, b) => a.id - b.id);
    } else if (ordenSeleccionado === "az") {
        filtradas.sort((a, b) => (a.titulo || "").localeCompare(b.titulo || ""));
    }

    // Actualizar texto de conteo
    if (textoConteoResultados) {
        textoConteoResultados.innerHTML = `Mostrando <strong class="text-slate-900 dark:text-white font-bold">${filtradas.length}</strong> de <strong class="text-slate-900 dark:text-white font-bold">${tareas.length}</strong> tareas registradas`;
    }

    // 4. Ocultar todos los contenedores de vista antes de renderizar la activa
    if (gridTareas) {
        gridTareas.classList.add("hidden");
        gridTareas.classList.remove("grid");
        gridTareas.style.display = "none";
    }
    if (kanbanView) {
        kanbanView.classList.add("hidden");
        kanbanView.classList.remove("grid");
        kanbanView.style.display = "none";
    }
    if (tableView) {
        tableView.classList.add("hidden");
        tableView.style.display = "none";
    }

    // 5. Renderizar o mostrar estado vacío
    if (filtradas.length === 0) {
        if (estadoVacio) {
            estadoVacio.classList.remove("hidden");
            estadoVacio.style.display = "block";
            if (textoBusqueda || filtroEstado !== "TODOS") {
                vacioTitulo.textContent = "No se encontraron coincidencias";
                vacioSubtitulo.textContent = `No hay tareas que coincidan con la búsqueda "${textoBusqueda || filtroEstado}".`;
            } else {
                vacioTitulo.textContent = "No hay tareas registradas";
                vacioSubtitulo.textContent = "Comienza creando tu primera tarea conectada a PostgreSQL.";
            }
        }
    } else {
        if (estadoVacio) {
            estadoVacio.classList.add("hidden");
            estadoVacio.style.display = "none";
        }

        if (vistaActual === "grid") {
            if (gridTareas) {
                gridTareas.classList.remove("hidden");
                gridTareas.classList.add("grid");
                gridTareas.style.display = "";
                renderizarCards(filtradas);
            }
        } else if (vistaActual === "kanban") {
            if (kanbanView) {
                kanbanView.classList.remove("hidden");
                kanbanView.classList.add("grid");
                kanbanView.style.display = "";
                renderizarKanban(filtradas);
            }
        } else if (vistaActual === "tabla") {
            if (tableView) {
                tableView.classList.remove("hidden");
                tableView.style.display = "";
                renderizarTabla(filtradas);
            }
        }
    }
}

/**
 * Renderiza el Grid de Tarjetas con diseño adaptable y acciones rápidas
 */
function renderizarCards(lista) {
    if (!gridTareas) return;
    gridTareas.innerHTML = "";

    lista.forEach(tarea => {
        const card = document.createElement("article");
        card.className = "task-card animate-card-in group cursor-pointer";
        card.setAttribute("data-id", tarea.id);
        card.setAttribute("data-estado", tarea.estado);

        const configEstado = obtenerConfiguracionEstado(tarea.estado);

        // Botón de avance rápido según el estado actual
        let botonAccionRapida = "";
        if (tarea.estado === "PENDIENTE") {
            botonAccionRapida = `<button type="button" class="btn-quick-status px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 transition-all cursor-pointer" data-id="${tarea.id}" data-sig="EN_PROCESO" title="Pasar a En Proceso">Iniciar 🔄</button>`;
        } else if (tarea.estado === "EN_PROCESO") {
            botonAccionRapida = `<button type="button" class="btn-quick-status px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 transition-all cursor-pointer" data-id="${tarea.id}" data-sig="COMPLETADA" title="Marcar como Completada">Completar ✅</button>`;
        } else {
            botonAccionRapida = `<button type="button" class="btn-quick-status px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400 transition-all cursor-pointer" data-id="${tarea.id}" data-sig="PENDIENTE" title="Reabrir Tarea">Reabrir ⏳</button>`;
        }

        card.innerHTML = `
            <div class="task-card-body">
                <div>
                    <div class="task-card-header">
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${configEstado.badgeClass}">
                            <i class="${configEstado.icon} text-[10px]"></i>
                            <span>${configEstado.texto}</span>
                        </span>
                        <div class="flex items-center gap-2">
                            <span class="card-doc-hint text-[11px] font-semibold text-indigo-500 dark:text-indigo-400 flex items-center gap-1">
                                <i class="fa-solid fa-file-invoice"></i> Details &rarr;
                            </span>
                            <span class="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                #${tarea.id}
                            </span>
                        </div>
                    </div>

                    <h3 class="task-card-title text-base font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors line-clamp-2 mt-1 leading-snug">
                        ${escaparHTML(tarea.titulo)}
                    </h3>

                    <!-- Structured Description Section (3-Column Equal Card Layout) -->
                    <div class="mt-2.5 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/80 space-y-2">
                        <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                            <span><i class="fa-regular fa-file-lines mr-1 text-indigo-500"></i> Description</span>
                            <span class="font-mono text-indigo-600 dark:text-indigo-400">${tarea.descripcion ? tarea.descripcion.length + ' chars' : 'Empty'}</span>
                        </div>
                        <p class="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                            ${tarea.descripcion ? escaparHTML(tarea.descripcion) : '<span class="italic text-slate-400 dark:text-slate-500">No description provided</span>'}
                        </p>
                    </div>
                </div>
            </div>

            <div class="task-card-footer">
                <div class="flex items-center gap-1.5" onclick="event.stopPropagation();">
                    ${botonAccionRapida}
                </div>

                <div class="flex items-center gap-1" onclick="event.stopPropagation();">
                    <button 
                        type="button" 
                        class="btn-ver-detalle p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-xl transition-all text-xs cursor-pointer" 
                        title="Ver Ficha Técnica (Documento)"
                    >
                        <i class="fa-solid fa-file-invoice"></i>
                    </button>
                    <button 
                        type="button" 
                        class="btn-editar p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-xl transition-all text-xs cursor-pointer" 
                        title="Editar tarea"
                    >
                        <i class="fa-regular fa-pen-to-square"></i>
                    </button>
                    <button 
                        type="button" 
                        class="btn-eliminar p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all text-xs cursor-pointer" 
                        title="Eliminar tarea"
                    >
                        <i class="fa-regular fa-trash-can"></i>
                    </button>
                </div>
            </div>
        `;

        // Click en tarjeta para ver detalle
        card.addEventListener("click", () => abrirModalDetalle(tarea));

        const btnVer = card.querySelector(".btn-ver-detalle");
        if (btnVer) btnVer.addEventListener("click", (e) => {
            e.stopPropagation();
            abrirModalDetalle(tarea);
        });

        const btnEdit = card.querySelector(".btn-editar");
        if (btnEdit) btnEdit.addEventListener("click", (e) => {
            e.stopPropagation();
            abrirFormularioEditar(tarea);
        });

        const btnDel = card.querySelector(".btn-eliminar");
        if (btnDel) btnDel.addEventListener("click", (e) => {
            e.stopPropagation();
            confirmarYEliminar(tarea.id);
        });

        const btnQuick = card.querySelector(".btn-quick-status");
        if (btnQuick) btnQuick.addEventListener("click", (e) => {
            e.stopPropagation();
            cambiarEstadoRapido(tarea.id, btnQuick.dataset.sig);
        });

        gridTareas.appendChild(card);
    });
}

/**
 * Renderiza el Tablero Kanban (3 columnas interactivas)
 */
function renderizarKanban(lista) {
    if (!kanbanListPendiente || !kanbanListProceso || !kanbanListCompletada) return;

    kanbanListPendiente.innerHTML = "";
    kanbanListProceso.innerHTML = "";
    kanbanListCompletada.innerHTML = "";

    const pendientes = lista.filter(t => t.estado === "PENDIENTE");
    const procesos = lista.filter(t => t.estado === "EN_PROCESO");
    const completadas = lista.filter(t => t.estado === "COMPLETADA");

    if (kanbanCountPendiente) kanbanCountPendiente.textContent = pendientes.length;
    if (kanbanCountProceso) kanbanCountProceso.textContent = procesos.length;
    if (kanbanCountCompletada) kanbanCountCompletada.textContent = completadas.length;

    const renderColumna = (contenedor, items) => {
        if (items.length === 0) {
            contenedor.innerHTML = `<div class="p-6 text-center text-xs text-slate-400 italic">No hay tareas en esta columna</div>`;
            return;
        }

        items.forEach(t => {
            const card = document.createElement("div");
            card.className = "kanban-card group";
            
            let btnAvanzar = "";
            if (t.estado === "PENDIENTE") {
                btnAvanzar = `<button type="button" class="btn-kanban-move px-2 py-1 rounded-md text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20" data-id="${t.id}" data-sig="EN_PROCESO" title="Mover a En Proceso">En Proceso ➡️</button>`;
            } else if (t.estado === "EN_PROCESO") {
                btnAvanzar = `<button type="button" class="btn-kanban-move px-2 py-1 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20" data-id="${t.id}" data-sig="COMPLETADA" title="Mover a Completada">Completar ✅</button>`;
            } else {
                btnAvanzar = `<button type="button" class="btn-kanban-move px-2 py-1 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20" data-id="${t.id}" data-sig="PENDIENTE" title="Reabrir">Reabrir ⏳</button>`;
            }

            card.innerHTML = `
                <div class="flex items-start justify-between gap-2 mb-2">
                    <span class="text-[11px] font-mono font-bold text-slate-400">#${t.id}</span>
                    <div class="flex items-center gap-1" onclick="event.stopPropagation();">
                        <button type="button" class="btn-kanban-edit p-1 text-slate-400 hover:text-indigo-600 transition-colors text-xs" title="Editar"><i class="fa-regular fa-pen-to-square"></i></button>
                        <button type="button" class="btn-kanban-del p-1 text-slate-400 hover:text-rose-600 transition-colors text-xs" title="Eliminar"><i class="fa-regular fa-trash-can"></i></button>
                    </div>
                </div>
                <h4 class="text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
                    ${escaparHTML(t.titulo)}
                </h4>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                    ${t.descripcion ? escaparHTML(t.descripcion) : '<span class="italic text-slate-400">Sin descripción</span>'}
                </p>
                <div class="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between" onclick="event.stopPropagation();">
                    ${btnAvanzar}
                    <button type="button" class="btn-kanban-detail text-[11px] text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold">Detalle &rarr;</button>
                </div>
            `;

            card.addEventListener("click", () => abrirModalDetalle(t));

            const btnMove = card.querySelector(".btn-kanban-move");
            if (btnMove) btnMove.addEventListener("click", (e) => {
                e.stopPropagation();
                cambiarEstadoRapido(t.id, btnMove.dataset.sig);
            });

            const btnEdit = card.querySelector(".btn-kanban-edit");
            if (btnEdit) btnEdit.addEventListener("click", (e) => {
                e.stopPropagation();
                abrirFormularioEditar(t);
            });

            const btnDel = card.querySelector(".btn-kanban-del");
            if (btnDel) btnDel.addEventListener("click", (e) => {
                e.stopPropagation();
                confirmarYEliminar(t.id);
            });

            const btnDetail = card.querySelector(".btn-kanban-detail");
            if (btnDetail) btnDetail.addEventListener("click", (e) => {
                e.stopPropagation();
                abrirModalDetalle(t);
            });

            contenedor.appendChild(card);
        });
    };

    renderColumna(kanbanListPendiente, pendientes);
    renderColumna(kanbanListProceso, procesos);
    renderColumna(kanbanListCompletada, completadas);
}

/**
 * Renderiza la Vista Tabla compacta
 */
function renderizarTabla(lista) {
    if (!tableBody) return;
    tableBody.innerHTML = "";

    lista.forEach(t => {
        const tr = document.createElement("tr");
        tr.className = "hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group";

        const config = obtenerConfiguracionEstado(t.estado);

        tr.innerHTML = `
            <td class="px-5 py-4 font-mono font-bold text-xs text-slate-400">#${t.id}</td>
            <td class="px-5 py-4 font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors max-w-xs truncate">
                ${escaparHTML(t.titulo)}
            </td>
            <td class="px-5 py-4 text-xs text-slate-500 dark:text-slate-400 max-w-sm truncate">
                ${t.descripcion ? escaparHTML(t.descripcion) : '<span class="italic text-slate-400">Sin descripción</span>'}
            </td>
            <td class="px-5 py-4 whitespace-nowrap">
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.badgeClass}">
                    <i class="${config.icon} text-[10px]"></i>
                    ${config.texto}
                </span>
            </td>
            <td class="px-5 py-4 text-right whitespace-nowrap" onclick="event.stopPropagation();">
                <div class="inline-flex items-center gap-1">
                    <button type="button" class="btn-tabla-ver p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Ver Detalle">
                        <i class="fa-regular fa-file-lines"></i>
                    </button>
                    <button type="button" class="btn-tabla-edit p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" title="Editar">
                        <i class="fa-regular fa-pen-to-square"></i>
                    </button>
                    <button type="button" class="btn-tabla-del p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors" title="Eliminar">
                        <i class="fa-regular fa-trash-can"></i>
                    </button>
                </div>
            </td>
        `;

        tr.addEventListener("click", () => abrirModalDetalle(t));

        const btnVer = tr.querySelector(".btn-tabla-ver");
        if (btnVer) btnVer.addEventListener("click", (e) => {
            e.stopPropagation();
            abrirModalDetalle(t);
        });

        const btnEdit = tr.querySelector(".btn-tabla-edit");
        if (btnEdit) btnEdit.addEventListener("click", (e) => {
            e.stopPropagation();
            abrirFormularioEditar(t);
        });

        const btnDel = tr.querySelector(".btn-tabla-del");
        if (btnDel) btnDel.addEventListener("click", (e) => {
            e.stopPropagation();
            confirmarYEliminar(t.id);
        });

        tableBody.appendChild(tr);
    });
}

/**
 * Inserta tareas de prueba de ejemplo en PostgreSQL
 */
async function crearTareaDemo() {
    const demos = [
        { titulo: "Optimizar consultas SQL en PostgreSQL", descripcion: "Crear índices B-tree sobre tareas(estado, titulo) para consultas de alta velocidad.", estado: "EN_PROCESO" },
        { titulo: "Diseñar endpoints REST para reportes", descripcion: "Exponer métricas de rendimiento y agregaciones semanales.", estado: "PENDIENTE" },
        { titulo: "Configurar Spring Boot Actuator", descripcion: "Monitorear salud del servicio y pool HikariCP.", estado: "COMPLETADA" },
        { titulo: "Añadir soporte para Docker Compose", descripcion: "Orquestar PostgreSQL 18 y el backend en contenedores aislados.", estado: "PENDIENTE" }
    ];

    const demo = demos[Math.floor(Math.random() * demos.length)];

    try {
        const respuesta = await fetch(API_BASE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(demo)
        });

        if (!respuesta.ok) throw new Error("Error al crear demo");
        mostrarToast("Tarea demo creada en PostgreSQL ✨", "success");
        await cargarTareas();
    } catch (error) {
        console.error("Error creando demo:", error);
        mostrarToast("No se pudo crear la tarea demo", "error");
    }
}

/**
 * Exporta todas las tareas registradas a un archivo JSON descargable
 */
function exportarTareasJSON() {
    if (tareas.length === 0) {
        mostrarToast("No hay tareas para exportar", "warning");
        return;
    }

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tareas, null, 2));
    const dlAnchor = document.createElement("a");
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `taskhub_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
    mostrarToast("Copia de respaldo JSON descargada 📥", "success");
}

function actualizarSaludoHero() {
    if (!heroGreeting) return;
    const hora = new Date().getHours();
    let saludo = "¡Buenas noches!";
    if (hora >= 6 && hora < 12) saludo = "¡Buenos días!";
    else if (hora >= 12 && hora < 19) saludo = "¡Buenas tardes!";
    heroGreeting.textContent = `${saludo} Workspace PostgreSQL Activo`;
}

function seleccionarEstadoModal(estadoVal) {
    if (selectEstado) selectEstado.value = estadoVal;

    if (btnsEstadoOpcion) {
        btnsEstadoOpcion.forEach(btn => {
            const esEste = btn.dataset.estadoVal === estadoVal;
            if (esEste) {
                btn.className = "btn-estado-opcion active p-3 rounded-2xl border text-center transition-all cursor-pointer border-indigo-500 bg-indigo-50/70 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-bold shadow-sm";
            } else {
                btn.className = "btn-estado-opcion p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-center transition-all cursor-pointer hover:border-slate-400 text-slate-600 dark:text-slate-400";
            }
        });
    }
}

// =============================================================================
// MODALES (DETALLE & FORMULARIO)
// =============================================================================

function abrirModalDetalle(tarea) {
    tareaEnDetalle = tarea;

    const config = obtenerConfiguracionEstado(tarea.estado);

    detalleIdBadge.textContent = `ID: #${tarea.id}`;
    detalleEstadoBadge.className = `px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.badgeClass}`;
    detalleEstadoBadge.innerHTML = `<i class="${config.icon} mr-1"></i>${config.texto}`;

    detalleTitulo.textContent = tarea.titulo;
    detalleDescripcion.textContent = tarea.descripcion || "Sin descripción proporcionada.";
    detalleEstadoTexto.textContent = config.texto;

    modalDetalle.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");
}

function cerrarModalDetalle() {
    modalDetalle.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
    tareaEnDetalle = null;
}

function abrirFormularioCrear() {
    formTarea.reset();
    inputTareaId.value = "";
    charTitulo.textContent = "0/150";
    charDescripcion.textContent = "0/500";
    modalFormTitulo.textContent = "Nueva Tarea";
    btnSubmitTexto.textContent = "Guardar Tarea";
    seleccionarEstadoModal("PENDIENTE");

    modalForm.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");
    setTimeout(() => inputTitulo.focus(), 50);
}

function abrirFormularioEditar(tarea) {
    inputTareaId.value = tarea.id;
    inputTitulo.value = tarea.titulo || "";
    inputDescripcion.value = tarea.descripcion || "";
    seleccionarEstadoModal(tarea.estado || "PENDIENTE");

    charTitulo.textContent = `${inputTitulo.value.length}/150`;
    charDescripcion.textContent = `${inputDescripcion.value.length}/500`;

    modalFormTitulo.textContent = `Editar Tarea #${tarea.id}`;
    btnSubmitTexto.textContent = "Actualizar Cambios";

    modalForm.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");
    setTimeout(() => inputTitulo.focus(), 50);
}

function cerrarModalForm() {
    modalForm.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
    formTarea.reset();
}

// =============================================================================
// HELPERS Y UTILIDADES
// =============================================================================

function obtenerConfiguracionEstado(estado) {
    switch (estado) {
        case "COMPLETADA":
            return {
                texto: "Completada",
                badgeClass: "badge-completada",
                icon: "fa-solid fa-check"
            };
        case "EN_PROCESO":
            return {
                texto: "En Proceso",
                badgeClass: "badge-en-proceso",
                icon: "fa-solid fa-spinner animate-spin"
            };
        case "PENDIENTE":
        default:
            return {
                texto: "Pendiente",
                badgeClass: "badge-pendiente",
                icon: "fa-regular fa-clock"
            };
    }
}

function actualizarDashboardKPIs() {
    const total = tareas.length;
    const pendientes = tareas.filter(t => t.estado === "PENDIENTE").length;
    const proceso = tareas.filter(t => t.estado === "EN_PROCESO").length;
    const completadas = tareas.filter(t => t.estado === "COMPLETADA").length;

    // Badges en barra de filtros
    if (badgeTotal) badgeTotal.textContent = `(${total})`;
    if (badgePendientes) badgePendientes.textContent = `(${pendientes})`;
    if (badgeProceso) badgeProceso.textContent = `(${proceso})`;
    if (badgeCompletadas) badgeCompletadas.textContent = `(${completadas})`;

    // KPIs Dashboard
    if (kpiTotal) kpiTotal.textContent = total;
    if (kpiPendientes) kpiPendientes.textContent = pendientes;
    if (kpiProceso) kpiProceso.textContent = proceso;
    if (kpiCompletadas) kpiCompletadas.textContent = completadas;

    const pctPendientes = total > 0 ? Math.round((pendientes / total) * 100) : 0;
    const pctProceso = total > 0 ? Math.round((proceso / total) * 100) : 0;
    const pctCompletadas = total > 0 ? Math.round((completadas / total) * 100) : 0;

    if (kpiPendientesPct) kpiPendientesPct.textContent = `${pctPendientes}%`;
    if (kpiProcesoPct) kpiProcesoPct.textContent = `${pctProceso}%`;
    if (kpiCompletadasPct) kpiCompletadasPct.textContent = `${pctCompletadas}%`;

    // Barras de progreso dinámicas con animación
    if (kpiTotalBar) kpiTotalBar.style.width = total > 0 ? "100%" : "0%";
    if (kpiPendientesBar) kpiPendientesBar.style.width = `${pctPendientes}%`;
    if (kpiProcesoBar) kpiProcesoBar.style.width = `${pctProceso}%`;
    if (kpiCompletadasBar) kpiCompletadasBar.style.width = `${pctCompletadas}%`;
}

function actualizarEstadoServidor(activo) {
    if (activo) {
        backendStatusBadge.className = "hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20";
        backendStatusText.textContent = "PostgreSQL Activo";
    } else {
        backendStatusBadge.className = "hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20";
        backendStatusText.textContent = "Backend Desconectado";
    }
}

function mostrarCarga(mostrar) {
    if (mostrar) {
        loadingSpinner.classList.remove("hidden");
        gridTareas.classList.add("hidden");
        estadoVacio.classList.add("hidden");
    } else {
        loadingSpinner.classList.add("hidden");
    }
}

function mostrarToast(mensaje, tipo = "info") {
    const toast = document.createElement("div");

    let colorClasses = "bg-white/95 dark:bg-slate-900/95 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200";
    let iconClass = "fa-solid fa-circle-info text-indigo-500 dark:text-indigo-400";

    if (tipo === "success") {
        colorClasses = "bg-emerald-50/95 dark:bg-emerald-950/90 border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-200";
        iconClass = "fa-solid fa-circle-check text-emerald-600 dark:text-emerald-400";
    } else if (tipo === "error") {
        colorClasses = "bg-rose-50/95 dark:bg-rose-950/90 border-rose-300 dark:border-rose-500/40 text-rose-800 dark:text-rose-200";
        iconClass = "fa-solid fa-triangle-exclamation text-rose-600 dark:text-rose-400";
    } else if (tipo === "warning") {
        colorClasses = "bg-amber-50/95 dark:bg-amber-950/90 border-amber-300 dark:border-amber-500/40 text-amber-800 dark:text-amber-200";
        iconClass = "fa-solid fa-circle-exclamation text-amber-600 dark:text-amber-400";
    }

    toast.className = `flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-2xl backdrop-blur-md text-xs font-semibold pointer-events-auto transition-all duration-300 transform translate-y-2 opacity-0 ${colorClasses}`;
    toast.innerHTML = `
        <i class="${iconClass} text-sm"></i>
        <span class="flex-1">${escaparHTML(mensaje)}</span>
    `;

    toastContainer.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.remove("translate-y-2", "opacity-0");
    });

    setTimeout(() => {
        toast.classList.add("translate-y-2", "opacity-0");
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

function escaparHTML(texto) {
    if (!texto) return "";
    return texto
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
