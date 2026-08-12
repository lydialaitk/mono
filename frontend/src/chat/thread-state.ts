import type { ChatRequest } from "shared/contracts/chat";
import type { ChatThread, ThreadMessage } from "shared/types/chat-thread";

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createEmptyThread(): ChatThread {
  const now = nowIso();
  return {
    threadId: createId("thread"),
    messages: [],
    createdAt: now,
    updatedAt: now,
    storageVersion: 1,
  };
}

export function appendUserMessage(thread: ChatThread, content: string, requestId: string): ChatThread {
  const message: ThreadMessage = {
    messageId: createId("msg"),
    role: "user",
    content,
    state: "complete",
    createdAt: nowIso(),
    requestId,
  };
  return {
    ...thread,
    messages: [...thread.messages, message],
    updatedAt: nowIso(),
  };
}

export function beginAssistantMessage(thread: ChatThread, requestId: string, messageId: string): ChatThread {
  const assistant: ThreadMessage = {
    messageId,
    role: "assistant",
    content: "",
    state: "streaming",
    createdAt: nowIso(),
    requestId,
  };
  return {
    ...thread,
    messages: [...thread.messages, assistant],
    updatedAt: nowIso(),
  };
}

export function appendAssistantDelta(thread: ChatThread, requestId: string, delta: string): ChatThread {
  const messages = [...thread.messages];
  const idx = [...messages].reverse().findIndex(
    (m) => m.role === "assistant" && m.requestId === requestId,
  );
  if (idx === -1) return thread;
  const actualIndex = messages.length - 1 - idx;
  messages[actualIndex] = {
    ...messages[actualIndex],
    content: messages[actualIndex].content + delta,
    state: "streaming",
  };
  return { ...thread, messages, updatedAt: nowIso() };
}

export function completeAssistantMessage(thread: ChatThread, requestId: string): ChatThread {
  const messages = thread.messages.map((m) =>
    m.role === "assistant" && m.requestId === requestId ? { ...m, state: "complete" as const } : m,
  );
  return { ...thread, messages, updatedAt: nowIso() };
}

export function failAssistantMessage(thread: ChatThread, requestId: string): ChatThread {
  const messages = thread.messages.map((m) =>
    m.role === "assistant" && m.requestId === requestId ? { ...m, state: "error" as const } : m,
  );
  return { ...thread, messages, updatedAt: nowIso() };
}

export function buildChatRequest(thread: ChatThread, requestId: string): ChatRequest {
  return {
    schemaVersion: "v1",
    requestId,
    stream: true,
    messages: thread.messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    client: {
      app: "web-chat",
      appVersion: "dev",
    },
  };
}

