# Дизайн-система CPQ Frontend

## Обзор

Данная дизайн-система обеспечивает единообразный внешний вид между веб-интерфейсом и генерируемыми PDF документами. Все компоненты строго следуют установленным дизайн-токенам.

## Дизайн-токены

### Цвета
- `--page-bg: #F2F3F5` - светло-серый фон страницы
- `--card-bg: #FFFFFF` - фон контентной области/таблиц
- `--accent-yellow: #F0D020` - жёлтая плашка заголовков
- `--text-primary: #111827` - основной текст (очень тёмно-серый)
- `--text-secondary: #4B5563` - второстепенный текст/пояснения
- `--border-muted: #E5E7EB` - линии таблиц/разделители
- `--link-blue: #004277` - ссылки/контакты

### Типографика
- `--font-family: "DejaVu Sans", Inter, Arial, sans-serif`
- H1: 20pt, line-height: 1.25, фон = accent_yellow
- H2: 16pt, те же правила плашки, отступ сверху 16px
- P, LI: 11pt, line-height: 1.45, цвет text_primary
- Сноски: 9pt, text_secondary

### Размеры
- `--radius-md: 8px` - средний радиус скругления
- `--radius-lg: 12px` - большой радиус скругления
- `--space-xs: 4px` - минимальный отступ
- `--space-sm: 8px` - маленький отступ
- `--space-md: 12px` - средний отступ
- `--space-lg: 16px` - большой отступ

## Компоненты

### PDFPreview
Компонент для предварительного просмотра PDF в веб-интерфейсе.

```tsx
import { PDFPreview } from './components/PDFPreview';

<PDFPreview 
  data={quoteData} 
  pricingData={pricingData} 
  className="optional-class" 
/>
```

### PDF Generator
Утилиты для генерации PDF с соблюдением дизайн-токенов.

```tsx
import { createPDFContent, generatePDF, createTestData } from './pdf-generator';

// Создание HTML контента
const htmlContent = createPDFContent(data, pricingData);

// Генерация PDF (в реальном приложении - вызов API)
const pdfUrl = await generatePDF(data, pricingData);

// Тестовые данные
const { data, pricingData } = createTestData();
```

## Использование в CSS

### CSS переменные
```css
.my-component {
  background-color: var(--card-bg);
  color: var(--text-primary);
  font-family: var(--font-family);
  border-radius: var(--radius-md);
  padding: var(--space-sm);
}
```

### Inline стили
```tsx
<div style={{
  backgroundColor: 'var(--accent-yellow)',
  padding: '8px 12px',
  borderRadius: 'var(--radius-md)',
  color: 'var(--text-primary)',
  fontFamily: 'var(--font-family)'
}}>
  Заголовок
</div>
```

## Правила дизайна

### 1. Макет страницы
- Формат: A4, портрет
- Поля: 18-20 мм со всех сторон
- Сетка: одна колонка, ширина контента ≈ 100% - поля

### 2. Цвет и фон
- Весь лист: background: page_bg
- Контентные блоки/таблицы: background: card_bg
- Заголовки всегда на жёлтой плашке (accent_yellow)

### 3. Таблицы
- Ширина: 100%, border-collapse: collapse
- Разделители строк: 1px solid border_muted
- Ячейки: padding: 8-10px
- Числовые колонки - правое выравнивание

### 4. Списки
- Маркированные списки с li { margin: 6px 0; }
- Чек-лист: квадратные чекбоксы □

### 5. Ссылки и контакты
- Цвет: link_blue, без подчёркивания в PDF
- Контактный блок - мелким шрифтом 9-10pt

## Ограничения

- Никаких внешних CSS/шрифтов - только инлайн-CSS
- Не менять токены цвета/размеров
- Не использовать градиенты, тени и рамки толще 1px
- Не прыгать шрифтами: только font_family из токенов

## Файлы

- `src/design-tokens.css` - CSS переменные с дизайн-токенами
- `src/pdf-generator.ts` - утилиты для генерации PDF
- `src/components/PDFPreview.tsx` - компонент предварительного просмотра
- `src/demo-pdf.tsx` - демонстрация использования
