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

// Configuración de endpoints (soporta ejecución directa o vía puerto 8080)
const API_BASE_URL = window.location.origin.includes("localhost") || window.location.origin.includes("127.0.0.1")
    ? `${window.location.origin}/api/tareas`
    : "http://localhost:8080/api/tareas";

// Estado en memoria de la aplicación
let tareas = [];
let filtroEstado = "TODOS";
let textoBusqueda = "";
let ordenSeleccionado = "recientes";
let tareaEnDetalle = null;

// =============================================================================
// REFERENCIAS A ELEMENTOS DEL DOM
// =============================================================================
// Selector de tema (Claro / Oscuro)
const btnThemeToggle = document.getElementById("btn-theme-toggle");
const themeToggleIcon = document.getElementById("theme-toggle-icon");
const themeToggleText = document.getElementById("theme-toggle-text");

// KPIs del Dashboard
const kpiTotal = document.getElementById("kpi-total");
const kpiPendientes = document.getElementById("kpi-pendientes");
const kpiPendientesPct = document.getElementById("kpi-pendientes-pct");
const kpiProceso = document.getElementById("kpi-proceso");
const kpiProcesoPct = document.getElementById("kpi-proceso-pct");
const kpiCompletadas = document.getElementById("kpi-completadas");
const kpiCompletadasPct = document.getElementById("kpi-completadas-pct");
const metricCards = document.querySelectorAll(".metric-card");

// Búsqueda, orden y filtros
const inputBusqueda = document.getElementById("input-busqueda");
const btnLimpiarBusqueda = document.getElementById("btn-limpiar-busqueda");
const btnsFiltro = document.querySelectorAll(".btn-filtro");
const selectOrden = document.getElementById("select-orden");
const gridTareas = document.getElementById("grid-tareas");
const loadingSpinner = document.getElementById("loading-spinner");
const estadoVacio = document.getElementById("estado-vacio");
const vacioTitulo = document.getElementById("vacio-titulo");
const vacioSubtitulo = document.getElementById("vacio-subtitulo");
const btnVacioCrear = document.getElementById("btn-vacio-crear");
const textoConteoResultados = document.getElementById("texto-conteo-resultados");
const btnRecargar = document.getElementById("btn-recargar");

// Badges de conteo
const badgeTotal = document.getElementById("badge-total");
const badgePendientes = document.getElementById("badge-pendientes");
const badgeProceso = document.getElementById("badge-proceso");
const badgeCompletadas = document.getElementById("badge-completadas");

// Estado del backend
const backendStatusBadge = document.getElementById("backend-status-badge");
const backendStatusText = document.getElementById("backend-status-text");

// Modal Detalle
const modalDetalle = document.getElementById("modal-detalle");
const backdropDetalle = document.getElementById("backdrop-detalle");
const btnCerrarDetalle = document.getElementById("btn-cerrar-detalle");
const detalleIdBadge = document.getElementById("detalle-id-badge");
const detalleEstadoBadge = document.getElementById("detalle-estado-badge");
const detalleTitulo = document.getElementById("detalle-titulo");
const detalleDescripcion = document.getElementById("detalle-descripcion");
const detalleEstadoTexto = document.getElementById("detalle-estado-texto");
const btnDetalleEditar = document.getElementById("btn-detalle-editar");
const btnDetalleEliminar = document.getElementById("btn-detalle-eliminar");
const btnCopiarDescripcion = document.getElementById("btn-copiar-descripcion");

// Modal Formulario (Crear / Editar)
const modalForm = document.getElementById("modal-form");
const backdropForm = document.getElementById("backdrop-form");
const btnNuevaTarea = document.getElementById("btn-nueva-tarea");
const btnCerrarForm = document.getElementById("btn-cerrar-form");
const btnCancelarForm = document.getElementById("btn-cancelar-form");
const formTarea = document.getElementById("tarea-form");
const modalFormTitulo = document.getElementById("modal-form-titulo");
const btnSubmitTexto = document.getElementById("btn-submit-texto");
const inputTareaId = document.getElementById("tarea-id");
const inputTitulo = document.getElementById("titulo");
const inputDescripcion = document.getElementById("descripcion");
const selectEstado = document.getElementById("estado");
const charTitulo = document.getElementById("char-titulo");
const charDescripcion = document.getElementById("char-descripcion");

// Contenedor de Toasts
const toastContainer = document.getElementById("toast-container");

