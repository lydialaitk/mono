import { beforeEach, describe, expect, it } from "vitest";
import { createEmptyThread, appendUserMessage } from "../../src/chat/thread-state";
import { loadThreadFromSession, saveThreadToSession } from "../../src/session/thread-storage";

describe("chat refresh restore", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("restores the same thread after a simulated page refresh", () => {
    let thread = createEmptyThread();
    thread = appendUserMessage(thread, "你好", "req-1");
    saveThreadToSession(thread);

    const restored = loadThreadFromSession();
    expect(restored?.threadId).toBe(thread.threadId);
    expect(restored?.messages.map((m) => m.content)).toEqual(["你好"]);
  });
});

