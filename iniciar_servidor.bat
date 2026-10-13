@echo off
title Servidor Spring Boot - CRUD Tareas
echo ========================================================
echo   INICIANDO SERVIDOR SPRING BOOT (CRUD TAREAS)
echo   Puerto: http://localhost:8080
echo   Endpoints: http://localhost:8080/api/tareas
echo ========================================================
echo.
call mvnw.cmd spring-boot:run
pause
