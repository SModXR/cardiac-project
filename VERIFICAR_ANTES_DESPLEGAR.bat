@echo off
echo ========================================
echo   VERIFICACION PRE-DESPLIEGUE
echo ========================================
echo.

set ERRORES=0

echo [1/6] Verificando archivos HTML principales...
if exist "index.html" (
    echo   ✓ index.html encontrado
) else (
    echo   ✗ index.html NO encontrado
    set /a ERRORES+=1
)

if exist "evaluacion.html" (
    echo   ✓ evaluacion.html encontrado
) else (
    echo   ✗ evaluacion.html NO encontrado
    set /a ERRORES+=1
)

if exist "admin.html" (
    echo   ✓ admin.html encontrado
) else (
    echo   ✗ admin.html NO encontrado
    set /a ERRORES+=1
)

echo.
echo [2/6] Verificando archivos CSS...
if exist "css\global.css" (
    echo   ✓ css\global.css encontrado
) else (
    echo   ✗ css\global.css NO encontrado
    set /a ERRORES+=1
)

if exist "css\style.css" (
    echo   ✓ css\style.css encontrado
) else (
    echo   ✗ css\style.css NO encontrado
    set /a ERRORES+=1
)

echo.
echo [3/6] Verificando archivos JavaScript...
if exist "js\evaluacion.js" (
    echo   ✓ js\evaluacion.js encontrado
) else (
    echo   ✗ js\evaluacion.js NO encontrado
    set /a ERRORES+=1
)

if exist "js\registro.js" (
    echo   ✓ js\registro.js encontrado
) else (
    echo   ✗ js\registro.js NO encontrado
    set /a ERRORES+=1
)

echo.
echo [4/6] Verificando archivo de configuracion...
if exist "staticwebapp.config.json" (
    echo   ✓ staticwebapp.config.json encontrado
) else (
    echo   ✗ staticwebapp.config.json NO encontrado
    set /a ERRORES+=1
)

echo.
echo [5/6] Verificando .gitignore...
if exist ".gitignore" (
    echo   ✓ .gitignore encontrado
) else (
    echo   ⚠ .gitignore NO encontrado (opcional)
)

echo.
echo [6/6] Verificando Azure CLI...
where az >nul 2>nul
if %errorlevel% equ 0 (
    echo   ✓ Azure CLI instalado
) else (
    echo   ⚠ Azure CLI NO instalado
    echo     Instalar desde: https://aka.ms/installazurecliwindows
)

echo.
echo ========================================
echo   RESULTADO DE LA VERIFICACION
echo ========================================
echo.

if %ERRORES% equ 0 (
    echo ✓ TODO LISTO PARA DESPLEGAR
    echo.
    echo Archivos criticos: OK
    echo Configuracion: OK
    echo.
    echo Puedes proceder con el despliegue usando:
    echo   - DESPLEGAR_AZURE_STATIC.bat
    echo   - O seguir la GUIA_DESPLEGAR_STATIC_WEB_APP.md
    echo.
) else (
    echo ✗ SE ENCONTRARON %ERRORES% ERRORES
    echo.
    echo Por favor corrige los errores antes de desplegar.
    echo.
)

pause
