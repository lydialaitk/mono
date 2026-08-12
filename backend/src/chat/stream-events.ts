import { type ChatMessage } from "./types";

export type StreamEventType = "response.start" | "response.delta" | "response.complete" | "response.error";

type BaseEnvelope = {
  schemaVersion: "v1";
  requestId: string;
  sequence: number;
  timestamp: string; // ISO
};

export function buildResponseStart(
  args: { requestId: string; sequence: number; messageId: string },
): BaseEnvelope & {
  type: "response.start";
  data: { messageId: string };
} {
  return {
    schemaVersion: "v1",
    requestId: args.requestId,
    sequence: args.sequence,
    timestamp: new Date().toISOString(),
    type: "response.start",
    data: { messageId: args.messageId },
  };
}

export function buildResponseDelta(args: { requestId: string; sequence: number; text: string }) {
  return {
    schemaVersion: "v1",
    requestId: args.requestId,
    sequence: args.sequence,
    timestamp: new Date().toISOString(),
    type: "response.delta",
    data: { text: args.text },
  } as const;
}

export function buildResponseComplete(args: { requestId: string; sequence: number; message: ChatMessage; finishReason: "stop" | "error" }) {
  return {
    schemaVersion: "v1",
    requestId: args.requestId,
    sequence: args.sequence,
    timestamp: new Date().toISOString(),
    type: "response.complete",
    data: { message: args.message, finishReason: args.finishReason },
  } as const;
}

export function buildResponseError(args: { requestId: string; sequence: number; code: string; message: string; retryable: boolean }) {
  return {
    schemaVersion: "v1",
    requestId: args.requestId,
    sequence: args.sequence,
    timestamp: new Date().toISOString(),
    type: "response.error",
    data: { code: args.code, message: args.message, retryable: args.retryable },
  } as const;
}

export async function writeSseJson(raw: NodeJS.WritableStream, event: unknown): Promise<void> {
  const json = JSON.stringify(event);
  raw.write(`data: ${json}\n\n`);
}

