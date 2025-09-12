#!/bin/bash

# CPQ System Deployment Readiness Check
# This script verifies that the system is ready for Docker deployment

set -e

echo "🔍 CPQ System Deployment Readiness Check"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
        return 1
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ docker-compose.yml not found. Please run this script from the project root.${NC}"
    exit 1
fi

echo "📁 Checking project structure..."

# Check Docker files
[ -f "Dockerfile.frontend" ] && print_status 0 "Dockerfile.frontend exists" || print_status 1 "Dockerfile.frontend missing"
[ -f "Dockerfile.backend" ] && print_status 0 "Dockerfile.backend exists" || print_status 1 "Dockerfile.backend missing"
[ -f "docker-compose.yml" ] && print_status 0 "docker-compose.yml exists" || print_status 1 "docker-compose.yml missing"
[ -f "nginx.conf" ] && print_status 0 "nginx.conf exists" || print_status 1 "nginx.conf missing"
[ -f "init.sql" ] && print_status 0 "init.sql exists" || print_status 1 "init.sql missing"

echo ""
echo "📦 Checking frontend..."

# Check frontend files
[ -f "cpq-frontend/package.json" ] && print_status 0 "Frontend package.json exists" || print_status 1 "Frontend package.json missing"
[ -f "cpq-frontend/vite.config.ts" ] && print_status 0 "Frontend vite.config.ts exists" || print_status 1 "Frontend vite.config.ts missing"
[ -f "cpq-frontend/src/api.ts" ] && print_status 0 "Frontend api.ts exists" || print_status 1 "Frontend api.ts missing"

echo ""
echo "🐍 Checking backend..."

# Check backend files
[ -f "backend/requirements.txt" ] && print_status 0 "Backend requirements.txt exists" || print_status 1 "Backend requirements.txt missing"
[ -f "backend/app/main.py" ] && print_status 0 "Backend main.py exists" || print_status 1 "Backend main.py missing"
[ -f "backend/run.py" ] && print_status 0 "Backend run.py exists" || print_status 1 "Backend run.py missing"

echo ""
echo "🔧 Checking configuration..."

# Check environment files
if [ -f ".env" ]; then
    print_status 0 ".env file exists"
    
    # Check critical environment variables
    if grep -q "TG_BOT_TOKEN=" .env && ! grep -q "TG_BOT_TOKEN=your_telegram_bot_token_here" .env; then
        print_status 0 "TG_BOT_TOKEN is configured"
    else
        print_warning "TG_BOT_TOKEN needs to be configured"
    fi
    
    if grep -q "HASH_SALT=" .env && ! grep -q "HASH_SALT=your_random_salt_here" .env; then
        print_status 0 "HASH_SALT is configured"
    else
        print_warning "HASH_SALT needs to be configured (security risk)"
    fi
else
    print_warning ".env file not found. Run ./init-env.sh to create it."
fi

# Check if credentials.json exists (optional)
if [ -f "backend/credentials.json" ]; then
    print_status 0 "Google credentials.json exists"
else
    print_warning "Google credentials.json not found (required for Sheets integration)"
fi

echo ""
echo "🐳 Checking Docker..."

# Check Docker installation
if command -v docker &> /dev/null; then
    print_status 0 "Docker is installed"
    docker --version
else
    print_status 1 "Docker is not installed"
fi

if command -v docker-compose &> /dev/null; then
    print_status 0 "Docker Compose is installed"
    docker-compose --version
else
    print_status 1 "Docker Compose is not installed"
fi

echo ""
echo "🌐 Checking port availability..."

# Check ports
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warning "Port $1 is already in use"
        return 1
    else
        print_status 0 "Port $1 is available"
        return 0
    fi
}

check_port 80
check_port 8000
check_port 5432

echo ""
echo "📋 Summary:"
echo "==========="

# Count issues
issues=0

# Check critical files
[ ! -f "Dockerfile.frontend" ] && ((issues++))
[ ! -f "Dockerfile.backend" ] && ((issues++))
[ ! -f "docker-compose.yml" ] && ((issues++))
[ ! -f "nginx.conf" ] && ((issues++))
[ ! -f "init.sql" ] && ((issues++))

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    ((issues++))
fi

if ! command -v docker-compose &> /dev/null; then
    ((issues++))
fi

if [ $issues -eq 0 ]; then
    echo -e "${GREEN}🎉 System is ready for deployment!${NC}"
    echo ""
    echo "To deploy:"
    echo "1. Configure .env file: nano .env"
    echo "2. Start services: docker-compose up -d"
    echo "3. Access: http://localhost"
else
    echo -e "${RED}❌ Found $issues issues that need to be resolved before deployment.${NC}"
    echo ""
    echo "Please fix the issues above and run this script again."
    exit 1
fi
