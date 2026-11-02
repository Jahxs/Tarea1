package com.proyecto.crudtareas.controller;

import com.proyecto.crudtareas.model.Tarea;
import com.proyecto.crudtareas.service.TareaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller: Exposes HTTP endpoints for CRUD operations.
 * Enables integration with any web client or AI via JSON.
 */
@RestController
@RequestMapping("/api/tareas")
@CrossOrigin(origins = "*") // Allows cross-origin requests from any source (prevents CORS issues)
public class TareaController {

    private final TareaService tareaService;

    @Autowired
    public TareaController(TareaService tareaService) {
        this.tareaService = tareaService;
    }

    /**
     * 1. GET /api/tareas
     * Returns the complete list of tasks.
     */
    @GetMapping
    public ResponseEntity<List<Tarea>> listarTodas() {
        List<Tarea> tareas = tareaService.listarTodas();
        return ResponseEntity.ok(tareas);
    }

    /**
     * 2. GET /api/tareas/{id}
     * Returns a specific task by its ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Tarea> obtenerPorId(@PathVariable Long id) {
        return tareaService.obtenerPorId(id)
                .map(tarea -> ResponseEntity.ok(tarea))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 3. POST /api/tareas
     * Creates and persists a new task received in JSON format within the request body.
     */
    @PostMapping
    public ResponseEntity<Tarea> crearTarea(@RequestBody Tarea tarea) {
        Tarea nuevaTarea = tareaService.guardar(tarea);
        return new ResponseEntity<>(nuevaTarea, HttpStatus.CREATED);
    }

    /**
     * 4. PUT /api/tareas/{id}
     * Updates an existing task with new data.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Tarea> actualizarTarea(@PathVariable Long id, @RequestBody Tarea tarea) {
        return tareaService.actualizar(id, tarea)
                .map(tareaActualizada -> ResponseEntity.ok(tareaActualizada))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 5. DELETE /api/tareas/{id}
     * Deletes a task by its ID.
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
