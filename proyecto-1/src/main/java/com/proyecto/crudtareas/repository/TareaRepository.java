package com.proyecto.crudtareas.repository;

import com.proyecto.crudtareas.model.Tarea;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repositorio de Tareas: Proporciona métodos CRUD listos para usar
 * (findAll, findById, save, deleteById, etc.) gracias a Spring Data JPA.
 */
@Repository
public interface TareaRepository extends JpaRepository<Tarea, Long> {
}
