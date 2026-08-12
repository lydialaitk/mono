import { describe, expect, it } from "vitest";
import { selectReplyProvider } from "../../src/chat/reply-provider";

describe("reply-provider", () => {
  it("uses mock mode when CHAT_REPLY_MODE is not set", async () => {
    const provider = selectReplyProvider({});
    expect(provider.mode).toBe("mock");
  });

  it("uses mock mode when CHAT_REPLY_MODE=mock", async () => {
    const provider = selectReplyProvider({ CHAT_REPLY_MODE: "mock" });
    expect(provider.mode).toBe("mock");
  });

  it("selects real-llm mode when requested even if provider key is missing", async () => {
    const provider = selectReplyProvider({ CHAT_REPLY_MODE: "real-llm" });
    expect(provider.mode).toBe("real-llm");
    await expect(provider.generate([{ role: "user", content: "hi" }])).rejects.toBeTruthy();
  });
});

