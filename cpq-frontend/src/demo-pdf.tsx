// Демонстрационный файл для показа PDF генерации
import React, { useState } from 'react';
import { PDFPreview, createTestData, generatePDF, validatePDFData } from './pdf-generator';
import { QuoteData, PricingData } from './pdf-generator';

export function PDFDemo() {
  const [data, setData] = useState<QuoteData | null>(null);
  const [pricingData, setPricingData] = useState<PricingData | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTestData = () => {
    const testData = createTestData();
    setData(testData.data);
    setPricingData(testData.pricingData);
    setError(null);
  };

  const generatePDFDemo = async () => {
    if (!data || !pricingData) {
      setError('Сначала загрузите тестовые данные');
      return;
    }

    const validationErrors = validatePDFData(data, pricingData);
    if (validationErrors.length > 0) {
      setError(`Ошибки валидации: ${validationErrors.join(', ')}`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = await generatePDF(data, pricingData);
      setPdfUrl(url);
    } catch (err) {
      setError(`Ошибка генерации PDF: ${err}`);
    } finally {
      setLoading(false);
    }
  };

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
          Демонстрация PDF генерации
        </h1>

        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <button
            onClick={loadTestData}
            style={{
              backgroundColor: 'var(--link-blue)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-sm) var(--space-md)',
              fontSize: '11pt',
              fontFamily: 'var(--font-family)',
              cursor: 'pointer',
              marginRight: 'var(--space-sm)'
            }}
          >
            Загрузить тестовые данные
          </button>

          <button
            onClick={generatePDFDemo}
            disabled={!data || !pricingData || loading}
            style={{
              backgroundColor: data && pricingData && !loading ? 'var(--accent-yellow)' : '#ccc',
              color: 'var(--text-primary)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-sm) var(--space-md)',
              fontSize: '11pt',
              fontFamily: 'var(--font-family)',
              cursor: data && pricingData && !loading ? 'pointer' : 'not-allowed'
            }}
          >
            {loading ? 'Генерируем PDF...' : 'Сгенерировать PDF'}
          </button>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#FEF2F2',
            color: '#DC2626',
            border: '1px solid #FCA5A5',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-sm)',
            marginBottom: 'var(--space-md)',
            fontSize: '11pt',
            fontFamily: 'var(--font-family)'
          }}>
            {error}
          </div>
        )}

        {pdfUrl && (
          <div style={{
            backgroundColor: '#F0FDF4',
            color: '#166534',
            border: '1px solid #86EFAC',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-sm)',
            marginBottom: 'var(--space-md)',
            fontSize: '11pt',
            fontFamily: 'var(--font-family)'
          }}>
            PDF сгенерирован! <a href={pdfUrl} target="_blank" rel="noreferrer noopener" style={{ color: 'var(--link-blue)' }}>Скачать</a>
          </div>
        )}
      </div>

      {data && pricingData && (
        <PDFPreview data={data} pricingData={pricingData} />
      )}
    </div>
  );
}
