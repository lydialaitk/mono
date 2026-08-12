import type { ChatThread, ThreadMessage } from "shared/types/chat-thread";

function stateLabel(message: ThreadMessage): string {
  if (message.role !== "assistant") return "";
  if (message.state === "streaming") return "（回覆中…）";
  if (message.state === "complete") return "（完成）";
  if (message.state === "error") return "（失敗）";
  return "";
}

export function createMessageList(): HTMLUListElement {
  const list = document.createElement("ul");
  list.setAttribute("data-testid", "message-list");
  list.style.listStyle = "none";
  list.style.padding = "0";
  return list;
}

export function renderMessageList(list: HTMLUListElement, thread: ChatThread): void {
  list.innerHTML = "";
  for (const message of thread.messages) {
    const item = document.createElement("li");
    item.setAttribute("data-role", message.role);
    item.setAttribute("data-state", message.state);
    item.textContent = `${message.role}: ${message.content} ${stateLabel(message)}`.trim();
    item.style.whiteSpace = "pre-wrap";
    item.style.marginBottom = "8px";
    list.appendChild(item);
  }
}

