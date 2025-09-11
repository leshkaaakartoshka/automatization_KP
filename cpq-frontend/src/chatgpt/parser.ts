// ChatGPT Response Parser (Deprecated)
// Этот файл больше не используется в основном потоке приложения

export interface ParsedPricingData {
  total_price: number;
  price_per_unit: number;
  materials_cost: number;
  printing_cost: number;
  delivery_cost: number;
  production_time_days: number;
  notes?: string;
}

/**
 * @deprecated Больше не используется. Логика расчета перенесена во фронтенд.
 */
export function parseChatGPTResponse(response: any): ParsedPricingData {
  throw new Error('ChatGPT integration is deprecated. Use tariff calculator instead.');
}

/**
 * @deprecated Больше не используется. Логика расчета перенесена во фронтенд.
 */
export function validatePricingData(data: ParsedPricingData): boolean {
  throw new Error('ChatGPT integration is deprecated. Use tariff calculator instead.');
}
