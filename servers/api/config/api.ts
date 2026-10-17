import type { ApiConfig, ValidatedApiEnvironment } from "../types/index.js";

export const createApiConfig = (environment: ValidatedApiEnvironment): ApiConfig => Object.freeze({
  environment: environment.NODE_ENV,
  host: environment.API_HOST,
  port: environment.API_PORT,
  webOrigin: environment.WEB_ORIGIN,
  logLevel: environment.LOG_LEVEL,
  queueIntervalMs: environment.QUEUE_INTERVAL_MS ?? 120_000,
  ...(environment.MONGODB_URI ? { mongodbUri: environment.MONGODB_URI } : {})
});