// =============================================================================
// INICIALIZACIÓN Y EVENT LISTENERS
// =============================================================================
document.addEventListener("DOMContentLoaded", () => {
    inicializarTema();
    cargarTareas();
    configurarEventos();
});

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
    inputBusqueda.addEventListener("input", (e) => {
        textoBusqueda = e.target.value.trim().toLowerCase();
        
        // Mostrar / ocultar botón de limpiar
        if (textoBusqueda.length > 0) {
            btnLimpiarBusqueda.classList.remove("hidden");
        } else {
            btnLimpiarBusqueda.classList.add("hidden");
        }

        aplicarFiltrosYRenderizar();
    });

    // Limpiar búsqueda
    btnLimpiarBusqueda.addEventListener("click", () => {
        inputBusqueda.value = "";
        textoBusqueda = "";
        btnLimpiarBusqueda.classList.add("hidden");
        inputBusqueda.focus();
        aplicarFiltrosYRenderizar();
    });

    // 2. Filtros por botones de estado (Flexbox)
    btnsFiltro.forEach((btn) => {
        btn.addEventListener("click", () => {
            seleccionarFiltro(btn.dataset.filtro);
        });
    });

    // Filtros por tarjetas de métricas (KPIs)
    metricCards.forEach((card) => {
        card.addEventListener("click", () => {
            const filtro = card.dataset.filtro;
            seleccionarFiltro(filtro);
        });
    });

    // Ordenamiento dinámico
    if (selectOrden) {
        selectOrden.addEventListener("change", (e) => {
            ordenSeleccionado = e.target.value;
            aplicarFiltrosYRenderizar();
        });
    }

    // Recargar lista
    btnRecargar.addEventListener("click", () => {
        cargarTareas();
        mostrarToast("Actualizando lista de tareas...", "info");
    });

    // Contador de caracteres para campos de formulario
    inputTitulo.addEventListener("input", () => {
        charTitulo.textContent = `${inputTitulo.value.length}/150`;
    });

    inputDescripcion.addEventListener("input", () => {
        charDescripcion.textContent = `${inputDescripcion.value.length}/500`;
    });

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

    // Atajos de teclado útiles
    document.addEventListener("keydown", (e) => {
        // Presionar '/' para enfocar búsqueda
        if (e.key === "/" && document.activeElement !== inputBusqueda && document.activeElement !== inputTitulo && document.activeElement !== inputDescripcion) {
            e.preventDefault();
            inputBusqueda.focus();
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
    btnNuevaTarea.addEventListener("click", () => abrirFormularioCrear());
    btnVacioCrear.addEventListener("click", () => abrirFormularioCrear());

    // Cerrar modales
    btnCerrarForm.addEventListener("click", cerrarModalForm);
    btnCancelarForm.addEventListener("click", cerrarModalForm);
    backdropForm.addEventListener("click", cerrarModalForm);

    btnCerrarDetalle.addEventListener("click", cerrarModalDetalle);
    backdropDetalle.addEventListener("click", cerrarModalDetalle);

    // Envío del formulario (Crear o Actualizar)
    formTarea.addEventListener("submit", procesarFormulario);

    // Acciones desde el modal de detalle
    btnDetalleEditar.addEventListener("click", () => {
        if (tareaEnDetalle) {
            const tareaAEditar = { ...tareaEnDetalle };
            cerrarModalDetalle();
            abrirFormularioEditar(tareaAEditar);
        }
    });

    btnDetalleEliminar.addEventListener("click", () => {
        if (tareaEnDetalle) {
            const idAEliminar = tareaEnDetalle.id;
            cerrarModalDetalle();
            confirmarYEliminar(idAEliminar);
        }
    });
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

// =============================================================================
// LÓGICA DE FILTRADO INSTANTÁNEO Y RENDERIZADO DE CARDS (GRID & FLEXBOX)
// =============================================================================

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
    textoConteoResultados.innerHTML = `Mostrando <strong class="text-slate-900 dark:text-white font-bold">${filtradas.length}</strong> de <strong class="text-slate-900 dark:text-white font-bold">${tareas.length}</strong> tareas registradas`;

    // 4. Renderizar o mostrar estado vacío
    if (filtradas.length === 0) {
        gridTareas.classList.add("hidden");
        gridTareas.innerHTML = "";
        estadoVacio.classList.remove("hidden");

        if (textoBusqueda || filtroEstado !== "TODOS") {
            vacioTitulo.textContent = "No se encontraron coincidencias";
            vacioSubtitulo.textContent = `No hay tareas que coincidan con la búsqueda "${textoBusqueda || filtroEstado}".`;
        } else {
            vacioTitulo.textContent = "No hay tareas registradas";
            vacioSubtitulo.textContent = "Comienza creando tu primera tarea conectada a PostgreSQL.";
        }
    } else {
        estadoVacio.classList.add("hidden");
        gridTareas.classList.remove("hidden");
        renderizarCards(filtradas);
    }
}

/**
 * Renderiza el Grid de Tarjetas con diseño adaptable (Claro / Oscuro + Flexbox)
 */
function renderizarCards(lista) {
    gridTareas.innerHTML = "";

    lista.forEach(tarea => {
        const card = document.createElement("article");
        card.className = "task-card animate-card-in group cursor-pointer";
        card.setAttribute("data-id", tarea.id);
        card.setAttribute("data-estado", tarea.estado);

        const configEstado = obtenerConfiguracionEstado(tarea.estado);

        card.innerHTML = `
            <!-- Encabezado de la Tarjeta (Flexbox) -->
            <div>
                <div class="task-card-header">
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${configEstado.badgeClass}">
                        <i class="${configEstado.icon} text-[10px]"></i>
                        <span>${configEstado.texto}</span>
                    </span>
                    <span class="text-xs font-mono font-bold text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        #${tarea.id}
                    </span>
                </div>

                <!-- Título -->
                <h3 class="task-card-title text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors line-clamp-2 mt-2 leading-snug">
                    ${escaparHTML(tarea.titulo)}
                </h3>

                <!-- Descripción previa -->
                <p class="text-xs text-slate-600 dark:text-slate-400 mt-2.5 line-clamp-3 leading-relaxed">
                    ${tarea.descripcion ? escaparHTML(tarea.descripcion) : '<span class="italic text-slate-400 dark:text-slate-500">Sin descripción</span>'}
                </p>
            </div>

            <!-- Pie de Tarjeta y Botones de Acción (Flexbox) -->
            <div class="task-card-footer">
                <!-- Botón: Ver Detalle (flecha al documento como en la pizarra) -->
                <button 
                    type="button" 
                    class="btn-ver-detalle inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                    title="Ver detalles completos"
                >
                    <i class="fa-regular fa-file-lines"></i>
                    <span>Ver Detalle</span>
                    <i class="fa-solid fa-arrow-right text-[10px] transform group-hover:translate-x-1 transition-transform"></i>
                </button>

                <!-- Acciones secundarias: Editar / Eliminar -->
                <div class="flex items-center gap-1" onclick="event.stopPropagation();">
                    <button 
                        type="button" 
                        class="btn-editar p-2 text-slate-400 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-xl transition-all text-xs" 
                        title="Editar tarea"
                    >
                        <i class="fa-regular fa-pen-to-square"></i>
                    </button>
                    <button 
                        type="button" 
                        class="btn-eliminar p-2 text-slate-400 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all text-xs" 
                        title="Eliminar tarea"
                    >
                        <i class="fa-regular fa-trash-can"></i>
                    </button>
                </div>
            </div>
        `;

        // Al hacer click en la tarjeta, abre el modal de detalle
        card.addEventListener("click", () => {
            abrirModalDetalle(tarea);
        });

        // Botón Editar
        const btnEdit = card.querySelector(".btn-editar");
        btnEdit.addEventListener("click", (e) => {
            e.stopPropagation();
            abrirFormularioEditar(tarea);
        });

        // Botón Eliminar
        const btnDel = card.querySelector(".btn-eliminar");
        btnDel.addEventListener("click", (e) => {
            e.stopPropagation();
            confirmarYEliminar(tarea.id);
        });

        gridTareas.appendChild(card);
    });
}

// =============================================================================
// MODALES (DETALLE & FORMULARIO)
// =============================================================================

/**
 * Abre la vista de detalle de una tarea (como el icono de documento en la pizarra)
 */
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

/**
 * Abre el formulario para registrar una nueva tarea
 */
function abrirFormularioCrear() {
    formTarea.reset();
    inputTareaId.value = "";
    charTitulo.textContent = "0/150";
    charDescripcion.textContent = "0/500";
    modalFormTitulo.textContent = "Nueva Tarea";
    btnSubmitTexto.textContent = "Guardar Tarea";
    selectEstado.value = "PENDIENTE";

    modalForm.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");
    setTimeout(() => inputTitulo.focus(), 50);
}

/**
 * Abre el formulario para editar una tarea existente
 */
function abrirFormularioEditar(tarea) {
    inputTareaId.value = tarea.id;
    inputTitulo.value = tarea.titulo || "";
    inputDescripcion.value = tarea.descripcion || "";
    selectEstado.value = tarea.estado || "PENDIENTE";

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
    badgeTotal.textContent = `(${total})`;
    badgePendientes.textContent = `(${pendientes})`;
    badgeProceso.textContent = `(${proceso})`;
    badgeCompletadas.textContent = `(${completadas})`;

    // KPIs Dashboard
    kpiTotal.textContent = total;
    kpiPendientes.textContent = pendientes;
    kpiProceso.textContent = proceso;
    kpiCompletadas.textContent = completadas;

    if (total > 0) {
        kpiPendientesPct.textContent = `${Math.round((pendientes / total) * 100)}%`;
        kpiProcesoPct.textContent = `${Math.round((proceso / total) * 100)}%`;
        kpiCompletadasPct.textContent = `${Math.round((completadas / total) * 100)}%`;
    } else {
        kpiPendientesPct.textContent = "0%";
        kpiProcesoPct.textContent = "0%";
        kpiCompletadasPct.textContent = "0%";
    }
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
