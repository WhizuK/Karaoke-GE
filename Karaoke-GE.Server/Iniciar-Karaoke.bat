@echo off
title Karaoke GE
rem Arranca o servidor do karaoke e abre o ecra numa janela maximizada.
rem Para fechar: fechar a janela do ecra e a janela preta do servidor.

cd /d "%~dp0"

echo A arrancar o servidor do karaoke...
start "Servidor Karaoke GE" /min "Karaoke-GE.Server.exe"

rem Espera ate o servidor responder em /api/health (no maximo 30 segundos).
set /a tentativas=0
:esperar
powershell -NoProfile -Command "try { Invoke-WebRequest 'http://localhost:5240/api/health' -UseBasicParsing -TimeoutSec 2 | Out-Null; exit 0 } catch { exit 1 }"
if not errorlevel 1 goto pronto
set /a tentativas+=1
if %tentativas% geq 30 goto falhou
timeout /t 1 /nobreak >nul
goto esperar

:pronto
echo Servidor pronto. A abrir o ecra do karaoke...
rem --app abre uma janela normal (minimizar, maximizar, fechar) sem barra de endereco.
start "" msedge --app="http://localhost:5240/ecra" --start-maximized --no-first-run
exit /b 0

:falhou
echo.
echo O servidor nao arrancou. Veja a janela "Servidor Karaoke GE" para saber porque.
pause
exit /b 1
