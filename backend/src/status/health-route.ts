import type { FastifyInstance } from "fastify";
import { type HealthResponse } from "./types";

export function registerHealthRoute(
  app: FastifyInstance,
  getResponse: () => HealthResponse,
): void {
  app.get(
    "/health",
    {
      schema: {
        response: {
          200: {
            type: "object",
            required: ["status"],
            additionalProperties: false,
            properties: {
              status: { type: "string", enum: ["ok"] },
              service: { type: "string" },
              time: { type: "string" },
            },
          },
        },
      },
    },
    async () => {
      return getResponse();
    },
  );
}

