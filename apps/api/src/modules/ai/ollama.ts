import { env } from "../../config/env";

interface OllamaTagsResponse {
  models?: Array<{
    name: string;
  }>;
}

interface OllamaGenerateResponse {
  response?: string;
}

interface OllamaGenerateOptions {
  numPredict?: number;
  temperature?: number;
}

export async function isOllamaModelAvailable() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), Math.min(env.OLLAMA_TIMEOUT_MS, 6000));
    const response = await fetch(`${env.OLLAMA_BASE_URL}/api/tags`, {
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return false;
    }

    const payload = (await response.json()) as OllamaTagsResponse;
    return payload.models?.some((model) => model.name === env.OLLAMA_MODEL) ?? false;
  } catch {
    return false;
  }
}

export async function generateWithOllama(
  system: string,
  prompt: string,
  options?: OllamaGenerateOptions
) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), env.OLLAMA_TIMEOUT_MS);
    const response = await fetch(`${env.OLLAMA_BASE_URL}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: env.OLLAMA_MODEL,
        system,
        prompt,
        stream: false,
        options: {
          temperature: options?.temperature ?? 0.2,
          num_predict: options?.numPredict ?? env.OLLAMA_NUM_PREDICT
        }
      })
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as OllamaGenerateResponse;
    return payload.response?.trim() || null;
  } catch {
    return null;
  }
}
