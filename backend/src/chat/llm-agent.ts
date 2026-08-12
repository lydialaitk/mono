import { type ChatMessage } from "./types";

export function generateVercelAIReply(_messages: ChatMessage[]): { text: string } {
  // v1 backend is mock-first. Real provider integration is intentionally
  // configuration-gated and can be filled in later.
  //
  // This function exists so the boundary and selection logic is explicit.
  const providerConfigured =
    process.env.VERCEL_AI_SDK_API_KEY ||
    process.env.VERCEL_AI_API_KEY ||
    process.env.LLM_API_KEY ||
    process.env.OPENAI_API_KEY;

  if (!providerConfigured) {
    throw new Error("LLM provider credentials not configured");
  }

  // Placeholder implementation for v1 planning artifacts.
  return { text: "Real provider reply (placeholder)" };
}

