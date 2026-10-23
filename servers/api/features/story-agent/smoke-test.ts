// servers/api/features/story-agent/smoke-provider.ts
import { config } from 'dotenv';
config();

import {
  createLlmGateway,
  type LlmTransportError
} from '../../integrations/index.js';

const providers = [
  {
    name: 'gemini',
    baseUrl: process.env.LLM_BASE_URL ?? '',
    apiKey: process.env.LLM_API_KEY ?? '',
    model: process.env.LLM_MODEL ?? '',
    timeoutMs: 30_000
  },
  {
    name: 'groq',
    baseUrl: process.env.FALLBACK_LLM_BASE_URL ?? '',
    apiKey: process.env.FALLBACK_LLM_API_KEY ?? '',
    model: process.env.FALLBACK_LLM_MODEL ?? '',
    timeoutMs: 30_000
  }
];

const messages = [{ role: 'user' as const, content: 'Reply with JSON {"ok":true}' }];
const gateway = createLlmGateway({ fetch: globalThis.fetch });

for (const provider of providers) {
  console.log(`\n→ Testing ${provider.name} (${provider.model})...`);
  try {
    const client = gateway.createClient(provider);
    const result = await client.complete({ messages });
    console.log('✓ Success');
    console.log('  Provider:', result.provider);
    console.log('  Text:', result.text.substring(0, 120));
    console.log('  Tokens:', result.usage.inputTokens, 'in /', result.usage.outputTokens, 'out');
  } catch (error: unknown) {
    const err = error as Partial<LlmTransportError>;
    console.log('✗ Failed');
    console.log('  Kind:', err.kind ?? 'unknown');
    console.log('  Status:', err.status ?? 'N/A');
    console.log('  Message:', error instanceof Error ? error.message : String(error));
  }
}
