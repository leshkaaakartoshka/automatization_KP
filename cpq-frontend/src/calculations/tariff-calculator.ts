// Калькулятор тарифов для расчета стоимости партии
// Реализует 3 варианта тарифов: стандартный, срочный, стратегический
// Новая логика: пользователь вводит сроки, система рассчитывает цены

export type TariffType = 'standard' | 'urgent' | 'strategic';

export interface TariffCalculation {
  standard: number;    // базовая цена без изменений
  urgent: number;      // цена с учетом ускорения
  strategic: number;   // цена со скидкой за увеличенный срок
}

export interface DeliveryDays {
  standard: number;    // базовый срок
  urgent: number;      // ускоренный срок (-50%)
  strategic: number;   // увеличенный срок (+50%)
}

export interface TariffInfo {
  type: TariffType;
  name: string;
  description: string;
  multiplier: number;
  price: number;
  deliveryDays: number;
  deliveryDate?: string; // добавить отформатированную дату
}

/**
 * Рассчитывает сроки доставки для всех тарифов на основе базового срока
 */
export function calculateDeliveryDays(baseDays: number): DeliveryDays {
  if (baseDays <= 0) {
    return {
      standard: 0,
      urgent: 0,
      strategic: 0
    };
  }

  return {
    standard: baseDays,                                    // базовый срок
    urgent: Math.max(1, Math.floor(baseDays * 0.5)),     // -50% от срока
    strategic: Math.ceil(baseDays * 1.5)                  // +50% к сроку
  };
}

/**
 * Рассчитывает цены тарифов на основе сроков доставки
 */
export function calculateTariffsByDelivery(unitPrice: number, qty: number, deliveryDays: number): TariffCalculation {
  if (unitPrice <= 0 || qty <= 0 || deliveryDays <= 0) {
    return {
      standard: 0,
      urgent: 0,
      strategic: 0
    };
  }

  const basePrice = unitPrice * qty;
  const urgentMultiplier = 1 + (deliveryDays * 0.1);  // Чем меньше срок, тем дороже
  const strategicDiscount = 0.85;  // -15% за увеличенный срок

  return {
    standard: basePrice,
    urgent: basePrice * urgentMultiplier,
    strategic: basePrice * strategicDiscount
  };
}

/**
 * Рассчитывает все варианты тарифов на основе цены за единицу, количества и сроков
 */
export function calculateTariffs(unitPrice: number, qty: number, deliveryDays: number): TariffCalculation {
  return calculateTariffsByDelivery(unitPrice, qty, deliveryDays);
}

/**
 * Получает информацию о тарифе (оптимизированная версия)
 */
export function getTariffInfo(type: TariffType, unitPrice: number, qty: number, deliveryDays: number, tariffs?: TariffCalculation): TariffInfo {
  // Используем переданные тарифы или рассчитываем новые
  const calculatedTariffs = tariffs || calculateTariffs(unitPrice, qty, deliveryDays);
  const calculatedDeliveryDays = calculateDeliveryDays(deliveryDays);
  
  const tariffMap: Record<TariffType, Omit<TariffInfo, 'price' | 'deliveryDays'>> = {
    standard: {
      type: 'standard',
      name: 'Стандартный',
      description: 'Базовая цена без изменений',
      multiplier: 1.0
    },
    urgent: {
      type: 'urgent',
      name: 'Срочный',
      description: 'Ускоренное изготовление',
      multiplier: 1 + (deliveryDays * 0.1)
    },
    strategic: {
      type: 'strategic',
      name: 'Стратегический',
      description: 'Долгосрочное сотрудничество',
      multiplier: 0.85
    }
  };

  return {
    ...tariffMap[type],
    price: calculatedTariffs[type],
    deliveryDays: calculatedDeliveryDays[type]
  };
}

/**
 * Получает все варианты тарифов с информацией (оптимизированная версия)
 */
export function getAllTariffInfos(unitPrice: number, qty: number, deliveryDays: number): TariffInfo[] {
  // Рассчитываем тарифы только один раз
  const tariffs = calculateTariffs(unitPrice, qty, deliveryDays);
  
  return ['standard', 'urgent', 'strategic'].map(type => 
    getTariffInfo(type as TariffType, unitPrice, qty, deliveryDays, tariffs)
  );
}

/**
 * Применяет пользовательские цены к рассчитанным тарифам
 */
export function applyCustomPrices(tariffs: TariffCalculation, customPrices: Record<TariffType, number | null>): TariffCalculation {
  return {
    standard: customPrices.standard ?? tariffs.standard,
    urgent: customPrices.urgent ?? tariffs.urgent,
    strategic: customPrices.strategic ?? tariffs.strategic
  };
}

/**
 * Применяет пользовательские сроки к рассчитанным срокам
 */
export function applyCustomDeliveryDays(
  calculatedDays: DeliveryDays, 
  customDays: Record<TariffType, number | null>
): DeliveryDays {
  return {
    standard: customDays.standard ?? calculatedDays.standard,
    urgent: customDays.urgent ?? calculatedDays.urgent,
    strategic: customDays.strategic ?? calculatedDays.strategic
  };
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
export function getTariffDifference(unitPrice: number, qty: number, deliveryDays: number, selectedTariff: TariffType): {
  difference: number;
  percentage: number;
  isIncrease: boolean;
} {
  const tariffs = calculateTariffs(unitPrice, qty, deliveryDays);
  const basePrice = unitPrice * qty;
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
 * Валидирует цену за единицу
 */
export function validateUnitPrice(price: number): {
  isValid: boolean;
  error?: string;
} {
  if (price < 0.01) {
    return {
      isValid: false,
      error: 'Цена за единицу должна быть не менее 0.01 руб'
    };
  }
  
  if (price > 1000000) {
    return {
      isValid: false,
      error: 'Цена за единицу слишком большая (максимум 1,000,000 руб)'
    };
  }
  
  return { isValid: true };
}
