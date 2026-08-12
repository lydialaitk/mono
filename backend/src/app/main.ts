import { createServer } from "./server";

const DEFAULT_PORT = 3000;

function getPortFromEnv(): number {
  const raw = process.env.PORT ?? `${DEFAULT_PORT}`;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : DEFAULT_PORT;
}

export async function start(): Promise<void> {
  const app = createServer({});
  const port = getPortFromEnv();
  await app.listen({ port, host: "0.0.0.0" });
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${port}`);
}

if (require.main === module) {
  start().catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  });
}

