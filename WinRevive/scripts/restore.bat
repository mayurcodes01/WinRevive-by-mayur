@echo off
setlocal enabledelayedexpansion
title WinRevive - Create Restore Point

echo Checking System Restore status...
sc query vss >nul 2>&1
if errorlevel 1 (
    echo System Restore service not available.
    exit /b 1
)
echo Creating restore point: WinRevive_Backup
powershell -ExecutionPolicy Bypass -Command "Checkpoint-Computer -Description 'WinRevive Auto Restore Point' -RestorePointType MODIFY_SETTINGS" 2>nul
echo Restore point created successfully.
endlocal
