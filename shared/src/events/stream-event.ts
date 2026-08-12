import type { ChatMessage } from "../contracts/chat.js";

export type ResponseStartEvent = {
  schemaVersion: "v1";
  type: "response.start";
  requestId: string;
  sequence: number;
  timestamp: string;
  data: {
    messageId: string;
  };
};

export type ResponseDeltaEvent = {
  schemaVersion: "v1";
  type: "response.delta";
  requestId: string;
  sequence: number;
  timestamp: string;
  data: {
    text: string;
  };
};

export type ResponseCompleteEvent = {
  schemaVersion: "v1";
  type: "response.complete";
  requestId: string;
  sequence: number;
  timestamp: string;
  data: {
    message: ChatMessage;
    finishReason: "stop" | "error";
  };
};

export type ResponseErrorEvent = {
  schemaVersion: "v1";
  type: "response.error";
  requestId: string;
  sequence: number;
  timestamp: string;
  data: {
    code: string;
    message: string;
    retryable: boolean;
  };
};

export type StreamEvent =
  | ResponseStartEvent
  | ResponseDeltaEvent
  | ResponseCompleteEvent
  | ResponseErrorEvent;

