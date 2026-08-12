"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const server_1 = require("../../src/app/server");
async function withTestServer(fn) {
    const app = (0, server_1.createServer)({});
    await app.listen({ port: 0, host: "127.0.0.1" });
    const address = app.server.address();
    if (!address || typeof address === "string")
        throw new Error("Unable to resolve server address");
    const baseUrl = `http://127.0.0.1:${address.port}`;
    try {
        await fn(baseUrl);
    }
    finally {
        await app.close();
    }
}
(0, vitest_1.describe)("/health", () => {
    (0, vitest_1.beforeEach)(() => {
        process.env.CHAT_REPLY_MODE = "real-llm";
        delete process.env.VERCEL_AI_SDK_API_KEY;
        delete process.env.VERCEL_AI_API_KEY;
        delete process.env.LLM_API_KEY;
        delete process.env.OPENAI_API_KEY;
    });
    (0, vitest_1.it)("returns status ok even when real-llm provider is not configured", async () => {
        await withTestServer(async (baseUrl) => {
            const res = await fetch(`${baseUrl}/health`);
            (0, vitest_1.expect)(res.status).toBe(200);
            const json = await res.json();
            (0, vitest_1.expect)(json).toEqual(vitest_1.expect.objectContaining({ status: "ok" }));
        });
    });
});
