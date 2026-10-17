export type ProviderConfig = Readonly<{
  name: string;
  baseUrl: string;
  apiKey: string;
  model: string;
  timeoutMs: number;
}>;
