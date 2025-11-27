@echo off
REM Windows production starter script
echo Starting Connecting Hearts Backend in Production Mode (Windows)...

REM Check if .env.prod exists
if exist ".env.prod" (
    echo Loading environment from .env.prod
    set NODE_ENV=production
    npx env-cmd -f .env.prod pm2 start pm2.js
) else (
    echo Warning: .env.prod not found, using default environment
    set NODE_ENV=production
    pm2 start pm2.js
)

echo Backend started with PM2. Use 'pm2 logs connecting-hearts-backend' to view logs.
echo Use 'pm2 list' to see running processes.
pause
