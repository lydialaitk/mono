export function createErrorState(): HTMLDivElement {
  const el = document.createElement("div");
  el.setAttribute("data-testid", "chat-error");
  el.style.color = "crimson";
  return el;
}

export function setErrorMessage(el: HTMLDivElement, message: string): void {
  el.textContent = message;
}

export function clearErrorMessage(el: HTMLDivElement): void {
  el.textContent = "";
}

