import "dotenv/config";

import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  CLIENT_ORIGIN: z.string().url().default("http://localhost:3000"),
  OLLAMA_BASE_URL: z.string().url().default("http://127.0.0.1:11434"),
  OLLAMA_MODEL: z.string().default("llama2:7b"),
  OLLAMA_TIMEOUT_MS: z.coerce.number().int().positive().default(60000),
  OLLAMA_NUM_PREDICT: z.coerce.number().int().positive().default(120)
});

export const env = envSchema.parse({
  PORT: process.env.PORT,
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN,
  OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL,
  OLLAMA_MODEL: process.env.OLLAMA_MODEL,
  OLLAMA_TIMEOUT_MS: process.env.OLLAMA_TIMEOUT_MS,
  OLLAMA_NUM_PREDICT: process.env.OLLAMA_NUM_PREDICT
});
