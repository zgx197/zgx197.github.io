export type AiProviderName = "kimi" | "openai" | "deepseek" | "custom";

export type AiTaskName =
  | "structural_parse"
  | "summarize_project"
  | "match_project"
  | "review_import";

export interface AiProviderConfig {
  provider: AiProviderName;
  enabled: boolean;
  baseUrl: string;
  model: string;
  apiKeyEnv: string;
  apiKey?: string;
  timeoutMs?: number;
  stream?: boolean;
}

export interface AiTaskConfig {
  task: AiTaskName;
  provider: AiProviderName;
  model?: string;
  temperature?: number;
  stream?: boolean;
  maxOutputTokens?: number;
}

export interface ResolvedAiProviderConfig {
  provider: AiProviderName;
  enabled: true;
  baseUrl: string;
  model: string;
  apiKeyEnv: string;
  apiKey: string;
  timeoutMs: number;
  stream: boolean;
}

export interface ProviderDefaults {
  baseUrl: string;
  model: string;
  apiKeyEnv: string;
}

export const DEFAULT_PROVIDERS: Record<AiProviderName, ProviderDefaults> = {
  kimi: {
    baseUrl: "https://api.moonshot.cn/v1",
    model: "moonshot-v1-8k",
    apiKeyEnv: "KIMI_API_KEY",
  },
  openai: {
    baseUrl: "https://api.openai.com/v1",
    model: "gpt-4o-mini",
    apiKeyEnv: "OPENAI_API_KEY",
  },
  deepseek: {
    baseUrl: "https://api.deepseek.com/v1",
    model: "deepseek-chat",
    apiKeyEnv: "DEEPSEEK_API_KEY",
  },
  custom: {
    baseUrl: "",
    model: "",
    apiKeyEnv: "CUSTOM_AI_API_KEY",
  },
};

const DEFAULT_TIMEOUT_MS = 60_000;
const DEFAULT_STREAM = false;
const DEFAULT_PROVIDER: AiProviderName = "kimi";

const TASK_ENV_KEYS: Record<AiTaskName, string> = {
  structural_parse: "AI_STRUCTURAL_PROVIDER",
  summarize_project: "AI_SUMMARIZER_PROVIDER",
  match_project: "AI_MATCHER_PROVIDER",
  review_import: "AI_REVIEW_PROVIDER",
};

const TASK_DEFAULTS: Record<AiTaskName, Omit<AiTaskConfig, "task">> = {
  structural_parse: {
    provider: DEFAULT_PROVIDER,
    temperature: 0,
    stream: false,
    maxOutputTokens: 8_000,
  },
  summarize_project: {
    provider: DEFAULT_PROVIDER,
    temperature: 0.2,
    stream: false,
    maxOutputTokens: 4_000,
  },
  match_project: {
    provider: DEFAULT_PROVIDER,
    temperature: 0,
    stream: false,
    maxOutputTokens: 2_000,
  },
  review_import: {
    provider: DEFAULT_PROVIDER,
    temperature: 0.2,
    stream: false,
    maxOutputTokens: 4_000,
  },
};

