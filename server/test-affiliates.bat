@echo off
echo Testing Affiliate System...
echo.

cd /d "%~dp0"
node test-affiliates.js

echo.
echo Test completed. Press any key to continue...
pause >nul