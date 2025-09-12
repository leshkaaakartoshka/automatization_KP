import React from 'react';

interface FormFieldProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  required?: boolean;
}

export function FormField({ id, label, hint, error, children, required }: FormFieldProps) {
  const describedByIds = [hint ? `${id}-hint` : undefined, error ? `${id}-error` : undefined]
    .filter(Boolean)
    .join(' ');
  return (
    <div className="mb-4">
      <label 
        htmlFor={id} 
        className="block text-sm font-medium"
        style={{ 
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-family)'
        }}
      >
        {label} {required && <span style={{ color: '#DC2626' }}>*</span>}
      </label>
      <div className="mt-1">
        {React.isValidElement(children)
          ? React.cloneElement(children as React.ReactElement<any>, {
              'aria-describedby': describedByIds || undefined,
              'aria-invalid': error ? true : undefined,
            })
          : children}
      </div>
      {hint && !error && (
        <p 
          id={`${id}-hint`} 
          className="mt-1 text-xs"
          style={{ 
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-family)'
          }}
        >
          {hint}
        </p>
      )}
      {error && (
        <p 
          id={`${id}-error`} 
          className="mt-1 text-sm"
          style={{ 
            color: '#DC2626',
            fontFamily: 'var(--font-family)'
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

interface FormRowProps {
  columns?: 1 | 2 | 3;
  children: React.ReactNode;
}

export function FormRow({ columns = 2, children }: FormRowProps) {
  const gridCols = columns === 1 ? 'grid-cols-1' : columns === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3';
  return <div className={`grid ${gridCols} gap-4`}>{children}</div>;
}

type Status = 'idle' | 'loading' | 'success' | 'error';

export function StatusBar({ status, message }: { status: Status; message?: string }) {
  const getStatusStyle = (status: Status) => {
    switch (status) {
      case 'idle':
        return { display: 'none' };
      case 'loading':
        return {
          backgroundColor: '#EFF6FF',
          color: '#1E40AF',
          borderColor: '#93C5FD',
          border: '1px solid #93C5FD',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-sm)',
          marginTop: 'var(--space-sm)',
          fontSize: '11pt',
          fontFamily: 'var(--font-family)'
        };
      case 'success':
        return {
          backgroundColor: '#F0FDF4',
          color: '#166534',
          borderColor: '#86EFAC',
          border: '1px solid #86EFAC',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-sm)',
          marginTop: 'var(--space-sm)',
          fontSize: '11pt',
          fontFamily: 'var(--font-family)'
        };
      case 'error':
        return {
          backgroundColor: '#FEF2F2',
          color: '#DC2626',
          borderColor: '#FCA5A5',
          border: '1px solid #FCA5A5',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-sm)',
          marginTop: 'var(--space-sm)',
          fontSize: '11pt',
          fontFamily: 'var(--font-family)'
        };
    }
  };

  const text =
    status === 'loading' ? 'Отправляем запрос…' : status === 'success' ? 'Готово. PDF сгенерирован.' : message || '';
  return (
    <div 
      role="status" 
      aria-live="polite" 
      style={getStatusStyle(status)}
    >
      {text}
    </div>
  );
}

export function ResultCard({ pdfUrl, leadId, onClick }: { pdfUrl: string; leadId?: string; onClick?: () => void }) {
  return (
    <div 
      style={{
        marginTop: 'var(--space-sm)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-muted)',
        padding: 'var(--space-sm)',
        backgroundColor: 'var(--card-bg)',
        fontFamily: 'var(--font-family)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p 
            style={{
              fontSize: '11pt',
              color: 'var(--text-secondary)',
              margin: '0 0 var(--space-xs) 0',
              fontFamily: 'var(--font-family)'
            }}
          >
            Lead ID: {leadId}
          </p>
          <a
            style={{
              marginTop: 'var(--space-xs)',
              display: 'inline-flex',
              alignItems: 'center',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--link-blue)',
              padding: 'var(--space-sm) var(--space-md)',
              fontSize: '11pt',
              fontWeight: '500',
              color: 'white',
              textDecoration: 'none',
              fontFamily: 'var(--font-family)'
            }}
            href={pdfUrl}
            target="_blank"
            rel="noreferrer noopener"
            onClick={onClick}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#003366';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--link-blue)';
            }}
          >
            Скачать PDF
          </a>
        </div>
        <div 
          style={{
            fontSize: '11pt',
            color: '#166534',
            fontFamily: 'var(--font-family)'
          }}
        >
          PDF готов
        </div>
      </div>
    </div>
  );
}

