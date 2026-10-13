@echo off
title Subir proyecto a GitHub
echo ========================================================
echo   SUBIENDO PROYECTO A GITHUB: Jahxs/Proyecto-Crud
echo ========================================================
echo.
git push -u origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo ========================================================
    echo   EXITO: El proyecto ha sido subido a GitHub correctamente!
    echo ========================================================
) else (
    echo ========================================================
    echo   Si te pidio iniciar sesion, completa el inicio en el navegador y vuelve a ejecutar este archivo.
    echo ========================================================
)
pause
