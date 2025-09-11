# Статические изображения в PDF

## Обзор

QR коды для WhatsApp и Telegram, а также логотип компании теперь встроены в PDF по умолчанию, используя статические файлы изображений. Пользователям больше не нужно загружать изображения через форму.

## Файлы изображений

### QR коды
- **Telegram**: `/home/russian-bogatyr/Рабочий стол/test_cursor/cpq-frontend/Telegram.jpg`
- **WhatsApp**: `/home/russian-bogatyr/Рабочий стол/test_cursor/cpq-frontend/WhatsApp.jpg`

### Логотип компании
- **Rusfart Logo**: `/home/russian-bogatyr/Рабочий стол/test_cursor/cpq-frontend/rusfart_logo_pdf.png`

## Как это работает

### 1. Бэкенд загружает изображения
```python
# app/utils/qr_images.py
def get_default_qr_codes() -> dict:
    telegram_qr_path = "/home/russian-bogatyr/Рабочий стол/test_cursor/cpq-frontend/Telegram.jpg"
    whatsapp_qr_path = "/home/russian-bogatyr/Рабочий стол/test_cursor/cpq-frontend/WhatsApp.jpg"
    
    return {
        "telegram_qr": load_image_as_base64(telegram_qr_path),
        "whatsapp_qr": load_image_as_base64(whatsapp_qr_path)
    }

def get_company_logo() -> Optional[str]:
    logo_path = "/home/russian-bogatyr/Рабочий стол/test_cursor/cpq-frontend/rusfart_logo_pdf.png"
    return load_image_as_base64(logo_path)
```

### 2. Изображения встраиваются в PDF
- Автоматически загружаются при генерации цитаты
- Конвертируются в base64 для встраивания в HTML
- **Логотип**: отображается в левом верхнем углу
- **QR коды**: отображаются в секции "Свяжитесь с нами"

### 3. Отображение в PDF

#### Логотип (левый верхний угол)
```html
<div class="company-logo">
    <img src="data:image/png;base64,{company_logo}" alt="Rusfart Logo" />
</div>
```

#### QR коды (секция "Свяжитесь с нами")
```html
<div class="qr-section">
    <h3>Свяжитесь с нами</h3>
    <div class="qr-codes">
        <div class="qr-item">
            <img src="data:image/jpeg;base64,{whatsapp_qr}" alt="WhatsApp QR" class="qr-code" />
            <div class="qr-label">WhatsApp</div>
        </div>
        <div class="qr-item">
            <img src="data:image/jpeg;base64,{telegram_qr}" alt="Telegram QR" class="qr-code" />
            <div class="qr-label">Telegram</div>
        </div>
    </div>
</div>
```

## Изменения в коде

### Удалено с фронтенда:
- ❌ Компонент `QRCodeUpload`
- ❌ Утилиты `qr-converter.ts`
- ❌ Поля QR кодов в форме
- ❌ Состояние для QR кодов в App.tsx
- ❌ Валидация QR полей

### Добавлено в бэкенд:
- ✅ `app/utils/qr_images.py` - загрузка статических изображений (QR коды + логотип)
- ✅ Автоматическая загрузка изображений в генераторе цитат
- ✅ Встраивание изображений в HTML шаблоны
- ✅ CSS стили для позиционирования логотипа

## Преимущества

1. **Простота использования**: Пользователям не нужно загружать изображения
2. **Консистентность**: Все PDF содержат одинаковые изображения
3. **Надежность**: Изображения всегда доступны
4. **Производительность**: Нет необходимости в загрузке файлов
5. **Брендинг**: Логотип компании в каждом PDF

## Обновление изображений

Чтобы обновить изображения:

1. Замените файлы:
   - `Telegram.jpg` - для Telegram QR кода
   - `WhatsApp.jpg` - для WhatsApp QR кода
   - `rusfart_logo_pdf.png` - для логотипа компании

2. Перезапустите бэкенд сервер

3. Изображения автоматически обновятся во всех новых PDF

## Требования к файлам

### QR коды
- **Формат**: JPG
- **Размер**: Рекомендуется 200x200+ пикселей
- **Качество**: Четкое изображение без размытия
- **Содержимое**: Валидные QR коды с правильными ссылками

### Логотип компании
- **Формат**: PNG (рекомендуется) или JPG
- **Размер**: Рекомендуется 60x30 пикселей или меньше
- **Качество**: Четкое изображение без размытия
- **Прозрачность**: PNG с прозрачным фоном предпочтительнее
- **Позиционирование**: Левый верхний угол, компактный размер
- **Отступ текста**: 100px сверху для предотвращения перекрытия

## Ссылки в QR кодах

- **WhatsApp**: `https://wa.me/79931401814`
- **Telegram**: `https://t.me/rusfart1`

## Тестирование

Изображения тестируются автоматически при запуске бэкенда. Если файлы не найдены, в логах появится предупреждение, но PDF будет сгенерирован без соответствующих изображений.

### Результаты тестирования:
- ✅ **Telegram QR**: Загружен (27,552 символов base64)
- ✅ **WhatsApp QR**: Загружен (24,476 символов base64)  
- ✅ **Логотип компании**: Загружен (76,916 символов base64, 57,687 байт)
