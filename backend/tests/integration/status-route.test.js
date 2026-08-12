"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const server_1 = require("../../src/app/server");
async function withTestServer(env, fn) {
    const app = (0, server_1.createServer)({});
    for (const [k, v] of Object.entries(env)) {
        if (v === undefined)
            delete process.env[k];
        else
            process.env[k] = v;
    }
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
(0, vitest_1.describe)("/status", () => {
    (0, vitest_1.beforeEach)(() => {
        delete process.env.VERCEL_AI_SDK_API_KEY;
        delete process.env.VERCEL_AI_API_KEY;
        delete process.env.LLM_API_KEY;
        delete process.env.OPENAI_API_KEY;
    });
    (0, vitest_1.it)("returns degraded when real-llm is requested but provider credentials are missing", async () => {
        await withTestServer({ CHAT_REPLY_MODE: "real-llm" }, async (baseUrl) => {
            const res = await fetch(`${baseUrl}/status`);
            (0, vitest_1.expect)(res.status).toBe(200);
            const json = await res.json();
            (0, vitest_1.expect)(json.status).toBe("degraded");
            (0, vitest_1.expect)(json.replyMode).toBe("real-llm");
            (0, vitest_1.expect)(json.schemaVersion).toBe("v1");
        });
    });
    (0, vitest_1.it)("returns ok in mock mode", async () => {
        await withTestServer({ CHAT_REPLY_MODE: "mock" }, async (baseUrl) => {
            const res = await fetch(`${baseUrl}/status`);
            (0, vitest_1.expect)(res.status).toBe(200);
            const json = await res.json();
            (0, vitest_1.expect)(json.status).toBe("ok");
            (0, vitest_1.expect)(json.replyMode).toBe("mock");
        });
    });
});
