import { getResolvedTaskProvider, getTaskConfig, type AiTaskName } from "./provider-config.ts";

export type ChatMessageRole = "system" | "user" | "assistant";

export interface ChatMessage {
  role: ChatMessageRole;
  content: string;
}

export interface ChatCompletionRequest {
  task: AiTaskName;
  messages: ChatMessage[];
  temperature?: number;
  maxOutputTokens?: number;
  responseFormat?: { type: "json_object" };
}

export interface ChatCompletionResult {
  provider: string;
  model: string;
  content: string;
  finishReason?: string;
  raw: unknown;
}

export async function createChatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResult> {
  const provider = getResolvedTaskProvider(request.task);
  const taskConfig = getTaskConfig(request.task);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), provider.timeoutMs);

  try {
    const response = await fetch(`${provider.baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${provider.apiKey}`,
      },
      body: JSON.stringify({
        model: provider.model,
        stream: false,
        temperature: request.temperature ?? taskConfig.temperature ?? 0,
        max_tokens: request.maxOutputTokens ?? taskConfig.maxOutputTokens,
        response_format: request.responseFormat,
        messages: request.messages,
      }),
    });

    const raw = await response.json();
    if (!response.ok) {
      throw new Error(`[ai-chat] ${response.status} ${response.statusText}: ${JSON.stringify(raw)}`);
    }

    const choice = raw?.choices?.[0];
    const content = choice?.message?.content;
    if (typeof content !== "string" || content.trim().length === 0) {
      throw new Error("[ai-chat] empty response content.");
    }

    return {
      provider: provider.provider,
      model: provider.model,
      content,
      finishReason: choice?.finish_reason,
      raw,
    };
  } finally {
    clearTimeout(timeout);
  }
}
