export type HealthResponse = {
  status: "ok";
  service?: string;
  time?: string;
};

export type StatusResponse = {
  schemaVersion: "v1";
  service: string;
  status: "ok" | "degraded";
  time: string;
  replyMode: "mock" | "real-llm";
  streamTransport: "sse";
  configurationState?: Record<string, string>;
};

