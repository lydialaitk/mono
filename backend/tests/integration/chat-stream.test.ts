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

function assertIsIsoDateTime(value: string) {
  // Contract uses `format: date-time`. In practice we treat "parsable by Date" as compliance.
  const dt = new Date(value);
  expect(Number.isNaN(dt.getTime())).toBe(false);
}

function assertStreamEventMatchesContract(event: StreamEvent, expectedRequestId: string) {
  // Mirrors `specs/001-agent-chat-app/contracts/http-api.yaml`:
  // - StreamEvent requires schemaVersion, type, requestId, sequence, timestamp, data
  // - data.oneOf schemas differ per `type`
  expect(event.schemaVersion).toBe("v1");
  expect(event.requestId).toBe(expectedRequestId);
  expect(event.sequence).toBeGreaterThan(0);
  assertIsIsoDateTime(event.timestamp);

  switch (event.type) {
    case "response.start": {
      expect(typeof event.data).toBe("object");
      const data = event.data as Record<string, unknown>;
      expect(Object.keys(data).sort()).toEqual(["messageId"]);
      expect(typeof data.messageId).toBe("string");
      break;
    }
    case "response.delta": {
      expect(typeof event.data).toBe("object");
      const data = event.data as Record<string, unknown>;
      expect(Object.keys(data).sort()).toEqual(["text"]);
      expect(typeof data.text).toBe("string");
      break;
    }
    case "response.complete": {
      expect(typeof event.data).toBe("object");
      const data = event.data as Record<string, unknown>;
      expect(Object.keys(data).sort()).toEqual(["finishReason", "message"]);
      expect(["stop", "error"]).toContain(data.finishReason);

      const message = data.message as Record<string, unknown>;
      // Contract schema: ChatMessage has `{ role, content }` only.
      expect(Object.keys(message).sort()).toEqual(["content", "role"]);
      expect(["system", "user", "assistant"]).toContain(message.role);
      expect(typeof message.content).toBe("string");
      expect(message.content.length).toBeGreaterThanOrEqual(1);
      break;
    }
    case "response.error": {
      expect(typeof event.data).toBe("object");
      const data = event.data as Record<string, unknown>;
      expect(Object.keys(data).sort()).toEqual(["code", "message", "retryable"]);
      expect(typeof data.code).toBe("string");
      expect(typeof data.message).toBe("string");
      expect(typeof data.retryable).toBe("boolean");
      break;
    }
    default:
      // Exhaustiveness check
      expect(event).toBeUndefined();
  }
}

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

async function readSseEventsUntil(
  res: Response,
  predicate: (event: StreamEvent) => boolean,
): Promise<{ events: StreamEvent[]; matched?: StreamEvent }> {
  if (!res.body) throw new Error("Expected response body");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  let buffer = "";
  const events: StreamEvent[] = [];

  // Incrementally split by SSE record separator `\n\n` (also accepts `\r\n\r\n`).
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // Process as many complete SSE blocks as we can.
    while (true) {
      const sepIndex = buffer.search(/\r?\n\r?\n/);
      if (sepIndex === -1) break;

      const block = buffer.slice(0, sepIndex).trim();
      const sep = buffer.startsWith("\r\n\r\n", sepIndex) ? 4 : 2;
      buffer = buffer.slice(sepIndex + sep);

      if (!block) continue;

      const lines = block.split(/\r?\n/g).map((l) => l.trim());
      const dataLines = lines.filter((l) => l.startsWith("data:"));

      for (const dataLine of dataLines) {
        const json = dataLine.replace(/^data:\s*/, "");
        const event = JSON.parse(json) as StreamEvent;
        events.push(event);

        if (predicate(event)) {
          return { events, matched: event };
        }
      }
    }
  }

  return { events };
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
          assertStreamEventMatchesContract(e, requestId);
        }
      },
    );
  });

  it("streams first response.delta within 2 seconds in mock mode (T052)", async () => {
    await withTestServer(
      { CHAT_REPLY_MODE: "mock" },
      async (baseUrl) => {
        const requestId = `req_${Date.now()}`;
        const payload = {
          schemaVersion: "v1",
          requestId,
          stream: true,
          messages: [{ role: "user", content: "你好，請介紹你自己" }],
        };

        const start = performance.now();
        const res = await fetch(`${baseUrl}/api/v1/chat`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });

        expect(res.status).toBe(200);

        const { matched } = await readSseEventsUntil(res, (e) => e.type === "response.delta");
        expect(matched).toBeDefined();

        const elapsedMs = performance.now() - start;
        // Quickstart expectation: within roughly 2 seconds in mock mode.
        // We allow a small buffer for CI/environment variability.
        expect(elapsedMs).toBeLessThan(2500);
      },
    );
  });
});

