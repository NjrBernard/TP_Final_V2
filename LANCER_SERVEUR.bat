@echo off
title TC Poussan - Serveur
echo ===================================
echo   SERVEUR TC POUSSAN EN COURS...
echo ===================================
echo.
echo Le serveur demarre, patientez...
echo.
cd /d "%~dp0"
npm start
echo.
echo ATTENTION: Ne fermez pas cette fenetre ! 
echo L'application ne fonctionnera plus si vous fermez cette fenetre. 
echo.
pause