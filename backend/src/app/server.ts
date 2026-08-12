import Fastify, { type FastifyInstance } from "fastify";
import { join } from "node:path";
import { registerRoutes } from "../api/routes";

export type ServerDeps = {
  /**
   * Optional path to static frontend assets.
   * In v1 we keep it optional so backend can run without a built frontend.
   */
  staticAssetsDir?: string;
};

export function createServer(deps: ServerDeps): FastifyInstance {
  const app = Fastify({
    logger: false,
  });

  registerRoutes(app, {
    staticAssetsDir: deps.staticAssetsDir ?? join(process.cwd(), "frontend", "dist"),
  });

  return app;
}

