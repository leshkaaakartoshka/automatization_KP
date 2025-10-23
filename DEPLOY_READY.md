# ✅ CPQ System готов к деплою!

## 🎯 Что было подготовлено

### 1. Обновлены конфигурационные файлы
- ✅ **nginx.conf** - оптимизирован для production с кэшированием и gzip
- ✅ **backend/app/main.py** - добавлен IP 193.32.179.66 в CORS origins
- ✅ **docker-compose.yml** - убран PostgreSQL (не нужен)
- ✅ **vite.config.ts** - настроен для production build

### 2. Созданы файлы для деплоя
- ✅ **env.production.example** - шаблон переменных окружения с описанием
- ✅ **QUICK_DEPLOY.md** - подробная инструкция на русском языке
- ✅ **deploy-production.sh** - автоматический скрипт деплоя
- ✅ **cleanup-pdfs.sh** - скрипт очистки старых PDF файлов

## 🚀 Как деплоить на сервер

### Вариант 1: Автоматический (рекомендуемый)
```bash
# На сервере Ubuntu 24.04
1. Установить Docker: curl -fsSL https://get.docker.com | sh
2. Скопировать проект на сервер
3. Настроить .env: cp env.production.example .env && nano .env
4. Запустить: ./deploy-production.sh
```

### Вариант 2: Ручной
```bash
# На сервере
1. docker-compose build
2. docker-compose up -d
3. curl http://193.32.179.66/health
```

## 📋 Что нужно настроить в .env

**Обязательные параметры:**
```bash
TG_BOT_TOKEN=ваш_токен_от_BotFather
TG_MANAGER_CHAT_ID=ваш_chat_id_от_userinfobot
HASH_SALT=случайная_строка_32_символа
```

**Автоматически настроенные:**
```bash
BASE_URL=http://193.32.179.66
LOOKUP_SOURCE=mock
PDF_STORAGE=local
```

## 🌐 После деплоя будет доступно

- **Фронтенд**: http://193.32.179.66
- **API**: http://193.32.179.66/api  
- **API Docs**: http://193.32.179.66/api/docs
- **Health Check**: http://193.32.179.66/health

## 🔧 Управление после деплоя

```bash
# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down

# Перезапуск
docker-compose restart

# Обновление
git pull && docker-compose up -d --build
```

## 🧹 Очистка PDF файлов

```bash
# Ручная очистка
./cleanup-pdfs.sh

# Автоматическая очистка (cron)
0 2 * * * /path/to/cleanup-pdfs.sh
```

## ✅ Преимущества этой конфигурации

- 🚀 **Быстрый деплой** - 1 команда
- 🔧 **Простое управление** - Docker Compose
- 📦 **Минимальная сложность** - 2 контейнера
- 🗄️ **Без базы данных** - mock данные
- 📄 **Локальное хранение PDF** - отправляются в Telegram
- 🔄 **Легко обновлять** - git pull + rebuild

## 📞 Поддержка

При проблемах проверьте:
1. Логи: `docker-compose logs`
2. Статус: `docker-compose ps`
3. Конфигурацию: `docker-compose config`
4. Переменные: `cat .env`

---

**🎉 Система полностью готова к production деплою!**
