import { useState, useCallback } from 'react';

/**
 * Хук для работы с localStorage с типизацией и обработкой ошибок
 * @param key - ключ для хранения в localStorage
 * @param initialValue - начальное значение, если данных в localStorage нет
 * @returns [storedValue, setValue] - текущее значение и функция для его обновления
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  // Получаем значение из localStorage или используем начальное
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Функция для обновления значения
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key]);

  // Очистка значения из localStorage
  const clearValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      window.localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Error clearing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, clearValue] as const;
}
