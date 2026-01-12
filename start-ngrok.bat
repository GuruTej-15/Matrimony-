@echo off
echo ========================================
echo   Jai Mala - ngrok Setup
echo ========================================
echo.

REM Check if ngrok is installed
where ngrok >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: ngrok not found!
    echo.
    echo Please:
    echo 1. Download ngrok from: https://ngrok.com/download
    echo 2. Extract ngrok.exe
    echo 3. Add ngrok.exe to PATH or place in C:\Windows\System32\
    echo.
    pause
    exit /b 1
)

echo Step 1: Starting Backend Server...
echo.
start "Backend Server" cmd /k "cd /d %~dp0server && npm run dev"
timeout /t 5 /nobreak >nul

echo Step 2: Exposing Backend with ngrok...
echo.
start "ngrok Backend" cmd /k "ngrok http 4000"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo IMPORTANT: Copy the ngrok URL!
echo ========================================
echo.
echo Look at the "ngrok Backend" window
echo Copy the URL that looks like:
echo   https://abc123.ngrok-free.app
echo.
echo Press any key after you've copied the URL...
pause >nul

echo.
set /p NGROK_URL="Paste the ngrok backend URL here: "

echo.
echo Step 3: Updating frontend configuration...
echo.

REM Update .env file
(
echo VITE_API_BASE=%NGROK_URL%
echo.
echo # Firebase Web Config
echo VITE_FIREBASE_API_KEY=AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXX
echo VITE_FIREBASE_AUTH_DOMAIN=jaimala-9e985.firebaseapp.com
echo VITE_FIREBASE_PROJECT_ID=jaimala-9e985
echo VITE_FIREBASE_STORAGE_BUCKET=jaimala-9e985.firebasestorage.app
echo VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
echo VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
) > client\.env

echo Step 4: Starting Frontend Server...
echo.
start "Frontend Server" cmd /k "cd /d %~dp0client && npm run dev"
timeout /t 5 /nobreak >nul

echo Step 5: Exposing Frontend with ngrok...
echo.
start "ngrok Frontend" cmd /k "ngrok http 5173"
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo SUCCESS! Your website is now public!
echo ========================================
echo.
echo Look at the "ngrok Frontend" window
echo Your PUBLIC URL is something like:
echo   https://xyz789.ngrok-free.app
echo.
echo Share this URL with anyone to test!
echo.
echo Test Login:
echo   Phone: +919876543210
echo   OTP: 123456
echo.
echo Keep all windows open!
echo Press any key to exit this window (servers will keep running)...
pause >nul
