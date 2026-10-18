package com.proyecto.crudtareas.service;

import com.proyecto.crudtareas.model.Tarea;
import com.proyecto.crudtareas.repository.TareaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Servicio de Tareas: Contiene la lógica de negocio y coordina
 * las llamadas al repositorio.
 */
@Service
public class TareaService {

    private final TareaRepository tareaRepository;

    @Autowired
    public TareaService(TareaRepository tareaRepository) {
        this.tareaRepository = tareaRepository;
    }

    // Listar todas las tareas (Read - GET all)
    public List<Tarea> listarTodas() {
        return tareaRepository.findAll();
    }

    // Obtener una tarea por su ID (Read - GET by ID)
    public Optional<Tarea> obtenerPorId(Long id) {
        return tareaRepository.findById(id);
    }

    // Guardar una nueva tarea (Create - POST)
    public Tarea guardar(Tarea tarea) {
        return tareaRepository.save(tarea);
    }

    // Actualizar una tarea existente (Update - PUT)
    public Optional<Tarea> actualizar(Long id, Tarea tareaActualizada) {
        return tareaRepository.findById(id).map(tareaExistente -> {
            tareaExistente.setTitulo(tareaActualizada.getTitulo());
            tareaExistente.setDescripcion(tareaActualizada.getDescripcion());
            tareaExistente.setEstado(tareaActualizada.getEstado());
            return tareaRepository.save(tareaExistente);
        });
    }

    // Eliminar una tarea por su ID (Delete - DELETE)
    public boolean eliminar(Long id) {
        if (tareaRepository.existsById(id)) {
            tareaRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
