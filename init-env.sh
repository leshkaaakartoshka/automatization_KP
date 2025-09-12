#!/bin/bash

# CPQ System Environment Initialization Script
# This script helps set up the environment for Docker deployment

set -e

echo "🚀 CPQ System Environment Setup"
echo "================================"

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created. Please edit it with your actual values."
    echo "   nano .env"
else
    echo "✅ .env file already exists"
fi

# Check if credentials.json exists
if [ ! -f backend/credentials.json ]; then
    echo "⚠️  credentials.json not found in backend/"
    echo "   This file is required for Google Sheets integration"
    echo "   Please add your Google service account credentials"
fi

# Create PDF directory
echo "📁 Creating PDF directory..."
mkdir -p backend/pdf
chmod 755 backend/pdf

# Check Docker and Docker Compose
echo "🐳 Checking Docker installation..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are available"

# Check if ports are available
echo "🔍 Checking port availability..."
if lsof -Pi :80 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 80 is already in use. You may need to stop the service using it."
fi

if lsof -Pi :8000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 8000 is already in use. You may need to stop the service using it."
fi

if lsof -Pi :5432 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  Port 5432 is already in use. You may need to stop the service using it."
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your actual values:"
echo "   nano .env"
echo ""
echo "2. Start the system:"
echo "   docker-compose up -d"
echo ""
echo "3. Access the application:"
echo "   Frontend: http://localhost"
echo "   Backend API: http://localhost/api"
echo "   API Docs: http://localhost/api/docs"
echo ""
echo "For troubleshooting, check logs:"
echo "   docker-compose logs"
