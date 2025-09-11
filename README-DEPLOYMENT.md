# 🚀 CPQ System Deployment Guide

Полное руководство по развертыванию системы CPQ на VDS сервере.

## 📋 Требования к серверу

### Минимальные требования:
- **CPU**: 2 ядра
- **RAM**: 4 GB
- **Диск**: 20 GB SSD
- **OS**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+

### Рекомендуемые требования:
- **CPU**: 4 ядра
- **RAM**: 8 GB
- **Диск**: 50 GB SSD
- **OS**: Ubuntu 22.04 LTS

## 🔧 Быстрое развертывание с Docker (Рекомендуется)

### 1. Подготовка сервера

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Установка Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Перезагрузка для применения изменений
sudo reboot
```

### 2. Клонирование и настройка

```bash
# Клонирование репозитория
git clone <your-repo-url>
cd cpq-system

# Настройка переменных окружения
cp env.example .env
nano .env  # Отредактируйте настройки
```

### 3. Запуск системы

```bash
# Запуск в development режиме
./deploy.sh development

# Или запуск в production режиме
./deploy.sh production
```

## 🛠 Ручное развертывание (без Docker)

### 1. Установка системных зависимостей

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y python3.11 python3.11-venv python3-pip nodejs npm nginx postgresql

# Установка зависимостей для WeasyPrint
sudo apt install -y libpango1.0-dev libharfbuzz-dev libfribidi-dev \
    libfontconfig1-dev libcairo2-dev libgdk-pixbuf2.0-dev \
    libglib2.0-dev libgtk-3-dev libxml2-dev libxslt1-dev \
    libffi-dev libssl-dev
```

### 2. Настройка Backend

```bash
cd backend

# Создание виртуального окружения
python3.11 -m venv venv
source venv/bin/activate

# Установка зависимостей
pip install -e ".[dev]"

# Настройка переменных окружения
cp env.example .env
nano .env

# Создание директории для PDF
mkdir -p pdf

# Запуск backend
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 3. Настройка Frontend

```bash
cd ../cpq-frontend

# Установка зависимостей
npm install

# Настройка переменных окружения
echo "VITE_API_BASE=http://your-server-ip:8000" > .env.local

# Сборка для production
npm run build

# Копирование файлов в nginx
sudo cp -r dist/* /var/www/html/
```

### 4. Настройка Nginx

```bash
# Создание конфигурации
sudo nano /etc/nginx/sites-available/cpq

# Содержимое файла:
server {
    listen 80;
    server_name your-domain.com;
    
    # Frontend
    location / {
        root /var/www/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # PDF files
    location /pdf {
        proxy_pass http://localhost:8000;
    }
}

# Активация сайта
sudo ln -s /etc/nginx/sites-available/cpq /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 5. Настройка PostgreSQL (опционально)

```bash
# Создание базы данных
sudo -u postgres psql
CREATE DATABASE cpq_db;
CREATE USER cpq_user WITH PASSWORD 'cpq_password';
GRANT ALL PRIVILEGES ON DATABASE cpq_db TO cpq_user;
\q

# Импорт схемы
psql -h localhost -U cpq_user -d cpq_db -f init.sql
```

## 🔐 Настройка переменных окружения

Скопируйте `env.example` в `.env` и настройте:

```bash
# Обязательные переменные
OPENAI_API_KEY=sk-your-openai-key-here
TG_BOT_TOKEN=your-telegram-bot-token
TG_MANAGER_CHAT_ID=your-telegram-chat-id

# Настройка источника данных
LOOKUP_SOURCE=postgres  # или sheets, mock
DB_DSN=postgresql://cpq_user:cpq_password@localhost:5432/cpq_db

# Настройка URL
BASE_URL=http://your-domain.com
```

## 🚀 Запуск как системные сервисы

### Backend как systemd сервис

```bash
# Создание сервиса
sudo nano /etc/systemd/system/cpq-backend.service

# Содержимое:
[Unit]
Description=CPQ Backend API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/backend
Environment=PATH=/path/to/backend/venv/bin
ExecStart=/path/to/backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target

# Запуск сервиса
sudo systemctl daemon-reload
sudo systemctl enable cpq-backend
sudo systemctl start cpq-backend
```

## 📊 Мониторинг и логи

```bash
# Просмотр логов backend
sudo journalctl -u cpq-backend -f

# Просмотр логов nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Проверка статуса сервисов
sudo systemctl status cpq-backend
sudo systemctl status nginx
```

## 🔧 Обновление системы

```bash
# Остановка сервисов
docker-compose down

# Обновление кода
git pull origin main

# Пересборка и запуск
docker-compose build --no-cache
docker-compose up -d
```

## 🛡 Безопасность

### SSL сертификат (Let's Encrypt)

```bash
# Установка Certbot
sudo apt install certbot python3-certbot-nginx

# Получение сертификата
sudo certbot --nginx -d your-domain.com

# Автоматическое обновление
sudo crontab -e
# Добавить: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Firewall

```bash
# Настройка UFW
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## 🐛 Устранение неполадок

### Проблемы с WeasyPrint

```bash
# Установка дополнительных шрифтов
sudo apt install fonts-liberation fonts-dejavu-core

# Проверка зависимостей
python3 -c "import weasyprint; print('WeasyPrint OK')"
```

### Проблемы с правами доступа

```bash
# Исправление прав на PDF директорию
sudo chown -R www-data:www-data /path/to/backend/pdf
sudo chmod -R 755 /path/to/backend/pdf
```

### Проблемы с базой данных

```bash
# Проверка подключения
psql -h localhost -U cpq_user -d cpq_db -c "SELECT 1;"

# Пересоздание таблиц
psql -h localhost -U cpq_user -d cpq_db -f init.sql
```

## 📞 Поддержка

При возникновении проблем:

1. Проверьте логи: `docker-compose logs`
2. Проверьте статус сервисов: `docker-compose ps`
3. Проверьте конфигурацию: `docker-compose config`
4. Перезапустите сервисы: `docker-compose restart`

## 🎯 Следующие шаги

После успешного развертывания:

1. Настройте мониторинг (Prometheus + Grafana)
2. Настройте резервное копирование
3. Настройте автоматическое обновление
4. Настройте уведомления об ошибках
