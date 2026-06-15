@echo off
echo ========================================
echo   DESPLEGAR A AZURE STATIC WEB APP
echo ========================================
echo.

REM Verificar que Azure CLI este instalado
where az >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Azure CLI no esta instalado
    echo.
    echo Instalar desde: https://aka.ms/installazurecliwindows
    echo.
    pause
    exit /b 1
)

REM Verificar que Static Web Apps CLI este instalado
where swa >nul 2>nul
if %errorlevel% neq 0 (
    echo Azure Static Web Apps CLI no encontrado. Instalando...
    npm install -g @azure/static-web-apps-cli
    if %errorlevel% neq 0 (
        echo.
        echo ERROR: No se pudo instalar SWA CLI
        echo Instalar Node.js desde: https://nodejs.org/
        echo.
        pause
        exit /b 1
    )
)

echo.
echo [1/4] Verificando sesion de Azure...
az account show >nul 2>nul
if %errorlevel% neq 0 (
    echo No hay sesion activa. Iniciando login...
    az login
    if %errorlevel% neq 0 (
        echo ERROR: No se pudo iniciar sesion en Azure
        pause
        exit /b 1
    )
)

echo ✓ Sesion activa en Azure
echo.

echo [2/4] Preparando archivos para despliegue...
REM Crear directorio temporal si no existe
if not exist ".deploy" mkdir .deploy

REM Copiar archivos necesarios (excluyendo .bat y archivos temporales)
xcopy /E /I /Y *.html .deploy\ >nul
xcopy /E /I /Y css .deploy\css\ >nul
xcopy /E /I /Y js .deploy\js\ >nul
copy /Y staticwebapp.config.json .deploy\ >nul

echo ✓ Archivos preparados
echo.

echo [3/4] Creando o actualizando Static Web App...
echo.
echo OPCIONES:
echo   1. Crear nueva Static Web App
echo   2. Desplegar a Static Web App existente
echo.
set /p opcion="Selecciona una opcion (1 o 2): "

if "%opcion%"=="1" goto crear
if "%opcion%"=="2" goto desplegar
echo Opcion invalida
pause
exit /b 1

:crear
echo.
set /p rg="Nombre del Resource Group (o Enter para crear 'rg-cardiacproy'): "
if "%rg%"=="" set rg=rg-cardiacproy

set /p nombre="Nombre de la Static Web App (o Enter para 'swa-cardiacproy'): "
if "%nombre%"=="" set nombre=swa-cardiacproy

set /p location="Location (o Enter para 'eastus'): "
if "%location%"=="" set location=eastus

echo.
echo Creando Resource Group (si no existe)...
az group create --name %rg% --location %location%

echo.
echo Creando Static Web App...
az staticwebapp create ^
    --name %nombre% ^
    --resource-group %rg% ^
    --location %location% ^
    --sku Free

if %errorlevel% neq 0 (
    echo ERROR: No se pudo crear la Static Web App
    pause
    exit /b 1
)

echo.
echo ✓ Static Web App creada
goto desplegar_archivos

:desplegar
echo.
set /p rg="Nombre del Resource Group: "
set /p nombre="Nombre de la Static Web App: "

:desplegar_archivos
echo.
echo [4/4] Obteniendo deployment token...

for /f "tokens=*" %%i in ('az staticwebapp secrets list --name %nombre% --resource-group %rg% --query "properties.apiKey" -o tsv') do set DEPLOYMENT_TOKEN=%%i

if "%DEPLOYMENT_TOKEN%"=="" (
    echo ERROR: No se pudo obtener el deployment token
    echo Verifica que el nombre y resource group sean correctos
    pause
    exit /b 1
)

echo ✓ Token obtenido
echo.
echo Desplegando archivos...

cd .deploy
swa deploy --deployment-token %DEPLOYMENT_TOKEN% --app-location . --no-use-keychain

if %errorlevel% neq 0 (
    echo.
    echo ERROR: Fallo el despliegue
    cd ..
    pause
    exit /b 1
)

cd ..

echo.
echo ========================================
echo   DESPLIEGUE COMPLETADO
echo ========================================
echo.
echo Tu sitio estara disponible en:
az staticwebapp show --name %nombre% --resource-group %rg% --query "defaultHostname" -o tsv
echo.
echo Limpiando archivos temporales...
rmdir /S /Q .deploy

echo.
echo ✓ Despliegue completado exitosamente
echo.
pause
