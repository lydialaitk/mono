import { describe, expect, it, beforeEach } from "vitest";
import { createServer } from "../../src/app/server";

async function withTestServer(
  env: Record<string, string | undefined>,
  fn: (baseUrl: string) => Promise<void>,
) {
  const app = createServer({});

  for (const [k, v] of Object.entries(env)) {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }

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

describe("/status", () => {
  beforeEach(() => {
    delete process.env.VERCEL_AI_SDK_API_KEY;
    delete process.env.VERCEL_AI_API_KEY;
    delete process.env.LLM_API_KEY;
    delete process.env.OPENAI_API_KEY;
  });

  it("returns degraded when real-llm is requested but provider credentials are missing", async () => {
    await withTestServer(
      { CHAT_REPLY_MODE: "real-llm" },
      async (baseUrl) => {
        const res = await fetch(`${baseUrl}/status`);
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.status).toBe("degraded");
        expect(json.replyMode).toBe("real-llm");
        expect(json.schemaVersion).toBe("v1");
      },
    );
  });

  it("returns ok in mock mode", async () => {
    await withTestServer(
      { CHAT_REPLY_MODE: "mock" },
      async (baseUrl) => {
        const res = await fetch(`${baseUrl}/status`);
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.status).toBe("ok");
        expect(json.replyMode).toBe("mock");
      },
    );
  });
});

