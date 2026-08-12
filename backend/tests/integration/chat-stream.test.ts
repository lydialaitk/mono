import { describe, expect, it } from "vitest";
import { createServer } from "../../src/app/server";

type StreamEvent = {
  schemaVersion: "v1";
  type: "response.start" | "response.delta" | "response.complete" | "response.error";
  requestId: string;
  sequence: number;
  timestamp: string;
  data: unknown;
};

function parseSseEvents(s: string): StreamEvent[] {
  // Our server emits `data: <json>\n\n` blocks.
  const blocks = s
    .split(/\r?\n\r?\n/g)
    .map((b) => b.trim())
    .filter(Boolean);

  const events: StreamEvent[] = [];
  for (const block of blocks) {
    const lines = block.split(/\r?\n/g).map((l) => l.trim());
    const dataLines = lines.filter((l) => l.startsWith("data:"));
    for (const dataLine of dataLines) {
      const json = dataLine.replace(/^data:\s*/, "");
      events.push(JSON.parse(json));
    }
  }
  return events;
}

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

describe("POST /api/v1/chat SSE contract", () => {
  it("emits start -> delta+ -> complete in mock mode", async () => {
    await withTestServer(
      { CHAT_REPLY_MODE: "mock" },
      async (baseUrl) => {
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

        expect(res.status).toBe(200);
        const text = await res.text();
        const events = parseSseEvents(text);

        expect(events[0]?.type).toBe("response.start");
        expect(events.some((e) => e.type === "response.delta")).toBe(true);
        expect(events[events.length - 1]?.type).toBe("response.complete");

        for (const e of events) {
          expect(e.requestId).toBe(requestId);
          expect(e.schemaVersion).toBe("v1");
          expect(e.sequence).toBeGreaterThan(0);
        }
      },
    );
  });
});

