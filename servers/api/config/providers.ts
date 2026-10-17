// servers/api/config/providers.ts
export const PROVIDER_DEFAULTS = Object.freeze({
  timeoutMs: 30_000,
  cooldownMs: 60_000
});

export {
  readProviderConfigs,
  readProviderRouterConfig,
  type ProviderProfile,
  type ProviderRouterConfig
} from "../validation/providers.validation.js";