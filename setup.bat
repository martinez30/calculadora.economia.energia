@echo off
REM Script de setup para Calculadora de Economia de Energia (Windows)
REM Este script instala todas as dependências e prepara o ambiente de desenvolvimento

echo.
echo 🌱 Calculadora de Economia de Energia - Setup
echo =============================================
echo.

REM Verificar se Node.js está instalado
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js não encontrado. Por favor, instale o Node.js primeiro.
    echo    Baixe em: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js encontrado
node -v

REM Verificar se npm está instalado
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm não encontrado.
    pause
    exit /b 1
)

echo ✅ npm encontrado
npm -v
echo.

REM Instalar dependências do backend
echo 📦 Instalando dependências do backend...
cd backend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Erro ao instalar dependências do backend
    pause
    exit /b 1
)
echo ✅ Dependências do backend instaladas
echo.

REM Criar arquivo .env se não existir
if not exist .env (
    echo 📝 Criando arquivo .env...
    copy .env.example .env >nul
    echo ✅ Arquivo .env criado
) else (
    echo ✅ Arquivo .env já existe
)
echo.

REM Inicializar banco de dados
echo 🗄️  Inicializando banco de dados...
call npm run init-db
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Erro ao inicializar banco de dados
    pause
    exit /b 1
)
echo ✅ Banco de dados inicializado
echo.

REM Voltar para o diretório raiz
cd ..

REM Instalar dependências do frontend
echo 📦 Instalando dependências do frontend...
cd frontend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Erro ao instalar dependências do frontend
    pause
    exit /b 1
)
echo ✅ Dependências do frontend instaladas
echo.

REM Voltar para o diretório raiz
cd ..

echo.
echo 🎉 Setup concluído com sucesso!
echo.
echo Para iniciar o desenvolvimento:
echo.
echo   Backend (em um terminal):
echo     cd backend ^&^& npm run dev
echo.
echo   Frontend (em outro terminal):
echo     cd frontend ^&^& npm start
echo.
echo URLs:
echo   - Frontend: http://localhost:4200
echo   - Backend:  http://localhost:3000
echo   - API:      http://localhost:3000/api/tarifas
echo.
echo 📚 Documentação:
echo   - README.md       - Visão geral do projeto
echo   - DEPLOY.md       - Guia completo de deploy
echo   - CHECKLIST.md    - Checklist para deploy
echo.
pause
