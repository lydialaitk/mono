import { streamChat } from "./chat/chat-client";
import {
  appendAssistantDelta,
  appendUserMessage,
  beginAssistantMessage,
  buildChatRequest,
  completeAssistantMessage,
  createEmptyThread,
  failAssistantMessage,
} from "./chat/thread-state";
import { getBackendEndpoint } from "./config/backend-endpoint";
import { clearThreadFromSession, loadThreadFromSession, saveThreadToSession } from "./session/thread-storage";
import { getStatus } from "./status/status-client";
import { createChatPage } from "./ui/chat-page";
import { validateAndDisplay } from "./ui/chat-input";
import { clearErrorMessage, setErrorMessage } from "./ui/error-state";
import { renderMessageList } from "./ui/message-list";

import type { ChatThread } from "shared/types/chat-thread";
import type { StreamEvent } from "shared/events/stream-event";

function createRequestId(): string {
  return `req-${Math.random().toString(36).slice(2, 10)}`;
}

function applyStreamEvent(thread: ChatThread, event: StreamEvent): ChatThread {
  switch (event.type) {
    case "response.start":
      return beginAssistantMessage(thread, event.requestId, event.data.messageId);
    case "response.delta":
      return appendAssistantDelta(thread, event.requestId, event.data.text);
    case "response.complete":
      return completeAssistantMessage(thread, event.requestId);
    case "response.error":
      return failAssistantMessage(thread, event.requestId);
  }
}

async function bootstrap(): Promise<void> {
  const appRoot = document.getElementById("app");
  if (!appRoot) throw new Error("Missing app root");

  const endpoint = getBackendEndpoint();
  let thread = loadThreadFromSession() ?? createEmptyThread();
  const page = createChatPage();
  appRoot.replaceChildren(page.root);

  renderMessageList(page.messageList, thread);

  try {
    const status = await getStatus(endpoint);
    page.statusBadge.textContent =
      status.status === "degraded"
        ? `狀態：degraded (${status.replyMode})`
        : `狀態：ok (${status.replyMode})`;
  } catch (err) {
    const message = err instanceof Error ? err.message : "狀態檢查失敗";
    page.statusBadge.textContent = "狀態：error";
    setErrorMessage(page.errorState, message);
  }

  page.inputView.form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearErrorMessage(page.errorState);

    if (!validateAndDisplay(page.inputView)) return;

    const requestId = createRequestId();
    thread = appendUserMessage(thread, page.inputView.getValue(), requestId);
    saveThreadToSession(thread);
    renderMessageList(page.messageList, thread);

    const request = buildChatRequest(thread, requestId);
    page.inputView.clear();

    try {
      await streamChat(endpoint, request, (streamEvent) => {
        thread = applyStreamEvent(thread, streamEvent);
        saveThreadToSession(thread);
        renderMessageList(page.messageList, thread);
      });
      saveThreadToSession(thread);
      renderMessageList(page.messageList, thread);
    } catch (err) {
      const message = err instanceof Error ? err.message : "串流失敗";
      thread = failAssistantMessage(thread, requestId);
      saveThreadToSession(thread);
      renderMessageList(page.messageList, thread);
      setErrorMessage(page.errorState, message);
    }
  });

  // Expose a debug helper to intentionally clear restore state during manual validation.
  (window as typeof window & { resetChatThread?: () => void }).resetChatThread = () => {
    clearThreadFromSession();
    thread = createEmptyThread();
    renderMessageList(page.messageList, thread);
  };
}

void bootstrap();

