import type { FastifyInstance } from "fastify";
import { type HealthResponse } from "../status/types";
import { registerChatRoutes } from "../chat/chat-route";
import { registerStatusRoutes } from "../status/status-route";

import { registerHealthRoute } from "../status/health-route";
import { serveStaticIfAvailable } from "../app/static";

export type RoutesDeps = {
  staticAssetsDir: string;
};

export function registerRoutes(app: FastifyInstance, deps: RoutesDeps): void {
  // Optional: serve the frontend (if built assets exist).
  serveStaticIfAvailable(app, deps.staticAssetsDir);

  registerHealthRoute(app, () => {
    const res: HealthResponse = {
      status: "ok",
      service: "backend-agent",
      time: new Date().toISOString(),
    };
    return res;
  });

  // Status is driven by env-backed config so `/status` can represent degraded
  // reply-generation impairment while `/health` stays process-only.
  registerStatusRoutes(app);

  registerChatRoutes(app);
}

