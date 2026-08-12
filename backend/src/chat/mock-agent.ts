import { type ChatMessage } from "./types";

export function generateMockReply(messages: ChatMessage[]): { text: string } {
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const input = lastUser?.content ?? "";
  return { text: `Mock reply: ${input}` };
}

