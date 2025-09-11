// Калькулятор тарифов для расчета стоимости партии
// Реализует 3 варианта тарифов: стандартный, срочный, стратегический

export type TariffType = 'standard' | 'urgent' | 'strategic';

export interface TariffCalculation {
  standard: number;    // базовая цена без изменений
  urgent: number;      // +100% к базовой цене
  strategic: number;   // -10% от базовой цены
}

export interface TariffInfo {
  type: TariffType;
  name: string;
  description: string;
  multiplier: number;
  price: number;
}

/**
 * Рассчитывает все варианты тарифов на основе базовой цены
 */
export function calculateTariffs(basePrice: number): TariffCalculation {
  if (basePrice <= 0) {
    return {
      standard: 0,
      urgent: 0,
      strategic: 0
    };
  }

  return {
    standard: basePrice,                    // без изменений
    urgent: basePrice * 2,                 // +100%
    strategic: Math.round(basePrice * 0.9) // -10%, округляем до целого
  };
}

/**
 * Получает информацию о тарифе (оптимизированная версия)
 */
export function getTariffInfo(type: TariffType, basePrice: number, tariffs?: TariffCalculation): TariffInfo {
  // Используем переданные тарифы или рассчитываем новые
  const calculatedTariffs = tariffs || calculateTariffs(basePrice);
  
  const tariffMap: Record<TariffType, Omit<TariffInfo, 'price'>> = {
    standard: {
      type: 'standard',
      name: 'Стандартный',
      description: 'Базовая цена без изменений',
      multiplier: 1.0
    },
    urgent: {
      type: 'urgent',
      name: 'Срочный',
      description: 'Увеличение на 100%',
      multiplier: 2.0
    },
    strategic: {
      type: 'strategic',
      name: 'Стратегический',
      description: 'Скидка 10%',
      multiplier: 0.9
    }
  };

  return {
    ...tariffMap[type],
    price: calculatedTariffs[type]
  };
}

/**
 * Получает все варианты тарифов с информацией (оптимизированная версия)
 */
export function getAllTariffInfos(basePrice: number): TariffInfo[] {
  // Рассчитываем тарифы только один раз
  const tariffs = calculateTariffs(basePrice);
  
  return ['standard', 'urgent', 'strategic'].map(type => 
    getTariffInfo(type as TariffType, basePrice, tariffs)
  );
}

/**
 * Форматирует цену для отображения
 */
export function formatPrice(price: number): string {
  return price.toLocaleString('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

/**
 * Получает разницу между тарифами
 */
export function getTariffDifference(basePrice: number, selectedTariff: TariffType): {
  difference: number;
  percentage: number;
  isIncrease: boolean;
} {
  const tariffs = calculateTariffs(basePrice);
  const selectedPrice = tariffs[selectedTariff];
  const difference = selectedPrice - basePrice;
  const percentage = basePrice > 0 ? Math.round((difference / basePrice) * 100) : 0;
  
  return {
    difference,
    percentage: Math.abs(percentage),
    isIncrease: difference > 0
  };
}

/**
 * Валидирует базовую цену
 */
export function validateBasePrice(price: number): {
  isValid: boolean;
  error?: string;
} {
  if (price < 0) {
    return {
      isValid: false,
      error: 'Цена не может быть отрицательной'
    };
  }
  
  if (price > 10000000) {
    return {
      isValid: false,
      error: 'Цена слишком большая (максимум 10,000,000 руб)'
    };
  }
  
  if (!Number.isInteger(price)) {
    return {
      isValid: false,
      error: 'Цена должна быть целым числом'
    };
  }
  
  return { isValid: true };
}