function readEnv(name: string): string | undefined {
  const value = process.env[name];
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function readBooleanEnv(name: string, fallback: boolean): boolean {
  const value = readEnv(name);
  if (!value) {
    return fallback;
  }

  if (["1", "true", "yes", "on"].includes(value.toLowerCase())) {
    return true;
  }
  if (["0", "false", "no", "off"].includes(value.toLowerCase())) {
    return false;
  }

  return fallback;
}

function readNumberEnv(name: string, fallback: number): number {
  const value = readEnv(name);
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function readFiniteNumberEnv(name: string, fallback: number): number {
  const value = readEnv(name);
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function isProviderName(value: string): value is AiProviderName {
  return value === "kimi" || value === "openai" || value === "deepseek" || value === "custom";
}

function readProviderEnvOverride(provider: AiProviderName, field: "baseUrl" | "model"): string | undefined {
  const upper = provider.toUpperCase();
  const key = field === "baseUrl" ? `${upper}_BASE_URL` : `${upper}_MODEL`;
  return readEnv(key);
}

function readProviderEnabled(provider: AiProviderName): boolean {
  const key = `${provider.toUpperCase()}_ENABLED`;
  return readBooleanEnv(key, true);
}

export function getProviderConfig(provider: AiProviderName): AiProviderConfig {
  const defaults = DEFAULT_PROVIDERS[provider];
  const apiKey = readEnv(defaults.apiKeyEnv);

  return {
    provider,
    enabled: readProviderEnabled(provider),
    baseUrl: readProviderEnvOverride(provider, "baseUrl") ?? defaults.baseUrl,
    model: readProviderEnvOverride(provider, "model") ?? defaults.model,
    apiKeyEnv: defaults.apiKeyEnv,
    apiKey,
    timeoutMs: readNumberEnv("AI_TIMEOUT_MS", DEFAULT_TIMEOUT_MS),
    stream: readBooleanEnv("AI_ENABLE_STREAM", DEFAULT_STREAM),
  };
}

export function getDefaultProviderName(): AiProviderName {
  const configured = readEnv("AI_DEFAULT_PROVIDER");
  if (configured && isProviderName(configured)) {
    return configured;
  }

  return DEFAULT_PROVIDER;
}

export function getTaskConfig(task: AiTaskName): AiTaskConfig {
  const defaults = TASK_DEFAULTS[task];
  const configuredProvider = readEnv(TASK_ENV_KEYS[task]);
  const provider = configuredProvider && isProviderName(configuredProvider)
    ? configuredProvider
    : getDefaultProviderName();

  return {
    task,
    provider,
    model: readEnv(`AI_${task.toUpperCase()}_MODEL`),
    temperature: readFiniteNumberEnv(`AI_${task.toUpperCase()}_TEMPERATURE`, defaults.temperature ?? 0),
    stream: readBooleanEnv(`AI_${task.toUpperCase()}_STREAM`, defaults.stream ?? DEFAULT_STREAM),
    maxOutputTokens: readNumberEnv(
      `AI_${task.toUpperCase()}_MAX_OUTPUT_TOKENS`,
      defaults.maxOutputTokens ?? 4_000,
    ),
  };
}

export function getResolvedTaskProvider(task: AiTaskName): ResolvedAiProviderConfig {
  const taskConfig = getTaskConfig(task);
  const providerConfig = getProviderConfig(taskConfig.provider);

  if (!providerConfig.enabled) {
    throw new Error(
      `[ai-provider] provider "${providerConfig.provider}" is disabled but task "${task}" is routed to it.`,
    );
  }

  const baseUrl = providerConfig.baseUrl.trim();
  if (!baseUrl) {
    throw new Error(
      `[ai-provider] provider "${providerConfig.provider}" is missing baseUrl. Check ${providerConfig.provider.toUpperCase()}_BASE_URL.`,
    );
  }

  const model = (taskConfig.model ?? providerConfig.model).trim();
  if (!model) {
    throw new Error(
      `[ai-provider] provider "${providerConfig.provider}" is missing model. Check ${providerConfig.provider.toUpperCase()}_MODEL.`,
    );
  }

  const apiKey = providerConfig.apiKey?.trim();
  if (!apiKey) {
    throw new Error(
      `[ai-provider] provider "${providerConfig.provider}" is missing API key from env "${providerConfig.apiKeyEnv}".`,
    );
  }

  return {
    provider: providerConfig.provider,
    enabled: true,
    baseUrl,
    model,
    apiKeyEnv: providerConfig.apiKeyEnv,
    apiKey,
    timeoutMs: providerConfig.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    stream: taskConfig.stream ?? providerConfig.stream ?? DEFAULT_STREAM,
  };
}

export function listProviderConfigs(): AiProviderConfig[] {
  return (Object.keys(DEFAULT_PROVIDERS) as AiProviderName[]).map((provider) => getProviderConfig(provider));
}

export function listTaskConfigs(): AiTaskConfig[] {
  return (Object.keys(TASK_DEFAULTS) as AiTaskName[]).map((task) => getTaskConfig(task));
}

