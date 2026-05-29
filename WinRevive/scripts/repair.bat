@echo off
setlocal enabledelayedexpansion
title WinRevive - Windows Repair

echo Checking system file integrity...
echo Running DISM health scan...
DISM /Online /Cleanup-Image /CheckHealth
echo Running SFC scan...
sfc /scannow
echo Repair scan complete.
endlocal
