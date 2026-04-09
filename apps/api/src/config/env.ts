import "dotenv/config";

import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  CLIENT_ORIGIN: z.string().url().default("http://localhost:3000"),
  ADMIN_EMAIL: z.string().email().default("rajeev@sagiam.com"),
  ADMIN_PASSWORD: z.string().min(8).default("Sagiam.com"),
  ADMIN_SESSION_TTL_MINUTES: z.coerce.number().int().positive().default(720),
  OLLAMA_BASE_URL: z.string().url().default("http://127.0.0.1:11434"),
  OLLAMA_MODEL: z.string().default("llama2:7b"),
  OLLAMA_TIMEOUT_MS: z.coerce.number().int().positive().default(60000),
  OLLAMA_NUM_PREDICT: z.coerce.number().int().positive().default(120),
  OLLAMA_NUM_PREDICT_FAST: z.coerce.number().int().positive().default(100),
  OLLAMA_NUM_PREDICT_DEEP: z.coerce.number().int().positive().default(220)
});

export const env = envSchema.parse({
  PORT: process.env.PORT,
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  ADMIN_SESSION_TTL_MINUTES: process.env.ADMIN_SESSION_TTL_MINUTES,
  OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL,
  OLLAMA_MODEL: process.env.OLLAMA_MODEL,
  OLLAMA_TIMEOUT_MS: process.env.OLLAMA_TIMEOUT_MS,
  OLLAMA_NUM_PREDICT: process.env.OLLAMA_NUM_PREDICT,
  OLLAMA_NUM_PREDICT_FAST: process.env.OLLAMA_NUM_PREDICT_FAST,
  OLLAMA_NUM_PREDICT_DEEP: process.env.OLLAMA_NUM_PREDICT_DEEP
});
