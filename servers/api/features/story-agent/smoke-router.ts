// servers/api/features/story-agent/smoke-router.ts
import { config } from 'dotenv';
config();

import { createLlmGateway } from '../../integrations/index.js';
import { createStoryAgentProviderRouter } from './story-agent.router.js';
import { loadRouterConfig } from './story-agent.config.js';
import { createLogger } from '@workspace/logging'; // ya jo bhi tera logger hai

const router = createStoryAgentProviderRouter({
  config: loadRouterConfig(),
  createClient: createLlmGateway({ fetch: globalThis.fetch }).createClient,
  logger: createLogger({
    service: 'story-agent-router',
    level: 'info',           // optional
    format: 'pretty',        // optional — 'json' ya 'pretty'
    colorize: true           // optional — dev me accha lagta hai
  }),
  clock: { now: () => Date.now() }
});

const result = await router.complete({
  profile: 'generate',
  messages: [{ role: 'user', content: 'Reply with JSON {"ok":true}' }]
});

console.log('Provider:', result.provider);
console.log('Text:', result.text);
