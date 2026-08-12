"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const reply_provider_1 = require("../../src/chat/reply-provider");
describe("reply-provider", () => {
    it("uses mock mode when CHAT_REPLY_MODE is not set", async () => {
        const provider = (0, reply_provider_1.selectReplyProvider)({});
        expect(provider.mode).toBe("mock");
    });
    it("uses mock mode when CHAT_REPLY_MODE=mock", async () => {
        const provider = (0, reply_provider_1.selectReplyProvider)({ CHAT_REPLY_MODE: "mock" });
        expect(provider.mode).toBe("mock");
    });
    it("selects real-llm mode when requested even if provider key is missing", async () => {
        const provider = (0, reply_provider_1.selectReplyProvider)({ CHAT_REPLY_MODE: "real-llm" });
        expect(provider.mode).toBe("real-llm");
        await expect(provider.generate([{ role: "user", content: "hi" }])).rejects.toBeTruthy();
    });
});
