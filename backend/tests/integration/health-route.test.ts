import { describe, expect, it, beforeEach } from "vitest";
import { createServer } from "../../src/app/server";

async function withTestServer(fn: (baseUrl: string) => Promise<void>) {
  const app = createServer({});
  await app.listen({ port: 0, host: "127.0.0.1" });
  const address = app.server.address();
  if (!address || typeof address === "string") throw new Error("Unable to resolve server address");
  const baseUrl = `http://127.0.0.1:${address.port}`;
  try {
    await fn(baseUrl);
  } finally {
    await app.close();
  }
}

describe("/health", () => {
  beforeEach(() => {
    process.env.CHAT_REPLY_MODE = "real-llm";
    delete process.env.VERCEL_AI_SDK_API_KEY;
    delete process.env.VERCEL_AI_API_KEY;
    delete process.env.LLM_API_KEY;
    delete process.env.OPENAI_API_KEY;
  });

  it("returns status ok even when real-llm provider is not configured", async () => {
    await withTestServer(async (baseUrl) => {
      const res = await fetch(`${baseUrl}/health`);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json).toEqual(expect.objectContaining({ status: "ok" }));
    });
  });
});

