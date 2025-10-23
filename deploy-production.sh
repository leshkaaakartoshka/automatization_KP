#!/bin/bash

# ===========================================
# CPQ System - Production Deployment Script
# ===========================================

set -e

echo "🚀 Starting CPQ System production deployment..."

# Проверяем наличие Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Run: curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh"
    exit 1
fi

# Проверяем наличие Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "   Run: sudo apt install docker-compose-plugin -y"
    exit 1
fi

# Проверяем наличие .env файла
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from template..."
    if [ -f "env.production.example" ]; then
        cp env.production.example .env
        echo "📝 Created .env from template. Please edit it with your values:"
        echo "   nano .env"
        echo ""
        echo "   Required variables:"
        echo "   - TG_BOT_TOKEN (get from @BotFather)"
        echo "   - TG_MANAGER_CHAT_ID (get from @userinfobot)"
        echo "   - HASH_SALT (generate with: openssl rand -hex 32)"
        echo ""
        echo "   Then run this script again."
        exit 1
    else
        echo "❌ env.production.example not found. Cannot create .env file."
        exit 1
    fi
fi

# Создаем необходимые директории
echo "📁 Creating necessary directories..."
mkdir -p backend/pdf
mkdir -p logs

# Останавливаем существующие контейнеры
echo "🛑 Stopping existing containers..."
docker-compose down 2>/dev/null || true

# Собираем образы
echo "🔨 Building Docker images..."
docker-compose build --no-cache

# Запускаем сервисы
echo "🚀 Starting services..."
docker-compose up -d

# Ждем запуска сервисов
echo "⏳ Waiting for services to start..."
sleep 15

# Проверяем здоровье сервисов
echo "🔍 Checking service health..."

# Проверяем бэкенд
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Backend API is running at http://localhost:8000"
else
    echo "❌ Backend API health check failed"
    echo "   Check logs: docker-compose logs backend"
fi

# Проверяем фронтенд
if curl -f http://localhost/health > /dev/null 2>&1; then
    echo "✅ Frontend is running at http://localhost"
else
    echo "❌ Frontend health check failed"
    echo "   Check logs: docker-compose logs frontend"
fi

# Показываем статус контейнеров
echo ""
echo "📊 Container status:"
docker-compose ps

echo ""
echo "🎉 Deployment completed!"
echo ""
echo "📋 Service URLs:"
echo "   Frontend: http://193.32.179.66"
echo "   Backend API: http://193.32.179.66/api"
echo "   API Docs: http://193.32.179.66/api/docs"
echo "   Health Check: http://193.32.179.66/health"
echo ""
echo "📊 Useful commands:"
echo "   View logs: docker-compose logs -f"
echo "   Stop services: docker-compose down"
echo "   Restart: docker-compose restart"
echo "   Update: git pull && docker-compose up -d --build"
echo ""
echo "🧹 PDF cleanup:"
echo "   Manual: ./cleanup-pdfs.sh"
echo "   Auto (cron): 0 2 * * * $(pwd)/cleanup-pdfs.sh"
