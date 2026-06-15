@echo off
echo ========================================
echo  SERVIDOR WEB - SISTEMA EVALUACION BPM
echo ========================================
echo.
echo Iniciando servidor en http://localhost:8000
echo.
echo Presiona Ctrl+C para detener el servidor
echo.
echo ========================================
echo.

python -m http.server 8000

pause
