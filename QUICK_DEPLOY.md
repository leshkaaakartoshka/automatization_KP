# 🚀 Быстрый деплой CPQ System на Ubuntu 24.04

## 📋 Что нужно на сервере

- Ubuntu 24.04 LTS
- IP адрес: 193.32.179.66
- Открытые порты: 80 (HTTP)

## ⚡ Быстрый старт (5 минут)

### 1. Установка Docker на Ubuntu 24.04

```bash
# Обновляем систему
sudo apt update && sudo apt upgrade -y

# Устанавливаем Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Добавляем пользователя в группу docker
sudo usermod -aG docker $USER

# Устанавливаем Docker Compose
sudo apt install docker-compose-plugin -y

# Перезагружаемся (или выходим и заходим заново)
sudo reboot
```

### 2. Копирование проекта на сервер

```bash
# Скачиваем проект (замените на ваш репозиторий)
git clone <ваш-репозиторий> cpq-system
cd cpq-system

# Или копируем файлы через scp/rsync
```

### 3. Настройка переменных окружения

```bash
# Копируем шаблон
cp env.production.example .env

# Редактируем конфигурацию
nano .env
```

**Обязательно заполните в .env:**
```bash
TG_BOT_TOKEN=ваш_токен_от_BotFather
TG_MANAGER_CHAT_ID=ваш_chat_id_от_userinfobot
HASH_SALT=случайная_строка_32_символа
```

### 4. Запуск системы

```bash
# Создаем необходимые директории
mkdir -p backend/pdf logs

# Запускаем систему
docker-compose up -d

# Проверяем статус
docker-compose ps
```

### 5. Проверка работы

```bash
# Проверяем фронтенд
curl http://193.32.179.66

# Проверяем API
curl http://193.32.179.66/api/health

# Проверяем API документацию
curl http://193.32.179.66/api/docs
```

## 🌐 Доступ к системе

После успешного деплоя система будет доступна по адресам:

- **Фронтенд**: http://193.32.179.66
- **API**: http://193.32.179.66/api
- **API Docs**: http://193.32.179.66/api/docs
- **Health Check**: http://193.32.179.66/health

## 🔧 Управление системой

### Просмотр логов
```bash
# Все сервисы
docker-compose logs -f

# Только бэкенд
docker-compose logs -f backend

# Только фронтенд
docker-compose logs -f frontend
```

### Остановка системы
```bash
docker-compose down
```

### Перезапуск системы
```bash
docker-compose restart
```

### Обновление системы
```bash
# Останавливаем
docker-compose down

# Обновляем код (git pull или замена файлов)
git pull

# Пересобираем и запускаем
docker-compose up -d --build
```

## 🧹 Очистка PDF файлов

PDF файлы накапливаются на сервере. Для автоматической очистки:

```bash
# Запуск очистки вручную
./cleanup-pdfs.sh

# Настройка автоматической очистки (каждый день в 2:00)
crontab -e
# Добавить строку:
0 2 * * * /path/to/cpq-system/cleanup-pdfs.sh
```

## 🐛 Решение проблем

### Проблема: "Address already in use"
```bash
# Проверяем что использует порт 80
sudo netstat -tulpn | grep :80

# Останавливаем nginx/apache если запущен
sudo systemctl stop nginx
sudo systemctl stop apache2
```

### Проблема: "Permission denied"
```bash
# Исправляем права на директории
sudo chown -R $USER:$USER backend/pdf/
chmod +x cleanup-pdfs.sh
```

### Проблема: "Container not starting"
```bash
# Смотрим логи
docker-compose logs backend
docker-compose logs frontend

# Проверяем конфигурацию
docker-compose config
```

### Проблема: "CORS error"
```bash
# Проверяем что в .env правильный BASE_URL
grep BASE_URL .env

# Должно быть: BASE_URL=http://193.32.179.66
```

## 📊 Мониторинг

### Проверка здоровья системы
```bash
# Скрипт для проверки
curl -f http://193.32.179.66/health && echo "✅ Frontend OK" || echo "❌ Frontend ERROR"
curl -f http://193.32.179.66/api/health && echo "✅ Backend OK" || echo "❌ Backend ERROR"
```

### Статистика использования
```bash
# Размер PDF директории
du -sh backend/pdf/

# Количество PDF файлов
find backend/pdf/ -name "*.pdf" | wc -l

# Использование диска контейнерами
docker system df
```

## 🔒 Безопасность

### Рекомендации для продакшна

1. **Измените HASH_SALT** на случайную строку
2. **Настройте firewall** (только порт 80)
3. **Регулярно обновляйте** систему
4. **Настройте мониторинг** логов
5. **Делайте бэкапы** конфигурации

### Настройка firewall
```bash
# Разрешаем только HTTP
sudo ufw allow 80/tcp
sudo ufw deny 22/tcp  # Закрываем SSH если не нужен
sudo ufw enable
```

## 📞 Поддержка

При возникновении проблем:

1. Проверьте логи: `docker-compose logs`
2. Проверьте статус: `docker-compose ps`
3. Проверьте конфигурацию: `docker-compose config`
4. Проверьте переменные: `cat .env`

---

**🎉 Готово! Ваша система CPQ развернута и готова к работе!**
