import { describe, expect, it } from "vitest";
import { validateUserMessage } from "../../src/chat/validation";

describe("chat validation", () => {
  it("rejects empty input", () => {
    expect(validateUserMessage("   ")).toEqual({
      valid: false,
      message: "請輸入訊息",
    });
  });

  it("accepts Traditional Chinese input", () => {
    expect(validateUserMessage("你好，請介紹你自己")).toEqual({ valid: true });
  });
});

