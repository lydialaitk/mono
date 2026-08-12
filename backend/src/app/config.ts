export type ReplyMode = "mock" | "real-llm";

export type AppConfig = {
  replyMode: ReplyMode;
  llmProviderConfigured: boolean;
};

function envIsTruthy(value: string | undefined): boolean {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes";
}

/**
 * Load backend configuration.
 *
 * Design note: v1 is mock-first. The real-provider path is configuration-gated.
 */
export function loadConfigFromEnv(env: NodeJS.ProcessEnv): AppConfig {
  const modeRaw = (env.CHAT_REPLY_MODE ?? "mock").trim().toLowerCase();
  const replyMode: ReplyMode = modeRaw === "real-llm" ? "real-llm" : "mock";

  // Vercel AI SDK provider credentials (or equivalent) are optional.
  // If not provided, we consider real-llm "not configured".
  const providerKey =
    env.VERCEL_AI_SDK_API_KEY ??
    env.VERCEL_AI_API_KEY ??
    env.LLM_API_KEY ??
    env.OPENAI_API_KEY; // kept for compatibility with older docs; harmless if unused

  const llmProviderConfigured =
    replyMode === "real-llm" && envIsTruthy(providerKey) === true;

  return {
    replyMode,
    llmProviderConfigured,
  };
}

