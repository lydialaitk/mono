import type { FastifyInstance } from "fastify";
import { existsSync } from "node:fs";
import { join } from "node:path";
import fastifyStatic from "@fastify/static";

export function serveStaticIfAvailable(app: FastifyInstance, staticAssetsDir: string): void {
  const resolvedDir = staticAssetsDir;
  if (!existsSync(resolvedDir)) return;

  app.register(fastifyStatic, {
    root: resolvedDir,
    prefix: "/",
    // If the SPA build exists, index.html will be served as a static file.
    // v1 does not require routing support here.
    decorateReply: false,
  });

  // Lightweight fallback: if index.html exists, serve it at `/`.
  const indexPath = join(resolvedDir, "index.html");
  if (existsSync(indexPath)) {
    app.get("/", async (_req, reply) => {
      // `reply.sendFile` resolves relative to Fastify's configured root.
      return reply.sendFile("index.html");
    });
  }
}

