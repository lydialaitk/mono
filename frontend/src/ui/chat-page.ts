import { createMessageList } from "./message-list";
import { createChatInput } from "./chat-input";
import { createErrorState } from "./error-state";

export type ChatPageView = {
  root: HTMLDivElement;
  messageList: HTMLUListElement;
  statusBadge: HTMLDivElement;
  errorState: HTMLDivElement;
  inputView: ReturnType<typeof createChatInput>;
};

export function createChatPage(): ChatPageView {
  const root = document.createElement("div");
  const title = document.createElement("h1");
  const statusBadge = document.createElement("div");
  const messageList = createMessageList();
  const inputView = createChatInput();
  const errorState = createErrorState();

  title.textContent = "Agent Chat App";
  statusBadge.setAttribute("data-testid", "status-badge");
  statusBadge.textContent = "就緒";

  root.append(title, statusBadge, errorState, messageList, inputView.container);
  root.style.maxWidth = "800px";
  root.style.margin = "2rem auto";
  root.style.fontFamily = "sans-serif";

  return { root, messageList, statusBadge, errorState, inputView };
}

