import type { ChatRequest } from "shared/contracts/chat";
import type { StreamEvent } from "shared/events/stream-event";

export async function streamChat(
  endpoint: string,
  request: ChatRequest,
  onEvent: (event: StreamEvent) => void,
): Promise<void> {
  const response = await fetch(`${endpoint}/api/v1/chat`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok || !response.body) {
    throw new Error(`Chat request failed with status ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const parts = buffer.split(/\r?\n\r?\n/g);
    buffer = parts.pop() ?? "";

    for (const part of parts) {
      const lines = part.split(/\r?\n/g).map((line) => line.trim());
      const dataLines = lines.filter((line) => line.startsWith("data:"));
      for (const dataLine of dataLines) {
        const payload = JSON.parse(dataLine.replace(/^data:\s*/, "")) as StreamEvent;
        onEvent(payload);
      }
    }
  }
}

