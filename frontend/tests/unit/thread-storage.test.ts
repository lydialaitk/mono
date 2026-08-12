import { beforeEach, describe, expect, it } from "vitest";
import { clearThreadFromSession, loadThreadFromSession, saveThreadToSession } from "../../src/session/thread-storage";
import { createEmptyThread } from "../../src/chat/thread-state";

describe("thread storage", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("restores a saved thread", () => {
    const thread = createEmptyThread();
    saveThreadToSession(thread);
    expect(loadThreadFromSession()).toEqual(thread);
  });

  it("returns null for malformed data", () => {
    sessionStorage.setItem("agent-chat-thread", "not-json");
    expect(loadThreadFromSession()).toBeNull();
  });

  it("clears the saved thread", () => {
    const thread = createEmptyThread();
    saveThreadToSession(thread);
    clearThreadFromSession();
    expect(loadThreadFromSession()).toBeNull();
  });
});

