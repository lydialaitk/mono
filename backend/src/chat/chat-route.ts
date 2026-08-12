import type { FastifyInstance } from "fastify";
import { selectReplyProvider } from "./reply-provider";
import {
  buildResponseComplete,
  buildResponseDelta,
  buildResponseError,
  buildResponseStart,
  writeSseJson,
} from "./stream-events";
import type { ChatRequest, ChatMessage } from "./types";
import { emitTelemetry } from "../telemetry/events";

export function registerChatRoutes(app: FastifyInstance): void {
  app.post(
    "/api/v1/chat",
    {
      schema: {
        body: {
          type: "object",
          additionalProperties: false,
          required: ["schemaVersion", "requestId", "stream", "messages"],
          properties: {
            schemaVersion: { type: "string", enum: ["v1"] },
            requestId: { type: "string" },
            stream: { type: "boolean", const: true },
            messages: {
              type: "array",
              minItems: 1,
              items: {
                type: "object",
                additionalProperties: false,
                required: ["role", "content"],
                properties: {
                  role: { type: "string", enum: ["system", "user", "assistant"] },
                  content: { type: "string", minLength: 1 },
                },
              },
            },
            client: { type: "object" },
          },
        },
      },
    },
    async (request, reply) => {
      const body = request.body as ChatRequest;

      const raw = reply.raw;
      raw.setHeader("Content-Type", "text/event-stream");
      raw.setHeader("Cache-Control", "no-cache");
      raw.setHeader("Connection", "keep-alive");

      // Allows headers to be sent immediately so the client can start reading.
      if (typeof (raw as unknown as { flushHeaders?: () => void }).flushHeaders === "function") {
        (raw as unknown as { flushHeaders: () => void }).flushHeaders();
      }

      let closed = false;
      raw.on("close", () => {
        closed = true;
      });

      const requestId = body.requestId;
      let sequence = 1;
      const assistantMessage: ChatMessage = { role: "assistant", content: "" };
      const messageId = `msg_${Date.now()}`;

      try {
        // response.start
        await writeSseJson(
          raw,
          buildResponseStart({ requestId, sequence: sequence++, messageId }),
        );
        emitTelemetry({ name: "chat.response.start", requestId });

        const provider = selectReplyProvider(process.env);
        const { text } = await provider.generate(body.messages);

        // Stream deltas in small chunks to satisfy "streaming" UX.
        const chunkSize = 10;
        for (let offset = 0; offset < text.length; offset += chunkSize) {
          if (closed) break;
          const chunk = text.slice(offset, offset + chunkSize);
          assistantMessage.content += chunk;
          await writeSseJson(raw, buildResponseDelta({ requestId, sequence: sequence++, text: chunk }));
          emitTelemetry({ name: "chat.response.delta", requestId, fields: { deltaSize: chunk.length } });
        }

        if (!closed) {
          // response.complete
          await writeSseJson(
            raw,
            buildResponseComplete({
              requestId,
              sequence: sequence++,
              message: assistantMessage,
              finishReason: "stop",
            }),
          );
          emitTelemetry({ name: "chat.response.complete", requestId });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown backend error";
        // response.error
        await writeSseJson(
          raw,
          buildResponseError({
            requestId,
            sequence: sequence++,
            code: "UPSTREAM_FAILURE",
            message,
            retryable: false,
          }),
        );
        emitTelemetry({ name: "chat.response.error", requestId, fields: { error: message } });

        // Ensure the stream ends even on failure.
      } finally {
        raw.end();
      }

      // We fully handled the stream via SSE.
      return reply;
    },
  );
}

