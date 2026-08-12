import { describe, expect, it } from "vitest";
import { appendUserMessage, buildChatRequest, createEmptyThread } from "../../src/chat/thread-state";

describe("thread state", () => {
  it("builds chat requests with full in-session history", () => {
    let thread = createEmptyThread();
    thread = appendUserMessage(thread, "第一句", "req-1");
    thread = appendUserMessage(thread, "第二句", "req-2");

    const request = buildChatRequest(thread, "req-3");
    expect(request.messages.map((message) => message.content)).toEqual(["第一句", "第二句"]);
    expect(request.requestId).toBe("req-3");
  });
});

