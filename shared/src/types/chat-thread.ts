import type { ChatMessage } from "../contracts/chat.js";

export type ThreadMessageState = "pending" | "streaming" | "complete" | "error";

export type ThreadMessage = ChatMessage & {
  messageId: string;
  state: ThreadMessageState;
  createdAt: string;
  requestId?: string;
};

export type ChatThread = {
  threadId: string;
  messages: ThreadMessage[];
  createdAt: string;
  updatedAt: string;
  storageVersion: number;
};

