"""Утилиты для работы с изображениями (QR коды и логотип)."""

import base64
from pathlib import Path
from typing import Optional


def load_image_as_base64(image_path: str) -> Optional[str]:
    """
    Загружает изображение и конвертирует в base64.
    
    Args:
        image_path: Путь к файлу изображения
        
    Returns:
        Base64 строка или None если файл не найден
    """
    try:
        image_file = Path(image_path)
        if not image_file.exists():
            print(f"Изображение не найдено: {image_path}")
            return None
            
        with open(image_file, "rb") as f:
            image_data = f.read()
            
        base64_data = base64.b64encode(image_data).decode('utf-8')
        return base64_data
        
    except Exception as e:
        print(f"Ошибка при загрузке изображения {image_path}: {e}")
        return None


def get_default_qr_codes() -> dict:
    """
    Возвращает QR коды по умолчанию.
    
    Returns:
        Словарь с base64 данными QR кодов
    """
    # Определяем путь к статическим изображениям внутри backend/app/static
    app_dir = Path(__file__).resolve().parents[1]
    static_dir = app_dir / "static"
    telegram_qr_path = str(static_dir / "Telegram.jpg")
    whatsapp_qr_path = str(static_dir / "WhatsApp.jpg")
    
    return {
        "telegram_qr": load_image_as_base64(telegram_qr_path),
        "whatsapp_qr": load_image_as_base64(whatsapp_qr_path)
    }


def get_company_logo() -> Optional[str]:
    """
    Возвращает логотип компании.
    
    Returns:
        Base64 строка с логотипом или None если файл не найден
    """
    app_dir = Path(__file__).resolve().parents[1]
    static_dir = app_dir / "static"
    logo_path = str(static_dir / "rusfart_logo_pdf.png")
    return load_image_as_base64(logo_path)
