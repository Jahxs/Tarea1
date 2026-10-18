@echo off
title Servidor Spring Boot - CRUD Tareas (Proyecto 1)
echo ========================================================
echo   INICIANDO PROYECTO 1: SPRING BOOT 3 + POSTGRESQL
echo   Puerto: http://localhost:8080
echo   Endpoints: http://localhost:8080/api/tareas
echo ========================================================
echo.
cd /d "%~dp0proyecto-1"
call mvnw.cmd spring-boot:run
pause
