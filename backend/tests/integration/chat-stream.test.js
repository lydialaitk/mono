"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const server_1 = require("../../src/app/server");
function parseSseEvents(s) {
    // Our server emits `data: <json>\n\n` blocks.
    const blocks = s
        .split("\n\n")
        .map((b) => b.trim())
        .filter(Boolean);
    const events = [];
    for (const block of blocks) {
        const dataLine = block.split("\n").find((l) => l.startsWith("data:"));
        if (!dataLine)
            continue;
        const json = dataLine.replace(/^data:\s*/, "");
        events.push(JSON.parse(json));
    }
    return events;
}
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
(0, vitest_1.describe)("POST /api/v1/chat SSE contract", () => {
    (0, vitest_1.it)("emits start -> delta+ -> complete in mock mode", async () => {
        await withTestServer({ CHAT_REPLY_MODE: "mock" }, async (baseUrl) => {
            const requestId = `req_${Date.now()}`;
            const payload = {
                schemaVersion: "v1",
                requestId,
                stream: true,
                messages: [{ role: "user", content: "你好" }],
            };
            const res = await fetch(`${baseUrl}/api/v1/chat`, {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify(payload),
            });
            (0, vitest_1.expect)(res.status).toBe(200);
            const text = await res.text();
            const events = parseSseEvents(text);
            (0, vitest_1.expect)(events[0]?.type).toBe("response.start");
            (0, vitest_1.expect)(events.some((e) => e.type === "response.delta")).toBe(true);
            (0, vitest_1.expect)(events[events.length - 1]?.type).toBe("response.complete");
            for (const e of events) {
                (0, vitest_1.expect)(e.requestId).toBe(requestId);
                (0, vitest_1.expect)(e.schemaVersion).toBe("v1");
                (0, vitest_1.expect)(e.sequence).toBeGreaterThan(0);
            }
        });
    });
});
