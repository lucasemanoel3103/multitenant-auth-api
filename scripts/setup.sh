#!/usr/bin/env bash
set -e

echo "🚀 Iniciando setup do boilerplate NestJS + Prisma + PostgreSQL"

# 1. Cria o .env se ainda não existir
if [ ! -f .env ]; then
  cp .env.example .env
  echo "📄 .env criado a partir de .env.example — edite as credenciais se quiser."
else
  echo "📄 .env já existe, mantendo como está."
fi

# 2. Instala dependências
echo "📦 Instalando dependências..."
npm install

# 3. Sobe o Postgres via Docker
echo "🐳 Subindo container do PostgreSQL..."
docker compose up -d

# 4. Espera o banco ficar pronto
echo "⏳ Aguardando o banco aceitar conexões..."
until docker compose exec -T postgres pg_isready -U "$(grep POSTGRES_USER .env | cut -d '=' -f2)" > /dev/null 2>&1; do
  sleep 1
done

# 5. Gera o client do Prisma e roda as migrations
echo "🔧 Gerando Prisma client..."
npx prisma generate

echo "🗄️  Rodando migrations..."
npx prisma migrate dev --name init

echo "✅ Tudo pronto! Rode 'npm run start:dev' para subir a API."
