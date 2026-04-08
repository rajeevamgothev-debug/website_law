const configuredApiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL?.trim() ||
  process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ||
  "http://127.0.0.1:4000";

export const apiBaseUrl = configuredApiBaseUrl.replace(/\/+$/, "");
