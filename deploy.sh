#!/bin/bash

# CPQ System Deployment Script
# Usage: ./deploy.sh [production|development]

set -e

ENVIRONMENT=${1:-development}
PROJECT_NAME="cpq-system"

echo "🚀 Deploying CPQ System in $ENVIRONMENT mode..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp env.example .env
    echo "📝 Please edit .env file with your configuration before running again."
    echo "   Required variables: TG_BOT_TOKEN, TG_MANAGER_CHAT_ID"
    exit 1
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p backend/pdf
mkdir -p logs

# Set environment-specific configurations
if [ "$ENVIRONMENT" = "production" ]; then
    echo "🏭 Production mode: Building optimized images..."
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache
    docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
else
    echo "🔧 Development mode: Building with cache..."
    docker-compose build
    docker-compose up -d
fi

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
echo "🔍 Checking service health..."
if curl -f http://localhost/health > /dev/null 2>&1; then
    echo "✅ Frontend is running at http://localhost"
else
    echo "❌ Frontend health check failed"
fi

if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Backend API is running at http://localhost:8000"
else
    echo "❌ Backend API health check failed"
fi

echo "🎉 Deployment completed!"
echo ""
echo "📋 Service URLs:"
echo "   Frontend: http://localhost"
echo "   Backend API: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "📊 To view logs:"
echo "   docker-compose logs -f"
echo ""
echo "🛑 To stop services:"
echo "   docker-compose down"
