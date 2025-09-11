// ChatGPT API Client (Deprecated)
// Этот файл больше не используется в основном потоке приложения

export interface ChatGPTMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatGPTResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

/**
 * @deprecated Больше не используется. Логика расчета перенесена во фронтенд.
 */
export async function callChatGPTAPI(messages: ChatGPTMessage[]): Promise<ChatGPTResponse> {
  throw new Error('ChatGPT integration is deprecated. Use tariff calculator instead.');
}

/**
 * @deprecated Больше не используется. Логика расчета перенесена во фронтенд.
 */
export function buildChatGPTPrompt(data: any): ChatGPTMessage[] {
  throw new Error('ChatGPT integration is deprecated. Use tariff calculator instead.');
}
