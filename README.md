# CPQ System - Configure, Price, Quote

Система автоматизации генерации коммерческих предложений для коробочного производства.

## 🚀 Возможности

- **Генерация КП**: Автоматическое создание коммерческих предложений на основе параметров коробки
- **PDF-экспорт**: Создание профессиональных PDF-документов
- **Telegram интеграция**: Автоматическая отправка КП в Telegram
- **Гибкая настройка**: Поддержка различных источников данных (Google Sheets, PostgreSQL)
- **Docker развертывание**: Готово к развертыванию в контейнерах

## 🏗️ Архитектура

- **Frontend**: React + TypeScript + Vite
- **Backend**: FastAPI + Python 3.11
- **База данных**: PostgreSQL
- **PDF генерация**: WeasyPrint
- **Контейнеризация**: Docker + Docker Compose

## 📦 Быстрый старт

### Предварительные требования

- Docker Engine 20.10+
- Docker Compose 2.0+
- Ubuntu 22.04 LTS (рекомендуется)

### Установка

1. **Клонируйте репозиторий:**
   ```bash
   git clone https://github.com/leshkaaakartoshka/automatization_KP.git
   cd automatization_KP
   ```

2. **Настройте окружение:**
   ```bash
   ./init-env.sh
   nano .env  # Отредактируйте настройки
   ```

3. **Запустите систему:**
   ```bash
   ./check-deployment.sh  # Проверка готовности
   docker-compose up -d   # Запуск
   ```

4. **Откройте приложение:**
   - Frontend: http://localhost
   - API: http://localhost/api
   - Документация API: http://localhost/api/docs

## ⚙️ Конфигурация

### Обязательные переменные

- `TG_BOT_TOKEN`: Токен Telegram бота
- `TG_MANAGER_CHAT_ID`: ID чата для уведомлений
- `HASH_SALT`: Соль для хеширования (измените в продакшене!)

### Опциональные переменные

- `LOOKUP_SOURCE`: Источник данных (mock, sheets, postgres)
- `PDF_STORAGE`: Хранение PDF (local, s3)
- `DB_DSN`: Строка подключения к PostgreSQL

## 📁 Структура проекта

```
├── cpq-frontend/          # React фронтенд
├── backend/               # FastAPI бэкенд
├── docker-compose.yml     # Docker Compose конфигурация
├── Dockerfile.frontend    # Dockerfile для фронтенда
├── Dockerfile.backend     # Dockerfile для бэкенда
├── nginx.conf            # Nginx конфигурация
├── init.sql              # Инициализация БД
├── init-env.sh           # Скрипт инициализации
├── check-deployment.sh   # Проверка готовности
└── DEPLOYMENT.md         # Подробная документация
```

## 🔧 Разработка

### Frontend
```bash
cd cpq-frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## 🚀 Развертывание в продакшене

1. **Настройте безопасность:**
   - Измените пароли PostgreSQL
   - Настройте CORS для вашего домена
   - Используйте HTTPS

2. **Масштабирование:**
   - Используйте внешнюю PostgreSQL
   - Настройте Redis для кеширования
   - Используйте S3 для хранения PDF

## 📚 Документация

- [Руководство по развертыванию](DEPLOYMENT.md)
- [API документация](http://localhost/api/docs) (после запуска)
- [Backend README](backend/README.md)

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для новой функции
3. Внесите изменения
4. Создайте Pull Request

## 📄 Лицензия

Этот проект распространяется под лицензией MIT.

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи: `docker-compose logs`
2. Запустите проверку: `./check-deployment.sh`
3. Создайте Issue в репозитории

---

**Статус**: ✅ Готово к развертыванию
**Версия**: 1.0.0
**Последнее обновление**: $(date)