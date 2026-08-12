export type ChatRole = "system" | "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type ChatRequest = {
  schemaVersion: "v1";
  requestId: string;
  stream: true;
  messages: ChatMessage[];
};

