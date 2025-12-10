#!/bin/bash

# Script de setup para Calculadora de Economia de Energia
# Este script instala todas as dependências e prepara o ambiente de desenvolvimento

set -e

echo "🌱 Calculadora de Economia de Energia - Setup"
echo "============================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js não encontrado. Por favor, instale o Node.js primeiro.${NC}"
    echo "   Baixe em: https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v) encontrado${NC}"

# Verificar se npm está instalado
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm não encontrado.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm $(npm -v) encontrado${NC}"
echo ""

# Instalar dependências do backend
echo -e "${BLUE}📦 Instalando dependências do backend...${NC}"
cd backend
npm install
echo -e "${GREEN}✅ Dependências do backend instaladas${NC}"
echo ""

# Criar arquivo .env se não existir
if [ ! -f .env ]; then
    echo -e "${BLUE}📝 Criando arquivo .env...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✅ Arquivo .env criado${NC}"
else
    echo -e "${GREEN}✅ Arquivo .env já existe${NC}"
fi
echo ""

# Inicializar banco de dados
echo -e "${BLUE}🗄️  Inicializando banco de dados...${NC}"
npm run init-db
echo -e "${GREEN}✅ Banco de dados inicializado${NC}"
echo ""

# Voltar para o diretório raiz
cd ..

# Instalar dependências do frontend
echo -e "${BLUE}📦 Instalando dependências do frontend...${NC}"
cd frontend
npm install
echo -e "${GREEN}✅ Dependências do frontend instaladas${NC}"
echo ""

# Voltar para o diretório raiz
cd ..

echo ""
echo -e "${GREEN}🎉 Setup concluído com sucesso!${NC}"
echo ""
echo "Para iniciar o desenvolvimento:"
echo ""
echo "  Backend (em um terminal):"
echo -e "    ${BLUE}cd backend && npm run dev${NC}"
echo ""
echo "  Frontend (em outro terminal):"
echo -e "    ${BLUE}cd frontend && npm start${NC}"
echo ""
echo "URLs:"
echo "  - Frontend: http://localhost:4200"
echo "  - Backend:  http://localhost:3000"
echo "  - API:      http://localhost:3000/api/tarifas"
echo ""
echo "📚 Documentação:"
echo "  - README.md       - Visão geral do projeto"
echo "  - DEPLOY.md       - Guia completo de deploy"
echo "  - CHECKLIST.md    - Checklist para deploy"
echo ""
