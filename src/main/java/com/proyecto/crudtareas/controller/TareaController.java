package com.proyecto.crudtareas.controller;

import com.proyecto.crudtareas.model.Tarea;
import com.proyecto.crudtareas.service.TareaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST: Expone los endpoints HTTP para realizar las operaciones CRUD.
 * Permite la integración con cualquier cliente web o IA mediante JSON.
 */
@RestController
@RequestMapping("/api/tareas")
@CrossOrigin(origins = "*") // Permite peticiones desde cualquier origen (evita problemas de CORS)
public class TareaController {

    private final TareaService tareaService;

    @Autowired
    public TareaController(TareaService tareaService) {
        this.tareaService = tareaService;
    }

    /**
     * 1. GET /api/tareas
     * Retorna la lista completa de tareas.
     */
    @GetMapping
    public ResponseEntity<List<Tarea>> listarTodas() {
        List<Tarea> tareas = tareaService.listarTodas();
        return ResponseEntity.ok(tareas);
    }

    /**
     * 2. GET /api/tareas/{id}
     * Retorna una tarea específica por su ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Tarea> obtenerPorId(@PathVariable Long id) {
        return tareaService.obtenerPorId(id)
                .map(tarea -> ResponseEntity.ok(tarea))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 3. POST /api/tareas
     * Crea y guarda una nueva tarea recibida en formato JSON en el cuerpo de la petición.
     */
    @PostMapping
    public ResponseEntity<Tarea> crearTarea(@RequestBody Tarea tarea) {
        Tarea nuevaTarea = tareaService.guardar(tarea);
        return new ResponseEntity<>(nuevaTarea, HttpStatus.CREATED);
    }

    /**
     * 4. PUT /api/tareas/{id}
     * Actualiza los datos de una tarea existente.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Tarea> actualizarTarea(@PathVariable Long id, @RequestBody Tarea tarea) {
        return tareaService.actualizar(id, tarea)
                .map(tareaActualizada -> ResponseEntity.ok(tareaActualizada))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 5. DELETE /api/tareas/{id}
     * Elimina una tarea por su ID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarTarea(@PathVariable Long id) {
        boolean eliminada = tareaService.eliminar(id);
        if (eliminada) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
