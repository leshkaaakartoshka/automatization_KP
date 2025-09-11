// PDF Generator с соблюдением дизайн-токенов
// Этот файл содержит функции для генерации PDF коммерческих предложений

// Дизайн-токены (строго по требованиям)
export const DESIGN_TOKENS = {
  page_bg: '#F2F3F5',         // светло-серый фон страницы
  card_bg: '#FFFFFF',         // фон контентной области/таблиц
  accent_yellow: '#F0D020',   // жёлтая плашка заголовков
  text_primary: '#111827',    // основной текст (очень тёмно-серый)
  text_secondary: '#4B5563',  // второстепенный текст/пояснения
  border_muted: '#E5E7EB',    // линии таблиц/разделители
  link_blue: '#004277',       // ссылки/контакты
  font_family: 'DejaVu Sans, Inter, Arial, sans-serif',
  radius_md: '8px',
  radius_lg: '12px',
  space_xs: '4px',
  space_sm: '8px',
  space_md: '12px',
  space_lg: '16px'
} as const;

// Типы для данных
export interface QuoteData {
  fefco: string;
  cardboard_type: string;
  cardboard_grade?: string;
  x_mm: number;
  y_mm: number;
  z_mm: number;
  print?: string;
  qty: number;
  sla_type: string;
  batch_cost?: number;
  selected_tariff?: string;
  final_price?: number;
  company?: string;
  contact_name?: string;
  city?: string;
  phone?: string;
  email?: string;
  lead_id?: string;
}

export interface PricingData {
  total_price: number;
  price_per_unit: number;
  materials_cost: number;
  printing_cost: number;
  delivery_cost: number;
  production_time_days: number;
  cost_difference?: number;
  cost_difference_percent?: number;
  notes?: string;
}

/**
 * Создает HTML контент для PDF с соблюдением дизайн-токенов
 */
