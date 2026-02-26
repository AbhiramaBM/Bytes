@echo off
:: Pre-deployment Setup Script for Windows

echo 🚀 RuralCare Connect - Deployment Setup
echo ========================================

:: Step 1: Install dependencies
echo 📦 Installing dependencies...
call npm run install-all

:: Step 2: Build frontend
echo 🏗️  Building frontend...
cd client
call npm run build
cd ..

:: Step 3: Verify setup
echo ✅ Setup complete!
echo.
echo Next steps:
echo 1. Push to GitHub: git push origin main
echo 2. Go to Render: https://render.com
echo 3. Connect GitHub repo and deploy backend
echo 4. Go to Vercel: https://vercel.com
echo 5. Connect GitHub repo and deploy frontend
echo.
echo 📖 Full guide: See DEPLOYMENT.md
echo.
pause
