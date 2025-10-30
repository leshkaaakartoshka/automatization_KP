import { useState } from 'react';
import { calculateTariffs, getAllTariffInfos, formatPrice, type TariffType } from '../calculations/tariff-calculator';

export function TariffDemo() {
  const [basePrice, setBasePrice] = useState<number>(50000);
  const [selectedTariff, setSelectedTariff] = useState<TariffType>('standard');

  const tariffs = calculateTariffs(basePrice, 1000, 10);
  const tariffInfos = getAllTariffInfos(basePrice, 1000, 10);

  return (
    <div style={{
      padding: 'var(--space-lg)',
      backgroundColor: 'var(--page-bg)',
      minHeight: '100vh',
      fontFamily: 'var(--font-family)'
    }}>
      <div style={{
        backgroundColor: 'var(--card-bg)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-lg)',
        marginBottom: 'var(--space-lg)'
      }}>
        <h1 style={{
          fontSize: '20pt',
          lineHeight: 1.25,
          background: 'var(--accent-yellow)',
          padding: '8px 12px',
          borderRadius: 'var(--radius-md)',
          margin: '0 0 var(--space-md) 0',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-family)'
        }}>
          Демонстрация системы тарифов
        </h1>

        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <label style={{
            display: 'block',
            marginBottom: 'var(--space-sm)',
            fontSize: '11pt',
            fontWeight: '500',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-family)'
          }}>
            Базовая стоимость партии (руб):
          </label>
          <input
            type="number"
            value={basePrice}
            onChange={(e) => setBasePrice(Number(e.target.value))}
            style={{
              width: '200px',
              padding: 'var(--space-sm)',
              border: '1px solid var(--border-muted)',
              borderRadius: 'var(--radius-md)',
              fontSize: '11pt',
              fontFamily: 'var(--font-family)'
            }}
          />
        </div>

        <h2 style={{
          fontSize: '16pt',
          lineHeight: 1.25,
          background: 'var(--accent-yellow)',
          padding: '8px 12px',
          borderRadius: 'var(--radius-md)',
          margin: 'var(--space-lg) 0 var(--space-md) 0',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-family)'
        }}>
          Варианты тарифов
        </h2>

        <div style={{ display: 'grid', gap: 'var(--space-sm)' }}>
          {tariffInfos.map((tariff) => (
            <label
              key={tariff.type}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: 'var(--space-md)',
                borderRadius: 'var(--radius-md)',
                border: selectedTariff === tariff.type 
                  ? '2px solid var(--link-blue)' 
                  : '1px solid var(--border-muted)',
                backgroundColor: selectedTariff === tariff.type 
                  ? '#EFF6FF' 
                  : 'var(--card-bg)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <input
                type="radio"
                name="tariff"
                value={tariff.type}
                checked={selectedTariff === tariff.type}
                onChange={(e) => setSelectedTariff(e.target.value as TariffType)}
                style={{ marginRight: 'var(--space-sm)' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '11pt',
                  fontWeight: '500',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-family)',
                  marginBottom: 'var(--space-xs)'
                }}>
                  {tariff.name}
                </div>
                <div style={{
                  fontSize: '9pt',
                  color: 'var(--text-secondary)',
                  fontFamily: 'var(--font-family)'
                }}>
                  {tariff.description}
                </div>
              </div>
              <div style={{
                fontSize: '14pt',
                fontWeight: 'bold',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-family)'
              }}>
                {formatPrice(tariff.price)} руб
              </div>
            </label>
          ))}
        </div>

        <div style={{
          marginTop: 'var(--space-lg)',
          padding: 'var(--space-md)',
          backgroundColor: '#F0FDF4',
          border: '1px solid #86EFAC',
          borderRadius: 'var(--radius-md)'
        }}>
          <h3 style={{
            fontSize: '12pt',
            fontWeight: 'bold',
            color: '#166534',
            margin: '0 0 var(--space-sm) 0',
            fontFamily: 'var(--font-family)'
          }}>
            Итоговая стоимость
          </h3>
          <div style={{
            fontSize: '16pt',
            fontWeight: 'bold',
            color: '#166534',
            fontFamily: 'var(--font-family)'
          }}>
            {formatPrice(tariffs[selectedTariff])} руб
          </div>
          <div style={{
            fontSize: '9pt',
            color: '#166534',
            marginTop: 'var(--space-xs)',
            fontFamily: 'var(--font-family)'
          }}>
            Выбран тариф: {tariffInfos.find(t => t.type === selectedTariff)?.name}
          </div>
        </div>
      </div>
    </div>
  );
}
