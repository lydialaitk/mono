import type { FastifyInstance } from "fastify";
import { loadConfigFromEnv, type AppConfig } from "../app/config";
import { type StatusResponse } from "./types";

export function registerStatusRoutes(
  app: FastifyInstance,
  getConfig: () => AppConfig = () => loadConfigFromEnv(process.env),
): void {
  app.get(
    "/status",
    {
      schema: {
        response: {
          200: {
            type: "object",
            required: ["schemaVersion", "service", "status", "time", "replyMode", "streamTransport"],
            additionalProperties: false,
            properties: {
              schemaVersion: { type: "string", enum: ["v1"] },
              service: { type: "string" },
              status: { type: "string", enum: ["ok", "degraded"] },
              time: { type: "string" },
              replyMode: { type: "string", enum: ["mock", "real-llm"] },
              streamTransport: { type: "string", enum: ["sse"] },
              configurationState: {
                type: "object",
                additionalProperties: { type: "string" },
              },
            },
          },
        },
      },
    },
    async () => {
      const cfg = getConfig();

      const degraded = cfg.replyMode === "real-llm" && cfg.llmProviderConfigured === false;

      const res: StatusResponse = {
        schemaVersion: "v1",
        service: "backend-agent",
        status: degraded ? "degraded" : "ok",
        time: new Date().toISOString(),
        replyMode: cfg.replyMode,
        streamTransport: "sse",
        configurationState: {
          llmProviderConfigured: String(cfg.llmProviderConfigured),
        },
      };

      return res;
    },
  );
}

