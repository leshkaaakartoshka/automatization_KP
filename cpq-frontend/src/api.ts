import type { QuoteFormPayload } from './types';

const API_BASE = import.meta.env.VITE_API_BASE ?? '';

function getCsrfToken(): string | undefined {
  const match = document.cookie.match(/csrftoken=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : undefined;
}

export interface ApiSuccess {
  ok: true;
  pdf_url: string;
  lead_id: string;
}

export interface ApiError {
  ok: false;
  error: string;
}

export type ApiResponse = ApiSuccess | ApiError;

export async function postQuote(payload: QuoteFormPayload, signal?: AbortSignal): Promise<ApiResponse> {
  // debug: ensure submission executed in tests
  // eslint-disable-next-line no-console
  console.log('postQuote called', payload);
  console.log('Sending request to:', `${API_BASE}/api/quote`);
  console.log('Request payload:', JSON.stringify(payload, null, 2));
  
  try {
    // Создаем AbortController с timeout если не передан signal
    const controller = signal ? { signal } : new AbortController();
    const timeoutId = setTimeout(() => {
      if (!signal && 'abort' in controller) {
        controller.abort();
      }
    }, 10000); // 10 секунд timeout

    const res = await fetch(`${API_BASE}/api/quote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': getCsrfToken() ?? '',
      },
      credentials: 'include',
      body: JSON.stringify(payload),
      signal: 'signal' in controller ? controller.signal : signal,
    });

    clearTimeout(timeoutId);

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await res.text().catch(() => '');
      return { ok: false, error: `Unexpected response: ${text || res.statusText}` };
    }
    const json = await res.json();
    
    // Если статус не 200, обрабатываем как ошибку
    if (!res.ok) {
      if (res.status === 422 && json.detail) {
        // Ошибка валидации - форматируем сообщения
        const validationErrors = Array.isArray(json.detail) 
          ? json.detail.map((err: any) => `${err.loc?.join('.')}: ${err.msg}`).join('; ')
          : json.detail;
        return { ok: false, error: `Ошибка валидации: ${validationErrors}` };
      }
      return { ok: false, error: json.error || json.message || `HTTP ${res.status}: ${res.statusText}` };
    }
    
    return json as ApiResponse;
  } catch (error) {
    // Обрабатываем различные типы ошибок
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return { ok: false, error: 'Request timeout - сервер не отвечает' };
      }
      if (error.message.includes('fetch')) {
        return { ok: false, error: 'Network error - проверьте подключение к интернету' };
      }
      return { ok: false, error: `Request failed: ${error.message}` };
    }
    return { ok: false, error: 'Unknown error occurred' };
  }
}