export function createPDFContent(data: QuoteData, pricingData: PricingData): string {
  const { 
    page_bg, card_bg, accent_yellow, text_primary, text_secondary, 
    border_muted, link_blue, font_family, radius_md, radius_lg, 
    space_xs, space_sm, space_md, space_lg 
  } = DESIGN_TOKENS;

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        /* Базовые стили страницы */
        body {
            background-color: ${page_bg};
            font-family: ${font_family};
            margin: 0;
            padding: 18mm;
            color: ${text_primary};
            font-size: 11pt;
            line-height: 1.45;
        }
        
        .container {
            background-color: ${card_bg};
            border-radius: ${radius_lg};
            padding: ${space_lg};
            max-width: 100%;
        }
        
        /* Заголовки */
        h1 {
            font-size: 20pt;
            line-height: 1.25;
            background-color: ${accent_yellow};
            padding: 8px 12px;
            border-radius: ${radius_md};
            margin: 0 0 ${space_md} 0;
            color: ${text_primary};
            font-family: ${font_family};
        }
        
        h2 {
            font-size: 16pt;
            line-height: 1.25;
            background-color: ${accent_yellow};
            padding: 8px 12px;
            border-radius: ${radius_md};
            margin: ${space_lg} 0 ${space_md} 0;
            color: ${text_primary};
            font-family: ${font_family};
        }
        
        /* Текст */
        p, li {
            font-size: 11pt;
            line-height: 1.45;
            color: ${text_primary};
            margin: 6px 0;
            font-family: ${font_family};
        }
        
        .footnote {
            font-size: 9pt;
            color: ${text_secondary};
            margin-top: ${space_md};
            font-family: ${font_family};
        }
        
        /* P.S. блок */
        .ps {
            border-top: 1px solid ${border_muted};
            padding-top: 10px;
            font-style: italic;
            color: ${text_secondary};
            margin-top: ${space_md};
            font-family: ${font_family};
        }
        
        /* Таблицы */
        table {
            width: 100%;
            border-collapse: collapse;
            margin: ${space_md} 0;
            background-color: ${card_bg};
            font-family: ${font_family};
        }
        
        th, td {
            padding: 8px 10px;
            border-bottom: 1px solid ${border_muted};
            text-align: left;
            font-family: ${font_family};
        }
        
        .number {
            text-align: right;
        }
        
        .price {
            text-align: right;
            font-weight: bold;
        }
        
        /* Контакты */
        .contact {
            font-size: 9pt;
            color: ${link_blue};
            margin-top: ${space_lg};
            font-family: ${font_family};
        }
        
        /* Чекбоксы */
        .checkbox {
            margin: 6px 0;
            font-family: ${font_family};
        }
        
        /* Списки */
        ul {
            margin: 6px 0;
            padding-left: 20px;
        }
        
        li {
            margin: 6px 0;
        }
        
        /* Разделители */
        .divider {
            border-top: 1px solid ${border_muted};
            margin: ${space_md} 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Коммерческое предложение</h1>
        
        <h2>Параметры заказа</h2>
        <table>
            <tr>
                <td>Код FEFCO</td>
                <td class="number">${data.fefco}</td>
            </tr>
            <tr>
                <td>Тип картона</td>
                <td class="number">${data.cardboard_type}</td>
            </tr>
            <tr>
                <td>Марка картона</td>
                <td class="number">${data.cardboard_grade || 'не указана'}</td>
            </tr>
            <tr>
                <td>Размеры (Д×Ш×В)</td>
                <td class="number">${data.x_mm}×${data.y_mm}×${data.z_mm} мм</td>
            </tr>
            <tr>
                <td>Печать</td>
                <td class="number">${data.print || 'нет'}</td>
            </tr>
            <tr>
                <td>Тираж</td>
                <td class="number">${data.qty.toLocaleString()} шт</td>
            </tr>
            <tr>
                <td>Срок</td>
                <td class="number">${data.sla_type}</td>
            </tr>
        </table>
        
        <h2>Расчет стоимости</h2>
        <table>
            <tr>
                <td>Базовая стоимость партии</td>
                <td class="price">${data.batch_cost?.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || '0'} руб</td>
            </tr>
            <tr>
                <td>Выбранный тариф</td>
                <td class="price">${getTariffName(data.selected_tariff || 'standard')}</td>
            </tr>
            <tr style="border-top: 2px solid ${border_muted};">
                <td><strong>Итоговая стоимость партии</strong></td>
                <td class="price">${data.final_price?.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || '0'} руб</td>
            </tr>
            <tr>
                <td>Стоимость за единицу</td>
                <td class="price">${data.qty > 0 ? (data.final_price || 0 / data.qty).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0'} руб</td>
            </tr>
        </table>
        
        <h2>Варианты тарифов</h2>
        <table>
            <tr>
                <td>Стандартный тариф</td>
                <td class="price">${data.batch_cost?.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || '0'} руб</td>
            </tr>
            <tr>
                <td>Срочный тариф (+100%)</td>
                <td class="price">${(data.batch_cost || 0) * 2} руб</td>
            </tr>
            <tr>
                <td>Стратегический тариф (-10%)</td>
                <td class="price">${Math.round((data.batch_cost || 0) * 0.9)} руб</td>
            </tr>
        </table>
        
        <h2>Сроки и условия</h2>
        <ul>
            <li>Срок производства: ${pricingData.production_time_days} дней</li>
            <li>Гарантия качества: 12 месяцев</li>
            <li>Возможность корректировки заказа: до начала производства</li>
        </ul>
        
        ${data.batch_cost ? `
        <div class="ps">
            <strong>P.S.</strong> Базовая стоимость: ${data.batch_cost.toLocaleString()} руб. 
            Выбран тариф: ${getTariffName(data.selected_tariff || 'standard')}. 
            Итоговая стоимость: ${data.final_price?.toLocaleString() || '0'} руб.
        </div>
        ` : ''}
        
        <div class="contact">
            <p><strong>Контакты:</strong></p>
            <p>Email: ${data.email || 'не указан'}</p>
            <p>Телефон: ${data.phone || 'не указан'}</p>
            <p>Город: ${data.city || 'не указан'}</p>
        </div>
        
        
        <div class="footnote">
            <p>Данное предложение действительно в течение 7 дней с момента формирования.</p>
            <p>Окончательная стоимость может быть скорректирована в зависимости от текущих цен на материалы.</p>
        </div>
    </div>
</body>
</html>
  `;
}

/**
 * Генерирует PDF файл из HTML контента
 * В реальном приложении здесь будет вызов API для генерации PDF
 */
export async function generatePDF(data: QuoteData, pricingData: PricingData): Promise<string> {
  const htmlContent = createPDFContent(data, pricingData);
  
  // В реальном приложении здесь будет отправка на бэкэнд для генерации PDF
  // const response = await fetch('/api/generate-pdf', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ html: htmlContent })
  // });
  // const { pdf_url } = await response.json();
  // return pdf_url;
  
  // Для демонстрации возвращаем URL
  return `https://example.com/pdf/quote_${data.lead_id || 'unknown'}.pdf`;
}

/**
 * Создает данные для тестирования PDF генерации
 */
export function createTestData(): { data: QuoteData; pricingData: PricingData } {
  const baseCost = 50000;
  const selectedTariff = 'standard';
  const finalPrice = baseCost; // для стандартного тарифа цена не меняется

  const data: QuoteData = {
    fefco: '0201',
    cardboard_type: '3-х слойный гофрокартон',
    cardboard_grade: 'Т22 крафт',
    x_mm: 300,
    y_mm: 200,
    z_mm: 150,
    print: 'Да',
    qty: 1000,
    sla_type: 'стандарт',
    batch_cost: baseCost,
    selected_tariff: selectedTariff,
    final_price: finalPrice,
    company: 'ООО "Тестовая компания"',
    contact_name: 'Иван Иванов',
    city: 'Москва',
    phone: '+7 999 999-99-99',
    email: 'test@example.com',
    lead_id: 'test-123'
  };

  const pricingData: PricingData = {
    total_price: finalPrice,
    price_per_unit: finalPrice / data.qty,
    materials_cost: Math.round(finalPrice * 0.6), // 60% от итоговой цены
    printing_cost: Math.round(finalPrice * 0.3),  // 30% от итоговой цены
    delivery_cost: Math.round(finalPrice * 0.1),  // 10% от итоговой цены
    production_time_days: 7,
    notes: 'Расчет основан на выбранном тарифе'
  };

  return { data, pricingData };
}

/**
 * Валидирует данные перед генерацией PDF
 */
/**
 * Получает название тарифа по типу
 */
function getTariffName(tariffType: string): string {
  const tariffNames: Record<string, string> = {
    'standard': 'Стандартный',
    'urgent': 'Срочный (+100%)',
    'strategic': 'Стратегический (-10%)'
  };
  
  return tariffNames[tariffType] || 'Стандартный';
}

export function validatePDFData(data: QuoteData, pricingData: PricingData): string[] {
  const errors: string[] = [];

  if (!data.fefco) errors.push('Код FEFCO обязателен');
  if (!data.cardboard_type) errors.push('Тип картона обязателен');
  if (!data.sla_type) errors.push('Срок обязателен');
  if (data.qty <= 0) errors.push('Тираж должен быть больше 0');
  if (!data.batch_cost || data.batch_cost <= 0) errors.push('Базовая стоимость должна быть больше 0');

  return errors;
}
