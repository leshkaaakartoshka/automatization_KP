import type { QuoteData, PricingData } from '../pdf-generator';
import { DESIGN_TOKENS } from '../pdf-generator';

interface PDFPreviewProps {
  data: QuoteData;
  pricingData: PricingData;
  className?: string;
}

export function PDFPreview({ data, pricingData, className = '' }: PDFPreviewProps) {
  const { 
    page_bg, card_bg, accent_yellow, text_primary, text_secondary, 
    border_muted, link_blue, font_family, radius_md, radius_lg, 
    space_md, space_lg 
  } = DESIGN_TOKENS;

  return (
    <div 
      className={`pdf-preview ${className}`}
      style={{
        background: page_bg,
        padding: '18mm',
        fontFamily: font_family,
        color: text_primary,
        minHeight: '297mm', // A4 height
        width: '210mm', // A4 width
        margin: '0 auto',
        boxSizing: 'border-box'
      }}
    >
      <div 
        style={{
          background: card_bg,
          borderRadius: radius_lg,
          padding: space_lg,
          maxWidth: '100%'
        }}
      >
        {/* Заголовок H1 */}
        <h1 
          style={{
            fontSize: '20pt',
            lineHeight: 1.25,
            background: accent_yellow,
            padding: '8px 12px',
            borderRadius: radius_md,
            margin: `0 0 ${space_md}px 0`,
            color: text_primary,
            fontFamily: font_family
          }}
        >
          Коммерческое предложение
        </h1>
        
        {/* Параметры заказа */}
        <h2 
          style={{
            fontSize: '16pt',
            lineHeight: 1.25,
            background: accent_yellow,
            padding: '8px 12px',
            borderRadius: radius_md,
            margin: `${space_lg}px 0 ${space_md}px 0`,
            color: text_primary,
            fontFamily: font_family
          }}
        >
          Параметры заказа
        </h2>
        
        <table 
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            margin: `${space_md}px 0`,
            background: card_bg,
            fontFamily: font_family
          }}
        >
          <tbody>
            <tr>
              <td style={{ padding: '8px 10px', borderBottom: `1px solid ${border_muted}` }}>Код FEFCO</td>
              <td style={{ padding: '8px 10px', borderBottom: `1px solid ${border_muted}`, textAlign: 'right' }}>{data.fefco}</td>
            </tr>
            <tr>
              <td style={{ padding: '8px 10px', borderBottom: `1px solid ${border_muted}` }}>Тип картона</td>
              <td style={{ padding: '8px 10px', borderBottom: `1px solid ${border_muted}`, textAlign: 'right' }}>{data.cardboard_type}</td>
            </tr>
            <tr>
              <td style={{ padding: '8px 10px', borderBottom: `1px solid ${border_muted}` }}>Марка картона</td>
              <td style={{ padding: '8px 10px', borderBottom: `1px solid ${border_muted}`, textAlign: 'right' }}>{data.cardboard_grade || 'не указана'}</td>
            </tr>
            <tr>
              <td style={{ padding: '8px 10px', borderBottom: `1px solid ${border_muted}` }}>Размеры (Д×Ш×В)</td>
              <td style={{ padding: '8px 10px', borderBottom: `1px solid ${border_muted}`, textAlign: 'right' }}>{data.x_mm}×{data.y_mm}×{data.z_mm} мм</td>
            </tr>
            <tr>
              <td style={{ padding: '8px 10px', borderBottom: `1px solid ${border_muted}` }}>Печать</td>
              <td style={{ padding: '8px 10px', borderBottom: `1px solid ${border_muted}`, textAlign: 'right' }}>{data.print || 'нет'}</td>
            </tr>
            <tr>
              <td style={{ padding: '8px 10px', borderBottom: `1px solid ${border_muted}` }}>Тираж</td>
              <td style={{ padding: '8px 10px', borderBottom: `1px solid ${border_muted}`, textAlign: 'right' }}>{data.qty.toLocaleString()} шт</td>
            </tr>
            <tr>
              <td style={{ padding: '8px 10px', borderBottom: `1px solid ${border_muted}` }}>Срок</td>
              <td style={{ padding: '8px 10px', borderBottom: `1px solid ${border_muted}`, textAlign: 'right' }}>{data.sla_type}</td>
            </tr>
          </tbody>
        </table>
        
        {/* Расчет стоимости */}
        <h2 
          style={{
            fontSize: '16pt',
            lineHeight: 1.25,
            background: accent_yellow,
            padding: '8px 12px',
            borderRadius: radius_md,
            margin: `${space_lg}px 0 ${space_md}px 0`,
            color: text_primary,
            fontFamily: font_family
          }}
        >
          Расчет стоимости
        </h2>
        
        <table 
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            margin: `${space_md}px 0`,
            background: card_bg,
            fontFamily: font_family
          }}
        >
          <tbody>
            <tr>
              <td style={{ padding: '8px 10px', borderBottom: `1px solid ${border_muted}` }}>Материалы</td>
              <td style={{ padding: '8px 10px', borderBottom: `1px solid ${border_muted}`, textAlign: 'right', fontWeight: 'bold' }}>
                {pricingData.materials_cost.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} руб
              </td>
            </tr>
            <tr>
              <td style={{ padding: '8px 10px', borderBottom: `1px solid ${border_muted}` }}>Печать</td>
              <td style={{ padding: '8px 10px', borderBottom: `1px solid ${border_muted}`, textAlign: 'right', fontWeight: 'bold' }}>
                {pricingData.printing_cost.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} руб
              </td>
            </tr>
            <tr>
              <td style={{ padding: '8px 10px', borderBottom: `1px solid ${border_muted}` }}>Доставка</td>
              <td style={{ padding: '8px 10px', borderBottom: `1px solid ${border_muted}`, textAlign: 'right', fontWeight: 'bold' }}>
                {pricingData.delivery_cost.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} руб
              </td>
            </tr>
            <tr style={{ borderTop: `2px solid ${border_muted}` }}>
              <td style={{ padding: '8px 10px', borderBottom: `1px solid ${border_muted}`, fontWeight: 'bold' }}>Общая стоимость партии</td>
              <td style={{ padding: '8px 10px', borderBottom: `1px solid ${border_muted}`, textAlign: 'right', fontWeight: 'bold' }}>
                {pricingData.total_price.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} руб
              </td>
            </tr>
            <tr>
              <td style={{ padding: '8px 10px', borderBottom: `1px solid ${border_muted}` }}>Стоимость за единицу</td>
              <td style={{ padding: '8px 10px', borderBottom: `1px solid ${border_muted}`, textAlign: 'right', fontWeight: 'bold' }}>
                {pricingData.price_per_unit.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} руб
              </td>
            </tr>
          </tbody>
        </table>
        
        {/* Сроки и условия */}
        <h2 
          style={{
            fontSize: '16pt',
            lineHeight: 1.25,
            background: accent_yellow,
            padding: '8px 12px',
            borderRadius: radius_md,
            margin: `${space_lg}px 0 ${space_md}px 0`,
            color: text_primary,
            fontFamily: font_family
          }}
        >
          Сроки и условия
        </h2>
        
        <ul style={{ margin: '6px 0', paddingLeft: '20px' }}>
          <li style={{ margin: '6px 0', fontSize: '11pt', lineHeight: 1.45, color: text_primary, fontFamily: font_family }}>
            Срок производства: {pricingData.production_time_days} дней
          </li>
          <li style={{ margin: '6px 0', fontSize: '11pt', lineHeight: 1.45, color: text_primary, fontFamily: font_family }}>
            Гарантия качества: 12 месяцев
          </li>
          <li style={{ margin: '6px 0', fontSize: '11pt', lineHeight: 1.45, color: text_primary, fontFamily: font_family }}>
            Возможность корректировки заказа: до начала производства
          </li>
        </ul>
        
        {/* P.S. блок */}
        {data.batch_cost && (
          <div 
            style={{
              borderTop: `1px solid ${border_muted}`,
              paddingTop: '10px',
              fontStyle: 'italic',
              color: text_secondary,
              marginTop: space_md,
              fontFamily: font_family
            }}
          >
            <strong>P.S.</strong> Ожидаемая стоимость: {data.batch_cost.toLocaleString()} руб.
            {pricingData.cost_difference !== undefined && (
              <> Разница: {pricingData.cost_difference.toLocaleString()} руб ({pricingData.cost_difference_percent?.toFixed(1) || 0}%)</>
            )}
          </div>
        )}
        
        {/* Контакты */}
        <div 
          style={{
            fontSize: '9pt',
            color: link_blue,
            marginTop: space_lg,
            fontFamily: font_family
          }}
        >
          <p style={{ margin: '6px 0', fontSize: '9pt', lineHeight: 1.45, color: link_blue, fontFamily: font_family }}>
            <strong>Контакты:</strong>
          </p>
          <p style={{ margin: '6px 0', fontSize: '9pt', lineHeight: 1.45, color: link_blue, fontFamily: font_family }}>
            Email: {data.email || 'не указан'}
          </p>
          <p style={{ margin: '6px 0', fontSize: '9pt', lineHeight: 1.45, color: link_blue, fontFamily: font_family }}>
            Телефон: {data.phone || 'не указан'}
          </p>
          <p style={{ margin: '6px 0', fontSize: '9pt', lineHeight: 1.45, color: link_blue, fontFamily: font_family }}>
            Город: {data.city || 'не указан'}
          </p>
        </div>
        
        {/* Сноски */}
        <div 
          style={{
            fontSize: '9pt',
            color: text_secondary,
            marginTop: space_md,
            fontFamily: font_family
          }}
        >
          <p style={{ margin: '6px 0', fontSize: '9pt', lineHeight: 1.45, color: text_secondary, fontFamily: font_family }}>
            Данное предложение действительно в течение 7 дней с момента формирования.
          </p>
          <p style={{ margin: '6px 0', fontSize: '9pt', lineHeight: 1.45, color: text_secondary, fontFamily: font_family }}>
            Окончательная стоимость может быть скорректирована в зависимости от текущих цен на материалы.
          </p>
        </div>
      </div>
    </div>
  );
}
