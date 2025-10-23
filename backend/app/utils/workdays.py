"""Utilities for calculating business days."""

from datetime import datetime, timedelta
from typing import Optional


def add_business_days(start_date: datetime, days: int) -> datetime:
    """
    Добавляет рабочие дни к дате, пропуская выходные (суббота, воскресенье).
    
    Args:
        start_date: Начальная дата
        days: Количество рабочих дней для добавления
        
    Returns:
        Дата после добавления указанного количества рабочих дней
    """
    if days <= 0:
        return start_date
    
    current_date = start_date
    days_added = 0
    
    while days_added < days:
        current_date += timedelta(days=1)
        # 0-4 = Понедельник-Пятница (рабочие дни)
        if current_date.weekday() < 5:
            days_added += 1
    
    return current_date


def format_russian_date(date: datetime) -> str:
    """
    Форматирует дату в русском формате: 21 октября 2025.
    
    Args:
        date: Дата для форматирования
        
    Returns:
        Отформатированная дата на русском языке
    """
    months = [
        'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
        'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ]
    
    return f"{date.day} {months[date.month - 1]} {date.year}"


def calculate_delivery_date(days: int) -> dict:
    """
    Рассчитывает дату готовности на основе количества рабочих дней.
    
    Args:
        days: Количество рабочих дней
        
    Returns:
        Словарь с информацией о сроке
    """
    current_date = datetime.now()
    delivery_date = add_business_days(current_date, days)
    
    return {
        'days': days,
        'date': delivery_date,
        'formatted_date': format_russian_date(delivery_date)
    }


def get_tariff_delivery_dates(
    base_delivery_days: int,
    custom_standard_days: Optional[int] = None,
    custom_urgent_days: Optional[int] = None,
    custom_strategic_days: Optional[int] = None
) -> dict:
    """
    Рассчитывает даты готовности для всех тарифов.
    Использует пользовательские сроки, если они указаны.
    
    Args:
        base_delivery_days: Базовое количество рабочих дней, введенное пользователем
        custom_standard_days: Пользовательский срок для стандартного тарифа
        custom_urgent_days: Пользовательский срок для срочного тарифа
        custom_strategic_days: Пользовательский срок для стратегического тарифа
        
    Returns:
        Словарь с датами готовности для каждого тарифа
    """
    # Рассчитываем базовые сроки
    standard_days = custom_standard_days or base_delivery_days
    urgent_days = custom_urgent_days or max(1, int(base_delivery_days * 0.5))
    strategic_days = custom_strategic_days or int(base_delivery_days * 1.5)
    
    return {
        'standard': calculate_delivery_date(standard_days),
        'urgent': calculate_delivery_date(urgent_days),
        'strategic': calculate_delivery_date(strategic_days)
    }
