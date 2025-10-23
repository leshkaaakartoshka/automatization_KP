#!/bin/bash

# ===========================================
# CPQ System - PDF Cleanup Script
# ===========================================
# Удаляет PDF файлы старше 7 дней
# Запускать через cron: 0 2 * * * /path/to/cleanup-pdfs.sh

echo "🧹 Starting PDF cleanup..."

# Директория с PDF файлами
PDF_DIR="./backend/pdf"

# Проверяем существование директории
if [ ! -d "$PDF_DIR" ]; then
    echo "❌ PDF directory not found: $PDF_DIR"
    exit 1
fi

# Подсчитываем файлы до очистки
BEFORE_COUNT=$(find "$PDF_DIR" -name "*.pdf" | wc -l)
echo "📊 PDF files before cleanup: $BEFORE_COUNT"

# Удаляем файлы старше 7 дней
DELETED_COUNT=$(find "$PDF_DIR" -name "*.pdf" -mtime +7 -delete -print | wc -l)

# Подсчитываем файлы после очистки
AFTER_COUNT=$(find "$PDF_DIR" -name "*.pdf" | wc -l)

echo "✅ Cleanup completed:"
echo "   - Deleted: $DELETED_COUNT files"
echo "   - Remaining: $AFTER_COUNT files"
echo "   - Directory: $PDF_DIR"

# Логируем в файл
echo "$(date): Cleaned $DELETED_COUNT PDF files, $AFTER_COUNT remaining" >> ./logs/pdf-cleanup.log
