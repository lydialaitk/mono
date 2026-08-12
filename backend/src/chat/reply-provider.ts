import { loadConfigFromEnv, type ReplyMode } from "../app/config";
import { generateMockReply } from "./mock-agent";
import { generateVercelAIReply } from "./llm-agent";
import { type ChatMessage } from "./types";

export type ReplyGenerationResult = { text: string };

export type ReplyProvider = {
  mode: ReplyMode;
  generate: (messages: ChatMessage[]) => Promise<ReplyGenerationResult>;
};

export function selectReplyProvider(env: NodeJS.ProcessEnv = process.env): ReplyProvider {
  const cfg = loadConfigFromEnv(env);

  if (cfg.replyMode === "mock") {
    return {
      mode: "mock",
      generate: async (messages) => generateMockReply(messages),
    };
  }

  // real-llm mode but credentials are not configured -> fail predictably
  return {
    mode: "real-llm",
    generate: async (messages) => generateVercelAIReply(messages),
  };
}

