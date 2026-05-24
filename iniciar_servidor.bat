@echo off
title DPV PRO - Servidor Cientifico
color 0a
cls

echo ===================================================
echo             DPV PRO - MASTER TOOLS v0.4
echo ===================================================
echo  Iniciando el servidor de precision cientifica...
echo  La aplicacion se abrira en tu navegador.
echo ===================================================
echo.

:: Navegar al directorio del script
cd /d "%~dp0"

:: Verificar si node_modules existe, si no, instalar dependencias
if not exist "node_modules\" (
    echo [INFO] No se encontro la carpeta node_modules. Instalando dependencias...
    call npm install
)

:: Abrir navegador automaticamente
echo [INFO] Abriendo DPV PRO en tu navegador...
start http://localhost:5173/

:: Iniciar servidor de desarrollo de Vite
echo [INFO] Lanzando Vite Dev Server...
call npm run dev

pause
