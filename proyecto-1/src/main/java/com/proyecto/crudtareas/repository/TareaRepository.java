package com.proyecto.crudtareas.repository;

import com.proyecto.crudtareas.model.Tarea;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Task Repository: Provides ready-to-use CRUD methods
 * (findAll, findById, save, deleteById, etc.) powered by Spring Data JPA.
 */
@Repository
public interface TareaRepository extends JpaRepository<Tarea, Long> {
}
