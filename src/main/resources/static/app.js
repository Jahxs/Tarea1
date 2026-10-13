/**
 * =============================================================================
 * APP.JS - INTEGRACIÓN FRONTEND CON BACKEND (SPRING BOOT REST API)
 * =============================================================================
 * Este archivo gestiona la comunicación asíncrona entre la interfaz de usuario
 * y los endpoints REST mediante la API nativa `fetch()` y promesas con async/await.
 */

// 1. URL base de los endpoints expuestos por Spring Boot
const API_URL = "http://localhost:8080/api/tareas";

// 2. Referencias a los elementos del DOM (Document Object Model)
const form = document.getElementById("tarea-form");
const inputId = document.getElementById("tarea-id");
const inputTitulo = document.getElementById("titulo");
const inputDescripcion = document.getElementById("descripcion");
const selectEstado = document.getElementById("estado");

const formTitulo = document.getElementById("form-titulo");
const btnTexto = document.getElementById("btn-texto");
const btnCancelar = document.getElementById("btn-cancelar");
const btnRecargar = document.getElementById("btn-recargar");

const tablaBody = document.getElementById("tabla-tareas-body");
const contadorTareas = document.getElementById("contador-tareas");
const mensajeVacio = document.getElementById("mensaje-vacio");
const toast = document.getElementById("toast-notificacion");

// 3. Event Listeners (Escuchadores de eventos de usuario)
document.addEventListener("DOMContentLoaded", () => {
    // Al cargar la página en el navegador, consultamos la lista inicial de tareas
    cargarTareas();
});

// Al enviar el formulario (Crear o Actualizar)
form.addEventListener("submit", guardarTarea);

// Al hacer clic en Cancelar edición
btnCancelar.addEventListener("click", resetearFormulario);

// Al hacer clic en el botón de recargar
btnRecargar.addEventListener("click", cargarTareas);


/**
 * =============================================================================
 * OPERACIÓN READ (GET): Obtener y renderizar todas las tareas
 * =============================================================================
 * - Envía una petición HTTP GET a /api/tareas.
 * - Recibe una respuesta en JSON (array de tareas).
 * - Renderiza las filas dinámicamente en el <tbody> sin recargar la página.
 */
async function cargarTareas() {
    try {
        contadorTareas.textContent = "Consultando base de datos...";
        
        // Petición GET con fetch
        const respuesta = await fetch(API_URL);

        if (!respuesta.ok) {
            throw new Error(`Error en el servidor: Código HTTP ${respuesta.status}`);
        }

        // Convertimos la respuesta cruda a objeto JavaScript (JSON)
        const tareas = await respuesta.json();

        // Actualizamos la tabla en pantalla
        renderizarTabla(tareas);

    } catch (error) {
        console.error("Error al cargar tareas:", error);
        contadorTareas.textContent = "Error al conectar con el backend";
        mostrarToast("No se pudo conectar al servidor. Asegúrate de que Spring Boot esté iniciado en el puerto 8080.", "error");
    }
}

/**
 * Dibuja las filas <tr> dentro de la tabla en base a los datos recibidos
 */
function renderizarTabla(tareas) {
    tablaBody.innerHTML = ""; // Limpiar filas anteriores
    contadorTareas.textContent = `${tareas.length} ${tareas.length === 1 ? "tarea encontrada" : "tareas encontradas"}`;

    if (tareas.length === 0) {
        mensajeVacio.style.display = "block";
        return;
    }

    mensajeVacio.style.display = "none";

    // Recorremos cada objeto tarea devuelto por el backend
    tareas.forEach(tarea => {
        const tr = document.createElement("tr");

        // Configuración visual de la insignia de estado
        let badgeClass = "badge-pendiente";
        let estadoLabel = "⏳ Pendiente";

        if (tarea.estado === "EN_PROCESO") {
            badgeClass = "badge-en-proceso";
            estadoLabel = "🔄 En Proceso";
        } else if (tarea.estado === "COMPLETADA") {
            badgeClass = "badge-completada";
            estadoLabel = "✅ Completada";
        }

        tr.innerHTML = `
            <td><strong>#${tarea.id}</strong></td>
            <td class="cell-title">${escaparHTML(tarea.titulo)}</td>
            <td class="cell-desc">${tarea.descripcion ? escaparHTML(tarea.descripcion) : "<em>Sin descripción</em>"}</td>
            <td><span class="status-badge ${badgeClass}">${estadoLabel}</span></td>
            <td>
                <div class="table-actions">
                    <button class="btn-action btn-action-edit" onclick="iniciarEdicion(${tarea.id}, '${escaparJS(tarea.titulo)}', '${escaparJS(tarea.descripcion || '')}', '${tarea.estado}')" title="Editar tarea">
                        ✏️ Editar
                    </button>
                    <button class="btn-action btn-action-delete" onclick="eliminarTarea(${tarea.id})" title="Eliminar tarea">
                        🗑️ Borrar
                    </button>
                </div>
            </td>
        `;

        tablaBody.appendChild(tr);
    });
}


