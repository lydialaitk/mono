import type { ChatThread } from "shared/types/chat-thread";

const STORAGE_KEY = "agent-chat-thread";

type StoredThreadSnapshot = {
  version: 1;
  thread: ChatThread;
};

export function saveThreadToSession(thread: ChatThread): void {
  const snapshot: StoredThreadSnapshot = { version: 1, thread };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}

export function loadThreadFromSession(): ChatThread | null {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredThreadSnapshot;
    if (parsed.version !== 1 || !parsed.thread) return null;
    return parsed.thread;
  } catch {
    return null;
  }
}

export function clearThreadFromSession(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}