/**
 * =============================================================================
 * OPERACIÓN CREATE / UPDATE (POST / PUT): Guardar cambios del formulario
 * =============================================================================
 * - Si inputId está vacío -> Petición POST a /api/tareas (Crear nueva tarea).
 * - Si inputId tiene un valor -> Petición PUT a /api/tareas/{id} (Actualizar existente).
 */
async function guardarTarea(event) {
    event.preventDefault(); // Prevenir que el navegador recargue la página

    const id = inputId.value;
    const datosTarea = {
        titulo: inputTitulo.value.trim(),
        descripcion: inputDescripcion.value.trim(),
        estado: selectEstado.value
    };

    const esEdicion = Boolean(id);
    const url = esEdicion ? `${API_URL}/${id}` : API_URL;
    const metodo = esEdicion ? "PUT" : "POST";

    try {
        // Petición HTTP asíncrona enviando el cuerpo en formato JSON
        const respuesta = await fetch(url, {
            method: metodo,
            headers: {
                "Content-Type": "application/json" // Indicamos al backend que enviamos un JSON
            },
            body: JSON.stringify(datosTarea) // Convertimos el objeto JS a cadena JSON
        });

        if (!respuesta.ok) {
            throw new Error(`Error en la solicitud: ${respuesta.status}`);
        }

        const tareaGuardada = await respuesta.json();

        mostrarToast(
            esEdicion ? `Tarea #${tareaGuardada.id} actualizada con éxito.` : "Nueva tarea registrada correctamente.", 
            "success"
        );

        resetearFormulario();
        cargarTareas(); // Refrescar la tabla con los datos más recientes

    } catch (error) {
        console.error("Error al guardar tarea:", error);
        mostrarToast("Ocurrió un error al intentar guardar los datos en la base de datos.", "error");
    }
}


/**
 * =============================================================================
 * OPERACIÓN DELETE (DELETE): Eliminar una tarea por ID
 * =============================================================================
 * - Envía una petición HTTP DELETE a /api/tareas/{id}.
 * - Si responde 204 No Content, elimina el elemento y refresca la tabla.
 */
async function eliminarTarea(id) {
    const confirmar = confirm(`¿Estás seguro de que deseas eliminar la tarea #${id}?`);
    if (!confirmar) return;

    try {
        const respuesta = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        if (respuesta.status === 204 || respuesta.ok) {
            mostrarToast(`Tarea #${id} eliminada correctamente.`, "success");
            // Si estábamos editando la tarea que se borró, limpiamos el formulario
            if (inputId.value === String(id)) {
                resetearFormulario();
            }
            cargarTareas();
        } else {
            throw new Error(`No se pudo eliminar. Código: ${respuesta.status}`);
        }

    } catch (error) {
        console.error("Error al eliminar tarea:", error);
        mostrarToast("No fue posible eliminar la tarea seleccionada.", "error");
    }
}


/**
 * =============================================================================
 * MÉTODOS AUXILIARES: UI Y CONTROL DEL FORMULARIO
 * =============================================================================
 */

// Carga los datos de una tarea en los campos del formulario para editar
function iniciarEdicion(id, titulo, descripcion, estado) {
    inputId.value = id;
    inputTitulo.value = titulo;
    inputDescripcion.value = descripcion;
    selectEstado.value = estado;

    formTitulo.textContent = `Editar Tarea #${id}`;
    btnTexto.textContent = "Actualizar Cambios";
    btnCancelar.style.display = "inline-flex";

    // Llevar el foco suavemente al formulario
    inputTitulo.focus();
}

// Devuelve el formulario a su estado original (modo creación)
function resetearFormulario() {
    form.reset();
    inputId.value = "";
    formTitulo.textContent = "Nueva Tarea";
    btnTexto.textContent = "Guardar Tarea";
    btnCancelar.style.display = "none";
}

// Muestra mensajes temporales en la interfaz (Toast)
function mostrarToast(mensaje, tipo = "success") {
    toast.textContent = mensaje;
    toast.className = `toast ${tipo === "success" ? "toast-success" : "toast-error"}`;
    toast.style.display = "block";

    setTimeout(() => {
        toast.style.display = "none";
    }, 4000);
}

// Sanitización básica para evitar inyecciones XSS
function escaparHTML(texto) {
    if (!texto) return "";
    return texto
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function escaparJS(texto) {
    if (!texto) return "";
    return texto.replace(/'/g, "\\'").replace(/"/g, '\\"');
}
